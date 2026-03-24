import type { Shop, POI, PlayLog, Owner, Notification, DailyStats } from '@/types'

export const mockOwner: Owner = {
  id: 'owner-1',
  name: 'Nguyễn Văn Minh',
  email: 'minh@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh',
  plan: 'pro',
}

export const mockShops: Shop[] = [
  {
    id: 'shop-1',
    ownerId: 'owner-1',
    name: 'Quán Cà Phê Sài Gòn Xưa',
    category: 'cafe',
    thumbnail: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=250&fit=crop',
    isActive: true,
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    poiCount: 4,
    audioGuideCount: 4,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'shop-2',
    ownerId: 'owner-1',
    name: 'Bảo Tàng Lịch Sử Thành Phố',
    category: 'museum',
    thumbnail: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=250&fit=crop',
    isActive: true,
    address: '2 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM',
    poiCount: 12,
    audioGuideCount: 6,
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'shop-3',
    ownerId: 'owner-1',
    name: 'Nhà Hàng Phở Hà Nội',
    category: 'restaurant',
    thumbnail: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=250&fit=crop',
    isActive: false,
    address: '45 Lê Lợi, Quận 3, TP.HCM',
    poiCount: 2,
    audioGuideCount: 2,
    createdAt: '2024-03-10T08:00:00Z',
  },
  {
    id: 'shop-4',
    ownerId: 'owner-1',
    name: 'Gallery Nghệ Thuật Đương Đại',
    category: 'art',
    thumbnail: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&h=250&fit=crop',
    isActive: true,
    address: '8 Lê Văn Thiêm, Quận 7, TP.HCM',
    poiCount: 8,
    audioGuideCount: 5,
    createdAt: '2024-04-05T08:00:00Z',
  },
]

export const mockPOIs: POI[] = [
  {
    id: 'poi-1',
    shopId: 'shop-1',
    name: 'Khu vực quầy bar vintage',
    lat: 10.7769,
    lng: 106.7009,
    radius: 30,
    priority: 1,
    isActive: true,
    contents: [
      {
        id: 'content-1',
        poiId: 'poi-1',
        language: 'vi',
        script: 'Chào mừng bạn đến với khu vực quầy bar vintage. Nơi đây được thiết kế theo phong cách Sài Gòn thập niên 70, với những chiếc ghế gỗ cổ điển và ánh đèn dầu ấm áp.',
        audioUrl: undefined,
        status: 'published',
      },
      {
        id: 'content-2',
        poiId: 'poi-1',
        language: 'en',
        script: 'Welcome to the vintage bar area. This space is designed in the 1970s Saigon style, with classic wooden chairs and warm oil lamp lighting.',
        audioUrl: undefined,
        status: 'published',
      },
    ],
    createdAt: '2024-01-20T08:00:00Z',
  },
  {
    id: 'poi-2',
    shopId: 'shop-1',
    name: 'Góc ảnh Sài Gòn xưa',
    lat: 10.7772,
    lng: 106.7015,
    radius: 20,
    priority: 2,
    isActive: true,
    contents: [
      {
        id: 'content-3',
        poiId: 'poi-2',
        language: 'vi',
        script: 'Góc ảnh này trưng bày hơn 50 bức ảnh về Sài Gòn từ năm 1960 đến 1975, ghi lại cuộc sống đời thường của người dân thành phố.',
        audioUrl: undefined,
        status: 'published',
      },
    ],
    createdAt: '2024-01-22T08:00:00Z',
  },
  {
    id: 'poi-3',
    shopId: 'shop-2',
    name: 'Phòng trưng bày đồ gốm',
    lat: 10.7890,
    lng: 106.7055,
    radius: 50,
    priority: 1,
    isActive: true,
    contents: [
      {
        id: 'content-4',
        poiId: 'poi-3',
        language: 'vi',
        script: 'Phòng trưng bày đồ gốm sứ thế kỷ 17-18, bao gồm các hiện vật từ triều đại Lê và Nguyễn.',
        audioUrl: undefined,
        status: 'published',
      },
      {
        id: 'content-5',
        poiId: 'poi-3',
        language: 'en',
        script: 'The ceramics exhibition hall displays 17th-18th century porcelain, including artifacts from the Le and Nguyen dynasties.',
        audioUrl: undefined,
        status: 'published',
      },
      {
        id: 'content-6',
        poiId: 'poi-3',
        language: 'fr',
        script: 'La salle d\'exposition de céramiques présente des porcelaines des XVIIe et XVIIIe siècles.',
        audioUrl: undefined,
        status: 'draft',
      },
    ],
    createdAt: '2024-02-05T08:00:00Z',
  },
  {
    id: 'poi-4',
    shopId: 'shop-2',
    name: 'Khu vực vũ khí cổ',
    lat: 10.7895,
    lng: 106.7060,
    radius: 40,
    priority: 2,
    isActive: true,
    contents: [
      {
        id: 'content-7',
        poiId: 'poi-4',
        language: 'vi',
        script: 'Bộ sưu tập vũ khí cổ đại gồm hơn 200 hiện vật, từ gươm đao đến cung nỏ của các triều đại phong kiến Việt Nam.',
        audioUrl: undefined,
        status: 'published',
      },
    ],
    createdAt: '2024-02-10T08:00:00Z',
  },
]

function generateDailyStats(days: number): DailyStats[] {
  const result: DailyStats[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    result.push({
      date: d.toISOString().split('T')[0],
      plays: Math.floor(Math.random() * 150) + 20,
    })
  }
  return result
}

export const mockDailyStats = generateDailyStats(30)

export const mockPlayLogs: PlayLog[] = Array.from({ length: 50 }, (_, i) => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - i * 30)
  return {
    id: `log-${i}`,
    poiId: mockPOIs[Math.floor(Math.random() * mockPOIs.length)].id,
    language: ['vi', 'en', 'fr', 'jp'][Math.floor(Math.random() * 4)],
    duration: Math.floor(Math.random() * 180) + 30,
    playedAt: d.toISOString(),
  }
})

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'info',
    message: 'Hệ thống sẽ bảo trì vào 2:00 - 4:00 sáng ngày 10/03/2026.',
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    type: 'success',
    message: 'Gian hàng "Bảo Tàng Lịch Sử" đã đạt 1000 lượt nghe!',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: false,
  },
  {
    id: 'notif-3',
    type: 'warning',
    message: 'Plan dùng thử của bạn còn 5 ngày. Nâng cấp để tiếp tục sử dụng.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    read: true,
  },
]

export const CATEGORIES = [
  { value: 'cafe', label: 'Quán cà phê' },
  { value: 'restaurant', label: 'Nhà hàng' },
  { value: 'museum', label: 'Bảo tàng' },
  { value: 'shop', label: 'Cửa hàng' },
  { value: 'art', label: 'Gallery nghệ thuật' },
  { value: 'hotel', label: 'Khách sạn' },
  { value: 'park', label: 'Công viên' },
  { value: 'temple', label: 'Đền / Chùa' },
  { value: 'other', label: 'Khác' },
]

export const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'jp', label: '日本語', flag: '🇯🇵' },
  { code: 'kr', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
]
