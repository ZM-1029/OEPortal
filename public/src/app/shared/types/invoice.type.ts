
export interface invoiceListResponseI {
  success: boolean
  data: invoiceListI[]
}

export interface invoiceListI {
  invoiceId: number
  invoiceNumber: string
  month: number
  year: number
  customerId: number
  customerName: string
  isActive: boolean
  employeeInvoices: invoiceCreateTableI[]
}

export interface invoiceCreateI {
    invoiceNumber: string
    year: number
    month: number
    customerId: number
    employeeInvoices: EmployeeInvoice[]
  }
  
  export interface EmployeeInvoice {
    employeeId: string
    salary: number
    billedAmount: number
    currencyId: number
  }
  
  export interface invoiceTableResponseI  {
    success: boolean
    message: string
    invoiceId:number
    data: invoiceCreateTableI[]
  }
  
  export interface invoiceCreateTableI {
    employeeName: string
    employeeID: string
    salaryAmount: number
    currencyId: number
    currencyCode: string
    billedAmount: number,
 
  }
  
  export interface posResponseI {
    success: boolean
    message: string
    data: allpo[]
  }
  
  export interface allpo {
    id: number
    poid: string
    customerId: number
    customerName: string
    poDate: string
    amount: number
    isActive: boolean
    currencyId: number
    currencyName: string
    currencyCode: string
  }
  
  export interface PoSummaryResponseI {
    success: boolean
    data: PoSummaryI
  }
  
  export interface PoSummaryI {
    poDate: string
    amount: number
    remainingAmount: number
    transactions: any[]
  }
  

  export interface invoiceEditI {
    success: boolean
    data: invoiceEditDataI
  }
  
  export interface invoiceEditDataI {
    id: number
    invoiceNumber: string
    invoiceDate: string
    customerId: number
    customerName: string
    isActive: boolean
    employeeInvoices: EmployeeInvoice[]
    poTransactionHistory: any[]
  }
  
  export interface EmployeeInvoice {
    id: number
    employeeID: string
    currencyId: number
    currencyCode: string
  }
  