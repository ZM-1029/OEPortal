import { Routes } from "@angular/router";
import { AddBussinessComponent } from "./component/add-bussiness/add-bussiness.component";
import { BussinessLineComponent } from "./component/bussiness-line/bussiness-line.component";
import { BussinessCountryComponent } from "./component/bussiness-country/bussiness-country.component";


export const BUSSINESS_ROUTES: Routes = [
  {
      path: "",
      component: BussinessLineComponent,
    },
    {
      path: "create",
      component: AddBussinessComponent,
    },
  
    {
      path: ":id",
      component: BussinessCountryComponent,
    }
];