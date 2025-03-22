import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { LoaderComponent } from "../../../../shared/components/UI/loader/loader.component";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Subject } from "rxjs";
import { salaryOfEmployeeI } from "../../../../shared/types/salary.type";
import { SalaryService } from "../../salary.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SuccessModalComponent } from "../../../../shared/components/UI/success-modal/success-modal.component";

@Component({
  selector: "app-salary-bulk-edit",
  imports: [AgGridAngular, CommonModule, LoaderComponent],
  templateUrl: "./salary-bulk-edit.component.html",
  styleUrl: "./salary-bulk-edit.component.scss",
})
export class SalaryBulkEditComponent implements OnChanges {
  columnDefs: any = [
    {
      headerName: "S. No",
      valueGetter: "node.rowIndex + 1",
      sortable: true,
      filter: true,
      pinned: "left",
      minWidth: 100,
      maxWidth: 100,
      cellStyle: () => {
        return { border: "none" };
      },
    },
    {
      headerName: "Actions",
      field: "delete",
      pinned: "right",
      cellRenderer: (params: any) => this.renderDeleteIcons(params),
      width: 100,
      filter: false,
      sortable: false,
      onCellClicked: (params: any) => this.deleteRow(params),
      cellStyle: () => {
        return { border: "none" };
      },
    },
    {
      field: "employeeID",
      headerName: "Employee Id",
      sortable: true,
      filter: true,
      minWidth: 170,
      editable: true,
      cellStyle: (params: any) => this.getCellStyleEmployeeID(params),
    },
    {
      field: "month",
      headerName: "Month",
      sortable: true,
      filter: true,
      minWidth: 170,
      editable: true,
      cellStyle: (params: any) => this.getCellStyleMonthCode(params),
    },
    {
      field: "year",
      headerName: "Year",
      sortable: true,
      filter: true,
      minWidth: 170,
      editable: true,
      cellStyle: (params: any) => this.getCellStyleYearCode(params),
    },
    {
      field: "customerName",
      headerName: "Customer Name",
      sortable: true,
      filter: true,
      minWidth: 200,
      editable: true,
      cellStyle: (params: any) => this.getCellStyleCustomerName(params),
    },
    {
      field: "currencyCode",
      headerName: "Currency Code",
      sortable: true,
      filter: true,
      minWidth: 170,
      editable: true,
      cellStyle: (params: any) => this.getCellStyleCurrencyCode(params),
    },
    {
      field: "amount",
      headerName: "Amount",
      sortable: true,
      filter: true,
      minWidth: 240,
      editable: true,
      cellStyle: (params: any) => this.getCellStyleAmountCode(params),
    },
  ];
  public totalCount: number = 0;
  public activeCustomer: number = 0;
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public customerId: number = 0;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];

  rowData: any[] = [];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    editable: false,
  };

  private gridApi: any;
  constructor(
    private _salaryService: SalaryService,
    private _changeDetetction: ChangeDetectorRef,
    private _successMessage: MatSnackBar,
  ) {}

  @Input() salaryList: salaryOfEmployeeI[] = [];
  @Output() fileSubmissionSuccessfully: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  ngOnInit(): void {
    console.log(this.salaryList, "Edit ");
    this.getSalaryList();
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.salaryList, "Edit ngOnChanges");
    this.getSalaryList();
  }

  getSalaryList() {
    this.rowData = [...this.salaryList];
    if (this.gridApi) {
      this.gridApi.setRowData(this.rowData);
    }
  }

  // cell style
  getCellStyleCustomerName(params: any) {
    if (params.value) {
      if (!params.data.isCustomerApproved) {
        return { color: "red" };
      }
    } else {
      return { borderColor: "red", backgroundColor: "rgba(255, 0, 0, 0.08)" };
    }
    return null;
  }

  getCellStyleEmployeeID(params: any) {
    if (params.value) {
      if (!params.data.isEmpApproved) {
        return { color: "red" };
      }
    } else {
      return { borderColor: "red", backgroundColor: "rgba(255, 0, 0, 0.08)" };
    }
    return null;
  }

  getCellStyleCurrencyCode(params: any) {
    if (params.value) {
      if (!params.data.isCurrencyApproved) {
        return { color: "red" };
      }
    } else {
      return { borderColor: "red", backgroundColor: "rgba(255, 0, 0, 0.08)" };
    }
    return null;
  }

  getCellStyleAmountCode(params: any) {
    if (params.value) {
      if (!params.data.isSalaryEmpty) {
        return { color: "red" };
      }
    } else {
      return { borderColor: "red", backgroundColor: "rgba(255, 0, 0, 0.08)" };
    }
    return null;
  }
  getCellStyleYearCode(params: any) {
    if (params.value) {
      if (!params.data.isYearEmpty) {
        return { color: "red" };
      }
    } else {
      return { backgroundColor: "rgba(255, 0, 0, 0.08)", borderColor: "red" };
    }
    return null;
  }

  getCellStyleMonthCode(params: any) {
    if (params.value) {
      if (!params.data.isMonthEmpty) {
        return { color: "red" };
      }
    } else {
      return { borderColor: "red", backgroundColor: "rgba(255, 0, 0, 0.08)" };
    }
    return null;
  }

  // Edited table data..

  submitEditedTableData() {
    this.gridApi.stopEditing();
    const listOfSalary = this.getAllRowData();
    this._salaryService.getValidateSalaryDTO(listOfSalary).subscribe({
      next: (response) => {
        if (response.success) {
          this._successMessage.openFromComponent(SuccessModalComponent, {
            data: { message: response.message },
            duration: 4000, // 4 seconds
            panelClass: ["custom-toast"],
            verticalPosition: "top",
            horizontalPosition: "right",
          });
          this.handleSalary(response.salaryDTOList);
          this.fileSubmissionSuccessfully.emit(true);
        }
      },
      error: (errorResponse) => {
        console.error("Error:", errorResponse);
        console.log(errorResponse.error, "errorResponse.error");
        console.log(
          errorResponse.error.salaryDTOList,
          "errorResponse.error.salaryDTOList",
        );
        if (errorResponse.error && errorResponse.error.salaryDTOList) {
          this.handleSalary(errorResponse.error.salaryDTOList);
        }
      },
    });
  }

  handleSalary(salaryDTOList: salaryOfEmployeeI[]) {
    console.log("Salary DTO List Errors:", salaryDTOList);
    this.rowData = salaryDTOList;
    this._changeDetetction.detectChanges();
  }

  getAllRowData() {
    const rowData: salaryOfEmployeeI[] = [];
    if (this.gridApi) {
      this.gridApi.forEachNode((node: any) => rowData.push(node.data));
    } else {
      console.warn("Grid API not initialized yet.");
    }
    console.log("All Table Data: SJJJJJJJJ", rowData);
    return rowData;
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.paginationSetPageSize(this.paginationPageSize);
  }

  // pagnation
  onPageSizeChange(event: any) {
    this.currentPageSize = +event.target.value;
    this.currentPageNumber = 1;
    this.getSalaryList();
  }

  onPaginationChanged(params: any) {
    if (!this.gridApi) return;
    this.currentPageNumber = this.gridApi.paginationGetCurrentPage() + 1;
    this.currentPageSize = this.gridApi.paginationGetPageSize();
    console.log(
      `Page Changed: Page ${this.currentPageNumber}, Size ${this.currentPageSize}`,
    );
  }

  renderDeleteIcons(params: any): string {
    return `
      <div class="action-icons d-flex align-items-center   justify-content-around">
      <span class="icon-container text-danger" style="display: block; width: 20px; height: 20px;"  >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>

      </span>
      </div>
    `;
  }

  deleteRow(params: any) {
    const rowIndex = params.node.rowIndex;
    if (rowIndex !== undefined) {
      this.rowData.splice(rowIndex, 1);
      this.rowData = [...this.rowData];
      this.gridApi.setRowData(this.rowData);
    }
  }
}
