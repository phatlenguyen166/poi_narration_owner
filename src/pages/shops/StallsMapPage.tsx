import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre'
import type { MapRef } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPin, Store, Navigation as NavigationIcon, List } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useShopStore } from '@/stores/shopStore'
import toast from 'react-hot-toast'
import type { Shop } from '@/types'

export default function StallsMapPage() {
  const { shops, fetchShops, isLoading } = useShopStore()
  const navigate = useNavigate()
  const mapRef = useRef<MapRef>(null)
  
  const [selectedStall, setSelectedStall] = useState<Shop | null>(null)
  const [viewState, setViewState] = useState({
    longitude: 106.7009,
    latitude: 10.7769,
    zoom: 12,
  })

  useEffect(() => {
    void fetchShops().catch(() => {
      toast.error('Không thể tải danh sách gian hàng')
    })
  }, [fetchShops])

  useEffect(() => {
    if (shops.length > 0 && mapRef.current) {
      const validShops = shops.filter(s => s.latitude && s.longitude)
      
      if (validShops.length > 0) {
        const lats = validShops.map(s => s.latitude!)
        const lngs = validShops.map(s => s.longitude!)
        
        const minLat = Math.min(...lats)
        const maxLat = Math.max(...lats)
        const minLng = Math.min(...lngs)
        const maxLng = Math.max(...lngs)
        
        mapRef.current.fitBounds(
          [[minLng, minLat], [maxLng, maxLat]],
          { padding: 60, duration: 1000 }
        )
      }
    }
  }, [shops])

  const handleGetCurrentLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom: 15,
            duration: 1000,
          })
        }
      },
      () => toast.error('Không thể lấy vị trí hiện tại'),
    )
  }, [])

  const validStalls = shops.filter(s => s.latitude && s.longitude)

  return (
    <div className="relative h-screen w-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
        attributionControl={{ compact: true }}
      >
        <NavigationControl position="top-right" />
        
        {validStalls.map((stall) => (
          <Marker
            key={stall.id}
            longitude={stall.longitude!}
            latitude={stall.latitude!}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              setSelectedStall(stall)
            }}
          >
            <div className="relative cursor-pointer transform hover:scale-110 transition-transform">
              <MapPin 
                size={32} 
                className={stall.isActive ? 'text-green-500' : 'text-gray-400'} 
                fill="currentColor"
                strokeWidth={1.5}
              />
            </div>
          </Marker>
        ))}

        {selectedStall && selectedStall.latitude && selectedStall.longitude && (
          <Popup
            longitude={selectedStall.longitude}
            latitude={selectedStall.latitude}
            anchor="top"
            onClose={() => setSelectedStall(null)}
            closeButton={true}
            closeOnClick={false}
            maxWidth="300px"
          >
            <div className="p-2">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">{selectedStall.name}</h3>
                <Badge variant={selectedStall.isActive ? 'success' : 'default'} className="text-xs">
                  {selectedStall.isActive ? 'Hoạt động' : 'Tạm dừng'}
                </Badge>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">{selectedStall.address}</p>
              
              <div className="text-xs text-gray-500 mb-3">
                <div>Audio guides: <span className="font-semibold">{selectedStall.audioGuideCount}</span></div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => navigate(`/shops/${selectedStall.id}/edit`)}
                >
                  Chi tiết
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => navigate(`/shops/${selectedStall.id}/analytics`)}
                >
                  Thống kê
                </Button>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Store size={20} className="text-orange-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Bản đồ gian hàng</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/shops')}
            title="Chế độ danh sách"
          >
            <List size={16} />
          </Button>
        </div>
        
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <p>
            <span className="font-semibold text-gray-900 dark:text-white">{validStalls.length}</span> gian hàng
          </p>
          <p>
            <span className="font-semibold text-green-600">{shops.filter(s => s.isActive).length}</span> đang hoạt động
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleGetCurrentLocation}
          >
            <NavigationIcon size={14} /> Vị trí hiện tại
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <p className="font-medium text-gray-900 dark:text-white">Đang tải bản đồ...</p>
          </div>
        </div>
      )}
    </div>
  )
}
