import React, { useState, useEffect } from 'react'

interface SleepAnalysis {
  advice: string
  sleepQuality: 'excellent' | 'good' | 'fair' | 'poor'
  recommendations: string[]
  insights: string[]
}

interface AIAdviceResponse {
  success: boolean
  data: SleepAnalysis
  message: string
}

const qualityColors = {
  excellent: 'from-green-500 to-emerald-500',
  good: 'from-blue-500 to-cyan-500',
  fair: 'from-yellow-500 to-orange-500',
  poor: 'from-red-500 to-pink-500'
}

const qualityLabels = {
  excellent: '훌륭함',
  good: '좋음',
  fair: '보통',
  poor: '개선 필요'
}

const qualityIcons = {
  excellent: '🌟',
  good: '😊',
  fair: '😐',
  poor: '😴'
}

export const AIAdvicePage: React.FC = () => {
  const [analysis, setAnalysis] = useState<SleepAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAIAdvice()
  }, [])

  const fetchAIAdvice = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai/ai-advice')
      const data: AIAdviceResponse = await response.json()

      if (data.success) {
        setAnalysis(data.data)
      } else {
        setError('AI 분석을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('AI 조언 조회 실패:', err)
      setError('AI 분석을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">AI가 수면 패턴을 분석 중입니다...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">오류 발생</div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchAIAdvice}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-700">AI 분석 결과가 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI 수면 분석 & 조언</h1>
        <p className="text-gray-600">
          인공지능이 당신의 수면 패턴을 분석하고 개인 맞춤형 조언을 제공합니다
        </p>
      </div>

      {/* 수면 품질 카드 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">수면 품질 평가</h2>
          <button
            onClick={fetchAIAdvice}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            새로고침
          </button>
        </div>

        <div
          className={`bg-gradient-to-r ${qualityColors[analysis.sleepQuality]} rounded-lg p-6 text-white`}
        >
          <div className="flex items-center justify-center mb-4">
            <span className="text-6xl mr-4">{qualityIcons[analysis.sleepQuality]}</span>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{qualityLabels[analysis.sleepQuality]}</div>
              <div className="text-lg opacity-90">현재 수면 상태</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI 조언 카드 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          💡 AI 전문가 조언
        </h2>
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-gray-700 leading-relaxed">{analysis.advice}</p>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          ⚠️ 이 조언은 일반적인 건강 정보이며, 의료적 진단을 대체하지 않습니다.
        </div>
      </div>

      {/* 맞춤 추천사항 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          🎯 맞춤 추천사항
        </h2>
        <div className="grid gap-3">
          {analysis.recommendations.map((recommendation, index) => (
            <div
              key={index}
              className="flex items-start bg-green-50 rounded-lg p-4 border-l-4 border-green-500"
            >
              <span className="text-green-600 font-bold mr-3">{index + 1}.</span>
              <p className="text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 수면 인사이트 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          📊 수면 패턴 인사이트
        </h2>
        <div className="grid gap-3">
          {analysis.insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500"
            >
              <span className="text-purple-600 text-xl mr-3">📈</span>
              <p className="text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 면책 조항 */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-yellow-600 text-xl mr-3">⚠️</span>
          <div className="text-sm text-yellow-800">
            <strong>면책 조항:</strong> 이 AI 분석은 참고용이며, 심각한 수면 문제가 있다면 전문의와
            상담하시기 바랍니다. 개인의 건강 상태에 따라 결과가 다를 수 있습니다.
          </div>
        </div>
      </div>
    </div>
  )
}
