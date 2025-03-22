export interface customerReturnI {
  success: boolean;
  message: string;
  data: customerI;
}
export interface customerDetailsI {
  success: boolean;
  message: string;
  customer: customerI;
}
export interface customerListI {
  success: boolean;
  message: string;
  totalCount: number;
  customers: customerI[];
}
export interface customerI {
  id: number | string;
  customerId: string;
  customerName: string;
  businessType: number | string;
  phoneNumber: string | number;
  primaryContact: string | number;
  email: string;
  address: string;
  postalCode: string;
  logo: null;
  logoFile: File | null;
  status: true;
  country: string;
  taxid: string;
  invoices: [];
  pos: [];
  salaries: [];
}
