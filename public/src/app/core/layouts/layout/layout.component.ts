import { Component } from "@angular/core";
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NgClass } from "@angular/common";
import { getMenuMasterListI } from "src/app/shared/types/sidebar.type";

@Component({
  selector: "app-layout",
  imports: [HeaderComponent, RouterOutlet, SidebarComponent, NgClass],
  templateUrl: "./layout.component.html",
  styleUrl: "./layout.component.scss",
})
export class LayoutComponent {
  menuClass: string = "openMenu";
  fromheader: any = "event";
  headerMenuList:getMenuMasterListI[]=[]
  getSideMenuClass(menuClass: string) {
    this.menuClass = menuClass;
  }

  headerMenu(menu:getMenuMasterListI[]){
    this.headerMenuList=menu;
  }
}
