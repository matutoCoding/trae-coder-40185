export interface CustomerRequirement {
  peopleCount: number
  budgetPerPerson: number
  totalBudget: number
  days: number
  transportType: 'rental' | 'self'
  hotelLevel: 'economic' | 'standard' | 'premium' | 'luxury'
  includeHiddenGems: boolean
  destination: string
  travelDate: string
  customerName: string
  phone: string
  specialRequests: string
}

export interface DailyPlan {
  day: number
  title: string
  driveDistance: number
  driveDuration: string
  stayCity: string
  hotelName: string
  highlights: string[]
  meals: string[]
  overBudgetRisk?: string
}

export interface RoutePlan {
  id: string
  name: string
  type: 'comfort' | 'classic' | 'deep'
  description: string
  tagline: string
  accentColor: string
  dailyPlans: DailyPlan[]
  totalDriveDistance: number
  basePrice: {
    min: number
    max: number
  }
  highlights: string[]
  potentialOverBudget: string[]
  included: string[]
  notIncluded: string[]
}

export interface HotelOption {
  id: string
  level: 'economic' | 'standard' | 'premium' | 'luxury'
  name: string
  pricePerNight: number
  rating: number
  features: string[]
}

export interface TicketPackage {
  id: string
  name: string
  description: string
  pricePerPerson: number
  includes: string[]
}

export interface ExtraService {
  id: string
  name: string
  description: string
  price: number
  unit: 'per_day' | 'total' | 'per_person'
  icon: string
}

export interface QuoteConfig {
  selectedHotelLevel: 'economic' | 'standard' | 'premium' | 'luxury'
  selectedTickets: string[]
  includeLeader: boolean
  includeRescue: boolean
  includeInsurance: boolean
  includeMeals: boolean
  profitMargin: number
}

export interface ServiceBreakdown {
  leaderCost: number
  rescueCost: number
  insuranceCost: number
  mealsCost: number
}

export interface QuoteResult {
  subtotal: number
  hotelCost: number
  ticketCost: number
  serviceCost: number
  serviceBreakdown: ServiceBreakdown
  otherCost: number
  profit: number
  totalMin: number
  totalMax: number
  profitMargin: number
  warnings: string[]
}

export interface QuoteVersion {
  id: string
  name: string
  config: QuoteConfig
  note: string
  createdAt: number
}

export interface BrandConfig {
  agencyName: string
  agencyLogo: string
  slogan: string
  consultantName: string
  consultantTitle: string
  consultantPhone: string
  consultantWechat: string
  agencyAddress: string
  agencyWebsite: string
}

export type AppStep = 'requirement' | 'comparison' | 'export'
