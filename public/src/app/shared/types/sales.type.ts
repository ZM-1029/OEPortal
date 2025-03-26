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
  export interface Unit {
    id: number;
    name: string;
  }
  export interface AllUnitI {
    success: boolean;
    message: string;
    data: Unit[];
    errors: any[];
  }
  export interface Service {
    id: number;
    name: string;
    description: string;
  }
  export interface AllServicesI {
    success: boolean;
    message: string;
    data: Service[];
    errors: any[];
  }
  
  
  