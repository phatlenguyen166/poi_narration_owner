import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Volume2, BarChart2, ChevronRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const steps = [
  {
    icon: MapPin,
    title: 'Tạo điểm thuyết minh (POI)',
    description: 'Đặt pin vị trí trên bản đồ và thiết lập vùng geofence. Khi khách bước vào vùng này, thuyết minh sẽ tự động phát.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Volume2,
    title: 'Thêm nội dung thuyết minh',
    description: 'Viết script thuyết minh hoặc upload file audio cho từng ngôn ngữ. Hệ thống hỗ trợ Text-to-Speech tự động.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: BarChart2,
    title: 'Theo dõi thống kê',
    description: 'Xem số lượt nghe, thời gian nghe trung bình và phân tích hành vi khách hàng theo thời gian thực.',
    color: 'bg-amber-100 text-amber-600',
  },
]

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()

  const handleNext = () => {
    if (current < steps.length - 1) {
      setCurrent(current + 1)
    } else {
      navigate('/dashboard')
    }
  }

  const step = steps[current]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? 'w-8 bg-orange-500' : i < current ? 'w-2 bg-orange-300' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${step.color} mb-6 mx-auto`}>
            <step.icon size={36} />
          </div>

              <div className="mb-2 text-sm font-medium text-orange-600">
            Bước {current + 1} / {steps.length}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">{step.description}</p>

          {/* Completed steps */}
          <div className="space-y-2 mb-8 text-left">
            {steps.slice(0, current).map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={16} />
                <span>{s.title}</span>
              </div>
            ))}
          </div>

          <Button onClick={handleNext} size="lg" className="w-full">
            {current < steps.length - 1 ? (
              <>Tiếp theo <ChevronRight size={16} /></>
            ) : (
              'Bắt đầu sử dụng!'
            )}
          </Button>

          {current < steps.length - 1 && (
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-3 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              Bỏ qua
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
