import {
  Component,
  EventEmitter,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { SalaryService } from "../../salary.service";
import { FileDragDropBoxComponent } from "../../../../shared/components/file-drag-drop-box/file-drag-drop-box.component";
import { FileIconXlsComponent } from "../../../../shared/components/UI/file-icon-xls/file-icon-xls.component";
import { salaryOfEmployeeI } from "../../../../shared/types/salary.type";
import { Route, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";

@Component({
  selector: "app-salary-upload",
  imports: [FileDragDropBoxComponent, FileIconXlsComponent],
  templateUrl: "./salary-upload.component.html",
  styleUrl: "./salary-upload.component.scss",
})
export class SalaryUploadComponent {
  constructor(
    private _salaryService: SalaryService,
    private _router: Router,
    private _successMessage: MatSnackBar,
  ) { }
  file!: any;
  fileName: string = "";
  isShowDragZone: boolean = true;
  salaryOfEmployees: salaryOfEmployeeI[] = [];
  @Output() SendSalaryList: EventEmitter<salaryOfEmployeeI[]> =
    new EventEmitter();
  reciveFileFromFileDragDrop(file: File) {
    this.file = file;
    this.fileName = file.name;
    this.isShowDragZone = false;
  }

  getBulkSalaryUpload() {
    if (this.file) {
      const formData = new FormData();
      formData.append("file", this.file, this.file.name);
      // this._salaryService
      //   .getBulkSalaryUpload(formData)
      //   .subscribe((salaryOfEmployees: any) => {
      //     console.log(salaryOfEmployees, "result getBulkSalaryUpload");
      //     this.salaryOfEmployees = salaryOfEmployees;
      //     this.SendSalaryList.emit(this.salaryOfEmployees);
      //   });
      this._salaryService.getBulkSalaryUpload(formData).subscribe({
        next: ((salaryOfEmployees: any) => {
          console.log(salaryOfEmployees, "result getBulkSalaryUpload");
          this.salaryOfEmployees = salaryOfEmployees;
          this.SendSalaryList.emit(this.salaryOfEmployees);
        }),
        error: ((err) => {
          if (err.status === 500) {
            this.handleError("Server error: Please check file format and content.");
          } else if (err.status === 400) {
            this.handleError("Bad request: Possibly malformed data.");
          } else {
            this.handleError("Something went wrong. Please try again.");
          }
        })
      });
    }
  }

  cancelFileUpload() {
    this.isShowDragZone = true;
    this.file = null;
  }

  handleExportFile() {
    const fileUrl = "/excelTemplate/SampleFile.xlsx";
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = "Sample file salary.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  //  Function to show success messages
  private showSuccessMessage(message: string) {
    this._successMessage.openFromComponent(SuccessModalComponent, {
      data: { message },
      duration: 4000,
      panelClass: ["custom-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
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
