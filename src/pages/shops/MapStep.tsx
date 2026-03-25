import { type UseFormReturn, Controller } from 'react-hook-form'
import { useState, useCallback, useRef } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import type { MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Navigation, MapPin } from 'lucide-react'
import type { Step2Data } from './ShopFormPage'

interface MapStepProps {
  form: UseFormReturn<Step2Data>
}

export function MapStep({ form }: MapStepProps) {
  const { control, watch, setValue, formState: { errors } } = form
  const lat = watch('lat')
  const lng = watch('lng')
  const mapRef = useRef<MapRef>(null)

  const [viewState, setViewState] = useState({
    longitude: lng || 106.7009,
    latitude: lat || 10.7769,
    zoom: 15,
  })

  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    const { lng: newLng, lat: newLat } = event.lngLat
    setValue('lat', parseFloat(newLat.toFixed(6)))
    setValue('lng', parseFloat(newLng.toFixed(6)))
  }, [setValue])

  const handleGetCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = parseFloat(pos.coords.latitude.toFixed(6))
        const newLng = parseFloat(pos.coords.longitude.toFixed(6))
        setValue('lat', newLat)
        setValue('lng', newLng)
        
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [newLng, newLat],
            zoom: 15,
            duration: 1000,
          })
        }
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
          <Map
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            onClick={handleMapClick}
            mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=LYbkJZzIsIDxy3KWt9kD"
            style={{ width: '100%', height: '100%' }}
            attributionControl={{ compact: true }}
          >
            <NavigationControl position="top-right" />
            
            {lat && lng && (
              <Marker
                longitude={lng}
                latitude={lat}
                anchor="bottom"
              >
                <div className="relative">
                  <MapPin 
                    size={32} 
                    className="text-red-500 drop-shadow-lg" 
                    fill="currentColor"
                    strokeWidth={1.5}
                  />
                </div>
              </Marker>
            )}
          </Map>
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
