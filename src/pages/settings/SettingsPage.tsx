import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Bell, CreditCard, Camera, Shield } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Badge'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/services/authApi'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { OwnerPlan, OwnerSettings } from '@/types'

type TabId = 'account' | 'notifications' | 'plan'

const TABS = [
  { id: 'account' as TabId, label: 'Tài khoản', icon: User },
  { id: 'notifications' as TabId, label: 'Thông báo', icon: Bell },
  { id: 'plan' as TabId, label: 'Gói dịch vụ', icon: CreditCard },
]

const accountSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phoneNumber: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Mật khẩu hiện tại tối thiểu 6 ký tự'),
  newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

type AccountForm = z.infer<typeof accountSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const { user, updateUser, refreshProfile } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabId>('account')
  const [notifSettings, setNotifSettings] = useState({
    emailPlays: true,
    emailWeekly: true,
    pushNew: false,
    pushMilestone: true,
  })
  const [settings, setSettings] = useState<OwnerSettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [changingPlanId, setChangingPlanId] = useState<OwnerPlan['id'] | null>(null)

  const accountForm = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '', phoneNumber: user?.phoneNumber || '' },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    accountForm.reset({
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    })
  }, [accountForm, user])

  useEffect(() => {
    let mounted = true
    const loadSettings = async () => {
      setSettingsLoading(true)
      try {
        const nextSettings = await authApi.getSettings()
        if (!mounted) return
        setSettings(nextSettings)
        setNotifSettings(nextSettings.notifications)
      } catch (error) {
        if (mounted) {
          toast.error(error instanceof Error ? error.message : 'Không thể tải cài đặt')
        }
      } finally {
        if (mounted) {
          setSettingsLoading(false)
        }
      }
    }
    void loadSettings()
    return () => {
      mounted = false
    }
  }, [])

  const handleSaveAccount = accountForm.handleSubmit(async (data) => {
    const nextUser = await authApi.updateProfile(data)
    updateUser(nextUser)
    toast.success('Đã cập nhật thông tin tài khoản')
  })

  const handleChangePassword = passwordForm.handleSubmit(async ({ currentPassword, newPassword }) => {
    await authApi.changePassword({ currentPassword, newPassword })
    passwordForm.reset()
    toast.success('Đã đổi mật khẩu thành công')
  })

  const handleSaveNotifications = async () => {
    setSavingNotifications(true)
    try {
      const notifications = await authApi.updateNotificationSettings(notifSettings)
      setNotifSettings(notifications)
      setSettings((current) => current ? { ...current, notifications } : current)
      toast.success('Đã lưu cài đặt thông báo')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu cài đặt thông báo')
    } finally {
      setSavingNotifications(false)
    }
  }

  const handleChangePlan = async (planId: OwnerPlan['id']) => {
    setChangingPlanId(planId)
    try {
      const nextSettings = await authApi.changeSubscription(planId)
      setSettings(nextSettings)
      setNotifSettings(nextSettings.notifications)
      await refreshProfile()
      toast.success(`Đã cập nhật gói ${planId.toUpperCase()}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật gói dịch vụ')
    } finally {
      setChangingPlanId(null)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Cài đặt</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <Icon size={15} />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* Avatar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Ảnh đại diện</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt="avatar"
                  className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-200 dark:border-gray-600"
                />
              <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white transition-colors hover:bg-orange-600">
                  <Camera size={12} />
                </button>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                <Badge variant="info" className="mt-1">
                  Plan {user?.plan?.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Thông tin tài khoản</h2>
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <Input
                label="Họ tên"
                required
                error={accountForm.formState.errors.name?.message}
                {...accountForm.register('name')}
              />
              <Input
                label="Email"
                type="email"
                required
                error={accountForm.formState.errors.email?.message}
                {...accountForm.register('email')}
              />
              <Input
                label="Số điện thoại"
                error={accountForm.formState.errors.phoneNumber?.message}
                {...accountForm.register('phoneNumber')}
              />
              <div className="flex justify-end">
                <Button type="submit" loading={accountForm.formState.isSubmitting}>
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield size={16} /> Đổi mật khẩu
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Mật khẩu hiện tại"
                type="password"
                required
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register('currentPassword')}
              />
              <Input
                label="Mật khẩu mới"
                type="password"
                required
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register('newPassword')}
              />
              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                required
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword')}
              />
              <div className="flex justify-end">
                <Button type="submit" loading={passwordForm.formState.isSubmitting}>
                  Đổi mật khẩu
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <h2 className="font-semibold text-gray-900 dark:text-white">Cài đặt thông báo</h2>
          {settingsLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải cài đặt...</p>}

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2">
              Email
            </p>
            <Toggle
              checked={notifSettings.emailPlays}
              onChange={(v) => setNotifSettings((s) => ({ ...s, emailPlays: v }))}
              label="Báo cáo lượt nghe hàng ngày"
            />
            <Toggle
              checked={notifSettings.emailWeekly}
              onChange={(v) => setNotifSettings((s) => ({ ...s, emailWeekly: v }))}
              label="Tổng kết hàng tuần"
            />
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2">
              Push notification
            </p>
            <Toggle
              checked={notifSettings.pushNew}
              onChange={(v) => setNotifSettings((s) => ({ ...s, pushNew: v }))}
              label="Khi có lượt nghe đầu tiên trong ngày"
            />
            <Toggle
              checked={notifSettings.pushMilestone}
              onChange={(v) => setNotifSettings((s) => ({ ...s, pushMilestone: v }))}
              label="Khi đạt mốc lượt nghe (100, 500, 1000...)"
            />
          </div>

          <Button onClick={() => void handleSaveNotifications()} loading={savingNotifications}>
            Lưu cài đặt
          </Button>
        </div>
      )}

      {/* Plan Tab */}
      {activeTab === 'plan' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/10">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              <strong>Gói hiện tại:</strong> {settings?.currentPlan?.toUpperCase() ?? user?.plan?.toUpperCase()}
              {settings?.renewalAt ? ` · Gia hạn tự động vào ${new Date(settings.renewalAt).toLocaleDateString('vi-VN')}` : ''}
            </p>
          </div>

          <div className="grid gap-4">
            {(settings?.availablePlans ?? []).map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  'bg-white dark:bg-gray-800 rounded-xl border-2 p-5 transition-colors',
                  plan.current
                    ? 'border-orange-500 dark:border-orange-400'
                    : 'border-gray-200 dark:border-gray-700',
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{plan.name}</h3>
                    {plan.popular && <Badge variant="info">Phổ biến nhất</Badge>}
                    {plan.current && <Badge variant="success">Gói hiện tại</Badge>}
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-1 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-emerald-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {!plan.current && (
                  <Button
                    variant={plan.id === 'pro' ? 'primary' : 'outline'}
                    size="sm"
                    loading={changingPlanId === plan.id}
                    onClick={() => void handleChangePlan(plan.id)}
                  >
                    {plan.ctaLabel}
                  </Button>
                )}
              </div>
            ))}
            {!settingsLoading && (settings?.availablePlans.length ?? 0) === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Không có cấu hình gói dịch vụ.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
