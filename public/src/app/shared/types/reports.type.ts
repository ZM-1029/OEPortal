export interface EmployeesForDropdownI {
  success: boolean
  message: string
  data: employeesDropdownI[]
}

export interface employeesDropdownI {
  id: number
  emailID: string
  employeeID: string
  firstName: string
  lastName: string
  reportingTo: string
}

export interface getEmployeeProfitDetailI {
  success: boolean
  message: string
  data: getEmployeeProfitDetailListI[]
}

export interface getEmployeeProfitDetailListI {
  id: number
  invoiceId: number
  employeeID: string
  salary: number
  billedAmount: number
  currencyId: number
  profitFactor: string
  month: number
  year: number
}

export interface getEfficiencyReportsEmployeeI {
  success: boolean
  message: string
  details: efficiencyReportsEmployeeDetailI[]
  summary:any
}

export interface efficiencyReportsEmployeeDetailI {
  month: number
  year: number
  employeeID: string
  employeeName: string
  salary: number
  billedAmount: number
  profitPercentage: number
  profitratio: number
}

export interface EfficiencyReportsCustomerResponseI {
  success: boolean
  message: string
  details: efficiencyReportsCustomerDetailsI[]
  summary:any
}

export interface efficiencyReportsCustomerDetailsI {
  month: number
  year: number
  employeeID: string
  employeeName: string
  customerId: number
  customerName: string
  salary: number
  billedAmount: number
  profitPercentage: number
}