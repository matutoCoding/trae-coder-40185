import { useState, useMemo, useCallback, useEffect } from 'react'
import type { AppStep, CustomerRequirement, QuoteConfig, RoutePlan, BrandConfig, QuoteResult, DailyPlan, QuoteVersion } from '@/types'
import { generateRoutePlans } from '@/data/routes'
import { calculateQuote } from '@/utils/quote'
import { StepHeader } from '@/components/StepHeader'
import { RequirementPanel } from '@/components/RequirementPanel'
import { ComparisonPanel } from '@/components/ComparisonPanel'
import { ExportPanel } from '@/components/ExportPanel'

const STORAGE_KEYS = {
  quoteConfig: 'lushu_quote_config',
  brandConfig: 'lushu_brand_config',
  requirement: 'lushu_requirement',
  editedRoutes: 'lushu_edited_routes',
  quoteVersions: 'lushu_quote_versions',
  quoteNote: 'lushu_quote_note',
}

const defaultRequirement: CustomerRequirement = {
  peopleCount: 4,
  budgetPerPerson: 5000,
  totalBudget: 20000,
  days: 7,
  transportType: 'rental',
  hotelLevel: 'standard',
  includeHiddenGems: false,
  destination: '川西稻城亚丁',
  travelDate: '',
  customerName: '',
  phone: '',
  specialRequests: '',
}

const defaultQuoteConfig: QuoteConfig = {
  selectedHotelLevel: 'standard',
  selectedTickets: ['t_standard'],
  includeLeader: true,
  includeRescue: true,
  includeInsurance: true,
  includeMeals: false,
  profitMargin: 15,
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved) as T
    }
  } catch {
    // ignore
  }
  return defaultValue
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

const defaultBrand: BrandConfig = {
  agencyName: '星空国际旅行社',
  agencyLogo: '',
  slogan: '发现世界的另一种可能',
  consultantName: '李文杰',
  consultantTitle: '高级定制游顾问',
  consultantPhone: '138-8888-6666',
  consultantWechat: 'lushu_liwenjie',
  agencyAddress: '成都市锦江区东大街99号',
  agencyWebsite: 'www.star-travel.com',
}

export default function App() {
  const [step, setStep] = useState<AppStep>('requirement')
  const [requirement, setRequirement] = useState<CustomerRequirement>(() => loadFromStorage(STORAGE_KEYS.requirement, defaultRequirement))
  const [quoteConfig, setQuoteConfig] = useState<QuoteConfig>(() => loadFromStorage(STORAGE_KEYS.quoteConfig, defaultQuoteConfig))
  const [selectedRouteId, setSelectedRouteId] = useState<string>('classic')
  const [brand, setBrand] = useState<BrandConfig>(() => loadFromStorage(STORAGE_KEYS.brandConfig, defaultBrand))
  const [editedRoutes, setEditedRoutes] = useState<Record<string, RoutePlan>>(() => loadFromStorage(STORAGE_KEYS.editedRoutes, {}))
  const [quoteVersions, setQuoteVersions] = useState<QuoteVersion[]>(() => loadFromStorage<QuoteVersion[]>(STORAGE_KEYS.quoteVersions, []))
  const [quoteNote, setQuoteNote] = useState<string>(() => loadFromStorage<string>(STORAGE_KEYS.quoteNote, ''))

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.requirement, requirement)
  }, [requirement])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.quoteConfig, quoteConfig)
  }, [quoteConfig])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.brandConfig, brand)
  }, [brand])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.editedRoutes, editedRoutes)
  }, [editedRoutes])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.quoteVersions, quoteVersions)
  }, [quoteVersions])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.quoteNote, quoteNote)
  }, [quoteNote])

  const baseRoutes = useMemo(
    () => generateRoutePlans(requirement.days, requirement.destination, requirement.includeHiddenGems),
    [requirement.days, requirement.destination, requirement.includeHiddenGems],
  )

  const routes = useMemo<RoutePlan[]>(() => {
    return baseRoutes.map(route => {
      const edited = editedRoutes[route.id]
      if (edited && edited.dailyPlans.length === route.dailyPlans.length) {
        return edited
      }
      return route
    })
  }, [baseRoutes, editedRoutes])

  const selectedRoute = useMemo(
    () => routes.find(r => r.id === selectedRouteId) || routes[0],
    [routes, selectedRouteId],
  )

  const quote = useMemo<QuoteResult>(() => {
    const mergedConfig = { ...quoteConfig, selectedHotelLevel: quoteConfig.selectedHotelLevel || requirement.hotelLevel }
    return calculateQuote(requirement, selectedRoute, mergedConfig)
  }, [requirement, selectedRoute, quoteConfig])

  const canGoComparison = requirement.days >= 3 && requirement.peopleCount >= 1

  const updateDailyPlan = useCallback((routeId: string, dayIndex: number, updates: Partial<DailyPlan>) => {
    setEditedRoutes(prev => {
      const route = routes.find(r => r.id === routeId)
      if (!route) return prev
      const current = prev[routeId] || route
      const newPlans = [...current.dailyPlans]
      newPlans[dayIndex] = { ...newPlans[dayIndex], ...updates }
      const totalDist = newPlans.reduce((s, d) => s + d.driveDistance, 0)
      const updated = { ...current, dailyPlans: newPlans, totalDriveDistance: Math.round(totalDist) }
      return { ...prev, [routeId]: updated }
    })
  }, [routes])

  const resetRouteEdits = useCallback((routeId: string) => {
    setEditedRoutes(prev => {
      const next = { ...prev }
      delete next[routeId]
      return next
    })
  }, [])

  const handleRouteChange = useCallback((id: string) => {
    setSelectedRouteId(id)
  }, [])

  const saveQuoteVersion = useCallback((name: string) => {
    const newVersion: QuoteVersion = {
      id: 'qv_' + Date.now(),
      name,
      config: { ...quoteConfig },
      note: quoteNote,
      createdAt: Date.now(),
    }
    setQuoteVersions(prev => [...prev, newVersion])
  }, [quoteConfig, quoteNote])

  const applyQuoteVersion = useCallback((versionId: string) => {
    const version = quoteVersions.find(v => v.id === versionId)
    if (version) {
      setQuoteConfig(version.config)
      setQuoteNote(version.note)
    }
  }, [quoteVersions])

  const deleteQuoteVersion = useCallback((versionId: string) => {
    setQuoteVersions(prev => prev.filter(v => v.id !== versionId))
  }, [])

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <StepHeader
        step={step}
        setStep={setStep}
        canGoComparison={canGoComparison}
        customerName={requirement.customerName}
        peopleCount={requirement.peopleCount}
        destination={requirement.destination}
      />
      <main className="flex-1 overflow-hidden">
        {step === 'requirement' && (
          <RequirementPanel
            requirement={requirement}
            setRequirement={setRequirement}
            routes={routes}
            onNext={() => setStep('comparison')}
            canNext={canGoComparison}
          />
        )}
        {step === 'comparison' && (
          <ComparisonPanel
            routes={routes}
            selectedRouteId={selectedRouteId}
            setSelectedRouteId={handleRouteChange}
            requirement={requirement}
            quoteConfig={quoteConfig}
            setQuoteConfig={setQuoteConfig}
            quote={quote}
            onNext={() => setStep('export')}
            onBack={() => setStep('requirement')}
            onUpdateDailyPlan={updateDailyPlan}
            onResetRoute={resetRouteEdits}
            isRouteEdited={!!editedRoutes[selectedRouteId]}
            quoteVersions={quoteVersions}
            quoteNote={quoteNote}
            setQuoteNote={setQuoteNote}
            onSaveQuoteVersion={saveQuoteVersion}
            onApplyQuoteVersion={applyQuoteVersion}
            onDeleteQuoteVersion={deleteQuoteVersion}
          />
        )}
        {step === 'export' && (
          <ExportPanel
            requirement={requirement}
            route={selectedRoute}
            quoteConfig={quoteConfig}
            quote={quote}
            brand={brand}
            setBrand={setBrand}
            onBack={() => setStep('comparison')}
            quoteNote={quoteNote}
          />
        )}
      </main>
    </div>
  )
}
