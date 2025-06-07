import { SleepRecord } from '../types'

interface SleepAnalysis {
  advice: string
  sleepQuality: 'excellent' | 'good' | 'fair' | 'poor'
  recommendations: string[]
  insights: string[]
}

type AIAdvisorServiceDeps = {
  apiKey: string
}

export const createAIAdvisorService = ({ apiKey }: AIAdvisorServiceDeps) => {
  const analyzeSleepPattern = async (sleepRecords: SleepRecord[]): Promise<SleepAnalysis> => {
    if (!sleepRecords || sleepRecords.length === 0) {
      return {
        advice: '수면 기록이 부족하여 분석할 수 없습니다. 더 많은 데이터를 수집해보세요.',
        sleepQuality: 'fair',
        recommendations: ['매일 수면 기록을 작성해주세요', '규칙적인 수면 스케줄을 유지하세요'],
        insights: ['충분한 데이터가 수집되면 더 정확한 분석이 가능합니다']
      }
    }

    // 수면 데이터 요약 생성
    const totalRecords = sleepRecords.length
    const averageHours = sleepRecords.reduce((sum, record) => sum + record.hours, 0) / totalRecords
    const recentRecords = sleepRecords.slice(-7) // 최근 7일
    const recentAverage =
      recentRecords.reduce((sum, record) => sum + record.hours, 0) / recentRecords.length

    // 요일별 패턴 분석
    const weekdayPattern: { [key: number]: number[] } = {}
    sleepRecords.forEach(record => {
      const date = new Date(record.date)
      const dayOfWeek = date.getDay()
      if (!weekdayPattern[dayOfWeek]) {
        weekdayPattern[dayOfWeek] = []
      }
      weekdayPattern[dayOfWeek].push(record.hours)
    })

    // 최근 메모들 수집
    const recentNotes = recentRecords
      .filter(record => record.note && record.note.trim())
      .map(record => record.note)
      .slice(-5) // 최근 5개 메모

    // AI 프롬프트 생성
    const prompt = `
당신은 수면 전문가입니다. 다음 수면 데이터를 분석하여 개인 맞춤형 조언을 제공해주세요.

## 수면 데이터 요약:
- 총 기록 일수: ${totalRecords}일
- 전체 평균 수면시간: ${averageHours.toFixed(1)}시간
- 최근 7일 평균: ${recentAverage.toFixed(1)}시간
- 최근 메모: ${recentNotes.length > 0 ? recentNotes.join(', ') : '없음'}

## 요일별 평균 수면시간:
${Object.entries(weekdayPattern)
  .map(([day, hours]) => {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토']
    const avg = hours.reduce((sum, h) => sum + h, 0) / hours.length
    return `${dayNames[parseInt(day)]}요일: ${avg.toFixed(1)}시간`
  })
  .join('\n')}

## 최근 수면 기록 (최근 7일):
${recentRecords
  .map(
    (record, index) =>
      `${7 - index}일 전: ${record.hours}시간 ${record.note ? `(${record.note})` : ''}`
  )
  .join('\n')}

다음 형식으로 응답해주세요:

ADVICE: (전반적인 수면 상태에 대한 따뜻하고 친근한 조언, 2-3문장)

QUALITY: (excellent/good/fair/poor 중 하나)

RECOMMENDATIONS: (구체적인 개선 방안 3-4개, 각각 한 줄씩)

INSIGHTS: (수면 패턴에서 발견한 흥미로운 인사이트 2-3개, 각각 한 줄씩)

조언은 한국어로 작성하고, 의료적 진단이 아닌 일반적인 건강 조언임을 명시해주세요.
`

    try {
      // Google Gemini API 호출
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ]
          })
        }
      )

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`)
      }

      const data = await response.json()
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      // 응답 파싱
      const advice = extractSection(responseText, 'ADVICE')
      const quality = extractSection(responseText, 'QUALITY') as SleepAnalysis['sleepQuality']
      const recommendations = extractListSection(responseText, 'RECOMMENDATIONS')
      const insights = extractListSection(responseText, 'INSIGHTS')

      return {
        advice: advice || '건강한 수면 습관을 유지하시고 있습니다. 지속적인 관리가 중요합니다.',
        sleepQuality: isValidQuality(quality) ? quality : 'fair',
        recommendations:
          recommendations.length > 0
            ? recommendations
            : ['규칙적인 수면 시간 유지', '침실 환경 개선'],
        insights: insights.length > 0 ? insights : ['수면 패턴이 안정적입니다']
      }
    } catch (error) {
      console.error('AI 분석 중 오류 발생:', error)

      // 폴백 분석
      return {
        advice: `평균 ${averageHours.toFixed(1)}시간의 수면을 취하고 계시네요. ${
          averageHours >= 7 && averageHours <= 9
            ? '적정 수면시간을 잘 유지하고 계십니다!'
            : averageHours < 7
              ? '조금 더 충분한 수면을 취해보세요.'
              : '수면시간을 조금 줄여보는 것도 좋겠습니다.'
        }`,
        sleepQuality: averageHours >= 7 && averageHours <= 9 ? 'good' : 'fair',
        recommendations: [
          '규칙적인 수면 시간 유지하기',
          '잠들기 전 스마트폰 사용 줄이기',
          '침실 온도를 18-22도로 유지하기',
          '카페인 섭취 시간 조절하기'
        ],
        insights: [
          `총 ${totalRecords}일간의 수면 데이터가 수집되었습니다`,
          `최근 일주일 평균은 ${recentAverage.toFixed(1)}시간입니다`
        ]
      }
    }
  }

  return {
    analyzeSleepPattern
  }
}

// 유틸리티 함수들
function extractSection(text: string, section: string): string {
  const regex = new RegExp(`${section}:\\s*(.+?)(?=\\n[A-Z]+:|$)`, 's')
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

function extractListSection(text: string, section: string): string[] {
  const content = extractSection(text, section)
  if (!content) return []

  return content
    .split('\n')
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(line => line.length > 0)
}

function isValidQuality(quality: string): quality is SleepAnalysis['sleepQuality'] {
  return ['excellent', 'good', 'fair', 'poor'].includes(quality)
}

export type AIAdvisorService = ReturnType<typeof createAIAdvisorService>
