import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

interface CreateSleepRecordDto {
  date: string
  hours: number
  note?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

const SleepCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CreateSleepRecordDto>({
    date: new Date().toISOString().split('T')[0], // 오늘 날짜로 기본값
    hours: 8,
    note: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      setLoading(true)
      const response = await fetch('/api/sleep-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: formData.date,
          hours: formData.hours,
          note: formData.note || undefined
        })
      })

      const result: ApiResponse<any> = await response.json()

      if (result.success) {
        navigate('/')
      } else {
        alert(result.error || '수면 기록 생성에 실패했습니다.')
      }
    } catch (err) {
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">새 수면 기록</h1>
              <p className="text-gray-600">오늘의 수면 정보를 기록해보세요</p>
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

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Link
                to="/"
                className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>저장 중...</span>
                  </div>
                ) : (
                  '수면 기록 저장'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 수면 기록 팁</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• 일정한 시간에 잠자리에 들고 일어나는 습관을 만들어보세요</li>
            <li>• 성인의 권장 수면시간은 하루 7-9시간입니다</li>
            <li>• 수면의 질을 높이기 위해 잠들기 전 스마트폰 사용을 줄여보세요</li>
            <li>• 카페인이나 알코올 섭취 시간도 함께 기록해보시면 도움이 됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SleepCreatePage
