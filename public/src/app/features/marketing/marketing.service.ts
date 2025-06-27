import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MarketingPermitionResponseI, MarketingResponse } from 'src/app/shared/types/marketing.type';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarketingService {

  constructor(private http: HttpClient) { }

  createMarketing(formdata: FormData) {
    return this.http.post<any>(
      `${environment.apiUrl}api/Marketing/Add`, formdata,
    );
  }

  updateMarketingById(id: number, formdata: FormData) {
    return this.http.put<any>(
      `${environment.apiUrl}api/Marketing/Update/${id}`, formdata,
    );
  }

  deleteMarketingById(id: number) {
    return this.http.delete<any>(
      `${environment.apiUrl}api/Marketing/Delete/${id}`,
    );
  }

  getMarketingList() {
    return this.http.get<MarketingResponse>(
      `${environment.apiUrl}api/Marketing/GetAll`,
    );
  }

  getMarketingById(id: number) {
    return this.http.get<MarketingResponse>(
      `${environment.apiUrl}api/Marketing/GetById/${id}`,
    );
  }

  getMarketingPermissionById(roleId: number) {
    return this.http.get<MarketingPermitionResponseI>(
      `${environment.apiUrl}api/Marketing/GetPermissionsByRoleId/GetPermissionsByRoleId/${roleId}`,
    );
  }

  //  downloadPdf(id:number) {
  //    return this.http.get<any>(
  //      `${environment.apiUrl}api/Marketing/DownloadPdf/download-pdf/${id}`,
  //    );
  //  }

  // downloadPdf(id: number): Observable<Blob> {
  //   return this.http.get(`${environment.apiUrl}api/Marketing/DownloadPdf/download-pdf/${id}`, {
  //     responseType: 'blob',
  //     headers: {
  //       'Accept': 'application/pdf'
  //     }
  //   });
  // }

  // In your service
  downloadPdf(id: number) {
    return this.http.get(`${environment.apiUrl}api/Marketing/DownloadPdf/download-pdf/${id}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });
  }

}
