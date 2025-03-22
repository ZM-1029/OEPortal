import { Routes } from "@angular/router";
import { SalaryListComponent } from "./salary-list/salary-list.component";
import { SalaryBulkUploadComponent } from "./salary-bulk-upload/salary-bulk-upload.component";

export const SALARY_ROUTS: Routes = [
  {
    path: "",
    component: SalaryListComponent,
  },
  {
    path: "upload",
    component: SalaryBulkUploadComponent,
  },
];
