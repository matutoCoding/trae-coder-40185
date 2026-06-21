import type { RoutePlan } from '@/types'

export function generateRoutePlans(days: number, destination: string, includeHiddenGems: boolean): RoutePlan[] {
  const destinationName = destination || '川西环线'
  const daysCount = Math.max(3, Math.min(15, days))

  const comfortPlan: RoutePlan = {
    id: 'comfort',
    name: '舒适型',
    type: 'comfort',
    description: '节奏轻松，每天车程不超过4小时，精选优质住宿，适合家庭或带老人出行',
    tagline: '悠然自得 · 尊享品质',
    accentColor: '#10b981',
    dailyPlans: generateDailyPlans(daysCount, destinationName, 'comfort', includeHiddenGems),
    totalDriveDistance: Math.round(daysCount * 180),
    basePrice: { min: 2800, max: 4200 },
    highlights: [
      '每日车程 ≤ 4小时，充分休息',
      '精选四钻以上酒店，保证睡眠品质',
      '热门景点深度游览，不赶路',
      '预留自由活动时间，随心调整',
    ],
    potentialOverBudget: [
      '景区内体验项目（骑马、索道等）',
      '升级酒店套房需额外加费',
      '特色餐饮安排需现场确认',
    ],
    included: ['全程住宿', '景区首道门票', '专业领队', '旅游保险', '24小时救援'],
    notIncluded: ['往返大交通', '酒店内消费', '自费项目', '个人消费'],
  }

  const classicPlan: RoutePlan = {
    id: 'classic',
    name: '经典型',
    type: 'classic',
    description: '节奏适中，覆盖核心景点与特色体验，性价比高，是大多数客户的首选',
    tagline: '精华荟萃 · 物超所值',
    accentColor: '#3b82f6',
    dailyPlans: generateDailyPlans(daysCount, destinationName, 'classic', includeHiddenGems),
    totalDriveDistance: Math.round(daysCount * 260),
    basePrice: { min: 2200, max: 3600 },
    highlights: [
      '覆盖所有核心必去景点',
      '穿插特色体验（藏家晚宴、星空露营等）',
      '住宿标准适中，交通舒适',
      '经典打卡点一个不漏',
    ],
    potentialOverBudget: [
      '小众景点交通费用',
      '升级餐饮标准',
      '体验类项目追加',
    ],
    included: ['全程住宿', '景区首道门票', '专业领队', '旅游保险'],
    notIncluded: ['往返大交通', '酒店内消费', '自费项目', '个人消费', '全程餐费'],
  }

  const deepPlan: RoutePlan = {
    id: 'deep',
    name: '深度型',
    type: 'deep',
    description: '行程紧凑，探索小众秘境，适合摄影爱好者和深度旅行者，收获难忘体验',
    tagline: '探索秘境 · 极致体验',
    accentColor: '#f59e0b',
    dailyPlans: generateDailyPlans(daysCount, destinationName, 'deep', includeHiddenGems),
    totalDriveDistance: Math.round(daysCount * 340),
    basePrice: { min: 3500, max: 5800 },
    highlights: [
      '深入小众秘境，避开人潮',
      '专业摄影向导随行',
      '多段越野路段体验',
      '特色民宿+星空露营组合',
    ],
    potentialOverBudget: [
      '越野车升级费用',
      '无人机航拍服务',
      '特色体验项目较多',
      '偏远地区住宿溢价',
    ],
    included: ['全程住宿', '景区首道门票', '专业领队+摄影指导', '旅游保险+高原险', '24小时救援+卫星电话'],
    notIncluded: ['往返大交通', '酒店内消费', '自费项目', '个人消费', '越野车差价'],
  }

  return [comfortPlan, classicPlan, deepPlan]
}

function generateDailyPlans(
  days: number,
  destination: string,
  type: 'comfort' | 'classic' | 'deep',
  includeHiddenGems: boolean
) {
  const template = {
    comfort: {
      cityNames: ['成都', destination.includes('稻城') ? '康定' : '新都桥', '雅江', '稻城', '亚丁', '理塘', '巴塘'],
      titles: [
        '启程·初见高原',
        '光影·新都桥晨韵',
        '行吟·雅砻江畔',
        '圣城·稻城寻梦',
        '秘境·亚丁三神山',
        '高原·天空之城',
        '归途·江河回望',
      ],
      highlights: [
        ['泸定桥参观', '折多山垭口合影', '新都桥日落'],
        ['新都桥晨光摄影', '塔公草原远观雅拉雪山', '木雅金塔'],
        ['剪子弯山观景台', '卡子拉山', '雅砻江大峡谷'],
        ['海子山地质公园', '稻城白塔', '茹布查卡温泉'],
        ['冲古寺', '珍珠海', '仙乃日雪山'],
        ['洛绒牛场', '五色海', '牛奶海徒步'],
        ['长青春科尔寺', '毛垭大草原', '返程留念'],
      ],
      dist: [260, 180, 140, 150, 80, 160, 220],
      dur: ['4h', '3h', '2.5h', '3h', '1.5h', '3.5h', '4h'],
    },
    classic: {
      cityNames: ['成都', '康定', '新都桥', '雅江', '稻城', '亚丁', '理塘', '巴塘'],
      titles: [
        '天府启程',
        '情歌故乡',
        '摄影天堂',
        '天路十八弯',
        '蓝色星球净土',
        '神山朝圣',
        '天空之城',
        '金沙江畔',
      ],
      highlights: [
        ['二郎山隧道', '大渡河峡谷', '康定夜景'],
        ['折多山', '木格措', '七色海'],
        ['新都桥', '塔公寺', '雅拉雪山', '墨石公园'],
        ['天路十八弯', '剪子弯山', '卡子拉山'],
        ['海子山', '兴伊措', '稻城红草地'],
        ['亚丁村', '冲古寺', '珍珠海'],
        ['洛绒牛场', '牛奶海', '五色海'],
        ['理塘古城', '长青春科尔寺', '毛垭草原'],
      ],
      dist: [330, 80, 120, 140, 150, 90, 180, 170],
      dur: ['5h', '1.5h', '2h', '2.5h', '3h', '2h', '4h', '3h'],
    },
    deep: {
      cityNames: ['成都', '丹巴', '八美', '新都桥', '稻城', '亚丁', '乡城', '得荣', '巴塘'],
      titles: [
        '川西启程',
        '千碉之国',
        '莲花宝地',
        '光影长廊',
        '最后的香格里拉',
        '三神山大环线',
        '白藏房之乡',
        '太阳谷秘境',
        '金沙江大拐弯',
      ],
      highlights: [
        ['卧龙熊猫', '四姑娘山远眺', '巴郎山'],
        ['甲居藏寨', '碉楼群', '梭坡古碉'],
        ['惠远寺', '雅拉雪山', '道孚民居'],
        ['新都桥', '泉华滩', '子梅垭口'],
        ['海子山深度游', '稻城白塔', '傍河日落'],
        ['亚丁大转山', '牛奶海', '五色海', '蛇湖'],
        ['乡城白藏房', '桑披岭寺', '香巴拉七湖'],
        ['得荣太阳谷', '下拥景区', '藏民家访'],
        ['金沙江大拐弯', '竹巴笼金沙江大桥', '芒康盐井'],
      ],
      dist: [420, 150, 130, 170, 160, 100, 180, 200, 150],
      dur: ['6.5h', '3h', '2.5h', '3.5h', '3.5h', '4h', '4h', '4.5h', '3h'],
    },
  }

  const tpl = template[type]
  const plans = []

  for (let i = 0; i < days; i++) {
    const idx = i % tpl.cityNames.length
    const dist = tpl.dist[idx] + (type === 'deep' && includeHiddenGems ? 40 : 0)
    const hidden = includeHiddenGems && (i === 2 || i === Math.floor(days / 2))

    plans.push({
      day: i + 1,
      title: tpl.titles[idx] + (hidden ? '（含秘境探索）' : ''),
      driveDistance: dist,
      driveDuration: tpl.dur[idx],
      stayCity: tpl.cityNames[idx],
      hotelName: generateHotelName(tpl.cityNames[idx], type),
      highlights: hidden
        ? [...tpl.highlights[idx], '探索小众秘境点', '当地人带路体验']
        : tpl.highlights[idx],
      meals: ['早餐自理', '午餐途中简餐', '晚餐特色餐饮'],
      overBudgetRisk: i === 2 ? '特色体验项目可能产生额外费用' : undefined,
    })
  }

  return plans
}

function generateHotelName(city: string, type: 'comfort' | 'classic' | 'deep') {
  const comfortHotels = ['洲际酒店', '希尔顿酒店', '华美达广场', '皇冠假日', '温德姆至尊']
  const classicHotels = ['精品酒店', '智选假日', '全季酒店', '亚朵酒店', '麗枫酒店']
  const deepHotels = ['特色民宿', '星空营地', '藏式客栈', '山景别院', '草原帐篷']
  const pool = type === 'comfort' ? comfortHotels : type === 'classic' ? classicHotels : deepHotels
  return `${city}${pool[Math.floor(Math.random() * pool.length)]}`
}
