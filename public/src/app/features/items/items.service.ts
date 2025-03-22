import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  customerDetailsI,
  customerListI,
  customerI,
} from "../../shared/types/customer.type";

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

  getCustomerList() {
    return this.http.get<customerListI>(
      `${environment.apiUrl}api/Customer/GetCustomers`,
    );
  }

  createCustomer(customer: any) {
    return this.http.post<customerI>(
      `${environment.apiUrl}api/Customer/AddCustomer`,
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
}
