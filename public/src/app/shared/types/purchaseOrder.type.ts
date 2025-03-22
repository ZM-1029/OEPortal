export interface purchaseOrdersResponseI {
  success: boolean;
  message: string;
  data: purchaseOrderI[];
}

export interface purchaseOrderI {
  id: number;
  poid: string;
  customerId: number;
  customerName: string;
  poDate: string;
  amount: number;
  description: string;
  isActive: boolean;
  currencyId: number;
  currencyName: string;
  currencyCode: string;
}

export interface returnPOI {
  success: boolean;
  message: string;
  data: createPOI;
}

export interface createPOI {
  poid: string;
  customerId: number;
  poDate: string;
  amount: number;
  description: string;
  currencyId: number;
}


export interface PurchaseOrderSummeryI {
  success: boolean
  data: PurchaseOrderSummeryData
}

export interface PurchaseOrderSummeryData {
  poDate: string
  amount: number
  remainingAmount: number
  transactions: any[]
}
