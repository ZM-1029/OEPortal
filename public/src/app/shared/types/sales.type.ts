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
    data: Country[];  
    errors: string[];  
  }
  export interface Company {
    id: number;
    name: string;
    countryId: number;
    headquater: string;
    isActive: boolean;
  }
  
  export interface CompanyListI {
    success: boolean;
    message: string;
    data: Company[];
  }

  export interface Branch {
    id: number;
    companyId: number;
    name: string;
    phoneNumber: string;
    state: string;
    city: string;
    address: string;
  }
  
  export interface BranchListI {
    success: boolean;
    message: string;
    data: Branch[];
  }

  export interface Tax {
    id: number;
    country: string;
    tax: string;
    value: number;
  }
  
  export interface TaxListI {
    success: boolean;
    message: string;
    data: Tax[];
    errors: any[];
  }
  
  
  
  