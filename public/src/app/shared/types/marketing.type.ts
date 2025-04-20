export interface MarketingResponse {
  success: boolean
  message: string
  data: MarketingList[]
}

export interface MarketingList {
  id: number
  heading: string
  description: string
  logoUrl: string
  pdf: string
}