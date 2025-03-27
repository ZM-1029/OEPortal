export interface itemReturnI {
    success: boolean;
    message: string;
    data: Quotation;
  }
  export interface productDetailsI {
    success: boolean;
    message: string;
    data: Quotation[];
    errors: any[];
  }
  export interface Quotation {
    id: number;
    quotationNumber: string;
    salesOrderDate: string;
    total: number;
    customerName: string;
    statusId: number;
    statusName: string;
  }
  
  export interface QuotationListI {
    success: boolean;
    message: string;
    data: Quotation[];
    errors: any[];
  }
  export interface Customer {
    id: number;
    name: string;
  }
  export interface AllCustomersI {
    success: boolean;
    message: string;
    data: Customer[];
    errors: any[];
  }
  export interface QuotationNumberI {
    success: boolean;
    message: string;
    data: string;
    errors: string[];
  }
  export interface PaymentTerm {
    id: number;
    termName: string;
  }
  export interface PaymentTermsI {
    success: boolean;
    message: string;
    data: PaymentTerm[];  
    errors: string[];
  }
  export interface Country {
    id: number;
    name: string;
  }
  
  export interface CountryI {
    success: boolean;
    message: string;
    data: Country[];  // Array of Country objects
    errors: string[];  // Array of error messages (if any)
  }
  
  
  