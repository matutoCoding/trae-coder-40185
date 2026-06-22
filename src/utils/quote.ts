import type { CustomerRequirement, QuoteConfig, RoutePlan, QuoteResult, ServiceBreakdown } from '@/types'
import { hotelOptions, ticketPackages, extraServices } from '@/data/options'

export function calculateQuote(
  requirement: CustomerRequirement,
  route: RoutePlan,
  config: QuoteConfig
): QuoteResult {
  const { peopleCount, days } = requirement
  const { selectedHotelLevel, selectedTickets, includeLeader, includeRescue, includeInsurance, includeMeals, profitMargin, discountAmount = 0 } = config

  const warnings: string[] = []

  const hotelPerNight = hotelOptions[selectedHotelLevel][0].pricePerNight
  const roomCount = Math.ceil(peopleCount / 2)
  const hotelCost = hotelPerNight * roomCount * (days - 1)

  let ticketCost = 0
  for (const ticketId of selectedTickets) {
    const ticket = ticketPackages.find(t => t.id === ticketId)
    if (ticket) ticketCost += ticket.pricePerPerson * peopleCount
  }

  let leaderCost = 0
  let rescueCost = 0
  let insuranceCost = 0
  let mealsCost = 0

  if (includeLeader) {
    const leader = extraServices.find(s => s.id === 's_leader')
    if (leader) leaderCost = leader.price * days
  }

  if (includeRescue) {
    const rescue = extraServices.find(s => s.id === 's_rescue')
    if (rescue) rescueCost = rescue.price
  }

  if (includeInsurance) {
    const insurance = extraServices.find(s => s.id === 's_insurance')
    if (insurance) insuranceCost = insurance.price * peopleCount
  }

  if (includeMeals) {
    const meals = extraServices.find(s => s.id === 's_meals')
    if (meals) mealsCost = meals.price * peopleCount * days
  }

  const serviceCost = leaderCost + rescueCost + insuranceCost + mealsCost
  const serviceBreakdown: ServiceBreakdown = {
    leaderCost: Math.round(leaderCost),
    rescueCost: Math.round(rescueCost),
    insuranceCost: Math.round(insuranceCost),
    mealsCost: Math.round(mealsCost),
  }

  const routeBase = route.basePrice.min * peopleCount
  const transportCost = requirement.transportType === 'rental' ? 1500 + days * 400 : 800

  const subtotal = hotelCost + ticketCost + serviceCost + routeBase * 0.5 + transportCost
  const profit = subtotal * (profitMargin / 100)
  const totalBeforeDiscount = Math.round((subtotal + profit) / 100) * 100
  const safeDiscount = Math.max(0, Math.min(discountAmount, totalBeforeDiscount - 1000))
  const totalAfterDiscount = totalBeforeDiscount - safeDiscount
  const totalMin = Math.round(totalAfterDiscount / 100) * 100
  const totalMax = Math.round((totalMin * 1.15) / 100) * 100

  const actualMargin = totalMin > 0 ? (profit / totalMin) * 100 : 0
  if (actualMargin < 8) {
    warnings.push('⚠️ 当前毛利率偏低，建议提高利润率或降低成本项')
  }
  if (totalMax > requirement.totalBudget * 1.1) {
    warnings.push('⚠️ 报价已超出客户预算10%以上，建议沟通调整方案')
  }
  if (days < 5 && includeLeader) {
    warnings.push('💡 短途行程领队成本占比较高，可考虑减少领队天数')
  }
  if (safeDiscount > 0 && actualMargin < 5) {
    warnings.push('⚠️ 优惠后毛利率低于5%，请注意成本控制')
  }

  return {
    subtotal: Math.round(subtotal),
    hotelCost: Math.round(hotelCost),
    ticketCost: Math.round(ticketCost),
    serviceCost: Math.round(serviceCost),
    serviceBreakdown,
    otherCost: Math.round(routeBase * 0.5 + transportCost),
    profit: Math.round(profit),
    discountAmount: safeDiscount,
    totalBeforeDiscount,
    totalMin,
    totalMax,
    profitMargin: Math.round(actualMargin * 10) / 10,
    warnings,
  }
}

export function formatMoney(amount: number): string {
  return '¥' + amount.toLocaleString('zh-CN')
}

export function getHotelLevelName(level: string): string {
  const map: Record<string, string> = {
    economic: '经济型',
    standard: '舒适型',
    premium: '豪华型',
    luxury: '奢华型',
  }
  return map[level] || '标准型'
}
