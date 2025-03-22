import { Routes } from "@angular/router";
import { InvoiceListComponent } from "./invoice-list/invoice-list.component";
import { InvoiceCreateComponent } from "./invoice-create/invoice-create.component";

export const INVOICE_ROUTS: Routes = [
  {
    path: "",
    component: InvoiceListComponent,
  },
  {
    path: "create",
    component: InvoiceCreateComponent,
  },

  {
    path: ":invoiceId",
    component: InvoiceCreateComponent,
  }
];

