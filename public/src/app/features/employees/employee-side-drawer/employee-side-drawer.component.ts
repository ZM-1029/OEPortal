import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { EmployeesService } from "../employees.service";

@Component({
  selector: "app-employee-side-drawer",
  imports: [],
  templateUrl: "./employee-side-drawer.component.html",
  styleUrl: "./employee-side-drawer.component.scss",
})
export class EmployeeSideDrawerComponent implements OnInit, OnDestroy {
  isDrawerOpen = false;
  employeeRowData: any = null;
  employeeId!: string;
  employeeImgUrl: string='/assets/images/demo.jpg';
  customerRowData: any = null;
  isVisible = false;
  constructor(
    private _employeeService: EmployeesService,
    private _router: Router,
    private _changeDetetction: ChangeDetectorRef,
  ) { }
  private _unsubscribeAll$: Subject<any> = new Subject<any>();

  ngOnInit() {
    this.getEmployees();
  }

  getEmployees() {
    this._employeeService.rowData$
      .pipe(takeUntil(this._unsubscribeAll$))
      .subscribe((data) => {
        if (data) {
          this.isVisible = true;
          this.employeeRowData = data;
          this.employeeId = data.employeeID;
          console.log(this.employeeRowData,"this.employeeRowData");
          
          if (!this.employeeRowData.ismanual) {
            this._employeeService
              .getImgById(this.employeeId)
              .pipe(takeUntil(this._unsubscribeAll$))
              .subscribe((img) => {
                this.employeeImgUrl = img.imageUrl;
                this._changeDetetction.detectChanges();
              });
          } else {
            if(this.employeeRowData.photo){
              this.employeeImgUrl = this.employeeRowData.photo;
            }
          }
          this.isDrawerOpen = true;
        } else {
          this.isVisible = false;
          this.isDrawerOpen = false;
        }
      });
  }

  navigateToDetails() {
    if (this.employeeRowData !== null) {
      this._router.navigateByUrl(
        "/admin/employee/" + this.employeeRowData.employeeID,
      );
    }
  }
  ngOnDestroy(): void {
    this._unsubscribeAll$.next(this._employeeService.rowData$);
  }
}
