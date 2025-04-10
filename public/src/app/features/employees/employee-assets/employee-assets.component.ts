import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, GridApi, GridReadyEvent } from 'ag-grid-community';
import { LoaderComponent } from 'src/app/shared/components/UI/loader/loader.component';
import { EmployeesService } from '../employees.service';
import { DatePipe } from '@angular/common';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-employee-assets',
  imports: [AgGridAngular, LoaderComponent],
  providers: [DatePipe],
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
      field: "assetId",
      headerName: "Asset Id",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "assetTag",
      headerName: "Asset Tag",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "assetName",
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
      headerName: "Assigned Date",
      sortable: true,
      filter: true,
      minWidth: 100,
      cellRenderer: (params: any) => this.getDate(params.value),
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
    private datePipe: DatePipe,
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

  getDate(formatDate: any, format: string = "dd-MMM-YYYY"): string | null {
    return this.datePipe.transform(formatDate, format);
  }

  //  Function to handle API errors
  private handleError(err: any) {
    this._successMessage.open(err.error.message, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
}
