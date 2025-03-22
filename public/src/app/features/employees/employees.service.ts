import { Injectable } from "@angular/core";
import {
  employeeListI,
  employeeType,
  employeeDetailsI,
  attendanceListI,
  employeeSalariesI,
  employeeTimesheetI,
  employeeTimesheetsI,
} from "../../shared/types/employees.type";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Subject } from "rxjs";
import { environment } from "../../../environments/environment";
import { nonComplianceHistoryI } from "src/app/shared/types/nonCompliance.type";

@Injectable({
  providedIn: "root",
})
export class EmployeesService {
  private rowDataSubject = new BehaviorSubject<any>(null);
  rowData$ = this.rowDataSubject;

  sendRowData(employeeDetails: employeeType) {
    this.rowDataSubject.next(employeeDetails);
  }
  constructor(private http: HttpClient) {}

  getEmployeesList(pageNumber: number, pageSize: number) {
    return this.http.get<employeeListI>(
      `${environment.apiUrl}api/EmployeeDashboard/GetEmployees`,
    );
  }

  employeeGetById(employeeId: number | string) {
    return this.http.get<employeeDetailsI>(
      `${environment.apiUrl}api/EmployeeDashboard/GetEmployeeById/${employeeId}`,
    );
  }

  getImgById(imgId: string) {
    return this.http.get<any>(
      `${environment.apiUrl}api/EmployeeDashboard/GetEmployeeImageUrl?employeeId=${imgId}`,
    );
  }

  getAttendanceByID(id: string, month: string | number, year: number | string) {
    return this.http.get<attendanceListI>(
      `${environment.apiUrl}api/EmployeeDashboard/GetAttendanceData?empId=${id}&month=${month}&year=${year}`,
    );
  }

  getTimesheetByEmail(
    email: string,
    month: string | number,
    year: number | string,
    project:Array<string>,
  ) {
    return this.http.get<employeeTimesheetsI>(
      `${environment.apiUrl}api/EmployeeDashboard/GetTimesheet?emailId=${email}&month=${month}&year=${year}&project=${project}`,
    );
  }

  getAttendancePdfByID(
    id: string,
    startDate: string,
    endDate: string,
    comment: string,
    istimesheetavailable: boolean,
    projectName:string,
  ) {
    return this.http.get(
      `${environment.apiUrl}api/EmployeeDashboard/DownloadEmployeeAttendance/${id}/${startDate}/${endDate}?Comment=${comment}&istimesheetavailable=${istimesheetavailable}&projectName=${projectName}`,
      {
        headers: {
          Accept: "application/pdf",
        },
        responseType: "blob",
      },
    );
  }

  getAttendanceExcelByID(
    id: string,
    startDate: string,
    endDate: string,
    comment: string,
    istimesheetavailable: boolean,
    projectName:string
  ) {
    return this.http.get(
      `${environment.apiUrl}api/EmployeeDashboard/DownloadEmployeeAttendanceExcel/${id}/${startDate}/${endDate}?Comment=${comment}&istimesheetavailable=${istimesheetavailable}&project=${projectName}`,
      {
        headers: {
          Accept: "application/pdf",
        },
        responseType: "blob",
      },
    );
  }

  getSalaryById(id: string) {
    return this.http.get<employeeSalariesI>(
      `${environment.apiUrl}api/Salary/GetEmployeeSalary?empId=${id}`,
    );
  }
  // GetNCHistoryLogs?empIds=ZI-001&startDate=02-01-2025&endDate=02-19-2025
  GetNCHistoryLogs(id: string, startDate: string, endDate: string) {
    return this.http.get<any>(
      `${environment.apiUrl}GetNCHistoryLogs?empIds=${id}&startDate=${startDate}&endDate=${endDate}`,
    );
  }
  // api/EmployeeDashboard/GetDistinctProjects?employeeId=ZM-1135&startDate=02-01-2025&endDate=02-21-2025
  GetDistinctProjects(id: string, startDate: any, endDate: any) {
    return this.http.get<any>(
      `${environment.apiUrl}api/EmployeeDashboard/GetDistinctProjects?employeeId=${id}&startDate=${startDate}&endDate=${endDate}`,
    );
  }
}
