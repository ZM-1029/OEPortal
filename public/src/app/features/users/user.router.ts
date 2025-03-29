import { Routes } from "@angular/router";
import { UserListComponent } from "./user-list/user-list.component";
import { UserCreateComponent } from "./user-create/user-create.component";


export const User_ROUTES: Routes = [
  {
    path: "",
    component: UserListComponent,
  },
];
