import type { HotelOption, TicketPackage, ExtraService } from '@/types'

export const hotelOptions: Record<string, HotelOption[]> = {
  economic: [
    {
      id: 'h_eco_1',
      level: 'economic',
      name: '经济型连锁酒店',
      pricePerNight: 180,
      rating: 3.0,
      features: ['干净卫生', '独立卫浴', '含早餐', 'WiFi覆盖'],
    },
  ],
  standard: [
    {
      id: 'h_std_1',
      level: 'standard',
      name: '四星标准酒店',
      pricePerNight: 380,
      rating: 4.2,
      features: ['位置便利', '自助早餐', '中央空调', '免费停车', '健身房'],
    },
  ],
  premium: [
    {
      id: 'h_pre_1',
      level: 'premium',
      name: '五星品质酒店',
      pricePerNight: 680,
      rating: 4.7,
      features: ['奢华大堂', '景观客房', '中西自助早餐', '室内泳池', 'SPA水疗'],
    },
  ],
  luxury: [
    {
      id: 'h_lux_1',
      level: 'luxury',
      name: '国际五星度假酒店',
      pricePerNight: 1280,
      rating: 4.9,
      features: ['雪山景观', '管家服务', '米其林餐厅', '私人温泉', '行政酒廊'],
    },
  ],
}

export const hotelLevelLabels: Record<string, string> = {
  economic: '经济型（3钻）',
  standard: '标准型（4钻）',
  premium: '豪华型（5钻）',
  luxury: '奢华型（5星+）',
}

export const ticketPackages: TicketPackage[] = [
  {
    id: 't_basic',
    name: '基础门票组合',
    description: '包含所有景区首道大门票',
    pricePerPerson: 580,
    includes: ['景区大门票', '景区环保车', '保险'],
  },
  {
    id: 't_standard',
    name: '标准门票组合',
    description: '首道门票+景区内必要交通',
    pricePerPerson: 880,
    includes: ['景区大门票', '环保车', '索道往返', '观光游船', '保险'],
  },
  {
    id: 't_premium',
    name: '尊享门票组合',
    description: '一票全含+免排队快速通道',
    pricePerPerson: 1380,
    includes: ['景区大门票', '环保车', '索道往返', '游船', '快速通道', '专业讲解', 'VIP休息室'],
  },
  {
    id: 't_niche',
    name: '小众景点门票组合',
    description: '包含秘境景点和体验项目',
    pricePerPerson: 680,
    includes: ['小众秘境门票', '向导带路', '越野车摆渡', '摄影点导览'],
  },
]

export const extraServices: ExtraService[] = [
  {
    id: 's_leader',
    name: '专业随车领队',
    description: '持有导游证+急救证的高原经验领队全程陪同',
    price: 800,
    unit: 'per_day',
    icon: '🧭',
  },
  {
    id: 's_rescue',
    name: '应急救援服务',
    description: '全程24小时应急响应，含卫星电话、医疗包、拖车服务',
    price: 1200,
    unit: 'total',
    icon: '🚨',
  },
  {
    id: 's_insurance',
    name: '高额旅游保险',
    description: '高原专项保险，含紧急救援运送、高反医疗保障',
    price: 120,
    unit: 'per_person',
    icon: '🛡️',
  },
  {
    id: 's_meals',
    name: '全程餐饮包',
    description: '含每日三餐，特色餐+当地风味体验',
    price: 280,
    unit: 'per_person',
    icon: '🍽️',
  },
  {
    id: 's_photo',
    name: '跟拍摄影服务',
    description: '专业摄影师全程跟拍，精修50张+全片赠送',
    price: 3500,
    unit: 'total',
    icon: '📷',
  },
  {
    id: 's_drone',
    name: '无人机航拍',
    description: '专业无人机航拍，大片级视频剪辑交付',
    price: 1800,
    unit: 'total',
    icon: '🚁',
  },
]
