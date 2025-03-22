import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  AllcurrencyI,
  createSalaryI,
  salaryListI,
} from "../../shared/types/salary.type";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class SalaryService {
  constructor(private http: HttpClient) {}

  getSalaryList() {
    return this.http.get<salaryListI>(
      `${environment.apiUrl}api/Salary/GetAllSalaries`,
    );
  }

  getBulkSalaryUpload(formData: FormData) {
    return this.http.post<salaryListI>(
      `${environment.apiUrl}api/Salary/BulkSalaryUpload`,
      formData,
    );
  }

  getValidateSalaryDTO(file: any) {
    return this.http.post<any>(
      `${environment.apiUrl}api/Salary/ValidateSalaryDTO`,
      file,
    );
  }

  getAllCurrencies() {
    return this.http.get<AllcurrencyI>(
      `${environment.apiUrl}api/Customer/GetAllCurrencies`,
    );
  }

  createSalary(salary: createSalaryI) {
    return this.http.post<any>(
      `${environment.apiUrl}api/Salary/CreateSalary`,
      salary,
    );
  }

  getSalaryById(id: number) {
    return this.http.get<salaryListI>(
      `${environment.apiUrl}api/Salary/GetSalaryById/${id}`,
    );
  }

  updateSalaryById(id: number, salaryData: createSalaryI) {
    return this.http.put<createSalaryI>(
      `${environment.apiUrl}api/Salary/EditSalary/${id}`,
      salaryData,
    );
  }

  deleteSalaryById(id: number) {
    return this.http.delete(
      `${environment.apiUrl}api/Salary/DeleteSalary/${id}`,
    );
  }
}
