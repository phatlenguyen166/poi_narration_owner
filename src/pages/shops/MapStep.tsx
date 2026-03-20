import { type UseFormReturn, Controller } from 'react-hook-form'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Navigation } from 'lucide-react'
import type { Step2Data } from './ShopFormPage'

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
  const { control, watch, setValue, formState: { errors } } = form
  const lat = watch('lat')
  const lng = watch('lng')

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
      () => alert('Không thể lấy vị trí hiện tại'),
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Vị trí trên bản đồ <span className="text-red-500">*</span>
        </label>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600" style={{ height: '320px' }}>
          <MapContainer center={[lat || 10.7769, lng || 106.7009]} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {lat && lng ? <Marker position={[lat, lng]} /> : null}
          </MapContainer>
        </div>
        <p className="mt-1 text-xs text-gray-400">Bấm trực tiếp lên bản đồ để đặt tọa độ địa điểm.</p>
      </div>

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

      <Button variant="outline" size="sm" type="button" onClick={handleGetCurrentLocation}>
        <Navigation size={14} /> Lấy vị trí hiện tại
      </Button>
    </div>
  )
}
