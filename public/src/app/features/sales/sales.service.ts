import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";
import { environment } from "../../../environments/environment";
import { AllServicesI, AllUnitI, Item, ItemsListI, productDetailsI } from 'src/app/shared/types/items.type';
import { AllCustomersI, BranchListI, CompanyListI, CountryI, PaymentTermsI, ProductListI, QuotationListI, QuotationNumberI, selectedProductI, TaxListI } from 'src/app/shared/types/sales.type';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private productRow = new BehaviorSubject<any>(null);
  productRowData$ = this.productRow.asObservable();

  sendRowData(event: Event) {
    this.productRow.next(event);
  }
  constructor(private http: HttpClient) { }
  getQuotationList() {
    return this.http.get<QuotationListI>(
      `${environment.apiUrl}api/Quotation/GetAllQuotations`,
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
  getTaxByCountry(id: number | string) {
    return this.http.get<TaxListI>(`${environment.apiUrl}api/Product/GetTaxByCountry`, {
      params: { countryId: id.toString() }
    });
  }
  updateProduct(updateProduct: any) {
    return this.http.patch<Item>(
      `${environment.apiUrl}api/Product/EditProduct`,
      updateProduct
    );
  }

  CustomerList() {
    return this.http.get<AllCustomersI>(
      `${environment.apiUrl}api/Customer/GetActiveCustomer`,
    );
  }
  getQuotationNumber() {
    return this.http.get<QuotationNumberI>(
      `${environment.apiUrl}api/Quotation/RandomQuotationNumberGenerator`,
    );
  }
  getPaymentTerms() {
    return this.http.get<PaymentTermsI>(
      `${environment.apiUrl}api/Product/GetPaymentTerms`,
    );
  }
  getCountry() {
    return this.http.get<CountryI>(
      `${environment.apiUrl}api/Product/GetCountry`,
    );
  }
  getCompany() {
    return this.http.get<CompanyListI>(
      `${environment.apiUrl}api/CompanyProfile/GetAll`,
    );
  }
  getBranchDetailByCompanyId(id: number | string) {
    return this.http.get<BranchListI>(`${environment.apiUrl}api/CompanyProfile/GetBranchDetailByCompanyId/${id}`);
  }
  getProduct() {
    return this.http.get<ProductListI>(
      `${environment.apiUrl}api/Product/GetProductList`,
    );
  }
  getProductById(id: number | string) {
    return this.http.get<selectedProductI>(`${environment.apiUrl}api/Product/GetProductById`, {
      params: { productId: id.toString() }
    });
  }
  
}
