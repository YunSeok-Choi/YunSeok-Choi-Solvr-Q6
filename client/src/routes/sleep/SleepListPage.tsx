import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Edit, Plus, Moon, Clock, Calendar, FileText } from 'lucide-react'

interface SleepRecord {
  id: number
  date: string
  hours: number
  note?: string
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

const SleepListPage: React.FC = () => {
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSleepRecords()
  }, [])

  const fetchSleepRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/sleep-records')
      const result: ApiResponse<SleepRecord[]> = await response.json()

      if (result.success) {
        setSleepRecords(result.data)
      } else {
        setError(result.error || '수면 기록을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 수면 기록을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/sleep-records/${id}`, {
        method: 'DELETE'
      })

      const result: ApiResponse<null> = await response.json()

      if (result.success) {
        setSleepRecords(prev => prev.filter(record => record.id !== id))
      } else {
        alert(result.error || '삭제에 실패했습니다.')
      }
    } catch (err) {
      alert('네트워크 오류가 발생했습니다.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getHoursColor = (hours: number) => {
    if (hours < 6) return 'text-red-600'
    if (hours >= 6 && hours <= 8) return 'text-green-600'
    return 'text-blue-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchSleepRecords}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-100 rounded-full">
                <Moon className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">수면 기록</h1>
                <p className="text-gray-600">당신의 수면 패턴을 관리하세요</p>
              </div>
            </div>
            <Link
              to="/sleep/new"
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>새 기록</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {sleepRecords.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">총 기록</p>
                  <p className="text-2xl font-bold text-gray-900">{sleepRecords.length}일</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">평균 수면시간</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(
                      sleepRecords.reduce((sum, record) => sum + record.hours, 0) /
                      sleepRecords.length
                    ).toFixed(1)}
                    시간
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Moon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">최근 수면시간</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sleepRecords.length > 0 ? `${sleepRecords[0].hours}시간` : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Records List */}
        {sleepRecords.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Moon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 수면 기록이 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 수면 기록을 추가해보세요!</p>
            <Link
              to="/sleep/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>첫 기록 추가하기</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sleepRecords.map(record => (
              <div
                key={record.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-indigo-100 rounded-full">
                      <Moon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatDate(record.date)}
                        </h3>
                        <span className={`text-2xl font-bold ${getHoursColor(record.hours)}`}>
                          {record.hours}시간
                        </span>
                      </div>
                      {record.note && (
                        <div className="flex items-start space-x-2 text-gray-600">
                          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{record.note}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(record.createdAt).toLocaleString('ko-KR')} 기록
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/sleep/edit/${record.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="수정"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SleepListPage
