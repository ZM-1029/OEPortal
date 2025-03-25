import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  customerI,
} from "../../shared/types/customer.type";
import { AllServicesI, AllUnitI, Item, ItemsListI, productDetailsI } from 'src/app/shared/types/items.type';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private productRow = new BehaviorSubject<any>(null);
  productRowData$ = this.productRow.asObservable();

  sendRowData(event: Event) {
    this.productRow.next(event);
  }
  constructor(private http: HttpClient) { }
  getProductList() {
    return this.http.get<ItemsListI>(
      `${environment.apiUrl}api/Product/GetProductList`,
    );
  }

  addProduct(customer: any) {
    return this.http.post<Item>(
      `${environment.apiUrl}api/Product/AddProduct`,
      customer,
    );
  }
  getProductByProductId(id: number | string) {
    return this.http.get<productDetailsI>(`${environment.apiUrl}api/Product/GetProductById`, {
      params: { productId: id.toString() }
    });
  }
  updateProduct(updateProduct: any) {
    return this.http.patch<Item>(
      `${environment.apiUrl}api/Product/EditProduct`,
      updateProduct
    );
  }
  // deleteCustomerById(id: number) {
  //   return this.http.delete<customerDetailsI>(
  //     `${environment.apiUrl}api/Customer/DeleteCustomer/${id}`,
  //   );
  // }

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
