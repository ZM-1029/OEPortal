import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { LoaderComponent } from "src/app/shared/components/UI/loader/loader.component";
import { PageHeaderComponent } from "src/app/shared/components/UI/page-header/page-header.component";
import { SideDrawerComponent } from "src/app/shared/components/UI/side-drawer/side-drawer.component";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteModalComponent } from "src/app/shared/components/UI/delete-modal/delete-modal.component";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { PurchaseOrdersService } from "../purchase-orders.service";
import { purchaseOrderI, purchaseOrdersResponseI } from "src/app/shared/types/purchaseOrder.type";
import { PurchaseOrderCreateComponent } from "../purchase-order-create/purchase-order-create.component";
import { AllCommunityModule, GridApi, GridReadyEvent, ModuleRegistry } from "ag-grid-community";
import { PurcheseOrdereViewComponent } from "../purchese-ordere-view/purchese-ordere-view.component";

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: "app-purchase-order-list",
  imports: [
    AgGridAngular,
    CommonModule,
    LoaderComponent,
    PageHeaderComponent,
    SideDrawerComponent,
    PurchaseOrderCreateComponent,
  ],
  templateUrl: "./purchase-order-list.component.html",
  styleUrl: "./purchase-order-list.component.scss",
})
export class PurchaseOrderListComponent implements OnInit {
  private gridApi!: GridApi<any>;
  public totalCount: number = 0;
  public activeCustomer: number = 0;
  public terminatedCustomer: number = 0;
  public resignedCustomer: number = 0;
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public isSideDrawerOpen: boolean = false;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  formHeading: string = "";
  PurchaseOrderRowId!: number;
  HeadingName: string = "Purchase Order";
  rowData: any;

  
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
      field: "actions",
      cellRenderer: (params: any) => this.renderActionIcons(params),
      minWidth: 150,
      maxWidth: 150,
      cellClass: "hover-effect-cell",
      pinned: "right",
      sortable: false,
      filter: false,
      cellStyle: () => {
        return { border: "none" };
      },
    },
    {
      field: "poid",
      headerName: "Order Id",
      sortable: true,
      filter: true,
      minWidth: 200,
    },
    {
      field: "poDate",
      headerName: "Month",
      cellRenderer: (params: any) => this.extractMonth(params),
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "poDate",
      headerName: "Year",
      cellRenderer: (params: any) => this.extractYear(params),
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
      field: "amount",
      headerName: "Amount",
      sortable: true,
      filter: true,
      minWidth: 240,
    },
    {
      field: "currencyCode",
      headerName: "Currency Code",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "description",
      headerName: "Description",
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
    private _purchaseOrder: PurchaseOrdersService,
    private _changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private _successMessage: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.pageHeader_customer(this.HeadingName);

  }

  ngAfterViewInit() {
    this._changeDetectorRef.detectChanges();
  }

  addSalary(event: Event) {
    this.formHeading = "Create";
    this.isSideDrawerOpen = true;
    this.PurchaseOrderRowId = 0;
  }

  pageHeader_customer(customerHeadingName: string) {
    this.HeadingName = customerHeadingName;
  }

  getPurchaseOrderList() {
    this._purchaseOrder
      .getPurchaseOrderList()
      .subscribe(
        {
          next:((result: purchaseOrdersResponseI)=>{
            if (result.success) {
              console.log(result.data, "result.data");
              this.rowData = result.data;
              this._changeDetectorRef.detectChanges();
            } else {
              this.rowData = [];
              this.gridApi.hideOverlay();
              this.showErrorOverlay("Data is not found");
              console.log("No customer data returned from API.");
            }
          }),error:((err)=>{
            this.rowData = [];
            this.gridApi.hideOverlay();
            this.showErrorOverlay("Data is not found");
            console.log("No customer data returned from API.");
          })
        },
    );
  }

  extractMonth(date: any) {
    const month = new Date(date.value).getMonth() + 1;
    return month;
  }

  extractYear(date: any) {
    const year = new Date(date.value).getFullYear();
    return year;
  }

  // pagnations....

  onPaginationChanged(params: any) {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    this.currentPageNumber = currentPage + 1;
    this.currentPageSize = pageSize;
  }

  // Form Close
  close(event: boolean) {
    if (event) {
      this.getPurchaseOrderList();
      this.handleSideDrawer();
      this.PurchaseOrderRowId = 0;
      this._changeDetectorRef.detectChanges();
    } else {
      console.log(event);
    }
  }

  // side Drawer close
  handleSideDrawer(event?: boolean) {
    console.log(event, "aaji idhar aayefa babe");
    if (event === false) {
      this.isSideDrawerOpen = event;
    }
    if (this.isSideDrawerOpen) {
      this.isSideDrawerOpen = false;
    }
  }

  updatePO(event: any): void {
    if (event.event.target.closest(".eye-icon")) {
      const PurchaseOrderRowId = event.event.target.closest(".eye-icon").getAttribute("data-id");
    const viewPurchseOrder= this.dialog.open(PurcheseOrdereViewComponent,{
        width: "700px",
        height: "390px",
        disableClose: true,
        data: PurchaseOrderRowId,
      });
      viewPurchseOrder.afterClosed().subscribe((result) => {
        if (result == true) {
          console.log("Delete confirmed");
        } else {
          console.log("Delete action canceled");
        }
      });
      // alert(PurchaseOrderRowId)
    }
    if (event.event.target.closest(".edit-icon")) {
      const PurchaseOrderRowId = event.event.target.closest(".edit-icon").getAttribute("data-id");
      this.isSideDrawerOpen = true;
      this.formHeading = "Update";
      this.PurchaseOrderRowId = Number(PurchaseOrderRowId);
    }
    if (event.event.target.closest(".delete-icon")) {
      const PurchaseOrderRowId = event.event.target.closest(".delete-icon").getAttribute("data-id");
      this.openDeleteModal(Number(PurchaseOrderRowId));
    }
  }

  openDeleteModal(PurchaseOrderId: number): void {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      width: "400px",
      height: "175px",
      disableClose: true,
      data: "Purchase Order",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        console.log("Delete confirmed");
        this.deleteRow(PurchaseOrderId);
      } else {
        console.log("Delete action canceled");
      }
    });
  }

  deleteRow(PurchaseOrderId: number): void {
    if (!PurchaseOrderId) return;
    // Call API to delete salary
    this._purchaseOrder.deletePOById(PurchaseOrderId).subscribe({
      next: (response: any) => {
        this._successMessage.openFromComponent(SuccessModalComponent, {
          data: { message: response.message },
          duration: 4000, 
          panelClass: ["custom-toast"],
          verticalPosition: "top",
          horizontalPosition: "right",
        });
        this.getPurchaseOrderList();
      },
      error: (err) => {
        console.error("Error deleting row:", err);
      },
    });
  }

  // for Manage Columns start
  allColumns = [...this.columnDefs];
  displayedColumns = [...this.columnDefs];

  toggleColumn(column: any) {
    const columnIndex = this.displayedColumns.findIndex(
      (col) => col.field === column.field,
    );
    if (columnIndex >= 0) {
      this.displayedColumns.splice(columnIndex, 1);
    } else {
      const colToAdd = this.allColumns.find(
        (col) => col.field === column.field,
      );
      if (colToAdd) {
        this.displayedColumns.push(colToAdd);
      }
    }
    this.columnDefs = [...this.displayedColumns];
  }

  isColumnDisplayed(column: any): boolean {
    return this.displayedColumns.some((col) => col.field === column.field);
  }

  // for Manage Columns end

  // show message in table if api is false.. start
  gridOptions = {
    noRowsOverlayComponentParams: {
      noRowsMessageFunc: () => "Data is not found",
    },
  };

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
   
    this.getPurchaseOrderList();

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

  renderActionIcons(params: any): string {
    return ` 
      <div class="action-icons d-flex align-items-center justify-content-around">
      <span class="icon-container text-secondary eye-icon" data-id="${params.data.poid}" style="display: block; width: 20px; height: 20px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
       <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
       <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>

        </span>
        <span class="icon-container text-primary edit-icon" data-id="${params.data.id}" style="display: block; width: 20px; height: 20px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </span>
        <span class="icon-container text-danger delete-icon" data-id="${params.data.id}" style="display: block; width: 20px; height: 20px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </span>
      </div>
    `;
  }

}
