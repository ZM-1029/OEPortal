export interface nonComplianceHistoryI {
  success: boolean;
  message: string;
  data: nonComplianceI[];
  ncTypeCounts:ncTypeCountsI
}

export interface nonComplianceI {
  id: number;
  empId: string;
  shiftDate: string;
  shiftDateFormatted: string;
  photo: string;
  firstIn: string;
  lastOut: string;
  totalHours: string;
  shiftStartTime: string;
  shiftEndTime: string;
  ncTypeName: string;
  status: string;
  ncTypeId: number;
  actualFirstCheckin: string;
  actualFirstCheckout: string;
  actualTotalHours: string;
  actualStatus: string;
  regularisationStatus: string;
  emailID: string;
  mobile: string;
  employeeName: string;
}

export interface ncTypeCountsI {
  1: number|string,
  2: number|string,
  3: number|string,
  4: number|string,
  5: number|string,
  1004: number|string,
  1005: number|string,
  1006: number|string
}

