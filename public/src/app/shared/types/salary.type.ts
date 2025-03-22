export interface salaryListI {
  success: boolean;
  message: string;
  data: salaryI[];
}

export interface salaryI {
  id: number;
  employeeid: string;
  employeeName: string;
  customerId: number;
  customerName: string;
  dateOfPayment: string;
  amount: number;
  isActive: boolean;
  currencyId: number;
  currencyName: string;
  currencyCode: string;
  month: number;
  year: number;
}

export interface salaryOfEmployeeI {
  employeeID: string;
  customerName: string;
  month: string;
  year: string;
  amount: number;
  currencyCode: string;
  dateOfPayment: string;
  isEmpApproved: boolean;
  isCustomerApproved: boolean;
  isCurrencyApproved: boolean;
  isMonthEmpty: boolean;
  isSalaryEmpty: boolean;
  isYearEmpty: boolean;
}

export interface AllcurrencyI {
  success: boolean;
  message: string;
  data: currency[];
}

export interface currency {
  currencyName: string;
  currencyCode: string;
  currencyId: number;
  symbol: string;
}

export interface createSalaryI {
  id: number;
  employeeID: string;
  customerId: number;
  dateOfPayment: string;
  currencyId: number;
  amount: number;
}
