import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'

interface SleepRecord {
  id: number
  date: string
  hours: number
  note?: string
  createdAt: string
  updatedAt: string
}

interface UpdateSleepRecordDto {
  date?: string
  hours?: number
  note?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

const SleepEditPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [sleepRecord, setSleepRecord] = useState<SleepRecord | null>(null)
  const [formData, setFormData] = useState<UpdateSleepRecordDto>({
    date: '',
    hours: 8,
    note: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (id) {
      fetchSleepRecord(parseInt(id))
    }
  }, [id])

  const fetchSleepRecord = async (recordId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sleep-records/${recordId}`)
      const result: ApiResponse<SleepRecord> = await response.json()

      if (result.success && result.data) {
        setSleepRecord(result.data)
        setFormData({
          date: result.data.date,
          hours: result.data.hours,
          note: result.data.note || ''
        })
      } else {
        alert(result.error || '수면 기록을 불러오는데 실패했습니다.')
        navigate('/')
      }
    } catch (err) {
      alert('네트워크 오류가 발생했습니다.')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.date) {
      newErrors.date = '날짜를 선택해주세요.'
    }

    if (!formData.hours || formData.hours <= 0) {
      newErrors.hours = '수면 시간을 입력해주세요.'
    } else if (formData.hours > 24) {
      newErrors.hours = '수면 시간은 24시간을 초과할 수 없습니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/sleep-records/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: formData.date,
          hours: formData.hours,
          note: formData.note || undefined
        })
      })

      const result: ApiResponse<SleepRecord> = await response.json()

      if (result.success) {
        navigate('/')
      } else {
        alert(result.error || '수면 기록 수정에 실패했습니다.')
      }
    } catch (err) {
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hours' ? parseFloat(value) || 0 : value
    }))

    // 입력 시 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleDelete = async () => {
    if (!confirm('이 수면 기록을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/sleep-records/${id}`, {
        method: 'DELETE'
      })

      const result: ApiResponse<null> = await response.json()

      if (result.success) {
        navigate('/')
      } else {
        alert(result.error || '삭제에 실패했습니다.')
      }
    } catch (err) {
      alert('네트워크 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!sleepRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">수면 기록을 찾을 수 없습니다.</p>
            <Link
              to="/"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">수면 기록 수정</h1>
              <p className="text-gray-600">
                {new Date(sleepRecord.date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}{' '}
                기록을 수정합니다
              </p>
            </div>
            <Link
              to="/"
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              목록으로
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Input */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                수면 날짜 *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            {/* Hours Input */}
            <div>
              <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-2">
                수면 시간 (시간) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="hours"
                  name="hours"
                  value={formData.hours}
                  onChange={handleInputChange}
                  min="0"
                  max="24"
                  step="0.5"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.hours ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="8"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 text-sm">시간</span>
                </div>
              </div>
              {errors.hours && <p className="mt-1 text-sm text-red-600">{errors.hours}</p>}
              <p className="mt-1 text-sm text-gray-500">
                0.5 단위로 입력 가능합니다. (예: 7.5시간)
              </p>
            </div>

            {/* Note Input */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                메모 (선택사항)
              </label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-vertical"
                placeholder="수면의 질이나 특이사항을 기록해보세요..."
                maxLength={500}
              />
              <div className="mt-1 flex justify-between text-sm text-gray-500">
                <span>수면의 질, 꿈, 잠들기까지 걸린 시간 등을 기록해보세요</span>
                <span>{formData.note?.length || 0}/500</span>
              </div>
            </div>

            {/* Sleep Time Suggestions */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">추천 수면 시간</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[6, 7, 8, 9].map(hours => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, hours }))}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.hours === hours
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {hours}시간
                  </button>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">기록 정보</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>생성일: {new Date(sleepRecord.createdAt).toLocaleString('ko-KR')}</p>
                <p>수정일: {new Date(sleepRecord.updatedAt).toLocaleString('ko-KR')}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                기록 삭제
              </button>

              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    saving
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {saving ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>저장 중...</span>
                    </div>
                  ) : (
                    '수정 사항 저장'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SleepEditPage
