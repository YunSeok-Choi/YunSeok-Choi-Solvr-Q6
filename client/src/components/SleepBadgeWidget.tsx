import React from 'react'
import { Link } from 'react-router-dom'

interface BadgeWidgetProps {
  sleepData: any[]
  currentStreak: number
  averageHours: number
  compact?: boolean // 컴팩트 모드
}

export const SleepBadgeWidget: React.FC<BadgeWidgetProps> = ({
  sleepData,
  currentStreak,
  averageHours,
  compact = false
}) => {
  // 간단한 뱃지 계산
  const calculateEarnedBadges = () => {
    const badges = []

    // 첫 기록
    if (sleepData.length >= 1) {
      badges.push({ id: 'first', icon: '🌱', name: '첫 기록' })
    }

    // 일주일 챔피언
    if (currentStreak >= 7) {
      badges.push({ id: 'week', icon: '🗓️', name: '일주일 챔피언' })
    }

    // 수면 마스터
    if (averageHours >= 7 && averageHours <= 9) {
      badges.push({ id: 'master', icon: '😴', name: '수면 마스터' })
    }

    // 한달 마스터
    if (currentStreak >= 30) {
      badges.push({ id: 'month', icon: '📅', name: '한달 마스터' })
    }

    return badges
  }

  const earnedBadges = calculateEarnedBadges()
  const totalPossibleBadges = 9 // 전체 뱃지 수
  const completionRate = Math.round((earnedBadges.length / totalPossibleBadges) * 100)

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center">🏆 뱃지</h3>
          <Link to="/sleep/badges" className="text-sm text-blue-600 hover:text-blue-800">
            전체보기
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex -space-x-1">
            {earnedBadges.slice(0, 3).map((badge, index) => (
              <div
                key={badge.id}
                className="w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center text-lg"
                title={badge.name}
              >
                {badge.icon}
              </div>
            ))}
            {earnedBadges.length > 3 && (
              <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                +{earnedBadges.length - 3}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="text-sm text-gray-600">
              {earnedBadges.length}/{totalPossibleBadges} 획득
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">🏆 최근 획득 뱃지</h3>
        <Link to="/sleep/badges" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          모든 뱃지 보기 →
        </Link>
      </div>

      {earnedBadges.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🌟</div>
          <p className="text-gray-600 mb-4">아직 획득한 뱃지가 없어요!</p>
          <p className="text-sm text-gray-500">수면 기록을 시작하여 첫 번째 뱃지를 획득해보세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 최근 뱃지들 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {earnedBadges.slice(0, 4).map(badge => (
              <div
                key={badge.id}
                className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="text-sm font-medium text-gray-700">{badge.name}</div>
              </div>
            ))}
          </div>

          {/* 진행 상황 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">뱃지 수집 진행률</span>
              <span className="text-sm font-bold text-purple-600">{completionRate}%</span>
            </div>
            <div className="w-full bg-white rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{earnedBadges.length}개 획득</span>
              <span>{totalPossibleBadges - earnedBadges.length}개 남음</span>
            </div>
          </div>

          {/* 다음 목표 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center">🎯 다음 도전</h4>
            <div className="space-y-2">
              {currentStreak < 7 && (
                <div className="text-sm text-yellow-700">
                  • 일주일 챔피언까지 {7 - currentStreak}일 남았어요!
                </div>
              )}
              {!(averageHours >= 7 && averageHours <= 9) && (
                <div className="text-sm text-yellow-700">
                  • 수면 마스터가 되려면 평균 7-9시간 수면이 필요해요!
                </div>
              )}
              {currentStreak < 30 && currentStreak >= 7 && (
                <div className="text-sm text-yellow-700">
                  • 한달 마스터까지 {30 - currentStreak}일 남았어요!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
