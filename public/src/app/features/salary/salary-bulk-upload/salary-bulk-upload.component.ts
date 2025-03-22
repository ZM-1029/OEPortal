import { Component, OnChanges, SimpleChanges } from "@angular/core";
import { SalaryUploadComponent } from "./salary-upload/salary-upload.component";
import { UploadInstructionsComponent } from "./upload-instructions/upload-instructions.component";
import { NgClass } from "@angular/common";
import { SalaryBulkEditComponent } from "./salary-bulk-edit/salary-bulk-edit.component";
import { salaryOfEmployeeI } from "../../../shared/types/salary.type";
import { Router } from "@angular/router";

@Component({
  selector: "app-salary-bulk-upload",
  imports: [
    SalaryUploadComponent,
    UploadInstructionsComponent,
    SalaryBulkEditComponent,
    NgClass,
  ],
  templateUrl: "./salary-bulk-upload.component.html",
  styleUrl: "./salary-bulk-upload.component.scss",
})
export class SalaryBulkUploadComponent implements OnChanges {
  fileProcessHeading: string = "Upload";
  salaryList: salaryOfEmployeeI[] = [];
  constructor(private _router: Router) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.reciveSalaryList(this.salaryList);
  }
  reciveSalaryList(list: any) {
    if (list) {
      this.fileProcessHeading = "Edit";
      this.salaryList = list;
      console.log(this.salaryList, "getBulkSalaryUpload");
    }
  }
  fileSubmissionSuccessfully() {
    this.fileProcessHeading = "Submission Successfully";
  }

  cancel() {
    this.fileProcessHeading = "Upload";
  }
  next() {
    this._router.navigateByUrl("/admin/salary");
  }

  backToSalaryList() {
    this._router.navigateByUrl("/admin/salary");
  }
}
