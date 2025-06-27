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

export interface marketingListCheckBoxValueResponse {
  success: boolean
  message: string
  data: marketingListCheckBoxValueI[]
  errors: any[]
}

export interface marketingListCheckBoxValueI {
  id: number
  roleId: number
  marketingId: number
  isView: boolean
  isDownload: boolean
}


export type MarketingPermitionResponseI = MarketingPermitionI[]

export interface MarketingPermitionI {
  id: number
  roleId: number
  marketingId: number
  isView: boolean
  isDownload: boolean
}