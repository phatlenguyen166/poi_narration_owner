import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Store } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: z.string(),
  shopName: z.string().min(2, 'Tên gian hàng tối thiểu 2 ký tự'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: registerOwner } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await registerOwner({
      name: data.name,
      businessName: data.shopName,
      email: data.email,
      password: data.password,
    })
    toast.success('Đăng ký thành công! Chào mừng bạn!')
    navigate('/shops/new', {
      state: {
        initialShopName: data.shopName,
        redirectFrom: location.pathname,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tạo tài khoản</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Bắt đầu miễn phí, không cần thẻ tín dụng</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Họ tên"
              placeholder="Nguyễn Văn A"
              leftIcon={<User size={16} />}
              error={errors.name?.message}
              required
              {...register('name')}
            />
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
            <Input
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />
            <Input
              label="Tên gian hàng đầu tiên"
              placeholder="Quán cà phê của tôi"
              leftIcon={<Store size={16} />}
              error={errors.shopName?.message}
              required
              {...register('shopName')}
            />

            <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting}>
              Đăng ký
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium dark:text-indigo-400">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
