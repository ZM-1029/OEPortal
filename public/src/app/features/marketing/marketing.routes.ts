import { Routes } from "@angular/router";
import { MarketingComponent } from "./marketing/marketing.component";
import { MarketingEmptyComponent } from "./marketing-empty/marketing-empty.component";
import { ViewSliderComponent } from "./view-slider/view-slider.component";

export const MARKETING_ROUTES: Routes = [
  {
    path: "",
    component: MarketingEmptyComponent,
    children: [
      {
        path: "",
        component: MarketingComponent,
      },
      {
        path: ":id",
        component: ViewSliderComponent,
      }
    ]
  },
];
