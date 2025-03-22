import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, GridReadyEvent, ModuleRegistry } from 'ag-grid-community';
import { LoaderComponent } from 'src/app/shared/components/UI/loader/loader.component';
import { invoiceCreateTableI } from 'src/app/shared/types/invoice.type';
import { InvoiceService } from '../../invoice.service';
import { Router } from '@angular/router';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-invoice-create-table',
  imports: [AgGridAngular, LoaderComponent, FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule, MatFormFieldModule,
    MatInputModule,
    MatSelectModule,],
  templateUrl: './invoice-create-table.component.html',
  styleUrl: './invoice-create-table.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceCreateTableComponent implements OnInit, OnChanges {
  columnDefs: any = [
    {
      headerName: "S. No",
      valueGetter: "node.rowIndex + 1",
      sortable: false,
      filter: false,
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
      field: "employeeName",
      headerName: "Employee Name",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "employeeID",
      headerName: "Employee Id",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "salary",
      headerName: "Salary Amount",
      sortable: true,
      filter: true,
      minWidth: 180,
    },
    {
      field: "currencyCode",
      headerName: "Currency Code",
      sortable: true,
      filter: true,
      minWidth: 180,
    },
    {
      field: "billedAmount",
      headerName: "Billed Amount",
      sortable: true,
      filter: true,
      editable: true,
      minWidth: 140,
      cellStyle: (params: any) => this.getCellStyleBilledAmount(params),
    },
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  };
  @Output() formSubmit: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() ValidTableData: EventEmitter<{ rowData: any[]; totalSum: number }> = new EventEmitter<{ rowData: any[]; totalSum: number }>();
  @Input() invoiceTableData!: any[];
  @ViewChild("input") input!: ElementRef<HTMLInputElement>;
  private gridApi: any;
  public totalCount: number = 0;
  public activeCustomer: number = 0;
  public terminatedCustomer: number = 0;
  public resignedCustomer: number = 0;
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public isSideDrawerOpen: boolean = false;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50];
  rowData: invoiceCreateTableI[] = []
  selectedCustomerId: number | string = '';
  isSubmitted: boolean = false;
  isValid: boolean = false;
  @Input() editedInvoicedata: any ;

  constructor(private _changeDetectorRef: ChangeDetectorRef,
    private invoiceService: InvoiceService, private _router: Router,
    private _successMessage: MatSnackBar,

  ) { }
  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.displaySalary();
    this.isSubmitted=false;
    this.isValid=false;
    if(this.editedInvoicedata!=undefined){
      if (changes['editedInvoicedata']) {
          this.rowData=this.editedInvoicedata?.employeeInvoices;
          console.log(this.rowData,"row datat");
          this._changeDetectorRef.detectChanges()
      }
    }
    
  }

  getCellStyleBilledAmount(params: any) {
    console.log(params);
    if (this.isSubmitted) {  
      if (!params.value || isNaN(Number(params.value))) {
        this.isValid = false;  
        return { borderColor: "red", backgroundColor: "rgba(255, 0, 0, 0.08)" }; 
      }else{
        this.isValid = true;
        return { borderColor: "transparent", backgroundColor: "transparent" }; 
      }
    } 
    return null; 
  }

  validateResponse() {
    this.formSubmit.emit(true);
    this.isSubmitted = true;
    if (this.gridApi) {
      this.gridApi.stopEditing();
      this.gridApi.refreshCells({ force: true });
      if(this.isValid){
        const { rowData, totalSum } = this.getAllRowData();
        if (rowData.length != 0 && totalSum != 0) {
          this.ValidTableData.emit({ rowData, totalSum });
        }
      } else{
        // const { rowData, totalSum } = this.getAllRowData();
        // if (rowData.length != 0 && totalSum != 0) {
        //   this.ValidTableData.emit({ rowData, totalSum });
        // }
        // this.isSubmitted=false
      }
    }
    this._changeDetectorRef.detectChanges()
  }

  displaySalary() {
    if (this.invoiceTableData.length !== 0) {
      this.rowData = this.invoiceTableData;
      this.gridApi.hideOverlay();
    } 
    this._changeDetectorRef.detectChanges()
  }

  // get all row
  getAllRowData(): { rowData: any, totalSum: number } {
    const rowData: any[] = [];
    let totalSum = 0;
    if (this.gridApi) {
      this.gridApi.forEachNode((node: any) => {
        if (node.data) {
          const billedAmountValue = Number(node.data.billedAmount);

          if (!isNaN(billedAmountValue)) {
            ;
            totalSum += billedAmountValue; 
          }
        }
        rowData.push(node.data);
      });
    } else {
      console.warn("Grid API not initialized yet.");
    }
    return { rowData, totalSum };
  }


  // show message in table if api is false.. start (if rowData=[])
  gridOptions = {
    noRowsOverlayComponentParams: {
      noRowsMessageFunc: () => "Data is not found",
    },
  };

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.displaySalary();
    if(this.rowData.length==0){
      this.showErrorOverlay('Data is not found');
    }
  }

  showErrorOverlay(message: string) {
    if (this.gridApi) {
      this.gridApi.showNoRowsOverlay();
      setTimeout(() => {
        const overlay = document.querySelector(".ag-overlay-no-rows-center");
        if (overlay) {
          overlay.innerHTML = `<span style="color: #2e3b64; font-weight: bold;">${message}</span>`;
        }
        this._changeDetectorRef.detectChanges();
      }, 100);
    }
  }
  // show message in table if api is false.. end


  onPaginationChanged(params: any) {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    this.currentPageNumber = currentPage + 1;
    this.currentPageSize = pageSize;
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

  deleteRow(params: any): void {
    if (!this.gridApi) {
      console.error("Grid API is not initialized!");
      return;
    }
    this.gridApi.applyTransaction({ remove: [params.data] });
    setTimeout(() => { 
      const remainingRows = this.gridApi.getDisplayedRowCount();
      if (remainingRows === 0) {
        this.showErrorOverlay('Data is not found'); 
      }
      this._changeDetectorRef.detectChanges();
    }, 100); 
    this._changeDetectorRef.detectChanges();
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
    this._successMessage.open(err, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }

}
