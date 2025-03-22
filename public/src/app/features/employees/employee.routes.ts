import { Routes } from "@angular/router";
import { EmployeeDetailsComponent } from "./employee-details/employee-details.component";
import { EmployeeListComponent } from "./employee-list/employee-list.component";
import { EmployeesComponent } from "./employees/employees.component";

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: "",
    component: EmployeesComponent,
    children: [
      {
        path: "",
        component: EmployeeListComponent,
      },
      {
        path: ":id",
        component: EmployeeDetailsComponent,
      },
    ],
  },
];
