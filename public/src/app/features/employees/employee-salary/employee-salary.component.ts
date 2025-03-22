import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { LoaderComponent } from "../../../shared/components/UI/loader/loader.component";
import { EmployeesService } from "../employees.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SuccessModalComponent } from "../../../shared/components/UI/success-modal/success-modal.component";
import {
  ModuleRegistry,
  AllCommunityModule,
  GridReadyEvent,
  GridApi,
} from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: "app-employee-salary",
  imports: [AgGridAngular, LoaderComponent],
  templateUrl: "./employee-salary.component.html",
  styleUrl: "./employee-salary.component.scss",
})
export class EmployeeSalaryComponent implements OnInit, AfterViewInit {
  @Input() employeeId!: string;
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  rowData: any | undefined;
  private gridApi!: GridApi<any>;

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
      field: "month",
      headerName: "Month",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "year",
      headerName: "Year",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "customerName",
      headerName: "Customer Name",
      sortable: true,
      filter: true,
      minWidth: 200,
    },
    {
      field: "currencyCode",
      headerName: "Currency Code",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "amount",
      headerName: "Amount",
      sortable: true,
      filter: true,
      minWidth: 240,
    },
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  };

 
  constructor(
    private _employeeService: EmployeesService,
    private _successMessage: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this._changeDetectorRef.detectChanges();
  }

  getSalaryById() {
    this._employeeService.getSalaryById(this.employeeId).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.rowData = response.data;
          this.gridApi.hideOverlay();
          this._changeDetectorRef.detectChanges();
        } else {
          this.rowData = [];
          this.showErrorOverlay("Data is not found");
        }
      },
      error: (err) => {
        console.error("Error Status:", err.status);
        console.error("Error Message:", err.error);
        let errorMessage = "An error occurred while fetching data.";
        if (err.status === 404 && err.error.message) {
          this.showErrorOverlay("Data is not found");
        }
        this.handleError(err.error.message);
      },
    });
  }

  gridOptions = {
    noRowsOverlayComponentParams: {
      noRowsMessageFunc: () => "Data is not found",
    },
  };

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.gridApi.hideOverlay();
    this.getSalaryById();
  }

  showErrorOverlay(message: string) {
    if (this.gridApi) {
      this.gridApi.showNoRowsOverlay();
      setTimeout(() => {
        const overlay = document.querySelector(".ag-overlay-no-rows-center");
        if (overlay) {
          overlay.innerHTML = `<span style="color: #2e3b64; font-weight: bold;">${message}</span>`;
        }
      }, 100);
      this._changeDetectorRef.detectChanges();
    }
  }

  onPaginationChanged(params: any) {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    this.currentPageNumber = currentPage + 1;
    this.currentPageSize = pageSize;
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
    console.error("Error Status:", err.status);
    console.error("Error Message:", err.error);
    this._successMessage.open(err.error.message, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
}
