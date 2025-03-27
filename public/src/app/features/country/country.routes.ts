import { Routes } from "@angular/router";
import { CountryListComponent } from "./component/country/country.component";
import { AddCountryComponent } from "./component/add-country/add-country.component";
import { CountrytaxesComponent } from "./component/countrytaxes/countrytaxes.component";

export const COUNTRY_ROUTES: Routes = [
  {
      path: "",
      component: CountryListComponent,
    },
    {
      path: "create",
      component: AddCountryComponent,
    },
  
    {
      path: ":id",
      component: CountrytaxesComponent,
    }
];
