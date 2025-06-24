import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  AuditlogResponseI,
  createPOI,
  purchaseOrdersResponseI,
  returnPOI,
} from "src/app/shared/types/purchaseOrder.type";
import { createSalaryI } from "src/app/shared/types/salary.type";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class PurchaseOrdersService {
  constructor(private http: HttpClient) {}

  getPurchaseOrderList() {
    return this.http.get<purchaseOrdersResponseI>(
      `${environment.apiUrl}api/PO/GetAllPo`,
    );
  }

  // PO(Purchase Order)
  createPO(order: any) {
    return this.http.post<returnPOI>(
      `${environment.apiUrl}api/PO/AddPo`,
      order,
    );
  }

  getPOByCustomerId(id: number) {
    return this.http.get<purchaseOrdersResponseI>(
      `${environment.apiUrl}api/PO/GetPosByCustomerId/${id}`,
    );
  }
  
  getPurchaseOrderById(id: number) {
    return this.http.get<purchaseOrdersResponseI>(
      `${environment.apiUrl}api/PO/GetPoById/${id}`,
    );
  }

  updatePOById(id: number, POData: any) {
    return this.http.put<any>(
      `${environment.apiUrl}api/PO/UpdatePo/${id}`,
      POData,
    );
  }

  deletePOById(id: number) {
    return this.http.delete(`${environment.apiUrl}api/PO/DeletePo/${id}`);
  }

  // auditEntityTypeId this id is static for this(4	PurchaseOrder	Purchase order record)
  getAuditLogs(auditEntityTypeId: number,tableId:number) {
    return this.http.get<any>(
      `${environment.apiUrl}api/Salary/auditlog?auditEntityTypeId=${auditEntityTypeId}&entityId=${tableId}`,
    );
  }
}
