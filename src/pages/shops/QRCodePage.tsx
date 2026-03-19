import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Printer, MapPin, Store, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useShopStore } from '@/stores/shopStore'
import { CATEGORIES } from '@/data/mock'
import toast from 'react-hot-toast'

export default function QRCodePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { shops, fetchShops, fetchQrCode, qrCodes } = useShopStore()
  const shop = shops.find((s) => s.id === id)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    void fetchShops()
  }, [fetchShops])

  useEffect(() => {
    if (id) {
      void fetchQrCode(id).catch(() => undefined)
    }
  }, [fetchQrCode, id])

  if (!shop) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>Không tìm thấy gian hàng</p>
        <Button className="mt-4" onClick={() => navigate('/shops')}>Quay lại</Button>
      </div>
    )
  }

  const qrValue = qrCodes[shop.id]?.resolvedUrl || ''
  const categoryLabel = CATEGORIES.find((c) => c.value === shop.category)?.label ?? shop.category

  const handleDownloadPNG = () => {
    const canvas = document.querySelector('#qr-canvas canvas') as HTMLCanvasElement
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-${shop.name.replace(/\s/g, '-')}.png`
    link.href = canvas.toDataURL()
    link.click()
    toast.success('Đã tải QR Code PNG')
  }

  const handleDownloadSVG = () => {
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
    await navigator.clipboard.writeText(qrValue)
    setCopied(true)
    toast.success('Đã copy link!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

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

          <div className="text-center">
            <p className="font-semibold text-gray-900 dark:text-white">{shop.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">
              {qrValue || 'Backend chưa trả QR URL cho gian hàng này'}
            </p>
            {shop.approvalStatus && (
              <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-1">
                Trạng thái duyệt: {shop.approvalStatus}
              </p>
            )}
          </div>

          {/* Actions */}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">{shop.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MapPin size={14} />
                <span>{shop.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Store size={14} />
                <span>{categoryLabel} · {shop.poiCount} POI</span>
              </div>
            </div>
          </div>

          {/* Preview what visitors see */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700 p-4">
            <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-3 text-sm">
              👁️ Khách sẽ thấy gì khi quét QR?
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2 text-sm shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Audio Tour</p>
                  <p className="text-xs text-gray-500">Trình duyệt sẽ mở trang web</p>
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                <p className="text-gray-700 dark:text-gray-300 font-medium">{shop.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">Chào mừng bạn! Hệ thống sẽ tự động phát thuyết minh khi bạn đến gần các điểm thú vị.</p>
              </div>
              <div className="bg-indigo-600 text-white text-xs text-center rounded-lg py-1.5 font-medium">
                {qrValue ? '🎧 Bắt đầu tour ngay' : '⏳ Chờ backend cấp QR'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
