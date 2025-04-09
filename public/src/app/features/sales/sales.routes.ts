import { Routes } from "@angular/router";
import { SalesComponent } from "./sales/sales.component";
import { SalesListComponent } from "./sales-list/sales-list.component";
import { SaleCreateComponent } from "./sale-create/sale-create.component";
import { ApproveQuatationComponent } from "./approve-quatation/approve-quatation.component";

// export const SALES_ROUTES: Routes = [
//   {
//     path: "",
//     component: SalesComponent,
//     children: [
//       {
//         path: "",
//         component: SalesListComponent,
//         children: [
//           {
//             path: ":id",
//             component: SaleCreateComponent,
//           },
//         ],
//       },
//     ],
//   },
// ];

export const SALES_ROUTES: Routes = [
  {
    path: "",
    component: SalesComponent,
    children: [
      {
        path: "",
        component: SalesListComponent,
      },
      {
        path: ":id",
        component: ApproveQuatationComponent,
      },
    ],
  },
];
