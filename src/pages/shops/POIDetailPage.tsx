import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Edit, Trash2, Pause, Play, MapPin, Mic, Radio } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { useShopStore } from '@/stores/shopStore'
import { LANGUAGES } from '@/data/mock'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// Fix leaflet icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function POIDetailPage() {
  const { shopId, poiId } = useParams()
  const navigate = useNavigate()
  const { pois, fetchShops, updatePOI, deletePOI } = useShopStore()
  const [showDelete, setShowDelete] = useState(false)
  const [activeLang, setActiveLang] = useState('vi')
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    void fetchShops()
  }, [fetchShops])

  const poi = pois.find((p) => p.id === poiId && p.shopId === shopId)

  if (!poi) {
    return (
      <div className="p-6 text-center text-gray-400">
        <Radio size={48} className="mx-auto mb-3 opacity-30" />
        <p>Không tìm thấy POI</p>
        <Button className="mt-4" onClick={() => navigate(`/shops`)}>Quay lại</Button>
      </div>
    )
  }

  const activeContent = poi.contents.find((c) => c.language === activeLang) || poi.contents[0]

  const handleDelete = () => {
    void deletePOI(poi.id)
      .then(() => {
        toast.success('Đã xóa POI')
        navigate('/shops')
      })
      .catch(() => {
        toast.error('Không thể xóa POI')
      })
  }

  const handleToggleActive = () => {
    void updatePOI(poi.id, { isActive: !poi.isActive })
      .then(() => {
        toast.success(poi.isActive ? 'Đã tạm dừng POI' : 'POI đang hoạt động')
      })
      .catch(() => {
        toast.error('Không thể cập nhật trạng thái POI')
      })
  }

  const handleTTS = () => {
    if (!activeContent?.script) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(activeContent.script)
    utterance.lang = activeLang === 'vi' ? 'vi-VN' : activeLang === 'en' ? 'en-US' : activeLang
    utterance.onend = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <button onClick={() => navigate('/shops')} className="hover:text-indigo-600">Gian hàng</button>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">{poi.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{poi.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tạo lúc {formatDate(poi.createdAt)} · Bán kính {poi.radius}m · Ưu tiên {poi.priority}/5
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={poi.isActive ? 'success' : 'default'}>
            {poi.isActive ? '● Đang hoạt động' : '○ Tạm dừng'}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate(`/shops/${shopId}/poi/${poiId}/edit`)}>
          <Edit size={14} /> Sửa POI
        </Button>
        <Button
          variant="secondary"
          onClick={handleToggleActive}
        >
          {poi.isActive ? <><Pause size={14} /> Tạm dừng</> : <><Play size={14} /> Kích hoạt</>}
        </Button>
        <Button variant="danger" onClick={() => setShowDelete(true)}>
          <Trash2 size={14} /> Xóa
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Map */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin size={16} /> Vị trí & Geofence
            </h2>
          </div>
          <div style={{ height: '240px' }}>
            <MapContainer
              center={[poi.lat, poi.lng]}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap'
              />
              <Marker position={[poi.lat, poi.lng]} />
              <Circle
                center={[poi.lat, poi.lng]}
                radius={poi.radius}
                pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.15 }}
              />
            </MapContainer>
          </div>
          <div className="px-4 py-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Lat / Lng</p>
              <p className="font-mono text-xs text-gray-700 dark:text-gray-300">
                {poi.lat.toFixed(5)}, {poi.lng.toFixed(5)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Geofence</p>
              <p className="font-medium text-gray-900 dark:text-white">{poi.radius}m bán kính</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Mic size={16} /> Nội dung thuyết minh
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {/* Lang tabs */}
            <div className="flex flex-wrap gap-2">
              {poi.contents.map((c) => {
                const lang = LANGUAGES.find((l) => l.code === c.language)
                return (
                  <button
                    key={c.language}
                    onClick={() => setActiveLang(c.language)}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                      activeLang === c.language
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    )}
                  >
                    {lang?.flag} {lang?.label}
                    <Badge variant={c.status === 'published' ? 'success' : 'default'} className="ml-1 text-[10px] px-1 py-0">
                      {c.status}
                    </Badge>
                  </button>
                )
              })}
            </div>

            {activeContent && (
              <div className="space-y-3">
                {/* Audio player */}
                {activeContent.audioUrl && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">File audio</p>
                    <audio controls src={activeContent.audioUrl} className="w-full h-8" />
                  </div>
                )}

                {/* Script */}
                {activeContent.script && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Script</p>
                      <Button variant="ghost" size="sm" onClick={handleTTS} className="text-xs">
                        {speaking ? '⏹ Dừng' : '▶ Nghe TTS'}
                      </Button>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-h-36 overflow-y-auto">
                      {activeContent.script}
                    </div>
                  </div>
                )}

                {!activeContent.script && !activeContent.audioUrl && (
                  <p className="text-sm text-gray-400 text-center py-4">Chưa có nội dung cho ngôn ngữ này</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Xóa POI"
        message="Bạn có chắc chắn muốn xóa điểm thuyết minh này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
      />
    </div>
  )
}
