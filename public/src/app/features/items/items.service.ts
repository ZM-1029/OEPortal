import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  customerDetailsI,
  customerListI,
  customerI,
} from "../../shared/types/customer.type";
import { AllServicesI, AllUnitI, ItemsListI } from 'src/app/shared/types/items.type';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private customerRow = new BehaviorSubject<any>(null);
  customerRowData$ = this.customerRow.asObservable();

  sendRowData(event: Event) {
    this.customerRow.next(event);
  }

  constructor(private http: HttpClient) {}

  getProductList() {
    return this.http.get<ItemsListI>(
      `${environment.apiUrl}api/Product/GetProductList`,
    );
  }

  addProduct(customer: any) {
    return this.http.post<customerI>(
      `${environment.apiUrl}api/Product/AddProduct`,
      customer,
    );
  }

  getCustomerByCustomerId(id: number | string) {
    return this.http.get<customerDetailsI>(
      `${environment.apiUrl}api/Customer/GetCustomerById/${id}`,
    );
  }

  updateCustomer(id: number | string, updateCustomer: any) {
    return this.http.post<customerI>(
      `${environment.apiUrl}api/Customer/EditCustomer/${id}`,
      updateCustomer,
    );
  }

  deleteCustomerById(id: number) {
    return this.http.delete<customerDetailsI>(
      `${environment.apiUrl}api/Customer/DeleteCustomer/${id}`,
    );
  }

  UnitList() {
      return this.http.get<AllUnitI>(
        `${environment.apiUrl}api/Product/UnitList`,
      );
    }
    getServices() {
      return this.http.get<AllServicesI>(
        `${environment.apiUrl}api/Product/GetServices`,
      );
    }
}
