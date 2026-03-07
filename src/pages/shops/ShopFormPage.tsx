import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Check, ChevronLeft, ChevronRight, Upload, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Badge'
import { useShopStore } from '@/stores/shopStore'
import { CATEGORIES, LANGUAGES } from '@/data/mock'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { MapStep } from './MapStep'
import { ContentStep } from './ContentStep'
import type { POIContent } from '@/types'

const step1Schema = z.object({
  name: z.string().min(2, 'Tên gian hàng tối thiểu 2 ký tự'),
  description: z.string().optional(),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  thumbnail: z.string().optional(),
  isActive: z.boolean(),
})

const step2Schema = z.object({
  lat: z.number({ error: 'Vui lòng chọn vị trí' }),
  lng: z.number({ error: 'Vui lòng chọn vị trí' }),
  radius: z.number().min(10).max(500),
  priority: z.number().min(1).max(5),
  poiName: z.string().min(2, 'Tên POI tối thiểu 2 ký tự'),
})

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>

const STEPS = [
  { id: 1, label: 'Thông tin cơ bản', icon: '🏪' },
  { id: 2, label: 'Vị trí & Geofence', icon: '📍' },
  { id: 3, label: 'Nội dung', icon: '🎙️' },
  { id: 4, label: 'Review & Publish', icon: '✅' },
]

export default function ShopFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { shops, addShop, updateShop, addPOI } = useShopStore()
  const isEdit = Boolean(id)
  const existingShop = isEdit ? shops.find((s) => s.id === id) : undefined

  const [step, setStep] = useState(1)
  const [thumbnailPreview, setThumbnailPreview] = useState(existingShop?.thumbnail || '')
  const [step2Data, setStep2Data] = useState<Step2Data>({
    lat: 10.7769,
    lng: 106.7009,
    radius: 50,
    priority: 1,
    poiName: '',
  })
  const [contents, setContents] = useState<POIContent[]>([
    { id: 'new-vi', poiId: 'new', language: 'vi', script: '', audioUrl: undefined, status: 'draft' },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: existingShop?.name || '',
      description: existingShop?.description || '',
      category: existingShop?.category || '',
      thumbnail: existingShop?.thumbnail || '',
      isActive: existingShop?.isActive ?? true,
    },
  })

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2Data,
  })

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setThumbnailPreview(url)
      form1.setValue('thumbnail', url)
    }
  }

  const handleStep1Next = form1.handleSubmit(() => setStep(2))
  const handleStep2Next = form2.handleSubmit((data) => {
    setStep2Data(data)
    setStep(3)
  })

  const handlePublish = async (isDraft: boolean) => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    const s1 = form1.getValues()
    const s2 = step2Data

    const shopId = isEdit ? id! : `shop-${Date.now()}`
    const poiId = `poi-${Date.now()}`

    if (isEdit) {
      updateShop(shopId, { ...s1, thumbnail: thumbnailPreview || s1.thumbnail })
      toast.success('Đã cập nhật gian hàng!')
    } else {
      addShop({
        id: shopId,
        ownerId: 'owner-1',
        name: s1.name,
        description: s1.description || '',
        category: s1.category,
        thumbnail: thumbnailPreview || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop',
        isActive: s1.isActive,
        address: `${s2.lat.toFixed(4)}, ${s2.lng.toFixed(4)}`,
        poiCount: 1,
        createdAt: new Date().toISOString(),
      })
      addPOI({
        id: poiId,
        shopId,
        name: s2.poiName,
        lat: s2.lat,
        lng: s2.lng,
        radius: s2.radius,
        priority: s2.priority as 1 | 2 | 3 | 4 | 5,
        isActive: true,
        contents: contents.map((c, i) => ({
          ...c,
          id: `content-${Date.now()}-${i}`,
          poiId,
          status: isDraft ? 'draft' : 'published',
        })),
        createdAt: new Date().toISOString(),
      })
      toast.success(isDraft ? 'Đã lưu nháp!' : 'Đã publish gian hàng!')
    }

    setIsSubmitting(false)
    navigate('/shops')
  }

  const s1 = form1.watch()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/shops')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Sửa gian hàng' : 'Thêm gian hàng mới'}
        </h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => step > s.id && setStep(s.id)}
              className={cn(
                'flex items-center gap-2 flex-shrink-0',
                step > s.id && 'cursor-pointer'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                step > s.id && 'bg-indigo-600 text-white',
                step === s.id && 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900',
                step < s.id && 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
              )}>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              <span className={cn(
                'text-sm whitespace-nowrap hidden sm:block',
                step === s.id ? 'font-semibold text-indigo-600' : 'text-gray-500 dark:text-gray-400',
              )}>
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-3 min-w-8 transition-colors',
                step > s.id ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Thông tin cơ bản</h2>

          <Input
            label="Tên gian hàng"
            placeholder="Nhập tên gian hàng..."
            required
            error={form1.formState.errors.name?.message}
            {...form1.register('name')}
          />

          <Textarea
            label="Mô tả ngắn"
            placeholder="Mô tả về gian hàng của bạn..."
            rows={3}
            {...form1.register('description')}
          />

          <Controller
            control={form1.control}
            name="category"
            render={({ field }) => (
              <Select
                label="Danh mục"
                options={CATEGORIES}
                required
                error={form1.formState.errors.category?.message}
                {...field}
              />
            )}
          />

          {/* Thumbnail upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ảnh đại diện
            </label>
            <div className="flex gap-4 items-start">
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="preview"
                  className="w-24 h-24 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400">
                  <Upload size={20} />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="thumbnail"
                  className="hidden"
                  onChange={handleThumbnailChange}
                />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('thumbnail')?.click()}>
                  <Upload size={14} /> {thumbnailPreview ? 'Đổi ảnh' : 'Tải ảnh lên'}
                </Button>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG. Tối đa 5MB</p>
              </div>
            </div>
          </div>

          <Controller
            control={form1.control}
            name="isActive"
            render={({ field }) => (
              <Toggle
                checked={field.value}
                onChange={field.onChange}
                label="Kích hoạt gian hàng ngay"
              />
            )}
          />

          <div className="flex justify-end pt-2">
            <Button onClick={handleStep1Next}>
              Tiếp theo <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Vị trí & Geofence</h2>
          <MapStep form={form2} />
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft size={16} /> Quay lại
            </Button>
            <Button onClick={handleStep2Next}>
              Tiếp theo <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Nội dung thuyết minh</h2>
          <ContentStep contents={contents} onChange={setContents} />
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft size={16} /> Quay lại
            </Button>
            <Button onClick={() => setStep(4)}>
              Tiếp theo <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4 - Review */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye size={18} /> Xem lại thông tin
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Thông tin cơ bản</h3>
                {thumbnailPreview && (
                  <img src={thumbnailPreview} alt="thumb" className="w-full h-32 object-cover rounded-lg" />
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">{s1.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s1.description}</p>
                  <p className="text-sm text-indigo-600 mt-1">
                    {CATEGORIES.find((c) => c.value === s1.category)?.label}
                  </p>
                </div>
              </div>

              {/* Location info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vị trí & POI</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tên POI:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{step2Data.poiName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lat / Lng:</span>
                    <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                      {step2Data.lat.toFixed(5)}, {step2Data.lng.toFixed(5)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bán kính:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{step2Data.radius}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ưu tiên:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{step2Data.priority}/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content summary */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Nội dung thuyết minh</h3>
              <div className="flex flex-wrap gap-2">
                {contents.map((c) => {
                  const lang = LANGUAGES.find((l) => l.code === c.language)
                  return (
                    <div key={c.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                      <span>{lang?.flag}</span>
                      <span className="text-gray-700 dark:text-gray-300">{lang?.label}</span>
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded',
                        c.script ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                      )}>
                        {c.script ? 'Có script' : 'Trống'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ChevronLeft size={16} /> Quay lại
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => handlePublish(true)} loading={isSubmitting}>
                Lưu nháp
              </Button>
              <Button onClick={() => handlePublish(false)} loading={isSubmitting}>
                Publish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
