import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SleepBadges } from '../../components/SleepBadges'

interface BadgeStats {
  totalEarned: number
  recentlyEarned: string[]
  nextMilestone: string
  completionPercentage: number
}

export const SleepBadgesPage: React.FC = () => {
  const [sleepData, setSleepData] = useState<any[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [averageHours, setAverageHours] = useState(0)
  const [badgeStats, setBadgeStats] = useState<BadgeStats>({
    totalEarned: 0,
    recentlyEarned: [],
    nextMilestone: '',
    completionPercentage: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBadgeData()
  }, [])

  const fetchBadgeData = async () => {
    try {
      setLoading(true)

      // 실제 API 호출
      const response = await fetch('/api/sleep-records')
      const result = await response.json()

      if (result.success) {
        const records = result.data
        setSleepData(records)

        const avgHours =
          records.length > 0
            ? records.reduce((sum: number, record: any) => sum + record.hours, 0) / records.length
            : 0
        setAverageHours(avgHours)

        const streak = calculateStreak(records)
        setCurrentStreak(streak)
      }
    } catch (error) {
      console.error('뱃지 데이터 로드 실패:', error)
      // 개발용 더미 데이터
      setSleepData([
        { date: '2024-01-01', hours: 7.5 },
        { date: '2024-01-02', hours: 8.0 },
        { date: '2024-01-03', hours: 6.5 },
        { date: '2024-01-04', hours: 7.8 },
        { date: '2024-01-05', hours: 8.2 }
      ])
      setAverageHours(7.6)
      setCurrentStreak(5)
    } finally {
      setLoading(false)
    }
  }

  const calculateStreak = (records: any[]): number => {
    return Math.min(records.length, 30)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">뱃지 데이터를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center space-x-3">
            <span className="text-5xl">🏆</span>
            <span>수면 성취 뱃지</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            꾸준한 수면 관리로 다양한 뱃지를 수집하고, 건강한 수면 습관을 만들어가세요!
          </p>
        </div>

        {/* 네비게이션 */}
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <span>🏠</span>
                <span>대시보드</span>
              </Link>
              <Link
                to="/sleep/statistics"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <span>📊</span>
                <span>통계</span>
              </Link>
              <Link
                to="/sleep/ai-advice"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <span>🤖</span>
                <span>AI 조언</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 뱃지 시스템 */}
        <SleepBadges
          sleepData={sleepData}
          currentStreak={currentStreak}
          averageHours={averageHours}
        />

        {/* 하단 격려 & 팁 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              💡 뱃지 획득 팁
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 font-bold">1.</span>
                <p className="text-gray-600">매일 꾸준히 수면 기록을 작성하세요</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 font-bold">2.</span>
                <p className="text-gray-600">규칙적인 취침 시간을 유지하세요</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-500 font-bold">3.</span>
                <p className="text-gray-600">7-9시간의 적절한 수면 시간을 목표로 하세요</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-orange-500 font-bold">4.</span>
                <p className="text-gray-600">수면 환경을 개선하여 질 좋은 잠을 자세요</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">🎯 다음 목표</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-800">일주일 챔피언</span>
                  <span className="text-blue-600">🗓️</span>
                </div>
                <p className="text-sm text-blue-600 mb-2">7일 연속 기록 달성</p>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min((currentStreak / 7) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-blue-600 mt-1">{currentStreak}/7 달성</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-purple-800">수면 마스터</span>
                  <span className="text-purple-600">😴</span>
                </div>
                <p className="text-sm text-purple-600 mb-2">평균 7-9시간 수면 달성</p>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${
                        averageHours >= 7 && averageHours <= 9
                          ? 100
                          : Math.max(0, Math.min((averageHours / 7) * 100, 100))
                      }%`
                    }}
                  />
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  현재 평균: {averageHours.toFixed(1)}시간
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
