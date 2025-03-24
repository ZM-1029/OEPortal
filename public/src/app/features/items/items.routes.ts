import { Routes } from "@angular/router";
import { ItemsListComponent } from "./items-list/items-list.component";
import { ItemCreateComponent } from "./item-create/item-create.component";
import { ItemsComponent } from "./items/items.component";

export const ITEMS_ROUTES: Routes = [
  {
    path: "",
    component: ItemsComponent,
    children: [
      {
        path: "",
        component: ItemsListComponent,
        children: [
          {
            path: ":id",
            component: ItemCreateComponent,
          },
        ],
      },
    ],
  },
];
