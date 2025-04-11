import { NgClass, NgFor } from "@angular/common";
import { Component, EventEmitter, inject, Input, input, OnInit, Output } from "@angular/core";
import { MatIconModule, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ICONS } from "../../helpers/icons";
import { CommonService } from "../../services/common.service";
import { getMenuMasterListI } from "../../types/sidebar.type";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-sidebar",
  imports: [RouterLink, NgClass, RouterLinkActive,MatIconModule,NgFor],
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.scss",
  
})
export class SidebarComponent implements OnInit {
  @Input() menuClass: string = "closeMenu";
  @Output() headerMenu: EventEmitter<getMenuMasterListI[]> = new EventEmitter<getMenuMasterListI[]>();
  menuList:getMenuMasterListI[]=[];
  sideBarMenuList:any[]=[];
  headerMenuList:any[]=[];
  constructor( private commonService:CommonService,private _successMessage: MatSnackBar,) {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    // Register SVG icons properly
    Object.keys(ICONS).forEach((iconName) => {
      iconRegistry.addSvgIconLiteral(
        iconName,
        sanitizer.bypassSecurityTrustHtml(ICONS[iconName]) 
      );
    });
  }
  
  ngOnInit(): void {
    const roleId=localStorage.getItem('role');
    console.log(roleId);
    this.commonService.GetMenuMasterList(roleId).subscribe(
      {
        next:((response)=>{
          if(response.success){
            this.menuList=response.data;
            this.headerMenuList = response.data.filter((value: any) => value.displayArea == 0 );
            this.sideBarMenuList = response.data.filter((value: any) => value.displayArea == 1 );
            console.log(this.sideBarMenuList,"sideBarMenuList");
            
            this.headerMenu.emit(this.headerMenuList)
          }else{
            this.handleError("Menu list not retrieved from api.")
          }
        }),
        error:((err)=>{
          this.handleError("Menu list not retrieved from api.")
        })
      }
    )
  }

  trackByFn(index: number, item: any): number {
  return item.id;
}


    //  Function to handle API errors
    private handleError(err: any) {
      this._successMessage.open(err, "Close", {
        duration: 4000,
        panelClass: ["error-toast"],
        verticalPosition: "top",
        horizontalPosition: "right",
      });
    }
}
