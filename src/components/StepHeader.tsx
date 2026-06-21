import type { AppStep } from '@/types'

interface Props {
  step: AppStep
  setStep: (s: AppStep) => void
  canGoComparison: boolean
  customerName?: string
  peopleCount?: number
  destination?: string
}

const steps: { id: AppStep; label: string; icon: string; desc: string }[] = [
  { id: 'requirement', label: '需求录入', icon: '📝', desc: '客户信息与出行偏好' },
  { id: 'comparison', label: '方案比较', icon: '🗺️', desc: '三条路线草案 + 报价联动' },
  { id: 'export', label: '成稿导出', icon: '📄', desc: 'PDF 路书 + 品牌定制' },
]

export function StepHeader({ step, setStep, canGoComparison, customerName, peopleCount, destination }: Props) {
  const currentIdx = steps.findIndex(s => s.id === step)
  const displayName = customerName || '新客户'
  const nameInitial = displayName.charAt(0) || '客'

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-3.5 shadow-sm flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xl shadow-lg shadow-brand-500/20">
            🚗
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">路书制作工具</h1>
            <p className="text-[11px] text-slate-500 leading-tight">定制自驾方案 · 快速生成可报价路书</p>
          </div>
        </div>

        <nav className="flex items-center bg-slate-100 rounded-2xl p-1.5 gap-1">
          {steps.map((s, idx) => {
            const isActive = step === s.id
            const isDone = idx < currentIdx
            const disabled =
              (s.id === 'comparison' && !canGoComparison && !isDone) ||
              (s.id === 'export' && idx > currentIdx)

            return (
              <button
                key={s.id}
                disabled={disabled}
                onClick={() => !disabled && setStep(s.id)}
                className={`relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-white text-slate-800 shadow-md'
                    : isDone
                      ? 'text-slate-600 hover:bg-slate-200/70 cursor-pointer'
                      : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : isDone
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-300 text-slate-600'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <div className="text-left leading-tight">
                  <div className="font-semibold">{s.label}</div>
                  <div className={`text-[10px] ${isActive ? 'text-slate-500' : 'opacity-80'}`}>
                    {s.desc}
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`ml-1 w-6 h-px ${
                      idx < currentIdx ? 'bg-green-400' : 'bg-slate-300'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="text-right pr-1">
            <div className="text-[11px] text-slate-500">当前客户</div>
            <div className="text-sm font-semibold text-slate-700 leading-tight">
              {displayName}
              {peopleCount && <span className="text-slate-400 font-normal"> · {peopleCount}人</span>}
            </div>
            {destination && (
              <div className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate max-w-[160px]">
                📍 {destination}
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-400 to-warm-600 flex items-center justify-center text-white font-bold shadow-md text-base">
            {nameInitial}
          </div>
        </div>
      </div>
    </header>
  )
}
