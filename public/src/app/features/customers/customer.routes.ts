import { Routes } from "@angular/router";
import { CustomersListComponent } from "./customers-list/customers-list.component";
import { CustomerCreateComponent } from "./customer-create/customer-create.component";
import { CustomerComponent } from "./customer/customer.component";

export const CUSTOMER_ROUTES: Routes = [
  {
    path: "",
    component: CustomerComponent,
    children: [
      {
        path: "",
        component: CustomersListComponent,
        children: [
          {
            path: ":id",
            component: CustomerCreateComponent,
          },
        ],
      },
    ],
  },
];
