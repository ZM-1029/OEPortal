import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmployeesForDropdownI } from 'src/app/shared/types/reports.type';
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

  GetTailgatingNCList(empIds: any, startDate: string, endDate: string) {
    return this.http.get<any>(
      `${environment.apiUrl}GetTailgatingNCList?empIds=${empIds}&startDate=${startDate}&endDate=${endDate}`,
    );
  }

  GetActiveEmployeesForDropdown() {
    return this.http.get<EmployeesForDropdownI>(
      `${environment.apiUrl}api/EmployeeDashboard/GetActiveEmployees`,
    );
  }
}
