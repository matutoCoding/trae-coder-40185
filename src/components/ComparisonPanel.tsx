import { useState } from 'react'
import type { CustomerRequirement, QuoteConfig, QuoteResult, RoutePlan, DailyPlan, QuoteVersion } from '@/types'
import { hotelOptions, hotelLevelLabels, ticketPackages, extraServices } from '@/data/options'
import { formatMoney } from '@/utils/quote'

interface Props {
  routes: RoutePlan[]
  selectedRouteId: string
  setSelectedRouteId: (id: string) => void
  requirement: CustomerRequirement
  quoteConfig: QuoteConfig
  setQuoteConfig: (c: QuoteConfig) => void
  quote: QuoteResult
  onNext: () => void
  onBack: () => void
  onUpdateDailyPlan: (routeId: string, dayIndex: number, updates: Partial<DailyPlan>) => void
  onResetRoute: (routeId: string) => void
  isRouteEdited: boolean
  quoteVersions: QuoteVersion[]
  quoteNote: string
  setQuoteNote: (n: string) => void
  onSaveQuoteVersion: (name: string) => void
  onApplyQuoteVersion: (id: string) => void
  onDeleteQuoteVersion: (id: string) => void
}

export function ComparisonPanel(props: Props) {
  const {
    routes, selectedRouteId, setSelectedRouteId, requirement,
    quoteConfig, setQuoteConfig, quote, onNext, onBack,
    onUpdateDailyPlan, onResetRoute, isRouteEdited,
    quoteVersions, quoteNote, setQuoteNote,
    onSaveQuoteVersion, onApplyQuoteVersion, onDeleteQuoteVersion,
  } = props

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0]
  const isOverBudget = quote.totalMax > requirement.totalBudget * 1.05

  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<DailyPlan>>({})
  const [showSaveVersion, setShowSaveVersion] = useState(false)
  const [newVersionName, setNewVersionName] = useState('')

  const toggleTicket = (id: string) => {
    const exists = quoteConfig.selectedTickets.includes(id)
    setQuoteConfig({
      ...quoteConfig,
      selectedTickets: exists ? quoteConfig.selectedTickets.filter(t => t !== id) : [...quoteConfig.selectedTickets, id],
    })
  }

  const openEditDay = (dayIndex: number) => {
    const day = selectedRoute.dailyPlans[dayIndex]
    setEditForm({
      title: day.title,
      stayCity: day.stayCity,
      hotelName: day.hotelName,
      driveDistance: day.driveDistance,
      driveDuration: day.driveDuration,
      highlights: [...day.highlights],
    })
    setEditingDay(dayIndex)
  }

  const closeEditDay = () => {
    setEditingDay(null)
    setEditForm({})
  }

  const saveEditDay = () => {
    if (editingDay === null) return
    onUpdateDailyPlan(selectedRouteId, editingDay, editForm)
    closeEditDay()
  }

  const addHighlight = () => {
    const highlights = [...(editForm.highlights || []), '新体验点']
    setEditForm({ ...editForm, highlights })
  }

  const updateHighlight = (idx: number, value: string) => {
    const highlights = [...(editForm.highlights || [])]
    highlights[idx] = value
    setEditForm({ ...editForm, highlights })
  }

  const removeHighlight = (idx: number) => {
    const highlights = [...(editForm.highlights || [])]
    highlights.splice(idx, 1)
    setEditForm({ ...editForm, highlights })
  }

  const peopleCount = requirement.peopleCount
  const hotelPerPerson = Math.round(quote.hotelCost / peopleCount)
  const ticketPerPerson = Math.round(quote.ticketCost / peopleCount)
  const servicePerPerson = Math.round(quote.serviceCost / peopleCount)
  const otherPerPerson = Math.round(quote.otherCost / peopleCount)
  const profitPerPerson = Math.round(quote.profit / peopleCount)
  const totalPerPerson = Math.round(quote.totalMin / peopleCount)
  const leaderPerPerson = Math.round(quote.serviceBreakdown.leaderCost / peopleCount)
  const rescuePerPerson = Math.round(quote.serviceBreakdown.rescueCost / peopleCount)
  const insurancePerPerson = Math.round(quote.serviceBreakdown.insuranceCost / peopleCount)
  const mealsPerPerson = Math.round(quote.serviceBreakdown.mealsCost / peopleCount)

  const handleSaveVersion = () => {
    if (newVersionName.trim()) {
      onSaveQuoteVersion(newVersionName.trim())
      setNewVersionName('')
      setShowSaveVersion(false)
    }
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 overflow-y-auto p-8 pb-28">
        <div className="max-w-[1300px] mx-auto space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-brand-600">🛣️</span> 三条路线方案对比
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  根据客户需求自动生成的 {requirement.days}天{requirement.days - 1}晚 自驾方案
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
                  <span>👥</span> {requirement.peopleCount}人
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
                  <span>💰</span> 总预算 ¥{requirement.totalBudget.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
                  <span>🎯</span> {requirement.destination || '川西'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              {routes.map(route => {
                const selected = route.id === selectedRouteId
                const baseTotalMin = route.basePrice.min * requirement.peopleCount
                const baseTotalMax = route.basePrice.max * requirement.peopleCount
                return (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                    className={`text-left card p-0 overflow-hidden transition-all hover:-translate-y-0.5 ${
                      selected ? 'ring-2 shadow-xl scale-[1.01]' : 'shadow-sm hover:shadow-lg'
                    }`}
                    style={{
                      // @ts-expect-error css var
                      '--accent': route.accentColor,
                      ringColor: selected ? route.accentColor : 'transparent',
                    }}
                  >
                    <div className="h-2" style={{ backgroundColor: route.accentColor }} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-800">{route.name}</h3>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: `${route.accentColor}15`, color: route.accentColor }}
                            >
                              {route.tagline}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{route.description}</p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition ${
                            selected ? 'border-transparent' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: selected ? route.accentColor : 'transparent' }}
                        >
                          {selected && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div className="rounded-lg bg-slate-50 py-2">
                          <div className="text-[10px] text-slate-500">总车程</div>
                          <div className="text-sm font-bold text-slate-800">{route.totalDriveDistance}km</div>
                        </div>
                        <div className="rounded-lg bg-slate-50 py-2">
                          <div className="text-[10px] text-slate-500">日均</div>
                          <div className="text-sm font-bold text-slate-800">
                            {Math.round(route.totalDriveDistance / requirement.days)}km
                          </div>
                        </div>
                        <div className="rounded-lg py-2" style={{ backgroundColor: `${route.accentColor}10` }}>
                          <div className="text-[10px]" style={{ color: route.accentColor }}>人均起</div>
                          <div className="text-sm font-bold" style={{ color: route.accentColor }}>
                            ¥{route.basePrice.min.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        <div className="text-xs font-semibold text-slate-700">核心亮点</div>
                        {route.highlights.slice(0, 3).map((h, i) => (
                          <div key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                            <span style={{ color: route.accentColor }}>•</span>
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-[10px] text-slate-500">报价区间</div>
                            <div className="font-bold" style={{ color: route.accentColor }}>
                              ¥{baseTotalMin.toLocaleString()} ~ {baseTotalMax.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {requirement.peopleCount}人
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-8 card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedRoute.accentColor }}
                  />
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {selectedRoute.name} 方案 - 每日行程
                      {isRouteEdited && <span className="ml-2 text-[10px] px-2 py-0.5 bg-warm-100 text-warm-700 rounded-full font-normal">已编辑</span>}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      共 {requirement.days} 天 · 总里程 {selectedRoute.totalDriveDistance}km · 点击可微调
                    </p>
                  </div>
                </div>
                {isRouteEdited && (
                  <button
                    onClick={() => onResetRoute(selectedRouteId)}
                    className="text-xs text-slate-500 hover:text-red-500 transition"
                  >↺ 恢复初始方案</button>
                )}
              </div>

              <div className="relative">
                <div
                  className="absolute left-[27px] top-2 bottom-2 w-0.5"
                  style={{ backgroundColor: `${selectedRoute.accentColor}30` }}
                />
                <div className="space-y-3 max-h-[calc(100vh-420px)] overflow-y-auto pr-2">
                  {selectedRoute.dailyPlans.map((day, dayIdx) => (
                    <div key={day.day} className="relative flex gap-4 pl-0">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-[54px] h-[54px] rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-sm flex-shrink-0 z-10 cursor-pointer hover:scale-105 transition"
                          style={{ backgroundColor: selectedRoute.accentColor }}
                          onClick={() => openEditDay(dayIdx)}
                        >
                          <div className="text-[10px] opacity-90">DAY</div>
                          <div className="text-lg leading-none">{day.day}</div>
                        </div>
                      </div>

                      <div
                        className="flex-1 rounded-xl bg-slate-50 hover:bg-slate-100 transition p-4 cursor-pointer group border border-transparent hover:border-brand-200"
                        onClick={() => openEditDay(dayIdx)}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                              {day.title}
                              <span className="opacity-0 group-hover:opacity-100 transition text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                                点击编辑 ✏️
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              📍 {day.stayCity} · 🏨 {day.hotelName}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs flex-shrink-0">
                            <span className="px-2 py-1 rounded-md bg-white text-slate-600 border border-slate-200 shadow-sm">
                              🚗 {day.driveDuration}
                            </span>
                            <span className="px-2 py-1 rounded-md bg-white text-slate-600 border border-slate-200 shadow-sm">
                              📏 {day.driveDistance}km
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {day.highlights.map((h, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2 py-0.5 rounded-md"
                              style={{ backgroundColor: `${selectedRoute.accentColor}12`, color: selectedRoute.accentColor }}
                            >
                              {h}
                            </span>
                          ))}
                        </div>

                        {day.overBudgetRisk && (
                          <div className="mt-2 text-[11px] text-warm-700 bg-warm-50 rounded-md px-2 py-1 border border-warm-100">
                            ⚠️ {day.overBudgetRisk}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRoute.potentialOverBudget.length > 0 && (
                <div className="mt-5 p-4 rounded-xl bg-warm-50 border border-warm-100">
                  <div className="text-xs font-bold text-warm-700 mb-2 flex items-center gap-1.5">
                    <span>💡</span> 可能的超预算项（建议提前与客户沟通）
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoute.potentialOverBudget.map((item, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-white text-warm-700 border border-warm-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-4 space-y-5">
              <div className={`card p-5 ${isOverBudget ? 'ring-2 ring-red-300' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span>💰</span> 实时报价
                  </h3>
                  <div className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    quote.profitMargin >= 12 ? 'bg-green-100 text-green-700' : quote.profitMargin >= 8 ? 'bg-warm-100 text-warm-700' : 'bg-red-100 text-red-700'
                  }`}>
                    毛利 {quote.profitMargin}%
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 mb-2 flex justify-between">
                  <span>项目</span>
                  <span className="flex gap-4">
                    <span>总价</span>
                    <span className="text-slate-400">人均</span>
                  </span>
                </div>

                <div className="space-y-1.5 text-sm mb-4">
                  <div className="flex justify-between items-center text-slate-600 py-1">
                    <span>🏨 酒店住宿</span>
                    <span className="flex gap-6">
                      <span className="font-medium text-slate-800">{formatMoney(quote.hotelCost)}</span>
                      <span className="text-[11px] text-slate-400 w-16 text-right">{formatMoney(hotelPerPerson)}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 py-1">
                    <span>🎫 门票组合</span>
                    <span className="flex gap-6">
                      <span className="font-medium text-slate-800">{formatMoney(quote.ticketCost)}</span>
                      <span className="text-[11px] text-slate-400 w-16 text-right">{formatMoney(ticketPerPerson)}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 py-1 pl-3 text-[13px]">
                    <span className="text-slate-500">├ 👨‍✈️ 专业领队</span>
                    <span className="flex gap-6">
                      <span className="text-slate-700">{formatMoney(quote.serviceBreakdown.leaderCost)}</span>
                      <span className="text-[11px] text-slate-400 w-16 text-right">{formatMoney(leaderPerPerson)}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 py-1 pl-3 text-[13px]">
                    <span className="text-slate-500">├ 🆘 应急救援</span>
                    <span className="flex gap-6">
                      <span className="text-slate-700">{formatMoney(quote.serviceBreakdown.rescueCost)}</span>
                      <span className="text-[11px] text-slate-400 w-16 text-right">{formatMoney(rescuePerPerson)}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 py-1 pl-3 text-[13px]">
                    <span className="text-slate-500">├ �️ 旅游保险</span>
                    <span className="flex gap-6">
                      <span className="text-slate-700">{formatMoney(quote.serviceBreakdown.insuranceCost)}</span>
                      <span className="text-[11px] text-slate-400 w-16 text-right">{formatMoney(insurancePerPerson)}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 py-1 pl-3 text-[13px]">
                    <span className="text-slate-500">└ 🍽️ 餐饮包</span>
                    <span className="flex gap-6">
                      <span className="text-slate-700">{formatMoney(quote.serviceBreakdown.mealsCost)}</span>
                      <span className="text-[11px] text-slate-400 w-16 text-right">{formatMoney(mealsPerPerson)}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 py-1">
                    <span>�️ 增值服务小计</span>
                    <span className="flex gap-6">
                      <span className="font-medium text-slate-800">{formatMoney(quote.serviceCost)}</span>
                      <span className="text-[11px] text-slate-400 w-16 text-right">{formatMoney(servicePerPerson)}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 py-1">
                    <span>🚗 交通及其他</span>
                    <span className="flex gap-6">
                      <span className="font-medium text-slate-800">{formatMoney(quote.otherCost)}</span>
                      <span className="text-[11px] text-slate-400 w-16 text-right">{formatMoney(otherPerPerson)}</span>
                    </span>
                  </div>
                  <div className="h-px bg-slate-200 my-1" />
                  <div className="flex justify-between items-center text-slate-600 py-1">
                    <span>📊 小计</span>
                    <span className="flex gap-6">
                      <span className="font-medium text-slate-800">{formatMoney(quote.subtotal)}</span>
                      <span className="text-[11px] text-slate-400 w-16 text-right">-</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 py-1">
                    <span>💵 计划利润</span>
                    <span className="flex gap-6">
                      <span className="font-medium text-green-600">+{formatMoney(quote.profit)}</span>
                      <span className="text-[11px] text-green-500 w-16 text-right">{formatMoney(profitPerPerson)}</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white">
                  <div className="text-xs text-brand-100 mb-1">建议报价区间</div>
                  <div className="text-2xl font-bold">
                    {formatMoney(quote.totalMin)} <span className="text-lg opacity-80">~</span> {formatMoney(quote.totalMax)}
                  </div>
                  <div className="flex justify-between mt-1 text-[11px]">
                    <span className="text-brand-100">人均 {formatMoney(totalPerPerson)} 起</span>
                    <span className="text-warm-300 font-semibold">毛利率 ~{quote.profitMargin}%</span>
                  </div>
                </div>

                {isOverBudget && (
                  <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700">
                    ⚠️ 报价已高于客户总预算（¥{requirement.totalBudget.toLocaleString()}），建议调整成本项
                  </div>
                )}

                {quote.warnings.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {quote.warnings.map((w, i) => (
                      <div key={i} className="text-xs text-warm-700 bg-warm-50 p-2 rounded-md">
                        {w}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span>⚙️</span> 报价配置项
                </h3>

                <div className="mb-5">
                  <div className="text-xs font-semibold text-slate-700 mb-2">酒店档次</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(hotelOptions) as Array<keyof typeof hotelOptions>).map(level => {
                      const hotel = hotelOptions[level][0]
                      const active = quoteConfig.selectedHotelLevel === level
                      return (
                        <button
                          key={level}
                          onClick={() => setQuoteConfig({ ...quoteConfig, selectedHotelLevel: level as QuoteConfig['selectedHotelLevel'] })}
                          className={`p-2.5 rounded-lg border-2 transition text-left ${
                            active ? 'border-warm-500 bg-warm-50' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-xs font-bold text-slate-800">{hotelLevelLabels[level]}</div>
                          <div className="text-[10px] text-warm-600 font-semibold mt-0.5">
                            ¥{hotel.pricePerNight}/晚 · {hotel.rating}分
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="text-xs font-semibold text-slate-700 mb-2">门票组合（可多选）</div>
                  <div className="space-y-2">
                    {ticketPackages.map(tk => {
                      const checked = quoteConfig.selectedTickets.includes(tk.id)
                      return (
                        <label
                          key={tk.id}
                          className={`flex gap-2.5 p-2.5 rounded-lg border transition cursor-pointer ${
                            checked ? 'border-brand-500 bg-brand-50/60' : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTicket(tk.id)}
                            className="mt-0.5 accent-brand-600"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-xs font-bold text-slate-800">{tk.name}</div>
                              <div className="text-xs font-bold text-brand-600 flex-shrink-0">
                                ¥{tk.pricePerPerson}/人
                              </div>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate">{tk.description}</div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="text-xs font-semibold text-slate-700 mb-2">随车服务</div>
                  <div className="space-y-2">
                    {[
                      { key: 'includeLeader', name: '专业随车领队', price: '¥800/天', perPerson: `¥${Math.round(800 / peopleCount)}/人/天`, desc: '高原经验+急救证' },
                      { key: 'includeRescue', name: '应急救援服务', price: '¥1200全程', perPerson: `¥${Math.round(1200 / peopleCount)}/人`, desc: '卫星电话+拖车' },
                      { key: 'includeInsurance', name: '高额旅游保险', price: '¥120/人', perPerson: '¥120/人', desc: '高原专项保障' },
                      { key: 'includeMeals', name: '全程餐饮包', price: '¥280/人/天', perPerson: '¥280/人/天', desc: '含特色餐体验' },
                    ].map(s => {
                      const key = s.key as keyof QuoteConfig
                      const checked = Boolean(quoteConfig[key])
                      return (
                        <label
                          key={s.key}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition cursor-pointer ${
                            checked ? 'border-green-500 bg-green-50/60' : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setQuoteConfig({ ...quoteConfig, [key]: !checked } as QuoteConfig)}
                            className="accent-green-600"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-xs font-bold text-slate-800">{s.name}</div>
                              <div className="text-[10px] text-green-700 font-bold flex-shrink-0 text-right">
                                <div>{s.price}</div>
                                <div className="text-green-500 font-normal">{s.perPerson}</div>
                              </div>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-700">期望利润率</div>
                    <div className="text-sm font-bold text-brand-600">{quoteConfig.profitMargin}%</div>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={35}
                    value={quoteConfig.profitMargin}
                    onChange={e => setQuoteConfig({ ...quoteConfig, profitMargin: Number(e.target.value) })}
                    className="w-full accent-brand-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>5% 薄利</span>
                    <span>15% 标准</span>
                    <span>35% 高利润</span>
                  </div>
                </div>
              </div>

              {extraServices.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <span>🎁</span> 更多增值服务
                  </h3>
                  <div className="space-y-2">
                    {extraServices.filter(s => !['s_leader','s_rescue','s_insurance','s_meals'].includes(s.id)).map(s => (
                      <div key={s.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                        <div className="text-xl">{s.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-bold text-slate-800">{s.name}</div>
                            <div className="text-[10px] text-warm-600 font-bold flex-shrink-0">
                              ¥{s.price}
                              {s.unit === 'per_day' ? '/天' : s.unit === 'per_person' ? '/人' : '全程'}
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate">{s.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span>📋</span> 报价方案版本
                  </h3>
                  {!showSaveVersion ? (
                    <button
                      onClick={() => setShowSaveVersion(true)}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium px-2 py-1 rounded hover:bg-brand-50"
                    >+ 保存为新版本</button>
                  ) : (
                    <button
                      onClick={() => { setShowSaveVersion(false); setNewVersionName('') }}
                      className="text-xs text-slate-500 hover:text-slate-600"
                    >取消</button>
                  )}
                </div>

                {showSaveVersion && (
                  <div className="mb-3 p-3 rounded-lg bg-brand-50 border border-brand-100 space-y-2">
                    <input
                      type="text"
                      placeholder="方案名称，如：基础版、舒适版、升级版..."
                      value={newVersionName}
                      onChange={e => setNewVersionName(e.target.value)}
                      className="input-base text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setShowSaveVersion(false); setNewVersionName('') }}
                        className="text-xs px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-100"
                      >取消</button>
                      <button
                        onClick={handleSaveVersion}
                        disabled={!newVersionName.trim()}
                        className="text-xs px-3 py-1.5 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                      >保存方案</button>
                    </div>
                  </div>
                )}

                {quoteVersions.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    暂无已保存的方案版本<br/>
                    调好配置后点击上方「保存为新版本」
                  </div>
                ) : (
                  <div className="space-y-2">
                    {quoteVersions.map(v => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 transition group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800">{v.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(v.createdAt).toLocaleString('zh-CN')}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => onApplyQuoteVersion(v.id)}
                            className="text-[10px] px-2 py-1 rounded bg-brand-600 text-white hover:bg-brand-700 opacity-0 group-hover:opacity-100 transition"
                          >应用</button>
                          <button
                            onClick={() => onDeleteQuoteVersion(v.id)}
                            className="text-[10px] px-2 py-1 rounded text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
                          >删除</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span>📝</span> 报价备注
                </h3>
                <textarea
                  value={quoteNote}
                  onChange={e => setQuoteNote(e.target.value)}
                  placeholder="可填写优惠说明、赠送项目、客户特殊约定等内容，将显示在报价摘要和 PDF 费用说明中..."
                  className="input-base min-h-[100px] resize-y text-sm"
                />
                <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                  <span>支持多行文字</span>
                  <span>{quoteNote.length} 字</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-200 px-8 py-4 z-20">
        <div className="max-w-[1300px] mx-auto flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">已选择方案</div>
            <div className="text-sm font-bold text-slate-800">
              <span style={{ color: selectedRoute.accentColor }}>●</span> {selectedRoute.name}方案 · {requirement.days}天{requirement.days-1}晚
              {isRouteEdited && <span className="ml-2 text-[10px] text-warm-600">（已微调）</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary" onClick={onBack}>← 返回修改需求</button>
            <div className="text-right pr-2">
              <div className="text-[11px] text-slate-500">建议报价</div>
              <div className="text-lg font-bold text-green-600">
                {formatMoney(quote.totalMin)} <span className="text-xs text-slate-400 font-normal">起</span>
              </div>
            </div>
            <button className="btn-primary" onClick={onNext}>
              生成路书 PDF →
            </button>
          </div>
        </div>
      </div>

      {editingDay !== null && editForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-center justify-center p-6" onClick={closeEditDay}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: selectedRoute.accentColor }}
                  >
                    D{selectedRoute.dailyPlans[editingDay]?.day}
                  </span>
                  微调第 {selectedRoute.dailyPlans[editingDay]?.day} 天行程
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">修改后将同步更新到方案预览和导出的路书中</p>
              </div>
              <button onClick={closeEditDay} className="text-slate-400 hover:text-slate-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="label-base">行程标题</label>
                <input
                  type="text"
                  className="input-base"
                  value={editForm.title || ''}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-base">住宿城市</label>
                  <input
                    type="text"
                    className="input-base"
                    value={editForm.stayCity || ''}
                    onChange={e => setEditForm({ ...editForm, stayCity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-base">酒店名称</label>
                  <input
                    type="text"
                    className="input-base"
                    value={editForm.hotelName || ''}
                    onChange={e => setEditForm({ ...editForm, hotelName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-base">车程距离（km）</label>
                  <input
                    type="number"
                    className="input-base"
                    value={editForm.driveDistance || 0}
                    onChange={e => setEditForm({ ...editForm, driveDistance: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="label-base">车程时长</label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="如：3.5h"
                    value={editForm.driveDuration || ''}
                    onChange={e => setEditForm({ ...editForm, driveDuration: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label-base mb-0">核心体验点</label>
                  <button
                    onClick={addHighlight}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                  >+ 添加体验点</button>
                </div>
                <div className="space-y-2">
                  {(editForm.highlights || []).map((h, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        className="input-base flex-1"
                        value={h}
                        onChange={e => updateHighlight(idx, e.target.value)}
                      />
                      <button
                        onClick={() => removeHighlight(idx)}
                        className="px-3 text-red-500 hover:bg-red-50 rounded-lg border border-red-100"
                      >删除</button>
                    </div>
                  ))}
                  {(editForm.highlights || []).length === 0 && (
                    <div className="text-xs text-slate-400 text-center py-3 bg-slate-50 rounded-lg">
                      暂无体验点，点击上方「添加体验点」按钮新增
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => onResetRoute(selectedRouteId)}
                className="text-xs text-slate-500 hover:text-red-500"
              >↺ 恢复这一天的原始内容</button>
              <div className="flex gap-3">
                <button className="btn-secondary" onClick={closeEditDay}>取消</button>
                <button className="btn-primary" onClick={saveEditDay}>✓ 保存修改</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
