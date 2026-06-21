import type { CustomerRequirement, RoutePlan } from '@/types'

interface Props {
  requirement: CustomerRequirement
  setRequirement: (r: CustomerRequirement) => void
  routes: RoutePlan[]
  onNext: () => void
  canNext: boolean
}

export function RequirementPanel({ requirement, setRequirement, routes, onNext, canNext }: Props) {
  const update = <K extends keyof CustomerRequirement>(key: K, value: CustomerRequirement[K]) => {
    const next = { ...requirement, [key]: value }
    if (key === 'peopleCount' || key === 'budgetPerPerson') {
      next.totalBudget = next.peopleCount * next.budgetPerPerson
    }
    setRequirement(next)
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-[1200px] mx-auto grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <section className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">1</span>
              <h2 className="text-base font-bold text-slate-800">客户基本信息</h2>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="label-base">客户姓名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="请输入客户姓名"
                  value={requirement.customerName}
                  onChange={e => update('customerName', e.target.value)}
                />
              </div>
              <div>
                <label className="label-base">联系电话</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="客户手机号码"
                  value={requirement.phone}
                  onChange={e => update('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="label-base">出行目的地 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="如：川西稻城亚丁、青甘大环线..."
                  value={requirement.destination}
                  onChange={e => update('destination', e.target.value)}
                />
              </div>
              <div>
                <label className="label-base">计划出团日期</label>
                <input
                  type="date"
                  className="input-base"
                  value={requirement.travelDate}
                  onChange={e => update('travelDate', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="label-base">特殊需求 / 备注</label>
                <textarea
                  className="input-base min-h-[72px] resize-none"
                  placeholder="如：有老人小孩、需要摄影向导、对饮食有特殊要求等..."
                  value={requirement.specialRequests}
                  onChange={e => update('specialRequests', e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">2</span>
              <h2 className="text-base font-bold text-slate-800">出行人数与预算</h2>
            </div>
            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className="label-base">出行人数</label>
                <div className="flex items-center bg-slate-50 rounded-lg p-1">
                  <button
                    className="w-9 h-9 rounded-md bg-white shadow-sm text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition"
                    onClick={() => update('peopleCount', Math.max(1, requirement.peopleCount - 1))}
                  >−</button>
                  <input
                    type="number"
                    className="flex-1 bg-transparent text-center font-bold text-xl text-slate-800 focus:outline-none"
                    value={requirement.peopleCount}
                    onChange={e => update('peopleCount', Math.max(1, Number(e.target.value) || 1))}
                    min={1}
                  />
                  <button
                    className="w-9 h-9 rounded-md bg-white shadow-sm text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition"
                    onClick={() => update('peopleCount', requirement.peopleCount + 1)}
                  >+</button>
                </div>
                <div className="mt-1.5 flex gap-2">
                  {[2, 4, 6, 8].map(n => (
                    <button
                      key={n}
                      onClick={() => update('peopleCount', n)}
                      className={`text-xs px-2.5 py-1 rounded-full transition ${
                        requirement.peopleCount === n
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >{n}人</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-base">预算（每人）</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                  <input
                    type="number"
                    className="input-base pl-8"
                    value={requirement.budgetPerPerson}
                    onChange={e => update('budgetPerPerson', Number(e.target.value) || 0)}
                  />
                </div>
                <div className="mt-1.5 flex gap-2">
                  {[3000, 5000, 8000, 12000].map(n => (
                    <button
                      key={n}
                      onClick={() => update('budgetPerPerson', n)}
                      className={`text-xs px-2.5 py-1 rounded-full transition ${
                        requirement.budgetPerPerson === n
                          ? 'bg-warm-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >¥{n / 1000}k</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-base">总预算</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                  <input
                    type="number"
                    className="input-base pl-8 font-bold text-brand-700 bg-brand-50/60 border-brand-100"
                    value={requirement.totalBudget}
                    onChange={e => {
                      const total = Number(e.target.value) || 0
                      setRequirement({
                        ...requirement,
                        totalBudget: total,
                        budgetPerPerson: Math.round(total / Math.max(1, requirement.peopleCount)),
                      })
                    }}
                  />
                </div>
                <div className="mt-1.5 text-xs text-slate-500">
                  {requirement.peopleCount}人 × ¥{requirement.budgetPerPerson.toLocaleString()}
                </div>
              </div>
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">3</span>
              <h2 className="text-base font-bold text-slate-800">行程偏好设置</h2>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="label-base">假期长度（天）</label>
                <div className="flex items-center bg-slate-50 rounded-lg p-1">
                  <button
                    className="w-9 h-9 rounded-md bg-white shadow-sm text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition"
                    onClick={() => update('days', Math.max(3, requirement.days - 1))}
                  >−</button>
                  <input
                    type="number"
                    className="flex-1 bg-transparent text-center font-bold text-xl text-slate-800 focus:outline-none"
                    value={requirement.days}
                    onChange={e => update('days', Math.max(3, Math.min(20, Number(e.target.value) || 3)))}
                    min={3}
                    max={20}
                  />
                  <button
                    className="w-9 h-9 rounded-md bg-white shadow-sm text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition"
                    onClick={() => update('days', Math.min(20, requirement.days + 1))}
                  >+</button>
                </div>
                <div className="mt-1.5 flex gap-2 flex-wrap">
                  {[5, 7, 10, 15].filter(n => n <= 20).map(n => (
                    <button
                      key={n}
                      onClick={() => update('days', n)}
                      className={`text-xs px-2.5 py-1 rounded-full transition ${
                        requirement.days === n
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >{n}天</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-base">交通方式</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => update('transportType', 'rental')}
                    className={`relative p-3 rounded-xl border-2 transition text-left ${
                      requirement.transportType === 'rental'
                        ? 'border-brand-500 bg-brand-50/60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🚙</div>
                    <div className="text-sm font-semibold text-slate-800">租车自驾</div>
                    <div className="text-[10px] text-slate-500">含租车费+保险</div>
                  </button>
                  <button
                    onClick={() => update('transportType', 'self')}
                    className={`relative p-3 rounded-xl border-2 transition text-left ${
                      requirement.transportType === 'self'
                        ? 'border-brand-500 bg-brand-50/60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🚘</div>
                    <div className="text-sm font-semibold text-slate-800">自带车辆</div>
                    <div className="text-[10px] text-slate-500">仅服务+保障</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="label-base">酒店等级</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: 'economic', name: '经济型', star: '⭐⭐⭐', price: '¥180起' },
                    { id: 'standard', name: '舒适型', star: '⭐⭐⭐⭐', price: '¥380起' },
                    { id: 'premium', name: '豪华型', star: '⭐⭐⭐⭐⭐', price: '¥680起' },
                    { id: 'luxury', name: '奢华型', star: '🌟🌟🌟', price: '¥1280起' },
                  ] as const).map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => update('hotelLevel', opt.id)}
                      className={`p-3 rounded-xl border-2 transition text-left ${
                        requirement.hotelLevel === opt.id
                          ? 'border-warm-500 bg-warm-50/60'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-800">{opt.name}</div>
                        <div className="text-[10px] text-warm-600 font-semibold">{opt.price}</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{opt.star}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-base">景点偏好</label>
                <button
                  onClick={() => update('includeHiddenGems', !requirement.includeHiddenGems)}
                  className={`w-full p-3 rounded-xl border-2 transition text-left ${
                    requirement.includeHiddenGems
                      ? 'border-green-500 bg-green-50/60'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏔️</span>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">含小众秘境</div>
                        <div className="text-[10px] text-slate-500">深度玩家、避开人潮</div>
                      </div>
                    </div>
                    <div className={`relative w-11 h-6 rounded-full transition ${requirement.includeHiddenGems ? 'bg-green-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${requirement.includeHiddenGems ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                </button>
                <div className="mt-2 text-xs text-slate-500 leading-relaxed">
                  开启后路线草案会增加小众景点探索，但可能增加车程和费用
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pb-4">
            <button className="btn-secondary">重置表单</button>
            <button className="btn-primary" disabled={!canNext} onClick={onNext}>
              生成路线方案 →
            </button>
          </div>
        </div>

        <div className="col-span-4 space-y-5">
          <section className="card p-5 bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0 shadow-xl shadow-brand-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">💡</span>
              <h3 className="font-bold">当前方案预览</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <div className="text-[11px] text-brand-100">目的地</div>
                <div className="text-sm font-semibold mt-0.5 truncate">{requirement.destination || '川西'}</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <div className="text-[11px] text-brand-100">总天数</div>
                <div className="text-sm font-semibold mt-0.5">{requirement.days}天{requirement.days - 1}晚</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <div className="text-[11px] text-brand-100">出行人数</div>
                <div className="text-sm font-semibold mt-0.5">{requirement.peopleCount}人</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <div className="text-[11px] text-brand-100">人均预算</div>
                <div className="text-sm font-semibold mt-0.5">¥{requirement.budgetPerPerson.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-brand-100">预算总额</span>
                <span className="text-2xl font-bold text-warm-300">¥{requirement.totalBudget.toLocaleString()}</span>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span>⚡</span>系统将生成三条方案
            </h3>
            <div className="space-y-3">
              {routes.map((r, idx) => (
                <div key={r.id} className="flex gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm"
                    style={{ backgroundColor: r.accentColor }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-slate-800">{r.name}</div>
                      <div className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: r.accentColor, backgroundColor: `${r.accentColor}15` }}>
                        {r.tagline.split(' · ')[0]}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{r.description}</div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      约 {r.totalDriveDistance}km · 人均 ¥{r.basePrice.min.toLocaleString()}起
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5 border-l-4 border-warm-400">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span>🧭</span>顾问小贴士
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <li>• 预算在3k以下建议推荐经典型方案</li>
              <li>• 有老人小孩优先选择舒适型方案</li>
              <li>• 客户明确要小众景点请务必开启秘境选项</li>
              <li>• 10天以上行程建议预留2天机动时间</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
