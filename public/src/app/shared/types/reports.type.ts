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