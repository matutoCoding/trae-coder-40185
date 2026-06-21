import { useState } from 'react'
import type { BrandConfig, CustomerRequirement, QuoteConfig, QuoteResult, RoutePlan } from '@/types'
import { generatePDF } from '@/utils/pdf'
import { formatMoney, getHotelLevelName } from '@/utils/quote'
import { hotelLevelLabels, ticketPackages } from '@/data/options'

interface Props {
  requirement: CustomerRequirement
  route: RoutePlan
  quoteConfig: QuoteConfig
  quote: QuoteResult
  brand: BrandConfig
  setBrand: (b: BrandConfig) => void
  onBack: () => void
  quoteNote: string
}

export function ExportPanel(props: Props) {
  const { requirement, route, quoteConfig, quote, brand, setBrand, onBack, quoteNote } = props
  const [exporting, setExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'brand'>('preview')

  const updateBrand = <K extends keyof BrandConfig>(key: K, value: BrandConfig[K]) => {
    setBrand({ ...brand, [key]: value })
  }

  const handleExport = async () => {
    setExporting(true)
    setExportSuccess(false)
    try {
      const filename = `${requirement.destination || '川西'}-${route.name}-${requirement.customerName || '客户方案'}.pdf`
      const ok = await generatePDF(brand, requirement, route, quoteConfig, quote, filename, quoteNote)
      setExportSuccess(ok)
      if (ok) setTimeout(() => setExportSuccess(false), 3000)
    } finally {
      setExporting(false)
    }
  }

  const selectedTickets = quoteConfig.selectedTickets
    .map(id => ticketPackages.find(t => t.id === id)?.name)
    .filter(Boolean)
    .join('、')

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-8 pb-28">
        <div className="max-w-[1300px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-warm-600">📄</span> 路书成稿 · 预览与导出
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                PDF 将包含封面、日程、费用说明、注意事项、地图、客户确认共 6+ 页
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'preview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >📖 路书预览</button>
              <button
                onClick={() => setActiveTab('brand')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'brand' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >🏢 品牌信息编辑</button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {activeTab === 'preview' ? (
              <>
                <div className="col-span-8 space-y-6">
                  <section className="card overflow-hidden">
                    <div
                      className="relative h-80 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 flex items-center p-10 overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${route.accentColor}dd, #1e3a8a)` }}
                    >
                      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-20 bg-white" />
                      <div className="absolute -left-10 bottom-0 w-48 h-48 rounded-full opacity-15 bg-white" />

                      <div className="relative z-10 text-white w-full">
                        <div className="text-2xl font-bold mb-1">{brand.agencyName || '星空国际旅行社'}</div>
                        {brand.slogan && (
                          <div className="text-sm text-brand-100 mb-10">{brand.slogan}</div>
                        )}
                        <div className="text-sm tracking-widest opacity-90">定 制 自 驾 旅 游 方 案</div>
                        <div className="text-5xl font-bold mt-3 mb-3 drop-shadow-lg">
                          {requirement.destination || '川西秘境'}
                        </div>
                        <div className="text-xl font-light">
                          {requirement.days}天{requirement.days - 1}晚 · {route.name}行程
                        </div>

                        <div className="w-20 h-1 bg-warm-400 mt-6 mb-6 rounded-full" />

                        <div className="space-y-1.5 text-sm">
                          <div>客户姓名：{requirement.customerName || '尊贵客户'}</div>
                          <div>出行人数：{requirement.peopleCount}人</div>
                          <div>出团日期：{requirement.travelDate || '待定'}</div>
                          <div>行程类型：{route.name} · {route.tagline}</div>
                        </div>

                        <div className="absolute right-0 bottom-0 text-right text-sm">
                          <div className="opacity-90">顾问：{brand.consultantName}</div>
                          <div className="opacity-90">电话：{brand.consultantPhone}</div>
                          <div className="opacity-80 text-xs mt-1">{brand.agencyAddress}</div>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                      <span>第 1 页 · 封面 Cover</span>
                      <span className="text-brand-600 font-semibold">✨ PDF 实际效果将使用矢量图形输出</span>
                    </div>
                  </section>

                  <section className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">2</span>
                        行程概览与每日安排
                      </h3>
                      <span className="text-xs text-slate-400">第 2 页</span>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-5">
                      {[
                        { label: '目的地', value: requirement.destination, icon: '📍' },
                        { label: '出行天数', value: `${requirement.days}天${requirement.days - 1}晚`, icon: '📅' },
                        { label: '出行人数', value: `${requirement.peopleCount}人`, icon: '👥' },
                        { label: '总里程', value: `${route.totalDriveDistance}km`, icon: '🛣️' },
                      ].map((item, i) => (
                        <div key={i} className="rounded-lg bg-slate-50 p-3 text-center">
                          <div className="text-xl mb-1">{item.icon}</div>
                          <div className="text-[10px] text-slate-500">{item.label}</div>
                          <div className="text-sm font-bold text-slate-800 mt-0.5 truncate">{item.value || '-'}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                      {route.dailyPlans.map(day => (
                        <div key={day.day} className="flex gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-100">
                          <div
                            className="w-12 h-12 rounded-xl flex-shrink-0 flex flex-col items-center justify-center text-white font-bold shadow-sm"
                            style={{ backgroundColor: route.accentColor }}
                          >
                            <div className="text-[9px] opacity-85 leading-none">DAY</div>
                            <div className="text-sm leading-none mt-0.5">{day.day}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-bold text-slate-800">{day.title}</div>
                              <div className="text-[11px] text-slate-500 flex-shrink-0">
                                {day.driveDuration} · {day.driveDistance}km
                              </div>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              📍 {day.stayCity} · 🏨 {day.hotelName}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {day.highlights.slice(0, 5).map((h, i) => (
                                <span key={i}
                                  className="text-[10px] px-1.5 py-0.5 rounded"
                                  style={{ backgroundColor: `${route.accentColor}12`, color: route.accentColor }}
                                >{h}</span>
                              ))}
                              {day.highlights.length > 5 && (
                                <span className="text-[10px] text-slate-400">+{day.highlights.length - 5}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">3</span>
                        费用说明与报价
                      </h3>
                      <span className="text-xs text-slate-400">第 3 页</span>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-xs font-bold text-slate-700 mb-3">费用明细</div>
                        <table className="w-full text-sm">
                          <tbody>
                            {[
                              { name: '酒店住宿', desc: `${hotelLevelLabels[quoteConfig.selectedHotelLevel]} × ${requirement.days - 1}晚`, value: quote.hotelCost, perPerson: Math.round(quote.hotelCost / requirement.peopleCount) },
                              { name: '门票组合', desc: selectedTickets || '客户自理', value: quote.ticketCost, perPerson: Math.round(quote.ticketCost / requirement.peopleCount) },
                              { name: '├ 专业领队', desc: quoteConfig.includeLeader ? '全程' : '未含', value: quote.serviceBreakdown.leaderCost, perPerson: Math.round(quote.serviceBreakdown.leaderCost / requirement.peopleCount), indent: true, muted: !quoteConfig.includeLeader },
                              { name: '├ 应急救援', desc: quoteConfig.includeRescue ? '全程' : '未含', value: quote.serviceBreakdown.rescueCost, perPerson: Math.round(quote.serviceBreakdown.rescueCost / requirement.peopleCount), indent: true, muted: !quoteConfig.includeRescue },
                              { name: '├ 旅游保险', desc: quoteConfig.includeInsurance ? '高原专项' : '未含', value: quote.serviceBreakdown.insuranceCost, perPerson: Math.round(quote.serviceBreakdown.insuranceCost / requirement.peopleCount), indent: true, muted: !quoteConfig.includeInsurance },
                              { name: '└ 餐饮包', desc: quoteConfig.includeMeals ? '含特色餐' : '未含', value: quote.serviceBreakdown.mealsCost, perPerson: Math.round(quote.serviceBreakdown.mealsCost / requirement.peopleCount), indent: true, muted: !quoteConfig.includeMeals },
                              { name: '增值服务小计', desc: '-', value: quote.serviceCost, perPerson: Math.round(quote.serviceCost / requirement.peopleCount), sub: true },
                              { name: '交通及其他', desc: requirement.transportType === 'rental' ? '含租车' : '自带车', value: quote.otherCost, perPerson: Math.round(quote.otherCost / requirement.peopleCount) },
                              { name: '计划利润', desc: `${quoteConfig.profitMargin}%`, value: quote.profit, perPerson: Math.round(quote.profit / requirement.peopleCount), highlight: true },
                            ].map((row: any, i) => (
                              <tr key={i} className="border-b border-slate-100 last:border-0">
                                <td className={`py-1.5 pr-2 ${row.indent ? 'pl-4' : ''}`}>
                                  <div className={`text-[11px] font-semibold ${row.highlight ? 'text-green-600' : row.muted ? 'text-slate-400' : row.sub ? 'text-brand-700' : 'text-slate-700'}`}>{row.name}</div>
                                  {row.desc && row.desc !== '-' && <div className="text-[9px] text-slate-400">{row.desc}</div>}
                                </td>
                                <td className={`py-1.5 text-right text-[10px] ${row.muted ? 'text-slate-400' : 'text-slate-400'}`}>{row.perPerson > 0 ? formatMoney(row.perPerson) + '/人' : '-'}</td>
                                <td className={`py-1.5 text-right font-bold ${row.highlight ? 'text-green-600' : row.muted ? 'text-slate-400' : row.sub ? 'text-brand-700' : 'text-slate-800'}`}>
                                  {formatMoney(row.value)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {quoteNote && (
                          <div className="mt-3 p-3 rounded-lg bg-warm-50 border border-warm-100">
                            <div className="text-[10px] font-bold text-warm-700 mb-1">📝 报价备注</div>
                            <div className="text-[11px] text-warm-600 whitespace-pre-wrap leading-relaxed">{quoteNote}</div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="p-5 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-lg">
                          <div className="text-xs text-brand-100 mb-1">建议报价区间</div>
                          <div className="text-3xl font-bold tracking-tight">
                            {formatMoney(quote.totalMin)}<span className="text-lg opacity-70 mx-1">~</span>{formatMoney(quote.totalMax)}
                          </div>
                          <div className="mt-2 pt-2 border-t border-white/20 flex justify-between text-[11px]">
                            <span className="text-brand-100">人均 {formatMoney(Math.round(quote.totalMin / requirement.peopleCount))} 起</span>
                            <span className="text-warm-300 font-semibold">毛利率约 {quote.profitMargin}%</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                            <div className="font-semibold text-green-700 mb-1">✓ 费用包含</div>
                            <ul className="text-green-600 space-y-0.5 text-[11px]">
                              {route.included.slice(0, 4).map((x, i) => (
                                <li key={i}>• {x}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                            <div className="font-semibold text-red-700 mb-1">✗ 不含项目</div>
                            <ul className="text-red-600 space-y-0.5 text-[11px]">
                              {route.notIncluded.slice(0, 4).map((x, i) => (
                                <li key={i}>• {x}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-warm-100 text-warm-700 flex items-center justify-center text-xs font-bold">4</span>
                        出行注意事项
                      </h3>
                      <span className="text-xs text-slate-400">第 4 页</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {[
                        {
                          title: '出行准备',
                          icon: '🎒',
                          items: ['防晒用品+墨镜+保暖衣物', '常用药品+身份证+优惠证件', '保温杯+充电宝+洗漱包'],
                        },
                        {
                          title: '安全须知',
                          icon: '🛡️',
                          items: ['严禁疲劳驾驶+遵守交规', '不单独去偏僻区域', '身体不适及时联系领队'],
                        },
                        {
                          title: '风俗礼仪',
                          icon: '🙏',
                          items: ['尊重当地少数民族风俗', '进寺庙脱帽不戴墨镜', '不随意拍摄当地居民'],
                        },
                        {
                          title: '退改政策',
                          icon: '📋',
                          items: ['15天前取消退100%', '7-14天取消退70%', '3-6天取消退50%'],
                        },
                      ].map((sec, i) => (
                        <div key={i} className="rounded-lg bg-slate-50 p-4">
                          <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                            <span>{sec.icon}</span> {sec.title}
                          </div>
                          <ul className="space-y-1 text-slate-600">
                            {sec.items.map((it, j) => (
                              <li key={j} className="flex gap-1.5 items-start">
                                <span className="text-warm-500 mt-0.5">•</span><span>{it}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">5</span>
                        行程地图示意
                      </h3>
                      <span className="text-xs text-slate-400">第 5 页</span>
                    </div>
                    <div className="relative h-72 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 overflow-hidden">
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 200">
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {(() => {
                          const cities = [...new Set(route.dailyPlans.map(d => d.stayCity))]
                          const points: { x: number; y: number; name: string; day: number }[] = []
                          cities.forEach((name, i) => {
                            const t = cities.length <= 1 ? 0 : i / (cities.length - 1)
                            points.push({
                              x: 40 + t * 420,
                              y: 50 + Math.sin(i * 1.2) * 50 + i * 8,
                              name,
                              day: i + 1,
                            })
                          })

                          return (
                            <>
                              <path
                                d={points.map((p, i) => (i ? 'L' : 'M') + p.x + ',' + p.y).join(' ')}
                                fill="none"
                                stroke={route.accentColor}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray="8 4"
                              />
                              {points.map(p => (
                                <g key={p.name}>
                                  <circle cx={p.x} cy={p.y} r="9" fill="#ef4444" stroke="white" strokeWidth="2.5" />
                                  <text x={p.x} y={p.y + 3.5} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{p.day}</text>
                                  <text x={p.x + 14} y={p.y + 4} fill="#1e293b" fontSize="12" fontWeight="bold">{p.name}</text>
                                </g>
                              ))}
                            </>
                          )
                        })()}
                      </svg>

                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-500 bg-white/80 backdrop-blur px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> 住宿城市</span>
                          <span className="flex items-center gap-1.5"><span className="w-5 h-0.5" style={{ background: route.accentColor }} /> 行车路线</span>
                        </div>
                        <span className="font-semibold text-slate-700">总里程 {route.totalDriveDistance}km</span>
                      </div>
                    </div>
                  </section>

                  <section className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">6</span>
                        客户确认页
                      </h3>
                      <span className="text-xs text-slate-400">第 6 页 · 可直接打印签字</span>
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-lg font-bold text-brand-800 tracking-wider">行程确认单</div>
                      <div className="w-12 h-0.5 bg-gradient-to-r from-brand-500 to-warm-400 mx-auto mt-1.5 rounded-full" />
                    </div>

                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-4">
                      <div className="text-xs font-bold text-brand-700 mb-2">客户信息</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div><span className="text-slate-500">客户姓名：</span><span className="font-semibold text-slate-800">{requirement.customerName || '____________'}</span></div>
                        <div><span className="text-slate-500">联系电话：</span><span className="font-semibold text-slate-800">{requirement.phone || '____________'}</span></div>
                        <div><span className="text-slate-500">出行人数：</span><span className="font-semibold text-slate-800">{requirement.peopleCount} 人</span></div>
                        <div><span className="text-slate-500">出团日期：</span><span className="font-semibold text-slate-800">{requirement.travelDate || '____________'}</span></div>
                        <div className="col-span-2"><span className="text-slate-500">行程方案：</span><span className="font-semibold text-slate-800">{route.name}方案 · {requirement.days}天{requirement.days-1}晚</span></div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white mb-4 text-center">
                      <div className="text-[10px] opacity-80 mb-1">合同总报价（{requirement.peopleCount}人）</div>
                      <div className="text-xl font-bold tracking-tight">
                        {formatMoney(quote.totalMin)}<span className="text-sm opacity-70 mx-1">~</span>{formatMoney(quote.totalMax)}
                      </div>
                      <div className="text-[10px] opacity-80 mt-1">人均 {formatMoney(Math.round(quote.totalMin / requirement.peopleCount))} 起</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[10px] mb-4">
                      <div className="rounded-lg bg-green-50 border border-green-100 p-3">
                        <div className="font-semibold text-green-700 mb-1">✓ 费用包含</div>
                        <ul className="text-green-600 space-y-0.5">
                          {route.included.slice(0, 3).map((x, i) => <li key={i}>• {x}</li>)}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                        <div className="font-semibold text-red-700 mb-1">✗ 不含项目</div>
                        <ul className="text-red-600 space-y-0.5">
                          {route.notIncluded.slice(0, 3).map((x, i) => <li key={i}>• {x}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-3 border-t border-slate-200">
                      <div>
                        <div className="text-[10px] font-bold text-brand-700 mb-2">旅行社确认</div>
                        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2.5 h-20 flex flex-col justify-end">
                          <div className="text-[9px] text-slate-400 border-t border-slate-300 pt-1">签字 / 盖章</div>
                          <div className="text-[9px] text-slate-400 mt-0.5">日期：______________</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-green-700 mb-2">客户确认</div>
                        <div className="rounded-lg border border-dashed border-green-300 bg-green-50/50 p-2.5 h-20 flex flex-col justify-end">
                          <div className="text-[9px] text-slate-400 border-t border-slate-300 pt-1">客户签字</div>
                          <div className="text-[9px] text-slate-400 mt-0.5">日期：______________</div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="col-span-4 space-y-5">
                  <div className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warm-400 to-warm-600 flex items-center justify-center text-white text-lg shadow-md">
                        🏢
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{brand.agencyName || '旅行社品牌'}</div>
                        <div className="text-[11px] text-slate-500">
                          {brand.consultantTitle} · {brand.consultantName}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {[
                        ['旅行社', brand.agencyName],
                        ['品牌口号', brand.slogan],
                        ['顾问姓名', brand.consultantName],
                        ['顾问职务', brand.consultantTitle],
                        ['联系电话', brand.consultantPhone],
                        ['微信号', brand.consultantWechat],
                        ['公司地址', brand.agencyAddress],
                        ['官方网站', brand.agencyWebsite],
                      ].filter(x => x[1]).map(([label, value], i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-slate-500 flex-shrink-0 w-16">{label}</span>
                          <span className="text-slate-800 font-medium truncate">{value}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setActiveTab('brand')}
                      className="mt-4 w-full text-xs text-brand-600 font-semibold py-2 rounded-lg bg-brand-50 hover:bg-brand-100 transition"
                    >
                      ✏️ 编辑品牌与联系方式
                    </button>
                  </div>

                  <div className="card p-5 border-l-4" style={{ borderLeftColor: route.accentColor }}>
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <span>📊</span> 方案摘要
                    </h3>
                    <dl className="space-y-2 text-xs">
                      <div className="flex justify-between"><dt className="text-slate-500">方案类型</dt><dd className="font-semibold text-slate-800">{route.name}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">行程天数</dt><dd className="font-semibold text-slate-800">{requirement.days}天{requirement.days-1}晚</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">出行人数</dt><dd className="font-semibold text-slate-800">{requirement.peopleCount}人</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">总里程</dt><dd className="font-semibold text-slate-800">{route.totalDriveDistance}km</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">酒店等级</dt><dd className="font-semibold text-slate-800">{getHotelLevelName(quoteConfig.selectedHotelLevel)}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">门票组合</dt><dd className="font-semibold text-slate-800">{selectedTickets || '自理'}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">领队服务</dt><dd className={`font-semibold ${quoteConfig.includeLeader ? 'text-green-600' : 'text-slate-400'}`}>{quoteConfig.includeLeader ? '已含' : '未含'}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">客户预算</dt><dd className="font-semibold text-slate-800">{formatMoney(requirement.totalBudget)}</dd></div>
                      <div className="h-px bg-slate-100 my-1" />
                      <div className="flex justify-between"><dt className="text-slate-500">建议报价</dt><dd className="font-bold text-green-600 text-sm">{formatMoney(quote.totalMin)}起</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">毛利空间</dt><dd className="font-bold text-warm-600 text-sm">~{quote.profitMargin}%</dd></div>
                    </dl>
                  </div>

                  {quote.warnings.length > 0 && (
                    <div className="card p-5 border-l-4 border-red-400 bg-red-50/40">
                      <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2 text-sm">
                        <span>⚠️</span> 需与客户沟通事项
                      </h3>
                      <ul className="space-y-1.5 text-xs text-red-600">
                        {quote.warnings.map((w, i) => <li key={i}>{w}</li>)}
                        {route.potentialOverBudget.map((w, i) => <li key={'b'+i}>💡 {w}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="card p-5">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                      <span>🎯</span> 导出操作
                    </h3>
                    <button
                      onClick={handleExport}
                      disabled={exporting}
                      className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${
                        exportSuccess
                          ? 'bg-green-500 shadow-green-500/30'
                          : 'bg-gradient-to-r from-brand-600 to-brand-700 shadow-brand-500/30 hover:shadow-xl hover:-translate-y-0.5'
                      }`}
                    >
                      {exporting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3"/>
                            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                          </svg>
                          正在生成 PDF...
                        </span>
                      ) : exportSuccess ? (
                        '✓ 导出成功！已保存到本地'
                      ) : (
                        '📄 导出路书 PDF 文件'
                      )}
                    </button>
                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 text-xs py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition">
                        📧 发送邮件
                      </button>
                      <button className="flex-1 text-xs py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition">
                        💾 保存为模板
                      </button>
                    </div>
                    <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                      提示：在桌面端运行会弹出系统保存对话框；Web 端将直接下载到浏览器默认下载目录。
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-12 card p-8 max-w-3xl mx-auto">
                <h3 className="font-bold text-slate-800 text-lg mb-1 flex items-center gap-2">
                  <span>🏢</span> 编辑旅行社品牌与顾问信息
                </h3>
                <p className="text-sm text-slate-500 mb-6">这些信息将显示在 PDF 路书的封面、页眉和页脚</p>

                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 p-4 rounded-xl bg-gradient-to-r from-brand-50 to-purple-50 border border-brand-100">
                    <div className="text-xs font-bold text-brand-700 mb-3">旅行社信息</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="label-base">旅行社名称</label>
                        <input className="input-base" value={brand.agencyName} onChange={e => updateBrand('agencyName', e.target.value)} placeholder="如：星空国际旅行社" />
                      </div>
                      <div className="col-span-2">
                        <label className="label-base">品牌口号</label>
                        <input className="input-base" value={brand.slogan} onChange={e => updateBrand('slogan', e.target.value)} placeholder="如：发现世界的另一种可能" />
                      </div>
                      <div>
                        <label className="label-base">公司地址</label>
                        <input className="input-base" value={brand.agencyAddress} onChange={e => updateBrand('agencyAddress', e.target.value)} placeholder="详细办公地址" />
                      </div>
                      <div>
                        <label className="label-base">官方网站</label>
                        <input className="input-base" value={brand.agencyWebsite} onChange={e => updateBrand('agencyWebsite', e.target.value)} placeholder="www.example.com" />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 p-4 rounded-xl bg-gradient-to-r from-warm-50 to-orange-50 border border-warm-100">
                    <div className="text-xs font-bold text-warm-700 mb-3">定制顾问信息（展示在路书上的联系信息）</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-base">顾问姓名</label>
                        <input className="input-base" value={brand.consultantName} onChange={e => updateBrand('consultantName', e.target.value)} placeholder="您的姓名" />
                      </div>
                      <div>
                        <label className="label-base">顾问职务</label>
                        <input className="input-base" value={brand.consultantTitle} onChange={e => updateBrand('consultantTitle', e.target.value)} placeholder="如：高级定制师" />
                      </div>
                      <div>
                        <label className="label-base">联系电话</label>
                        <input className="input-base" value={brand.consultantPhone} onChange={e => updateBrand('consultantPhone', e.target.value)} placeholder="客户联系您的电话" />
                      </div>
                      <div>
                        <label className="label-base">微信号</label>
                        <input className="input-base" value={brand.consultantWechat} onChange={e => updateBrand('consultantWechat', e.target.value)} placeholder="客户添加您的微信" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button className="btn-secondary" onClick={() => setActiveTab('preview')}>← 返回预览</button>
                  <button className="btn-warm" onClick={() => setActiveTab('preview')}>
                    保存并预览 →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-200 px-8 py-4 z-20">
        <div className="max-w-[1300px] mx-auto flex items-center justify-between">
          <div className="text-sm">
            <span className="text-slate-500">已完成：</span>
            <span className="font-bold text-slate-800 mx-1">需求录入</span>
            <span className="text-slate-300">→</span>
            <span className="font-bold text-slate-800 mx-1">方案对比</span>
            <span className="text-slate-300">→</span>
            <span className="font-bold text-green-600 mx-1">路书导出</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary" onClick={onBack}>← 返回修改方案</button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-6 py-2.5 bg-gradient-to-r from-warm-500 to-warm-600 text-white font-bold rounded-lg hover:from-warm-600 hover:to-warm-700 transition shadow-lg shadow-warm-500/25 disabled:opacity-70"
            >
              {exporting ? '生成中...' : '📄 一键导出路书'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
