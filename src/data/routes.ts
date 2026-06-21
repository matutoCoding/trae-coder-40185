import type { RoutePlan, DailyPlan } from '@/types'

export function generateRoutePlans(days: number, destination: string, includeHiddenGems: boolean): RoutePlan[] {
  const destinationName = destination || '川西环线'
  const daysCount = Math.max(3, Math.min(20, days))

  const comfortPlan: RoutePlan = {
    id: 'comfort',
    name: '舒适型',
    type: 'comfort',
    description: '节奏轻松，每天车程不超过4小时，精选优质住宿，适合家庭或带老人出行',
    tagline: '悠然自得 · 尊享品质',
    accentColor: '#10b981',
    dailyPlans: generateDailyPlans(daysCount, destinationName, 'comfort', includeHiddenGems),
    totalDriveDistance: 0,
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
    totalDriveDistance: 0,
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
    totalDriveDistance: 0,
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

  const plans = [comfortPlan, classicPlan, deepPlan]
  plans.forEach(p => {
    p.totalDriveDistance = p.dailyPlans.reduce((sum, d) => sum + d.driveDistance, 0)
  })

  return plans
}

interface RouteTemplate {
  cityNames: string[]
  titles: string[]
  highlights: string[][]
  dist: number[]
  dur: string[]
}

function getTemplate(destination: string, type: 'comfort' | 'classic' | 'deep'): RouteTemplate {
  const isDaocheng = destination.includes('稻城') || destination.includes('亚丁')

  const templates: Record<string, RouteTemplate> = {
    comfort: {
      cityNames: [
        '成都', '康定', '新都桥', '雅江', '理塘', '稻城', '亚丁村',
        '稻城', '乡城', '香格里拉镇', '泸沽湖', '西昌', '雅安', '成都'
      ],
      titles: [
        '启程·初见高原', '情歌故里·康定', '光影新都桥', '雅砻江畔·雅江',
        '天空之城·理塘', '圣城稻城', '神山之下·亚丁',
        '亚丁深度游', '白藏房之乡·乡城', '香格里拉镇', '泸沽湖环湖',
        '月城西昌', '熊猫故乡·雅安', '归途·返回成都'
      ],
      highlights: [
        ['泸定桥', '折多山垭口', '新都桥日落'],
        ['康定古城', '跑马山', '二道桥温泉'],
        ['新都桥晨光', '塔公草原', '木雅金塔'],
        ['剪子弯山', '卡子拉山', '雅砻江峡谷'],
        ['理塘古城', '长青春科尔寺', '毛垭大草原'],
        ['海子山', '稻城白塔', '茹布查卡温泉'],
        ['冲古寺', '珍珠海', '仙乃日雪山'],
        ['洛绒牛场', '牛奶海', '五色海'],
        ['乡城白藏房', '桑披岭寺', '香巴拉七湖'],
        ['香格里拉大峡谷', '碧让峡谷', '藏民家访'],
        ['泸沽湖环湖', '里格半岛', '摩梭族家访'],
        ['邛海', '西昌卫星发射中心', '建昌古城'],
        ['碧峰峡熊猫基地', '上里古镇', '雅安鱼'],
        ['返程总结', '自由购物', '送机送站'],
      ],
      dist: [270, 80, 75, 140, 130, 150, 80, 100, 110, 120, 180, 240, 160, 140],
      dur: ['4h', '1.5h', '1.5h', '2.5h', '2.5h', '3h', '1.5h', '2h', '2h', '2.5h', '3.5h', '4h', '3h', '2.5h'],
    },
    classic: {
      cityNames: [
        '成都', '康定', '新都桥', '雅江', '理塘', '稻城', '亚丁',
        '稻城', '理塘', '巴塘', '芒康', '左贡', '八宿', '然乌', '波密',
        '林芝', '拉萨'
      ],
      titles: [
        '天府启程', '情歌故乡', '摄影天堂·新都桥', '天路十八弯',
        '天空之城·理塘', '蓝色星球净土·稻城', '神山朝圣·亚丁',
        '稻城休整', '理塘-巴塘', '金沙江畔·巴塘', '芒康盐井',
        '左贡-怒江七十二拐', '然乌湖', '冰川之乡·波密',
        '塞上江南·林芝', '圣城·拉萨'
      ],
      highlights: [
        ['二郎山隧道', '大渡河峡谷', '康定夜景'],
        ['折多山', '木格措', '七色海'],
        ['新都桥', '塔公寺', '雅拉雪山', '墨石公园'],
        ['天路十八弯', '剪子弯山', '卡子拉山'],
        ['理塘古城', '长青春科尔寺', '毛垭草原'],
        ['海子山', '兴伊措', '稻城红草地'],
        ['亚丁村', '冲古寺', '珍珠海'],
        ['洛绒牛场', '牛奶海', '五色海'],
        ['毛垭大草原', '海子山', '巴塘弦子'],
        ['金沙江大拐弯', '竹巴笼大桥', '巴塘夜市'],
        ['盐井古盐田', '红拉山', '芒康古城'],
        ['怒江七十二拐', '怒江峡谷', '业拉山'],
        ['然乌湖', '来古冰川', '瓦村'],
        ['米堆冰川', '波密岗乡', '古乡湖'],
        ['鲁朗林海', '南迦巴瓦峰', '尼洋河'],
        ['布达拉宫', '大昭寺', '八廓街'],
      ],
      dist: [330, 80, 120, 140, 130, 150, 90, 110, 170, 100, 110, 200, 90, 130, 160, 240],
      dur: ['5h', '1.5h', '2h', '2.5h', '2.5h', '3h', '2h', '2h', '3.5h', '2h', '2h', '4.5h', '2h', '2.5h', '3h', '5h'],
    },
    deep: {
      cityNames: [
        '成都', '卧龙', '丹巴', '八美', '新都桥', '上木居', '子梅垭口',
        '稻城', '亚丁', '泸沽湖', '木里', '稻城', '乡城', '得荣',
        '香格里拉', '丽江', '攀枝花', '成都'
      ],
      titles: [
        '川西启程', '熊猫之乡·卧龙', '千碉之国·丹巴', '莲花宝地·八美',
        '光影长廊·新都桥', '上木居藏寨', '子梅垭口·贡嘎日落',
        '最后的香格里拉·稻城', '三神山大环线·亚丁',
        '泸沽湖深度', '木里秘境', '稻城亚丁', '白藏房之乡·乡城',
        '太阳谷·得荣', '香格里拉', '丽江古城', '攀枝花', '返回成都'
      ],
      highlights: [
        ['卧龙熊猫', '巴郎山', '四姑娘山远眺'],
        ['甲居藏寨', '梭坡古碉', '中路藏寨'],
        ['惠远寺', '雅拉雪山', '道孚民居'],
        ['新都桥', '泉华滩', '子梅垭口'],
        ['贡嘎西南坡', '冷嘎措', '上木居藏式客栈'],
        ['子梅垭口日出', '贡嘎主峰', '泉华滩钙化池'],
        ['稻城白塔', '傍河日落', '色拉草原'],
        ['亚丁大转山', '牛奶海', '五色海', '蛇湖'],
        ['泸沽湖', '里格半岛', '尼塞村'],
        ['木里大寺', '寸冬海子', '康坞大寺'],
        ['稻城', '红草地', '万亩胡杨林'],
        ['乡城白藏房', '桑披岭寺', '香巴拉七湖'],
        ['得荣太阳谷', '下拥景区', '藏民家访'],
        ['金沙江大拐弯', '纳帕海', '依拉草原'],
        ['松赞林寺', '普达措', '独克宗古城'],
        ['丽江古城', '束河古镇', '玉龙雪山远眺'],
        ['攀枝花', '二滩水电站', '雅砻江'],
        ['返程', '成渝高速', '回到成都'],
      ],
      dist: [420, 110, 120, 140, 170, 80, 180, 110, 280, 150, 220, 110, 200, 180, 190, 210, 260],
      dur: ['6.5h', '2h', '2.5h', '3h', '3.5h', '2h', '4h', '2.5h', '5h', '3h', '5h', '2.5h', '4.5h', '4h', '4h', '4h', '5h'],
    },
  }

  const tpl = templates[type]
  if (isDaocheng) return tpl

  const generalTpls: Record<string, RouteTemplate> = {
    comfort: {
      ...templates.comfort,
      cityNames: ['成都', '都江堰', '汶川', '茂县', '松潘', '川主寺', '九寨沟',
        '九寨沟', '川主寺', '若尔盖', '唐克', '红原', '米亚罗', '理县', '成都'],
    },
    classic: {
      ...templates.classic,
      cityNames: ['成都', '绵阳', '广元', '汉中', '西安', '延安', '银川',
        '阿拉善', '兰州', '临夏', '夏河', '合作', '若尔盖', '松潘', '成都'],
    },
    deep: {
      ...templates.deep,
      cityNames: ['成都', '康定', '新都桥', '理塘', '巴塘', '芒康', '左贡',
        '八宿', '波密', '林芝', '拉萨', '日喀则', '定日', '珠峰', '日喀则', '拉萨'],
    },
  }

  return generalTpls[type]
}

function generateDailyPlans(
  days: number,
  destination: string,
  type: 'comfort' | 'classic' | 'deep',
  includeHiddenGems: boolean
): DailyPlan[] {
  const tpl = getTemplate(destination, type)
  const plans: DailyPlan[] = []
  const templateLen = tpl.cityNames.length

  for (let i = 0; i < days; i++) {
    let idx: number
    if (i < templateLen) {
      idx = i
    } else {
      idx = templateLen - 1
    }

    const isFirst = i === 0
    const isLast = i === days - 1
    const isMiddle = i >= templateLen - 1 && !isLast

    const hidden = includeHiddenGems && (i === 3 || i === Math.floor(days / 2))

    let title = tpl.titles[idx] || `第${i + 1}天·自由探索`
    let stayCity = tpl.cityNames[idx] || '沿线城镇'
    let dist = tpl.dist[idx] || 120
    let dur = tpl.dur[idx] || '2.5h'
    let highlights = [...(tpl.highlights[idx] || ['自由活动', '沿途观光', '当地美食'])]

    if (isMiddle) {
      const extraCities = ['深度探索', '自由活动', '周边游览', '特色体验', '文化探访']
      const cityIdx = (i - templateLen + 1) % extraCities.length
      stayCity = extraCities[cityIdx] + '（' + tpl.cityNames[templateLen - 1] + '周边）'
      title = `深度漫游·第${i + 1 - templateLen + 1}天`
      dist = 60 + (i % 3) * 30
      dur = (1.5 + (i % 3) * 0.5).toFixed(1) + 'h'
      highlights = [
        '睡到自然醒',
        '当地特色早餐',
        '自由探索周边小众景点',
        '下午休闲时光',
        '品尝当地美食',
      ]
    }

    if (isLast && days > templateLen) {
      stayCity = '成都'
      title = '归途·返回成都'
      dist = 260
      dur = '4h'
      highlights = ['早餐后返程', '沿途回顾', '抵达成都', '送机送站']
    }

    if (hidden) {
      title = title + '（含秘境探索）'
      highlights = [...highlights, '小众秘境探索', '当地人带路体验']
      dist += 50
      dur = (parseFloat(dur) + 1).toFixed(1) + 'h'
    }

    if (isFirst) {
      title = '启程·' + (tpl.titles[0]?.split('·')[1] || '出发')
    }

    plans.push({
      day: i + 1,
      title,
      driveDistance: Math.round(dist),
      driveDuration: dur,
      stayCity,
      hotelName: generateHotelName(stayCity, type),
      highlights,
      meals: ['早餐自理', '午餐途中简餐', '晚餐特色餐饮'],
      overBudgetRisk: i === 2 ? '特色体验项目可能产生额外费用' : undefined,
    })
  }

  return plans
}

function generateHotelName(city: string, type: 'comfort' | 'classic' | 'deep') {
  const comfortHotels = ['洲际酒店', '希尔顿酒店', '华美达广场', '皇冠假日', '温德姆至尊', '喜来登酒店', '万豪酒店']
  const classicHotels = ['精品酒店', '智选假日', '全季酒店', '亚朵酒店', '麗枫酒店', '希尔顿欢朋', '维也纳国际']
  const deepHotels = ['特色民宿', '星空营地', '藏式客栈', '山景别院', '草原帐篷', '悬崖民宿', '河谷部落']
  const pool = type === 'comfort' ? comfortHotels : type === 'classic' ? classicHotels : deepHotels
  const hotel = pool[city.length % pool.length]
  if (city.includes('（')) {
    return '当地特色酒店'
  }
  return `${city}${hotel}`
}

export function updateDailyPlan(
  routes: RoutePlan[],
  routeId: string,
  dayIndex: number,
  updates: Partial<DailyPlan>
): RoutePlan[] {
  return routes.map(route => {
    if (route.id !== routeId) return route
    const newPlans = [...route.dailyPlans]
    newPlans[dayIndex] = { ...newPlans[dayIndex], ...updates }
    const totalDist = newPlans.reduce((s, d) => s + d.driveDistance, 0)
    return { ...route, dailyPlans: newPlans, totalDriveDistance: Math.round(totalDist) }
  })
}
