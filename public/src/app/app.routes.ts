import { Routes } from "@angular/router";
import { LayoutComponent } from "./core/layouts/layout/layout.component";
import { EmptyComponent } from "./core/layouts/empty/empty.component";
import { SignInComponent } from "./features/auth/sign-in/sign-in.component";
import { authGuard } from "./core/auth/guards/auth-guard.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "",
    component: EmptyComponent,
    data: {
      layout: "empty",
    },
    children: [
      {
        path: "login",
        loadComponent: () =>
          import("./features/auth/sign-in/sign-in.component").then(
            (m) => m.SignInComponent,
          ),
      },
      {
        path: "sign-up",
        loadComponent: () =>
          import("./features/auth/sign-up/sign-up.component").then(
            (m) => m.SignUpComponent,
          ),
      },
    ],
  },
  {
    path: "admin",
    component: LayoutComponent,
    canActivate: [authGuard],
    data: {
      layout: "layout",
    },
    children: [
      {
        path: "employee",
        loadChildren: () =>
          import("./features/employees/employee.routes").then(
            (m) => m.EMPLOYEE_ROUTES,
          ),
      },
      {
        path: "customers",
        loadChildren: () =>
          import("./features/customers/customer.routes").then(
            (m) => m.CUSTOMER_ROUTES,
          ),
      },
      {
        path: "country",
        loadChildren: () =>
          import("./features/country/country.routes").then(
            (m) => m.COUNTRY_ROUTES,
          ),
      },
      {
        path: "bussiness",
        loadChildren: () =>
          import("./features/bussiness/bussiness.routing").then(
            (m) => m.BUSSINESS_ROUTES,
          ),
      }
      ,
      {
        path: "company",
        loadChildren: () =>
          import("./features/company/company.routing").then(
            (m) => m.COMPANY_ROUTES,
          ),
      },
      
      {
        path: "branch",
        loadChildren: () =>
          import("./features/branch/branch.routing").then(
            (m) => m.BRANCH_ROUTES,
          ),
      },
      {
        path: "bank",
        loadChildren: () =>
          import("./features/companybank/bank.routing").then(
            (m) => m.BANK_ROUTES,
          ),
      },
      {
        path: "salary",
        loadChildren: () =>
          import("./features/salary/salary.routes").then((m) => m.SALARY_ROUTS),
      },
      {
        //PO(Purchase Order)
        path: "PO",
        loadChildren: () =>
          import("./features/purchaseOrders/purchaseOrder.routes").then(
            (m) => m.PO_ROUTS,
          ),
      },
      {
        path: "invoice",
        loadChildren: () =>
          import("./features/invoice/invoice.router").then(
            (m) => m.INVOICE_ROUTS,
          ),
      },
      {
        path: "reports",
        loadChildren: () =>
          import("./features/reports/reports.router").then(
            (m) => m.REPORTS_ROUTS,
          ),
      },
      {
        path: "roles",
        loadComponent: () =>
          import("./features/role-permissions/role-permission/role-permission.component").then(
            (m) => m.RolePermissionComponent,
          ),
      },
    ],
  },
];
