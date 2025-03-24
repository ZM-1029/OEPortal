import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  output,
  ViewChild,
} from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { AuthenticationService } from "src/app/core/auth/authentication.service";
import { getMenuMasterListI } from "../../types/sidebar.type";

@Component({
  selector: "app-header",
  imports: [MatIconModule,RouterLink],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent implements OnInit {
  @Input() headerMenuList:getMenuMasterListI[]=[];
  @Output() sendMenuClass: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild("sideBar") myDiv!: ElementRef;
  Menu = "openMenu";
  name:string|null='';
  roleName:string|null='';
  roleId:any;
  constructor(private authenticationService:AuthenticationService){}
  ngOnInit(): void {
    this.name=localStorage.getItem('name');
    this.roleName=localStorage.getItem('roleName');
    this.roleId = Number(localStorage.getItem('role'));
  }

  openMenu() {
    if (this.Menu == "closeMenu") {
      this.Menu = "openMenu";
      this.sendMenuClass.emit(this.Menu);
    } else {
      this.Menu = "closeMenu";
      this.sendMenuClass.emit(this.Menu);
    }
  }

  accessElement() {
    console.log(this.myDiv.nativeElement); 
    this.myDiv.nativeElement.style.color = "red"; 
  }

  logout(){
    this.authenticationService.logout();
  }
  
}
