import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, GridApi, GridReadyEvent } from 'ag-grid-community';
import { LoaderComponent } from 'src/app/shared/components/UI/loader/loader.component';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { EmployeesService } from '../employees.service';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-employee-assets',
  imports: [AgGridAngular, LoaderComponent],
  templateUrl: './employee-assets.component.html',
  styleUrl: './employee-assets.component.scss'
})
export class EmployeeAssetsComponent implements OnInit, AfterViewInit {
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
      assetName: "assetName",
      headerName: "Asset Name",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "serialNo",
      headerName: "Serial No",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "checkOutDate",
      headerName: "check OutDate",
      sortable: true,
      filter: true,
      minWidth: 100,
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

  employeeAssetsGetById() {
    this._employeeService.employeeAssetsGetById(this.employeeId).subscribe({
      next: (response:any) => {
        if (response.data.length > 0) {
          this.rowData = response.data;
          this.gridApi.hideOverlay();
          this._changeDetectorRef.detectChanges();
        } else {
          this.rowData = [];
          this.showErrorOverlay("Data is not found");
        }
      },
      error: (err) => {
        this.rowData=[]
        this.showErrorOverlay("Data is not found");
        console.error("Error Status:", err.status);
        console.error("Error Message:", err.error);
        let errorMessage = "An error occurred while fetching data.";
        if (err.status === 404 && err.error.message) {
         
          this.handleError(err.error.message);
        }
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
    this.employeeAssetsGetById();
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
