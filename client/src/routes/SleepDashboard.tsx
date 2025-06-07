import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SleepBadges } from '../components/SleepBadges'

interface QuickStats {
  totalRecords: number
  averageHours: number
  currentStreak: number
  todayStatus: 'recorded' | 'not-recorded'
}

interface RecentBadge {
  id: string
  name: string
  icon: string
  earnedDate: string
}

export const SleepDashboard: React.FC = () => {
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalRecords: 0,
    averageHours: 0,
    currentStreak: 0,
    todayStatus: 'not-recorded'
  })

  const [recentBadges, setRecentBadges] = useState<RecentBadge[]>([])
  const [sleepData, setSleepData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // 수면 기록 데이터 가져오기 (실제 API 호출)
      const sleepResponse = await fetch('/api/sleep-records')
      const sleepResult = await sleepResponse.json()

      if (sleepResult.success) {
        const records = sleepResult.data
        setSleepData(records)

        // 통계 계산
        const totalRecords = records.length
        const averageHours =
          totalRecords > 0
            ? records.reduce((sum: number, record: any) => sum + record.hours, 0) / totalRecords
            : 0

        // 연속 기록 계산 (간단한 예시)
        const currentStreak = calculateStreak(records)

        // 오늘 기록 여부 확인
        const today = new Date().toISOString().split('T')[0]
        const todayStatus = records.some((record: any) => record.date === today)
          ? ('recorded' as const)
          : ('not-recorded' as const)

        setQuickStats({
          totalRecords,
          averageHours,
          currentStreak,
          todayStatus
        })
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error)
      // 개발용 더미 데이터
      setSleepData([
        { date: '2024-01-01', hours: 7.5 },
        { date: '2024-01-02', hours: 8.0 },
        { date: '2024-01-03', hours: 6.5 },
        { date: '2024-01-04', hours: 7.8 },
        { date: '2024-01-05', hours: 8.2 }
      ])

      setQuickStats({
        totalRecords: 5,
        averageHours: 7.6,
        currentStreak: 5,
        todayStatus: 'not-recorded'
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStreak = (records: any[]): number => {
    // 간단한 연속 기록 계산 로직
    if (records.length === 0) return 0

    // 실제로는 날짜 순으로 정렬하여 연속성 확인
    return Math.min(records.length, 30) // 최대 30일로 제한
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return { text: '늦은 밤이네요! 🌙', color: 'text-purple-600' }
    if (hour < 12) return { text: '좋은 아침이에요! ☀️', color: 'text-yellow-600' }
    if (hour < 18) return { text: '좋은 오후에요! 🌤️', color: 'text-blue-600' }
    return { text: '좋은 저녁이에요! 🌅', color: 'text-orange-600' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">대시보드를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const greeting = getGreeting()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 헤더 & 인사말 */}
        <div className="text-center space-y-4">
          <h1 className={`text-4xl font-bold ${greeting.color} mb-2`}>{greeting.text}</h1>
          <p className="text-xl text-gray-600">수면 관리의 모든 것을 한눈에 확인해보세요</p>
        </div>

        {/* 오늘의 상태 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`p-4 rounded-full ${
                  quickStats.todayStatus === 'recorded' ? 'bg-green-100' : 'bg-yellow-100'
                }`}
              >
                <span className="text-3xl">
                  {quickStats.todayStatus === 'recorded' ? '✅' : '📝'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {quickStats.todayStatus === 'recorded'
                    ? '오늘 수면 기록 완료!'
                    : '오늘 수면 기록을 남겨보세요!'}
                </h2>
                <p className="text-gray-600">
                  {quickStats.todayStatus === 'recorded'
                    ? '꾸준한 기록으로 건강한 습관을 만들어가고 있어요!'
                    : '매일 기록하여 수면 패턴을 개선해보세요!'}
                </p>
              </div>
            </div>
            {quickStats.todayStatus === 'not-recorded' && (
              <Link
                to="/sleep/new"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-medium"
              >
                🌙 기록하기
              </Link>
            )}
          </div>
        </div>

        {/* 퀵 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 기록일</p>
                <p className="text-3xl font-bold text-blue-600">{quickStats.totalRecords}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">평균 수면시간</p>
                <p className="text-3xl font-bold text-green-600">
                  {quickStats.averageHours.toFixed(1)}h
                </p>
              </div>
              <div className="text-4xl">⏰</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">연속 기록</p>
                <p className="text-3xl font-bold text-purple-600">{quickStats.currentStreak}</p>
              </div>
              <div className="text-4xl">🔥</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">수면 품질</p>
                <p className="text-3xl font-bold text-orange-600">
                  {quickStats.averageHours >= 7 ? '좋음' : '개선필요'}
                </p>
              </div>
              <div className="text-4xl">{quickStats.averageHours >= 7 ? '😊' : '😴'}</div>
            </div>
          </div>
        </div>

        {/* 뱃지 시스템 (메인 컨텐츠) */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🏆 나의 수면 성취</h2>
            <p className="text-gray-600">
              꾸준한 기록으로 다양한 뱃지를 획득하고 건강한 수면 습관을 만들어보세요!
            </p>
          </div>

          <SleepBadges
            sleepData={sleepData}
            currentStreak={quickStats.currentStreak}
            averageHours={quickStats.averageHours}
          />
        </div>

        {/* 빠른 액션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/sleep/new"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="text-3xl">📝</div>
              <div>
                <h3 className="text-xl font-bold">새 기록 작성</h3>
                <p className="opacity-90">오늘의 수면을 기록해보세요</p>
              </div>
            </div>
          </Link>

          <Link
            to="/sleep/statistics"
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="text-3xl">📊</div>
              <div>
                <h3 className="text-xl font-bold">통계 보기</h3>
                <p className="opacity-90">수면 패턴을 분석해보세요</p>
              </div>
            </div>
          </Link>

          <Link
            to="/sleep/ai-advice"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🤖</div>
              <div>
                <h3 className="text-xl font-bold">AI 조언</h3>
                <p className="opacity-90">개인 맞춤 조언을 받아보세요</p>
              </div>
            </div>
          </Link>
        </div>

        {/* 격려 메시지 */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🌟</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">수면 관리, 정말 잘하고 있어요!</h3>
          <p className="text-gray-600">
            꾸준한 기록으로 더 건강한 수면 습관을 만들어가세요. 작은 변화가 큰 차이를 만듭니다! 💪
          </p>
        </div>
      </div>
    </div>
  )
}
