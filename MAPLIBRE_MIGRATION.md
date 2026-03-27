# Hướng dẫn Migration từ Leaflet sang MapLibre GL

## 📦 Bước 1: Cài đặt packages

### Gỡ cài đặt Leaflet:
```bash
npm uninstall leaflet react-leaflet @types/leaflet
```

### Cài đặt MapLibre GL:
```bash
npm install react-map-gl maplibre-gl
```

**Lưu ý:** Nếu gặp lỗi về platform (như `@tailwindcss/oxide-linux-x64-gnu`), thử:
```bash
npm install react-map-gl maplibre-gl --legacy-peer-deps
```

## 🎯 Các file đã được cập nhật:

### 1. **MapStep.tsx** - Form chọn vị trí stall
- ✅ Đã refactor từ Leaflet sang MapLibre GL
- ✅ Giữ nguyên chức năng: click để chọn vị trí, input tọa độ, lấy vị trí hiện tại
- ✅ Thêm hiệu ứng flyTo khi lấy vị trí hiện tại
- ✅ Custom marker icon đẹp hơn với MapPin từ lucide-react

### 2. **StallsMapPage.tsx** - Trang bản đồ hiển thị tất cả stalls (MỚI)
- ✅ Hiển thị tất cả stalls từ API lên bản đồ
- ✅ Marker màu xanh (hoạt động) / xám (tạm dừng)
- ✅ Click vào marker để xem popup với thông tin stall
- ✅ Auto zoom to fit tất cả markers
- ✅ Sidebar hiển thị thống kê
- ✅ Nút chuyển về chế độ danh sách

### 3. **ShopsPage.tsx** - Trang danh sách stalls
- ✅ Thêm nút "Xem bản đồ" ở header

### 4. **App.tsx** - Routes
- ✅ Thêm route `/shops/map` cho trang bản đồ mới

## 🗺️ Tính năng của StallsMapPage mới:

### Hiển thị markers:
- Hiển thị tất cả stalls có tọa độ (latitude, longitude)
- Marker màu xanh cho stalls đang hoạt động
- Marker màu xám cho stalls tạm dừng
- Hover để phóng to marker

### Popup khi click marker:
- Tên stall
- Địa chỉ
- Trạng thái (hoạt động/tạm dừng)
- Số lượng audio guides
- Nút "Chi tiết" - chuyển đến trang edit
- Nút "Thống kê" - xem analytics

### Sidebar:
- Tổng số gian hàng
- Số gian hàng đang hoạt động
- Nút "Vị trí hiện tại" - bay đến vị trí GPS của bạn
- Nút "Chế độ danh sách" - quay về ShopsPage

### Auto fit bounds:
- Tự động zoom ra để hiển thị tất cả markers khi tải trang
- Animation mượt mà

## 🎨 Tùy chỉnh map style:

Trong file `StallsMapPage.tsx` và `MapStep.tsx`, bạn có thể thay đổi `mapStyle`:

### Miễn phí (không cần API key):
```typescript
// Sáng - Voyager (hiện tại đang dùng)
mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"

// Sáng - Positron (tối giản)
mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"

// Tối - Dark Matter
mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"

// OpenStreetMap Liberty
mapStyle="https://tiles.openfreemap.org/styles/liberty"
```

### Có API key (đẹp hơn):
Đăng ký miễn phí tại [MapTiler](https://cloud.maptiler.com/):
```typescript
mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=YOUR_API_KEY"
mapStyle="https://api.maptiler.com/maps/basic-v2/style.json?key=YOUR_API_KEY"
mapStyle="https://api.maptiler.com/maps/outdoor-v2/style.json?key=YOUR_API_KEY"
```

## 🔄 So sánh Leaflet vs MapLibre GL:

| Tính năng | Leaflet | MapLibre GL |
|-----------|---------|-------------|
| **Rendering** | Canvas/SVG | WebGL (GPU) |
| **Hiệu suất** | Trung bình | Rất cao |
| **Bundle size** | ~39KB | ~500KB |
| **3D/Rotation** | Không | Có |
| **Vector tiles** | Không | Có |
| **Smooth animation** | Trung bình | Rất mượt |

## 📝 Các thay đổi API chính:

### Leaflet → MapLibre GL

```typescript
// LEAFLET (cũ)
<MapContainer center={[lat, lng]} zoom={15}>
  <TileLayer url="..." />
  <Marker position={[lat, lng]} />
</MapContainer>

// MAPLIBRE GL (mới)
<Map
  latitude={lat}
  longitude={lng}
  zoom={15}
  mapStyle="..."
>
  <Marker latitude={lat} longitude={lng} />
</Map>
```

### Coordinates:
- **Leaflet:** `[latitude, longitude]` (mảng)
- **MapLibre:** `latitude` và `longitude` riêng biệt (props)

### Map events:
- **Leaflet:** `useMapEvents({ click(e) {...} })`
- **MapLibre:** `onClick={(e) => e.lngLat.lat, e.lngLat.lng}`

### Navigation:
- **Leaflet:** Phải cài plugin riêng
- **MapLibre:** Built-in `<NavigationControl />`

## 🚀 Test thử:

1. Chạy dev server:
```bash
npm run dev
```

2. Truy cập các trang:
- `/shops` - Danh sách stalls (có nút "Xem bản đồ")
- `/shops/map` - Bản đồ hiển thị tất cả stalls
- `/shops/new` - Form tạo stall mới (MapStep đã dùng MapLibre)

## 🐛 Troubleshooting:

### Lỗi: "Cannot find module 'maplibre-gl'"
```bash
npm install maplibre-gl --save
```

### Lỗi: "Map is not defined"
Kiểm tra import:
```typescript
import Map from 'react-map-gl/maplibre'
```

### Marker không hiển thị:
Kiểm tra latitude/longitude có giá trị hợp lệ:
```typescript
{lat && lng && <Marker ... />}
```

### CSS không load:
Kiểm tra import CSS:
```typescript
import 'maplibre-gl/dist/maplibre-gl.css'
```

## 🎁 Bonus Features:

### Thêm Popup vào MapStep.tsx:
Nếu muốn hiển thị popup khi click marker trong form, thêm:

```typescript
import { Popup } from 'react-map-gl/maplibre'

const [showPopup, setShowPopup] = useState(false)

// Trong Marker:
onClick={(e) => {
  e.originalEvent.stopPropagation()
  setShowPopup(true)
}}

// Dưới Marker:
{showPopup && (
  <Popup
    longitude={lng}
    latitude={lat}
    onClose={() => setShowPopup(false)}
  >
    <div>Vị trí đã chọn</div>
  </Popup>
)}
```

### Thêm custom control:
```typescript
import { FullscreenControl, GeolocateControl } from 'react-map-gl/maplibre'

<GeolocateControl position="top-right" />
<FullscreenControl position="top-right" />
```

## ✅ Hoàn tất!

Migration thành công! Bây giờ bạn có:
- ✅ MapLibre GL thay thế Leaflet
- ✅ Hiệu suất cao hơn (WebGL)
- ✅ Trang bản đồ mới hiển thị tất cả stalls
- ✅ Tích hợp API `/api/v1/owner/stalls`
- ✅ UI đẹp và responsive
- ✅ Miễn phí 100% (không cần API key)
