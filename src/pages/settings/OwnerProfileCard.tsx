import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Badge'
import { useOwnerProfile } from '@/hooks/useOwnerProfile'
import { useUpdateOwnerProfile } from '@/hooks/useUpdateOwnerProfile'
import { useAuthStore } from '@/stores/authStore'

const schema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phoneNumber: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function OwnerProfileCard() {
  const { user, updateUser } = useAuthStore()
  const { data, isPending, isError, error, refetch } = useOwnerProfile()
  const updateMutation = useUpdateOwnerProfile()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phoneNumber: user?.phoneNumber ?? '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!data) return
    form.reset({
      name: data.name ?? '',
      email: data.email ?? '',
      phoneNumber: data.phoneNumber ?? '',
    })
  }, [data, form])

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber?.trim() ? values.phoneNumber : undefined,
      }

      const next = await updateMutation.mutateAsync(payload)
      updateUser(next)
      toast.success('Đã cập nhật thông tin tài khoản')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể cập nhật thông tin tài khoản')
    }
  })

  if (isPending) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <SkeletonCard />
      </div>
    )
  }

  if (isError) {
    const message = error instanceof Error ? error.message : 'Không thể tải thông tin tài khoản'
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Thông tin tài khoản</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void refetch()} loading={updateMutation.isPending}>
            Thử lại
          </Button>
          <Button variant="outline" onClick={() => toast.error('Vui lòng thử lại sau')}>
            Đóng
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Thông tin tài khoản</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Họ tên"
          required
          error={form.formState.errors.name?.message}
          {...form.register('name')}
        />
        <Input
          label="Email"
          type="email"
          required
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />
        <Input
          label="Số điện thoại"
          error={form.formState.errors.phoneNumber?.message}
          {...form.register('phoneNumber')}
        />
        <div className="flex justify-end">
          <Button type="submit" loading={updateMutation.isPending}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  )
}

