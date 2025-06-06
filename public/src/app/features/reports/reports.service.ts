import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmployeesForDropdownI, getEmployeeProfitDetailI, getEfficiencyReportsEmployeeI, EfficiencyReportsCustomerResponseI, projectTimesheetResponseI } from 'src/app/shared/types/reports.type';
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

  getEfficiencyReportsEmployee(employeeId: any, month: any, year: any) {
    return this.http.get<getEfficiencyReportsEmployeeI>(
      `${environment.apiUrl}api/EmployeeDashboard/GetEmployeeProfitDetailsfromSalary?employeeIds=${employeeId}&months=${month}&year=${year}`,
    );
  }

  getEfficiencyReportsCustomer(customerId: any, month: any, year: any) {
    return this.http.get<EfficiencyReportsCustomerResponseI>(
      `${environment.apiUrl}api/EmployeeDashboard/GetEmployeeProfitDetailsByCustomer?customerIds=${customerId}&months=${month}&year=${year}`,
    );
  }
  
  getTimesheetByDurationAndProject(startDate: any, endDate: any, projects: any) {
    return this.http.get<projectTimesheetResponseI>(
      `${environment.apiUrl}api/EmployeeDashboard/GetTimesheetByDurationAndProject?startDate=${startDate}&endDate=${endDate}&project=${projects}`,
    );
  }

  getAllCustomer() {
    return this.http.get(
      `${environment.apiUrl}api/Customer/GetCustomerForPo`,
    );
  }

  getAllProjects() {
    return this.http.get(
      `${environment.apiUrl}api/EmployeeDashboard/distinct-projects`,
    );
  }


}
