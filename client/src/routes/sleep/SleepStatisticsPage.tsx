import React, { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { Clock, TrendingUp, Calendar, AlertCircle, Loader2 } from 'lucide-react'
import axios from 'axios'

interface SleepStatistics {
  overallAverage: number
  weeklyAverages: {
    [key: string]: number
  }
  weeklyTrends: Array<{
    week: string
    average: number
  }>
}

const SleepStatisticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<SleepStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get('/api/sleep-records/sleep-statistics')

        if (response.data.success) {
          setStatistics(response.data.data)
        } else {
          setError('통계 데이터를 불러오는데 실패했습니다.')
        }
      } catch (err) {
        console.error('통계 데이터 로드 에러:', err)
        setError('서버에서 데이터를 가져오는데 문제가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  // 요일별 데이터를 차트용으로 변환
  const weeklyChartData = statistics
    ? Object.entries(statistics.weeklyAverages).map(([day, hours]) => ({
        day,
        hours: Number(hours.toFixed(1))
      }))
    : []

  // 최근 7일 추이 데이터 (weeklyTrends의 마지막 7개 또는 전체)
  const recentTrendsData = statistics
    ? statistics.weeklyTrends.slice(-7).map((trend, index) => ({
        day: `${trend.week}`,
        hours: Number(trend.average.toFixed(1))
      }))
    : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3 text-purple-600">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-lg font-medium">통계 데이터를 불러오는 중...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center flex-col space-y-4">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">데이터 로드 실패</h2>
              <p className="text-gray-600 text-center">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center space-x-3">
            <Calendar className="h-10 w-10 text-purple-600" />
            <span>수면 통계 보기</span>
          </h1>
          <p className="text-gray-600 text-lg">나의 수면 패턴을 분석해보세요</p>
        </div>

        {/* 전체 평균 카드 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="bg-purple-100 p-4 rounded-full">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700">전체 평균 수면시간</h3>
              <p className="text-4xl font-bold text-purple-600 mt-2">
                {statistics?.overallAverage.toFixed(1)}시간
              </p>
            </div>
          </div>
        </div>

        {/* 차트 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 요일별 수면시간 바차트 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <BarChart className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">요일별 평균 수면시간</h3>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    domain={[0, 'dataMax + 1']}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    label={{
                      value: '시간',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}시간`, '수면시간']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="수면시간" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 주간별 추이 라인차트 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">주간별 수면시간 추이</h3>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={recentTrendsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    label={{
                      value: '시간',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}시간`, '평균 수면시간']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 하단 요약 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-yellow-100 p-3 rounded-full w-fit mx-auto mb-4">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">가장 잠을 많이 자는 요일</h4>
            <p className="text-2xl font-bold text-yellow-600">
              {weeklyChartData.length > 0
                ? weeklyChartData.reduce((max, curr) => (curr.hours > max.hours ? curr : max)).day
                : '-'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-red-100 p-3 rounded-full w-fit mx-auto mb-4">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">가장 잠을 적게 자는 요일</h4>
            <p className="text-2xl font-bold text-red-600">
              {weeklyChartData.length > 0
                ? weeklyChartData.reduce((min, curr) => (curr.hours < min.hours ? curr : min)).day
                : '-'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">주간별 데이터 포인트</h4>
            <p className="text-2xl font-bold text-blue-600">
              {statistics?.weeklyTrends.length || 0}주
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SleepStatisticsPage
