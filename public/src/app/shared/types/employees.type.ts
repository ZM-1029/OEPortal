export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any[];
}

export interface employeeListI {
  success:boolean
  message:string
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  employees: employeeType[];
}

export interface employeeType {
  id: number;
  emailID: string;
  aadhaarBackSide: null | string;
  dateOfBirth: Date | string;
  uanNumber: string;
  photo: string;
  gender: string;
  maritalStatus: string;
  cancelledChequeDownloadUrl: string;
  probationStatus: string;
  approvalStatus: string;
  department: string;
  aadharFrontSideDownloadUrl: string;
  mobileCountryCode: null;
  reportingTo: string;
  photoDownloadUrl: string;
  totalExperienceDisplayValue: null;
  bloodgroup: string;
  employeestatus: string;
  aadharFrontSide: string;
  role: string;
  experience: string | number;
  employeeType: string;
  ifscCode: string;
  uploadCopyOfUANPassbookAnyOneMonthStatementDownloadUrl: string;
  panNumber: string;
  lastName: string;
  employeeID: string;
  zuid: string | number;
  aadhaarNumber: string;
  pleaseSelectIfYouDoNotHaveAUAN: string | boolean;
  dateofexit: string | number | Date;
  permanentAddress: string;
  aadhaarBackSideDownloadUrl: string;
  otherEmail: string;
  locationName: string;
  workLocation: string;
  presentAddress: string;
  nickName: string;
  totalExperience: string | number;
  modifiedTime: number;
  reportingToMailID: null;
  zohoID: string | number;
  sourceOfHire: string;
  accountNumber: number | string;
  age: string | number;
  designation: string;
  ageDisplayValue: null;
  uploadCopyOfUANPassbookAnyOneMonthStatement: string;
  firstName: string;
  dateofjoining: Date | string;
  panCardDownloadUrl: string;
  mobile: string;
  bankName: string;
  panCard: string;
  cancelledCheque: string;
  workPhone: string;
  syncBy: string;
  employeeInvoices: [];
  salaries: [];
  delivery_centre: string;
  billable_Type: string;
}

export interface attendanceTypeI {
  id: number;
  empId: string;
  shiftDate: string | Date;
  shiftStartTime: string;
  status: string;
  firstIn_Building: string;
  paidBreakHours: string;
  lastOut_Location: string;
  shiftName: string;
  unPaidBreakHours: string;
  firstIn: string;
  firstIn_Location: string;
  totalHours: string;
  workingHours: string;
  lastOut_Building: string;
  lastOut: string;
  shiftEndTime: string;
}

export interface employeeSalariesI {
  success: boolean;
  message: string;
  data: employeeSalaryI[];
}

export interface employeeSalaryI {
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

export interface employeeTimesheetsI {
  success: boolean;
  message: string;
  data: employeeTimesheetI[];
}

export interface employeeTimesheetI {
  id: number;
  erecono: string;
  timerLog: boolean;
  employeeMailId: string;
  jobColor: string;
  description: string;
  employeeFirstName: string;
  isDeleteAllowed: boolean;
  type: string;
  workDate: string;
  billedStatus: string;
  jobIsActive: boolean;
  jobName: string;
  approvalStatus: string;
  hours: string;
  dbWorkDate: string;
  jobIsCompleted: number;
  hoursInMins: number;
  isEditAllowed: boolean;
  billingStatus: string;
  jobId: string;
  addIp: string;
  isTimelogPushedToQBO: boolean;
  totalTime: number;
  employeeLastName: string;
  geoLocation: string;
  timelogId: string;
  ttInputType: number;
  projectName: string;
  projectId: string;
  isPushAllowToZF: boolean;
}

export interface employeeInvoiceResponseI {
  success: boolean
  message: string
  data: employeeInvoiceI[]
}

export interface employeeInvoiceI {
  id: number
  invoiceId: number
  employeeID: string
  salary: number
  billedAmount: number
  currencyId: number
  
}

export type employeeDetailsI = BaseResponse<employeeType>;
export type attendanceListI = BaseResponse<attendanceTypeI[]>;
