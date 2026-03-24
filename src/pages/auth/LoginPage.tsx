import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Radio } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'owner@poi.local',
      password: 'Owner@123',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password)
      toast.success('Đăng nhập thành công!')
      navigate('/dashboard')
    } catch {
      toast.error('Email hoặc mật khẩu không đúng')
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-amber-500 p-12 text-white">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
          <Radio size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Audio Tour</h1>
        <p className="text-xl text-orange-100 mb-8 text-center">
          Nền tảng thuyết minh thông minh cho gian hàng của bạn
        </p>
        <div className="space-y-4 text-sm text-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-200 rounded-full" />
            <span>Tạo điểm thuyết minh với geofence thông minh</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-200 rounded-full" />
            <span>Hỗ trợ đa ngôn ngữ (VI, EN, FR, JP, KR...)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-200 rounded-full" />
            <span>Thống kê lượt nghe theo thời gian thực</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Radio size={24} className="text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
          <p className="text-gray-500 mb-8">
            Chào mừng trở lại! Vui lòng đăng nhập tài khoản.
          </p>

          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
            Tài khoản test mặc định đã điền sẵn: <span className="font-semibold">owner@poi.local</span> / <span className="font-semibold">Owner@123</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="ban@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              required
              {...register('email')}
            />
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <div className="flex justify-end">
              <a href="#" className="text-sm text-orange-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              Đăng nhập
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-orange-600 hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </p>

          <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-3">
            <p className="text-center text-xs text-orange-700">
              Đăng nhập bằng tài khoản owner đã đăng ký trên backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
