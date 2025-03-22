import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from "@angular/core";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatButtonModule } from "@angular/material/button";
import { RouterModule } from "@angular/router";
import { EmployeesService } from "../../../../features/employees/employees.service";
import { Subject } from "rxjs";
import { CustomersService } from "../../../../features/customers/customers.service";
@Component({
  selector: "app-side-drawer",
  imports: [MatSidenavModule, MatButtonModule, RouterModule],
  templateUrl: "./side-drawer.component.html",
  styleUrl: "./side-drawer.component.scss",
})
export class SideDrawerComponent implements OnChanges, OnDestroy {
  isDrawerOpen = false;
  employeeRowData: any = null;
  employeeId!: string;
  employeeImgUrl!: string;
  customerRowData: any = null;
  isVisible = false;
  constructor(
    private _employeeService: EmployeesService,
    private _customerService: CustomersService,
  ) {}
  private _unsubscribeAll$: Subject<any> = new Subject<any>();

  @Input() isSideDrawerOpen!: boolean;
  @Output() sideDrawer: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnChanges(changes: SimpleChanges): void {
    this.drawerOpen(this.isSideDrawerOpen);
  }

  drawerOpen(isSideDrawerOpen: boolean) {
    if (isSideDrawerOpen) {
      this.isVisible = true;
      this.isDrawerOpen = true;
    } else {
      this.isVisible = false;
      this.isDrawerOpen = false;
    }
  }

  closeDrawer() {
    this.isVisible = false;
    this.isDrawerOpen = false;
    this.sideDrawer.emit(false);
  }
  closeDrawerByBody(event: Event) {
    event.stopPropagation();
    this.isSideDrawerOpen = false;
  }

  ngOnDestroy(): void {
    console.log("ng destroyee...");
    this._unsubscribeAll$.next(this._customerService);
    this._unsubscribeAll$.next(this._employeeService.rowData$);
    this._unsubscribeAll$.complete();
  }
}
