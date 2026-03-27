import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Badge'

import type { StallCreateRequest } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  description: z.string().optional(),
  address: z.string().min(3, 'Vui lòng nhập địa chỉ'),
  latitude: z.number(),
  longitude: z.number(),
  active: z.boolean(),
})

export type StallFormValues = z.infer<typeof schema>

export function StallForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel = 'Lưu',
}: {
  initialValues: StallCreateRequest
  onSubmit: (values: StallFormValues) => Promise<void> | void
  isSubmitting: boolean
  submitLabel?: string
}) {
  const form = useForm<StallFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: 'onChange',
  })

  const values = form.watch()

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <Input
        label="Tên địa điểm"
        placeholder="Ví dụ: Landmark 81"
        required
        error={form.formState.errors.name?.message}
        {...form.register('name')}
      />

      <Textarea
        label="Mô tả ngắn"
        placeholder="Mô tả ngắn gọn về địa điểm..."
        rows={4}
        {...form.register('description')}
      />

      <Input
        label="Địa chỉ"
        placeholder="Ví dụ: 720A Điện Biên Phủ, Bình Thạnh, TP.HCM"
        required
        error={form.formState.errors.address?.message}
        {...form.register('address')}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Latitude"
          type="number"
          step="any"
          required
          error={form.formState.errors.latitude?.message}
          {...form.register('latitude', { valueAsNumber: true })}
        />
        <Input
          label="Longitude"
          type="number"
          step="any"
          required
          error={form.formState.errors.longitude?.message}
          {...form.register('longitude', { valueAsNumber: true })}
        />
      </div>

      <Toggle
        checked={values.active}
        onChange={(v) => form.setValue('active', v, { shouldValidate: true })}
        label="Kích hoạt địa điểm ngay"
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

