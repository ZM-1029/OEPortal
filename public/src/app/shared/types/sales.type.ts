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
  export interface Product {
    id: number;
    name: string;
    sku: string;
    hsnCode: string;
    isService: boolean;
    salesPrice: number;
    costPrice: number;
    description: string;
    unit: string;
    businessLine: string;
    isActive: boolean;
  }
  
  export interface ProductListI {
    success: boolean;
    message: string;
    data: Product[];
    errors: any[];
  }

  export interface selectedProduct {
    id: number;
    name: string;
    isService: boolean;
    sku: string;
    hsnCode: string;
    salesPrice: number;
    costPrice: number;
    description: string;
    unit: string;
    unitId: number;
    serviceName: string;
    serviceId: number;
    isActive: boolean;
  }
  
  export interface selectedProductI {
    success: boolean;
    message: string;
    data: selectedProduct[];
    errors: any[];
  }

  export interface itemAmountCalculationI {
    success: boolean;
    message: string;
    data: number;
    errors: any[];
  }
  
  export interface amountTax {
    tax: string;
    value: number;
    amount: number;
  }
  
  export interface finalAmount {
    subTotal: number;
    taxes: amountTax[];
    shippingCharge: number;
    adjustment: number;
    total: number;
  }
  
  export interface finalAmountListI {
    success: boolean;
    message: string;
    data: finalAmount;
    errors: any[];
  }



  export interface quatationItem {
    id: number;
    productId: number;
    quantity: number;
    rate: number;
    discount: number;
    taxId: number;
    subTotal: number;
  }
  
  export interface QuatationI {
    id: number;
    customerId: number;
    countryId: number;
    companyId: number;
    companyBranchId: number;
    quotationNumber: string;
    salesOrderDate: string; // ISO Date Format
    expectedShippingDate: string; // ISO Date Format
    salesPerson: string;
    deliveryMethod: string;
    shippingCharges: number;
    paymentTermId: number;
    adjustment: number;
    subTotal: number;
    total: number;
    items: quatationItem[];
  }
 export interface CountryCurrencyI {
    success: boolean;
    message: string;
    data: string;
    errors: any[];
  }
  


  export interface QuotationEditItem {
    id: number;
    productId: number;
    quantity: number;
    rate: number;
    discount: number;
    taxId: number;
    subTotal: number;
  }
  
  export interface QuotationDetails {
    id: number;
    quotationNumber: string;
    companyId: number;
    companyBranchId: number;
    salesOrderDate: string;
    expectedShippingDate: string;
    total: number;
    subTotal: number;
    customerId: number;
    countryId:number;
    customerName: string;
    statusId: number;
    statusName: string;
    salesPerson: string;
    deliveryMethod: string;
    shippingCharges: number;
    paymentTermId: number;
    adjustment: number;
    items: QuotationEditItem[];
  }
  
  export interface QuotationResponse {
    success: boolean;
    message: string;
    data: QuotationDetails;
    errors: any[];
  }

  export  interface AddressResponse {
    success: boolean;
    message: string;
    data: AddressData;
    errors: any[];
}

export interface AddressData {
    billingAddress: string;
    shippingAddress: string;
}

  
  
  
  
  
  
  