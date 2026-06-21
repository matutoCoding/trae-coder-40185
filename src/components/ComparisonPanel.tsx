import type { CustomerRequirement, QuoteConfig, QuoteResult, RoutePlan } from '@/types'
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
}

export function ComparisonPanel(props: Props) {
  const { routes, selectedRouteId, setSelectedRouteId, requirement, quoteConfig, setQuoteConfig, quote, onNext, onBack } = props
  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0]
  const isOverBudget = quote.totalMax > requirement.totalBudget * 1.05

  const toggleTicket = (id: string) => {
    const exists = quoteConfig.selectedTickets.includes(id)
    setQuoteConfig({
      ...quoteConfig,
      selectedTickets: exists ? quoteConfig.selectedTickets.filter(t => t !== id) : [...quoteConfig.selectedTickets, id],
    })
  }

  return (
    <div className="h-full flex flex-col">
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
                    className={`text-left card p-0 overflow-hidden transition-all hover:-translate-y-1 ${
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
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedRoute.accentColor }}
                    />
                    {selectedRoute.name} 方案 - 每日行程
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">共 {requirement.days} 天 · 总里程 {selectedRoute.totalDriveDistance}km</p>
                </div>
              </div>

              <div className="relative">
                <div
                  className="absolute left-[27px] top-2 bottom-2 w-0.5"
                  style={{ backgroundColor: `${selectedRoute.accentColor}30` }}
                />
                <div className="space-y-4">
                  {selectedRoute.dailyPlans.map(day => (
                    <div key={day.day} className="relative flex gap-4 pl-0">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-[54px] h-[54px] rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-sm flex-shrink-0 z-10"
                          style={{ backgroundColor: selectedRoute.accentColor }}
                        >
                          <div className="text-[10px] opacity-90">DAY</div>
                          <div className="text-lg leading-none">{day.day}</div>
                        </div>
                      </div>

                      <div className="flex-1 rounded-xl bg-slate-50 hover:bg-slate-100 transition p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-800 text-sm">{day.title}</div>
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

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-slate-600">
                    <span>🏨 酒店住宿</span>
                    <span className="font-medium text-slate-800">{formatMoney(quote.hotelCost)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>🎫 门票组合</span>
                    <span className="font-medium text-slate-800">{formatMoney(quote.ticketCost)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>🛠️ 增值服务</span>
                    <span className="font-medium text-slate-800">{formatMoney(quote.serviceCost)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>🚗 交通及其他</span>
                    <span className="font-medium text-slate-800">{formatMoney(quote.otherCost)}</span>
                  </div>
                  <div className="h-px bg-slate-200 my-1" />
                  <div className="flex justify-between text-slate-600">
                    <span>📊 小计</span>
                    <span className="font-medium text-slate-800">{formatMoney(quote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>💵 计划利润</span>
                    <span className="font-medium text-green-600">+{formatMoney(quote.profit)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white">
                  <div className="text-xs text-brand-100 mb-1">建议报价区间</div>
                  <div className="text-2xl font-bold">
                    {formatMoney(quote.totalMin)} <span className="text-lg opacity-80">~</span> {formatMoney(quote.totalMax)}
                  </div>
                  <div className="text-[11px] text-brand-100 mt-1">
                    人均 {formatMoney(Math.round(quote.totalMin / requirement.peopleCount))} 起
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
                      { key: 'includeLeader', name: '专业随车领队', price: '¥800/天', desc: '高原经验+急救证' },
                      { key: 'includeRescue', name: '应急救援服务', price: '¥1200全程', desc: '卫星电话+拖车' },
                      { key: 'includeInsurance', name: '高额旅游保险', price: '¥120/人', desc: '高原专项保障' },
                      { key: 'includeMeals', name: '全程餐饮包', price: '¥280/人/天', desc: '含特色餐体验' },
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
                              <div className="text-[10px] text-green-700 font-bold flex-shrink-0">{s.price}</div>
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
    </div>
  )
}
