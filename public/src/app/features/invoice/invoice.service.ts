import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { invoiceCreateI, invoiceEditI, invoiceListResponseI, invoiceTableResponseI, posResponseI, PoSummaryResponseI } from 'src/app/shared/types/invoice.type';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  constructor(private http: HttpClient) { }

  getInvoiceList() {
    return this.http.get<invoiceListResponseI>(
      `${environment.apiUrl}api/Invoice/GetAllInvoices`,
    );
  }


  getSalaryByCustomerId(customerId: number | string, month: number | string, year: number | string) {
    return this.http.get<invoiceTableResponseI>(
      `${environment.apiUrl}api/Salary/GetSalaryByCustomer?customerId=${customerId}&month=${month}&year=${year}`,
    );
  }


  getPosByCustomerid(customerId: number | string) {
    return this.http.get<posResponseI>(
      `${environment.apiUrl}api/PO/GetPosByCustomerId/${customerId}`,
    );
  }

  getPOSummaryByPoId(PoId: string) {
    return this.http.get<PoSummaryResponseI>(
      `${environment.apiUrl}api/PO/GetPOSummary/${PoId}`,
    );
  }

  getInvoiceById(id: number) {
    return this.http.get<invoiceEditI>(
      `${environment.apiUrl}api/Invoice/GetInvoiceById/${id}`,
    );
  }


  createInvoice(data: invoiceCreateI) {
    return this.http.post<invoiceTableResponseI>(
      `${environment.apiUrl}api/Invoice/CreateInvoice`,
      data,
    );
  }

  createPurchaseOrderTransaction(data: any) {
    return this.http.post<any>(
      `${environment.apiUrl}api/PO/CreatePOTransaction`,
      data,
    );
  }

  updateInvoiceById(id: number, editedData: any) {
      return this.http.put<any>(
        `${environment.apiUrl}api/Invoice/EditInvoice/${id}`,editedData);
    }
    // api/Invoice/DeleteInvoice/82

     deleteInvoiceById(id: number) {
        return this.http.delete(
          `${environment.apiUrl}api/Invoice/DeleteInvoice/${id}`,
        );
      }
}
