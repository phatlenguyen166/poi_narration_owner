import { type UseFormReturn, Controller } from 'react-hook-form'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Navigation } from 'lucide-react'
import type { Step2Data } from './ShopFormPage'

// Fix leaflet default icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface MapStepProps {
  form: UseFormReturn<Step2Data>
}

export function MapStep({ form }: MapStepProps) {
  const { control, watch, setValue, register, formState: { errors } } = form
  const lat = watch('lat')
  const lng = watch('lng')
  const radius = watch('radius')

  const handleMapClick = (newLat: number, newLng: number) => {
    setValue('lat', parseFloat(newLat.toFixed(6)))
    setValue('lng', parseFloat(newLng.toFixed(6)))
  }

  const handleGetCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('lat', parseFloat(pos.coords.latitude.toFixed(6)))
        setValue('lng', parseFloat(pos.coords.longitude.toFixed(6)))
      },
      () => alert('Không thể lấy vị trí hiện tại')
    )
  }

  return (
    <div className="space-y-4">
      <Input
        label="Tên điểm POI"
        placeholder="Ví dụ: Khu vực chính, Lối vào..."
        required
        error={errors.poiName?.message}
        {...register('poiName')}
      />

      {/* Map */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Vị trí trên bản đồ <span className="text-red-500">*</span>
        </label>
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600" style={{ height: '300px' }}>
          <MapContainer
            center={[lat || 10.7769, lng || 106.7009]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {lat && lng && (
              <>
                <Marker position={[lat, lng]} />
                <Circle
                  center={[lat, lng]}
                  radius={radius || 50}
                  pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.15 }}
                />
              </>
            )}
          </MapContainer>
        </div>
        <p className="text-xs text-gray-400 mt-1">Click trên bản đồ để đặt vị trí</p>
      </div>

      {/* Lat/Lng inputs */}
      <div className="grid grid-cols-2 gap-3">
        <Controller
          control={control}
          name="lat"
          render={({ field }) => (
            <Input
              label="Vĩ độ (Lat)"
              type="number"
              step="0.000001"
              error={errors.lat?.message}
              {...field}
              onChange={(e) => field.onChange(parseFloat(e.target.value))}
            />
          )}
        />
        <Controller
          control={control}
          name="lng"
          render={({ field }) => (
            <Input
              label="Kinh độ (Lng)"
              type="number"
              step="0.000001"
              error={errors.lng?.message}
              {...field}
              onChange={(e) => field.onChange(parseFloat(e.target.value))}
            />
          )}
        />
      </div>

      <Button variant="outline" size="sm" onClick={handleGetCurrentLocation} type="button">
        <Navigation size={14} /> Lấy vị trí hiện tại
      </Button>

      {/* Radius slider */}
      <Controller
        control={control}
        name="radius"
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bán kính geofence: <span className="text-indigo-600 font-bold">{field.value}m</span>
            </label>
            <input
              type="range"
              min={10}
              max={500}
              step={5}
              value={field.value}
              onChange={(e) => field.onChange(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10m</span>
              <span>500m</span>
            </div>
          </div>
        )}
      />

      {/* Priority */}
      <Controller
        control={control}
        name="priority"
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mức ưu tiên: <span className="text-indigo-600 font-bold">{field.value}/5</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => field.onChange(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium border-2 transition-colors ${
                    field.value === p
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-indigo-400 dark:border-gray-600 dark:text-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">1 = thấp nhất, 5 = cao nhất</p>
          </div>
        )}
      />
    </div>
  )
}
