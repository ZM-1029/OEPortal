import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TailgateReportsService {

  constructor(private http: HttpClient) { }
  CreateTailgatingNc(data: any) {
    return this.http.post(
      `${environment.apiUrl}TailgatingNc`, data
    );
  }

  GetTailgatingNCList() {
    return this.http.get<any>(
      `${environment.apiUrl}GetTailgatingNCList`,
    );
  }
}
