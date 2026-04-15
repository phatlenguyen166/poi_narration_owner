import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Printer, MapPin, Store, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useShopStore } from '@/stores/shopStore'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export default function QRCodePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { shops, fetchShops, fetchQrCode, createQrCode, qrCodes } = useShopStore()
  const { user } = useAuthStore()
  const shop = shops.find((s) => s.id === id)
  const [copied, setCopied] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)
  const [isCreatingQr, setIsCreatingQr] = useState(false)
  const [expiresInDays, setExpiresInDays] = useState(30)
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const canUseQr = user?.plan !== 'free'

  useEffect(() => {
    void fetchShops()
  }, [fetchShops])

  useEffect(() => {
    if (id && canUseQr) {
      void fetchQrCode(id)
        .then(() => setQrError(null))
        .catch((error) => {
          setQrError(error instanceof Error ? error.message : 'Chưa có QR Code cho địa điểm này')
        })
    }
  }, [canUseQr, fetchQrCode, id])

  if (!shop) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>Không tìm thấy gian hàng</p>
        <Button className="mt-4" onClick={() => navigate('/shops')}>Quay lại</Button>
      </div>
    )
  }

  if (!canUseQr) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-[2rem] border border-orange-100 bg-white/90 p-8 text-center shadow-xl shadow-orange-100/70">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-100 text-orange-700">
            <Store size={28} />
          </div>
          <h1 className="text-2xl font-black text-gray-950">Gói FREE không hỗ trợ QR Code</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
            Vui lòng nâng cấp lên Pro hoặc Enterprise để tạo QR cho địa điểm và cho khách quét vào app.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/shops')}>Quay lại gian hàng</Button>
            <Button onClick={() => navigate('/settings')}>Nâng cấp gói</Button>
          </div>
        </div>
      </div>
    )
  }

  const qrValue = qrCodes[shop.id]?.resolvedUrl || ''
  const hasQr = Boolean(qrValue)

  const handleCreateQr = async () => {
    if (!id) return
    if ((startAt && !endAt) || (!startAt && endAt)) {
      toast.error('Vui lòng nhập đủ cả thời gian bắt đầu và kết thúc')
      return
    }
    if (startAt && endAt && new Date(endAt).getTime() <= new Date(startAt).getTime()) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu')
      return
    }
    setIsCreatingQr(true)
    try {
      await createQrCode(id, startAt && endAt
        ? {
            startsAt: new Date(startAt).toISOString(),
            expiresAt: new Date(endAt).toISOString(),
          }
        : {
            expiresInDays,
          })
      setQrError(null)
      toast.success('Đã tạo QR Code cho địa điểm')
    } catch (error) {
      setQrError(error instanceof Error ? error.message : 'Không thể tạo QR Code')
      toast.error(error instanceof Error ? error.message : 'Không thể tạo QR Code')
    } finally {
      setIsCreatingQr(false)
    }
  }

  const handleDownloadPNG = () => {
    if (!hasQr) return
    const canvas = document.querySelector('#qr-canvas canvas') as HTMLCanvasElement
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-${shop.name.replace(/\s/g, '-')}.png`
    link.href = canvas.toDataURL()
    link.click()
    toast.success('Đã tải QR Code PNG')
  }

  const handleDownloadSVG = () => {
    if (!hasQr) return
    const svg = document.querySelector('#qr-svg svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `qr-${shop.name.replace(/\s/g, '-')}.svg`
    link.href = url
    link.click()
    toast.success('Đã tải QR Code SVG')
  }

  const handleCopyLink = async () => {
    if (!hasQr) return
    await navigator.clipboard.writeText(qrValue)
    setCopied(true)
    toast.success('Đã copy link!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  const formattedExpiresAt = qrCodes[shop.id]?.expiresAt
    ? new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(qrCodes[shop.id]!.expiresAt!))
    : null
  const formattedStartsAt = qrCodes[shop.id]?.startsAt
    ? new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(qrCodes[shop.id]!.startsAt!))
    : null

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/shops')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">QR Code - {shop.name}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Display */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center gap-6">
          {hasQr ? (
            <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div id="qr-canvas">
                <QRCodeCanvas
                  value={qrValue}
                  size={220}
                  level="H"
                  includeMargin
                  imageSettings={{
                    src: 'https://api.dicebear.com/7.x/icons/svg?seed=audiotour',
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>
              <div id="qr-svg" className="hidden">
                <QRCodeSVG value={qrValue} size={220} level="H" />
              </div>
            </div>
          ) : (
            <div className="flex h-[252px] w-[252px] flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-6 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                <Store size={24} />
              </div>
              <p className="text-sm font-bold text-gray-900">Địa điểm này chưa có QR Code</p>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                Owner cần chủ động tạo QR khi muốn bắt đầu cho khách quét vào app.
              </p>
            </div>
          )}

          <div className="text-center">
            <p className="font-semibold text-gray-900 dark:text-white">{shop.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">
              {qrValue || qrError || 'Chưa có QR Code cho địa điểm này'}
            </p>
            {formattedStartsAt && (
              <p className="mt-2 text-xs font-medium text-orange-700">
                Bắt đầu dùng lúc: {formattedStartsAt}
              </p>
            )}
            {formattedExpiresAt && (
              <p className="mt-1 text-xs font-medium text-orange-700">
                Hết hạn lúc: {formattedExpiresAt}
              </p>
            )}
            {shop.approvalStatus && (
                <p className="mt-1 text-xs text-orange-600 dark:text-orange-300">
                Trạng thái duyệt: {shop.approvalStatus}
              </p>
            )}
          </div>

          {/* Actions */}
          {!hasQr ? (
            <div className="w-full space-y-3">
              <label className="block text-left text-sm font-semibold text-gray-800">
                Chọn nhanh thời hạn QR
                <select
                  className="mt-2 w-full rounded-2xl border border-orange-200 bg-orange-50/70 px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-orange-400"
                  value={expiresInDays}
                  onChange={(event) => setExpiresInDays(Number(event.target.value))}
                >
                  <option value={1}>1 ngày</option>
                  <option value={7}>7 ngày</option>
                  <option value={30}>30 ngày</option>
                  <option value={90}>90 ngày</option>
                </select>
              </label>
              <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4">
                <p className="text-left text-sm font-semibold text-gray-800">Hoặc tự chọn thời gian</p>
                <p className="mt-1 text-left text-xs leading-5 text-gray-500">
                  Nếu nhập cả 2 mốc này, hệ thống sẽ ưu tiên dùng thời gian bắt đầu và kết thúc thay vì số ngày bên trên.
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="block text-left text-sm font-medium text-gray-700">
                    Bắt đầu
                    <input
                      type="datetime-local"
                      className="mt-2 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-orange-400"
                      value={startAt}
                      onChange={(event) => setStartAt(event.target.value)}
                    />
                  </label>
                  <label className="block text-left text-sm font-medium text-gray-700">
                    Kết thúc
                    <input
                      type="datetime-local"
                      className="mt-2 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-orange-400"
                      value={endAt}
                      onChange={(event) => setEndAt(event.target.value)}
                    />
                  </label>
                </div>
              </div>
              <Button className="w-full" onClick={() => void handleCreateQr()} loading={isCreatingQr}>
                Tạo QR ngay
              </Button>
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
              <Download size={14} /> Tải PNG
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadSVG}>
              <Download size={14} /> Tải SVG
            </Button>
            <Button
              variant={copied ? 'primary' : 'outline'}
              size="sm"
              onClick={handleCopyLink}
            >
              {copied ? <><Check size={14} /> Đã copy</> : <><Copy size={14} /> Copy link</>}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer size={14} /> In
            </Button>
          </div>
          )}
        </div>

        {/* Shop info + Preview */}
        <div className="space-y-4">
          {/* Shop info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <img src={shop.thumbnail} alt={shop.name} className="w-full h-36 object-cover" />
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white">{shop.name}</h2>
                <Badge variant={shop.isActive ? 'success' : 'default'}>
                  {shop.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MapPin size={14} />
                <span>{shop.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Store size={14} />
                <span>Địa điểm · {shop.audioGuideCount} audio guide</span>
              </div>
            </div>
          </div>

          {/* Preview what visitors see */}
          <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4 dark:border-orange-700 dark:from-orange-900/10 dark:to-amber-900/10">
            <h3 className="mb-3 text-sm font-medium text-orange-800 dark:text-orange-300">
              👁️ Khách sẽ thấy gì khi quét QR?
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2 text-sm shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">A</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Audio Tour</p>
                  <p className="text-xs text-gray-500">Trình duyệt sẽ mở trang web</p>
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                <p className="text-gray-700 dark:text-gray-300 font-medium">{shop.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">Chào mừng bạn! Quét QR sẽ đưa khách vào đúng địa điểm và chỉ dùng được trong thời gian owner đã chọn.</p>
              </div>
              <div className="rounded-lg bg-orange-500 py-1.5 text-center text-xs font-medium text-white">
                {qrValue ? '🎧 Bắt đầu tour ngay' : '⏳ Tạo QR khi cần sử dụng'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
