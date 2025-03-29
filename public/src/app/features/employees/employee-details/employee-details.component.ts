import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { EmployeesService } from "../employees.service";
import {
  employeeDetailsI,
  employeeType,
} from "../../../shared/types/employees.type";
import { ActivatedRoute } from "@angular/router";
import { ChangeDetectorRef } from "@angular/core";
import { EmployeeAttendanceComponent } from "../employee-attendance/employee-attendance.component";
import { LoaderComponent } from "../../../shared/components/UI/loader/loader.component";
import { DatePipe, NgClass } from "@angular/common";
import { HideShowInfoDirective } from "../../../shared/directive/hide-show-info.directive";
import { EmployeeSalaryComponent } from "../employee-salary/employee-salary.component";
import { EmployeeTimesheetComponent } from "../employee-timesheet/employee-timesheet.component";
import { NonComplianceHistoryComponent } from "../non-compliance-history/non-compliance-history.component";
import { EmployeeInvoiceComponent } from "../employee-invoice/employee-invoice.component";
import { EmployeeAssetsComponent } from "../employee-assets/employee-assets.component";

@Component({
  selector: "app-employee-details",
  imports: [
    EmployeeAttendanceComponent,
    LoaderComponent,
    DatePipe,
    HideShowInfoDirective,
    EmployeeSalaryComponent,
    EmployeeTimesheetComponent,
    NonComplianceHistoryComponent,
    NgClass,
    EmployeeInvoiceComponent,
    EmployeeAssetsComponent
  ],
  templateUrl: "./employee-details.component.html",
  styleUrl: "./employee-details.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDetailsComponent implements OnInit {
  id: number = 0;
  empId!: string;
  managerId: string = "";
  reportingTo: string = "";
  reportingToUrl!: string;
  imgUrl: any;
  employeeDetails!: employeeType;
  reportingId!: string;
  originalString: string = "";
  maskedString = "";
  isMasked = true;
  employeeDataForTimesheet: any ;
  activeTab: string = "profile";

  constructor(
    private _employeeService: EmployeesService,
    private route: ActivatedRoute,
    private _changeDetetction: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.empId = params.id;
    });
    this.employeeGetById(this.empId);
    this.sendEmployeeId_attendance(this.empId);
    this.setActiveTab(this.activeTab);
  }

  // active tab load..
  setActiveTab(tabName: string) {
    this.activeTab = tabName;
    this._changeDetetction.detectChanges();
  }

  sendEmployeeId_attendance(employeeIdInput: string) {
    this.empId = employeeIdInput;
  }

  employeeGetById(employeeId: string) {
    console.log(employeeId, "IDDDD");
    this._employeeService
      .employeeGetById(employeeId)
      .subscribe((result: employeeDetailsI) => {
        if (result.success) {
          this.employeeDetails = result.data;
          const employeeDataForTimesheet={
            employeeOfficalEmail:result.data.emailID,
            employeeId:employeeId,
          }
          this.employeeDataForTimesheet = employeeDataForTimesheet;
          this.reportingTo = this.employeeDetails?.reportingTo;
          this.managerId = this.employeeDetails.employeeID;
          const reportingMangerId: string = this.getReportingManagerId(
            this.reportingTo,
          );
          this.getReportingMangerImage(reportingMangerId);
          this.sendEmployeeId_attendance(employeeId);
          this._changeDetetction.detectChanges();
          this._employeeService
            .getImgById(this.managerId)
            .subscribe((img: any) => {
              if (img.imageUrl) {
                this.imgUrl = img.imageUrl;
              }
              this._changeDetetction.detectChanges();
            });
        } else {
          console.log("No employee data returned from API.");
        }
      });
  }

  getReportingMangerImage(mangerId: string) {
    this._employeeService
      .getImgById(mangerId)
      .subscribe((img: { imageUrl: string }) => {
        this.reportingToUrl = img.imageUrl;
        this._changeDetetction.detectChanges();
      });
  }

  getReportingManagerId(reporting: string) {
    let toStringR = String(reporting);
    if (toStringR.indexOf("ZM-")) {
      let startIndex = toStringR.indexOf("ZM-");
      this.reportingId = toStringR.slice(startIndex, toStringR.length);
    } else if (toStringR.indexOf("HRM")) {
      let startIndex = toStringR.indexOf("HRM");
      this.reportingId = toStringR.slice(startIndex, toStringR.length);
    } else if (toStringR.indexOf("ZCS-")) {
      let startIndex = toStringR.indexOf("ZCS-");
      this.reportingId = toStringR.slice(startIndex, toStringR.length);
    } else if (toStringR.indexOf("ZI-")) {
      let startIndex = toStringR.indexOf("ZI-");
      this.reportingId = toStringR.slice(startIndex, toStringR.length);
    } else {
      console.log("No employee data returned from ");
    }
    return this.reportingId;
  }
}
