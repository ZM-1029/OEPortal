import { Routes } from "@angular/router";
import { SalesComponent } from "./sales/sales.component";
import { SalesListComponent } from "./sales-list/sales-list.component";
import { SaleCreateComponent } from "./sale-create/sale-create.component";

export const SALES_ROUTES: Routes = [
  {
    path: "",
    component: SalesComponent,
    children: [
      {
        path: "",
        component: SalesListComponent,
        children: [
          {
            path: ":id",
            component: SaleCreateComponent,
          },
        ],
      },
    ],
  },
];
