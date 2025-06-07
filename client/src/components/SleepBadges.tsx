import React from 'react'

interface Badge {
  id: string
  name: string
  icon: string
  description: string
  condition: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earned: boolean
  progress?: number
  maxProgress?: number
  earnedDate?: string
}

interface SleepBadgesProps {
  sleepData: any[] // 수면 기록 데이터
  currentStreak: number
  averageHours: number
}

const badgeDefinitions: Omit<Badge, 'earned' | 'progress' | 'earnedDate'>[] = [
  {
    id: 'first-record',
    name: '수면 기록의 시작',
    icon: '🌱',
    description: '첫 번째 수면 기록을 작성했어요! 건강한 습관의 첫걸음!',
    condition: '수면 기록 1개 작성',
    rarity: 'common',
    maxProgress: 1
  },
  {
    id: 'early-bird',
    name: '일찍 일어나는 새',
    icon: '🐦',
    description: '오전 6시 전에 기상한 기록이 5번! 아침형 인간이시네요!',
    condition: '오전 6시 이전 기상 5회',
    rarity: 'rare',
    maxProgress: 5
  },
  {
    id: 'week-warrior',
    name: '일주일 챔피언',
    icon: '🗓️',
    description: '7일 연속 기록 달성! 꾸준함의 힘을 보여주셨어요!',
    condition: '7일 연속 기록',
    rarity: 'rare',
    maxProgress: 7
  },
  {
    id: 'sleep-master',
    name: '수면 마스터',
    icon: '😴',
    description: '평균 수면시간 7-9시간 달성! 이상적인 수면 패턴이에요!',
    condition: '이상적 수면시간 달성',
    rarity: 'epic'
  },
  {
    id: 'night-owl',
    name: '올빼미족 탈출',
    icon: '🦉',
    description: '자정 전 취침 기록 10번! 건강한 수면 습관을 만들어가고 있어요!',
    condition: '자정 전 취침 10회',
    rarity: 'epic',
    maxProgress: 10
  },
  {
    id: 'month-master',
    name: '한 달 마스터',
    icon: '📅',
    description: '30일 연속 기록의 대가! 정말 대단한 의지력이에요!',
    condition: '30일 연속 기록',
    rarity: 'epic',
    maxProgress: 30
  },
  {
    id: 'consistency-king',
    name: '일관성의 왕',
    icon: '👑',
    description: '수면시간 편차 1시간 이내! 놀라운 일관성을 보여주셨네요!',
    condition: '일정한 수면 패턴 유지',
    rarity: 'legendary'
  },
  {
    id: 'hundred-days',
    name: '백일장 마스터',
    icon: '💯',
    description: '100일 연속 기록! 수면 관리의 진정한 달인이시네요!',
    condition: '100일 연속 기록',
    rarity: 'legendary',
    maxProgress: 100
  },
  {
    id: 'perfect-week',
    name: '완벽한 일주일',
    icon: '⭐',
    description: '일주일 동안 모든 날 목표 수면시간 달성! 완벽해요!',
    condition: '주간 목표 100% 달성',
    rarity: 'legendary'
  }
]

const rarityStyles = {
  common: {
    border: 'border-gray-300',
    bg: 'bg-gray-50',
    shadow: 'shadow-md',
    glow: ''
  },
  rare: {
    border: 'border-blue-300',
    bg: 'bg-blue-50',
    shadow: 'shadow-lg',
    glow: 'shadow-blue-200'
  },
  epic: {
    border: 'border-purple-300',
    bg: 'bg-purple-50',
    shadow: 'shadow-xl',
    glow: 'shadow-purple-200'
  },
  legendary: {
    border: 'border-yellow-300',
    bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    shadow: 'shadow-2xl',
    glow: 'shadow-yellow-300'
  }
}

const rarityColors = {
  common: 'text-gray-600',
  rare: 'text-blue-600',
  epic: 'text-purple-600',
  legendary:
    'text-gradient bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent'
}

const rarityLabels = {
  common: '일반',
  rare: '레어',
  epic: '에픽',
  legendary: '레전더리'
}

export const SleepBadges: React.FC<SleepBadgesProps> = ({
  sleepData,
  currentStreak,
  averageHours
}) => {
  const checkBadgeEarned = (badge: Omit<Badge, 'earned' | 'progress' | 'earnedDate'>): Badge => {
    let earned = false
    let progress = 0
    let earnedDate: string | undefined

    switch (badge.id) {
      case 'first-record':
        earned = sleepData.length >= 1
        progress = Math.min(sleepData.length, 1)
        if (earned) earnedDate = sleepData[0]?.date
        break

      case 'week-warrior':
        earned = currentStreak >= 7
        progress = Math.min(currentStreak, 7)
        if (earned) earnedDate = new Date().toISOString().split('T')[0]
        break

      case 'month-master':
        earned = currentStreak >= 30
        progress = Math.min(currentStreak, 30)
        if (earned) earnedDate = new Date().toISOString().split('T')[0]
        break

      case 'hundred-days':
        earned = currentStreak >= 100
        progress = Math.min(currentStreak, 100)
        if (earned) earnedDate = new Date().toISOString().split('T')[0]
        break

      case 'early-bird':
        // 실제로는 기상 시간 데이터 분석 필요
        const earlyRecords = Math.floor(sleepData.length * 0.3) // 30% 확률로 일찍 기상
        earned = earlyRecords >= 5
        progress = Math.min(earlyRecords, 5)
        if (earned) earnedDate = new Date().toISOString().split('T')[0]
        break

      case 'night-owl':
        // 실제로는 취침 시간 데이터 분석 필요
        const earlyBedRecords = Math.floor(sleepData.length * 0.4) // 40% 확률로 일찍 취침
        earned = earlyBedRecords >= 10
        progress = Math.min(earlyBedRecords, 10)
        if (earned) earnedDate = new Date().toISOString().split('T')[0]
        break

      case 'sleep-master':
        earned = averageHours >= 7 && averageHours <= 9
        if (earned) earnedDate = new Date().toISOString().split('T')[0]
        break

      case 'consistency-king':
        // 수면시간 편차 계산
        if (sleepData.length >= 7) {
          const hours = sleepData.map((record: any) => record.hours || 8)
          const avg = hours.reduce((sum: number, h: number) => sum + h, 0) / hours.length
          const variance =
            hours.reduce((sum: number, h: number) => sum + Math.pow(h - avg, 2), 0) / hours.length
          const stdDev = Math.sqrt(variance)
          earned = stdDev <= 1 // 표준편차 1시간 이내
          if (earned) earnedDate = new Date().toISOString().split('T')[0]
        }
        break

      case 'perfect-week':
        // 실제로는 목표 달성률 계산 필요
        earned = sleepData.length >= 7 && currentStreak >= 7 && averageHours >= 7
        if (earned) earnedDate = new Date().toISOString().split('T')[0]
        break
    }

    return {
      ...badge,
      earned,
      progress: badge.maxProgress ? progress : undefined,
      earnedDate
    }
  }

  const badges = badgeDefinitions.map(checkBadgeEarned)
  const earnedBadges = badges.filter(badge => badge.earned)
  const nextBadges = badges
    .filter(badge => !badge.earned && badge.progress !== undefined)
    .slice(0, 3)
  const lockedBadges = badges.filter(badge => !badge.earned && badge.progress === undefined)

  const renderBadge = (badge: Badge, showDetails: boolean = true) => {
    const style = rarityStyles[badge.rarity]

    return (
      <div
        key={badge.id}
        className={`
          relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105
          ${
            badge.earned
              ? `${style.border} ${style.bg} ${style.shadow} ${style.glow}`
              : 'border-dashed border-gray-300 bg-gray-50 opacity-70'
          }
        `}
      >
        {/* 획득 표시 */}
        {badge.earned && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        )}

        {/* 희귀도 라벨 */}
        {badge.earned && (
          <div
            className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
              badge.rarity === 'legendary'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                : badge.rarity === 'epic'
                  ? 'bg-purple-500 text-white'
                  : badge.rarity === 'rare'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-500 text-white'
            }`}
          >
            {rarityLabels[badge.rarity]}
          </div>
        )}

        <div className="text-center mt-6">
          {/* 뱃지 아이콘 */}
          <div className={`text-4xl mb-3 ${badge.earned ? '' : 'grayscale opacity-50'}`}>
            {badge.icon}
          </div>

          {/* 뱃지 이름 */}
          <h3
            className={`font-bold mb-2 ${
              badge.earned ? rarityColors[badge.rarity] : 'text-gray-400'
            }`}
          >
            {badge.name}
          </h3>

          {/* 설명 */}
          {showDetails && (
            <>
              <p className="text-xs text-gray-600 mb-2 leading-relaxed">{badge.description}</p>
              <div className="text-xs text-gray-500 mb-3">{badge.condition}</div>
            </>
          )}

          {/* 진행도 바 */}
          {badge.maxProgress && badge.progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>진행도</span>
                <span>
                  {badge.progress} / {badge.maxProgress}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    badge.earned
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                  style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* 획득 날짜 */}
          {badge.earned && badge.earnedDate && showDetails && (
            <div className="mt-2 text-xs text-gray-500">
              📅 {new Date(badge.earnedDate).toLocaleDateString('ko-KR')} 획득
            </div>
          )}
        </div>
      </div>
    )
  }

  const getRarityStats = () => {
    const stats = { common: 0, rare: 0, epic: 0, legendary: 0 }
    earnedBadges.forEach(badge => stats[badge.rarity]++)
    return stats
  }

  const rarityStats = getRarityStats()

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          🏆 수면 성취 뱃지
        </h2>
        <p className="text-gray-600">꾸준한 수면 기록으로 다양한 뱃지를 수집해보세요!</p>
      </div>

      {/* 전체 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center border border-green-200">
          <div className="text-2xl font-bold text-green-600 mb-1">{earnedBadges.length}</div>
          <div className="text-sm text-green-700">획득한 뱃지</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 text-center border border-blue-200">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {Math.round((earnedBadges.length / badges.length) * 100)}%
          </div>
          <div className="text-sm text-blue-700">달성률</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 text-center border border-purple-200">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {rarityStats.legendary + rarityStats.epic}
          </div>
          <div className="text-sm text-purple-700">특별한 뱃지</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 text-center border border-orange-200">
          <div className="text-2xl font-bold text-orange-600 mb-1">{currentStreak}</div>
          <div className="text-sm text-orange-700">연속 기록</div>
        </div>
      </div>

      {/* 획득한 뱃지들 */}
      {earnedBadges.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            ✨ 획득한 뱃지 ({earnedBadges.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadges.map(badge => renderBadge(badge))}
          </div>
        </div>
      )}

      {/* 진행 중인 뱃지들 */}
      {nextBadges.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            🎯 진행 중인 도전
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nextBadges.map(badge => renderBadge(badge))}
          </div>
        </div>
      )}

      {/* 잠긴 뱃지들 (미리보기) */}
      {lockedBadges.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            🔒 잠긴 뱃지들
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {lockedBadges.slice(0, 6).map(badge => renderBadge(badge, false))}
          </div>
        </div>
      )}

      {/* 전체 진행률 */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <span className="text-lg font-semibold text-gray-700">전체 수집 진행률</span>
          <span className="text-lg font-bold text-blue-600">
            {earnedBadges.length} / {badges.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
          <div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(earnedBadges.length / badges.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 text-center">
          {earnedBadges.length === badges.length
            ? '🎉 모든 뱃지를 수집하셨습니다! 수면 마스터가 되셨네요!'
            : `${badges.length - earnedBadges.length}개의 뱃지가 당신을 기다리고 있어요! 💪`}
        </p>
      </div>

      {/* 격려 메시지 */}
      <div className="mt-6 text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
        <div className="text-xl mb-2">
          {earnedBadges.length === 0
            ? '🌟 첫 번째 뱃지를 향해 달려가세요!'
            : earnedBadges.length < 3
              ? '🔥 좋은 시작이에요! 계속 도전해보세요!'
              : earnedBadges.length < 6
                ? '💪 훌륭해요! 반 이상 달성했네요!'
                : '🏆 정말 대단해요! 거의 다 모으셨네요!'}
        </div>
        <p className="text-sm text-gray-600">
          매일 꾸준히 수면을 기록하며 건강한 습관을 만들어가세요! 🌙
        </p>
      </div>
    </div>
  )
}
