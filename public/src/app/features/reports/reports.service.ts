import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmployeesForDropdownI, getEmployeeProfitDetailI } from 'src/app/shared/types/reports.type';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(private http: HttpClient) { }
  
  GetEmployeesForDropdown() {
      return this.http.get<EmployeesForDropdownI>(
        `${environment.apiUrl}api/EmployeeDashboard/GetEmployeesForDropdown`,
      );
    }
  
  getEmployeeProfitDetail() {
      return this.http.get<getEmployeeProfitDetailI>(
        `${environment.apiUrl}api/EmployeeDashboard/GetEmployeeProfitDetails`,
      );
    }
  
  
}
