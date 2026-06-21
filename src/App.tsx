import { useState, useMemo } from 'react'
import type { AppStep, CustomerRequirement, QuoteConfig, RoutePlan, BrandConfig, QuoteResult } from '@/types'
import { generateRoutePlans } from '@/data/routes'
import { calculateQuote } from '@/utils/quote'
import { StepHeader } from '@/components/StepHeader'
import { RequirementPanel } from '@/components/RequirementPanel'
import { ComparisonPanel } from '@/components/ComparisonPanel'
import { ExportPanel } from '@/components/ExportPanel'

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
  const [requirement, setRequirement] = useState<CustomerRequirement>(defaultRequirement)
  const [quoteConfig, setQuoteConfig] = useState<QuoteConfig>(defaultQuoteConfig)
  const [selectedRouteId, setSelectedRouteId] = useState<string>('classic')
  const [brand, setBrand] = useState<BrandConfig>(defaultBrand)

  const routes = useMemo(
    () => generateRoutePlans(requirement.days, requirement.destination, requirement.includeHiddenGems),
    [requirement.days, requirement.destination, requirement.includeHiddenGems],
  )

  const selectedRoute = useMemo(
    () => routes.find(r => r.id === selectedRouteId) || routes[0],
    [routes, selectedRouteId],
  )

  const quote = useMemo<QuoteResult>(() => {
    const mergedConfig = { ...quoteConfig, selectedHotelLevel: quoteConfig.selectedHotelLevel || requirement.hotelLevel }
    return calculateQuote(requirement, selectedRoute, mergedConfig)
  }, [requirement, selectedRoute, quoteConfig])

  const canGoComparison = requirement.days >= 3 && requirement.peopleCount >= 1

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <StepHeader step={step} setStep={setStep} canGoComparison={canGoComparison} />
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
            setSelectedRouteId={setSelectedRouteId}
            requirement={requirement}
            quoteConfig={quoteConfig}
            setQuoteConfig={setQuoteConfig}
            quote={quote}
            onNext={() => setStep('export')}
            onBack={() => setStep('requirement')}
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
          />
        )}
      </main>
    </div>
  )
}
