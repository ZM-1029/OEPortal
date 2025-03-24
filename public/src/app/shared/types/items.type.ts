export interface itemReturnI {
  success: boolean;
  message: string;
  data: Item;
}
export interface productDetailsI {
  success: boolean;
  message: string;
  data: Item[];
  errors: any[];
}
export interface Item {
  id: number;
  name: string;
  sku: string;
  hsnCode: string;
  salesPrice: number;
  costPrice: number;
  description: string;
  unit: string;
  businessLine: string;
  unitId?: string;
  serviceId?: string;
  isService?: boolean;
  isActive?: boolean;
}
export interface ItemsListI {
  success: boolean;
  message: string;
  data: Item[];
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


