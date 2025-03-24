import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { AllCommunityModule, GridApi, GridReadyEvent, ModuleRegistry } from "ag-grid-community";
import { CommonModule } from "@angular/common";
import { PageHeaderComponent } from "../../../shared/components/UI/page-header/page-header.component";
import { LoaderComponent } from "../../../shared/components/UI/loader/loader.component";
import { SideDrawerComponent } from "../../../shared/components/UI/side-drawer/side-drawer.component";
import { MatDialog } from "@angular/material/dialog";
import { DeleteModalComponent } from "../../../shared/components/UI/delete-modal/delete-modal.component";
import { Subject } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { ItemsService } from "../items.service";
import { ItemCreateComponent } from "../item-create/item-create.component";
import { Item, ItemsListI } from "src/app/shared/types/items.type";

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-items-list',
  imports: [
    AgGridAngular,
    CommonModule,
    LoaderComponent,
    PageHeaderComponent,
    SideDrawerComponent,
    ItemCreateComponent,
  ],
  templateUrl: './items-list.component.html',
  styleUrl: './items-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsListComponent {
  columnDefs: any = [
    {
      headerName: "Name",
      field: "name",
      sortable: false,
      filter: false,
      pinned: "left",
      minWidth: 100,
      maxWidth: 100,
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params: any) => this.renderActionIcons(params),
      minWidth: 100,
      maxWidth: 100,
      cellClass: "hover-effect-cell",
      pinned: "right",
      sortable: false,
      filter: false,
      cellStyle: () => {
        return { border: "none" };
      },
    },

    {
      field: "sku",
      headerName: "SKU",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "hsnCode",
      headerName: "HSN Code",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "unit",
      headerName: "Unit",
      sortable: true,
      filter: true,
      minWidth: 200,
    },
    {
      field: "businessLine",
      headerName: "Business Line",
      sortable: true,
      filter: true,
      minWidth: 200,
    },
    {
      field: "isService",
      headerName: "Type",
      sortable: true,
      filter: true,
      minWidth: 200,
      cellRenderer: (params: any) => {
        return params.value ? 'Good' : 'Service';
      },
    },
    {
      field: "salesPrice",
      headerName: "Sales Price",
      sortable: true,
      filter: true,
      minWidth: 270,
    },
    {
      field: "costPrice",
      headerName: "Cost Price",
      sortable: true,
      filter: true,
      minWidth: 270,
    },


  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  };

  public totalCount: number = 0;
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public productId: number = 0;
  public isSideDrawerOpen: boolean = false;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  HeadingName: string = "Product";
  rowData: Item[] = [];
  private gridApi!: GridApi<any>;
  private _unsubscribeAll$: Subject<any> = new Subject<any>();
  constructor(
    private _itemService: ItemsService,
    private _changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private _successMessage: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.pageHeader_product(this.HeadingName);
  }
  addProduct(event: Event) {
    this.productId = 0;
    this.isSideDrawerOpen = true;
  }
  pageHeader_product(productHeadingName: string) {
    this.HeadingName = productHeadingName;
  }
  getProductList() {
    this._itemService.getProductList().subscribe((result: ItemsListI) => {
      if (result.success) {
        this.rowData = result.data;
        this.totalCount = result.data.length;
        this._changeDetectorRef.detectChanges();
      } else {
        this.rowData = [];
        this.showErrorOverlay('Data is not found');
        console.log('No product data returned from API.');
      }
    });
  }
  export(event: Event) {
    alert("export");
  }

  formClose(event: any) {
    this.sideDrawer();
    if (event) {
      this.getProductList();
      this.productId = 0;
    }
  }
  sideDrawer() {
    if (this.isSideDrawerOpen) {
      this.isSideDrawerOpen = false;
      this._changeDetectorRef.detectChanges();
    }
  }
  updateProduct(event: any): void {
    if (event.event.target.closest(".edit-icon")) {
      const productId = event.event.target.closest(".edit-icon").getAttribute("data-id");
      console.log(productId, 'productId')
      this.productId = Number(productId);
      this.isSideDrawerOpen = true;
    }
    if (event.event.target.closest(".delete-icon")) {
      const productId = event.event.target.closest(".delete-icon").getAttribute("data-id");
      this.openDeleteModal(Number(productId));
    }
  }
  openDeleteModal(productId: number): void {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      width: "400px",
      height: "175px",
      disableClose: true,
      data: "Product",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        console.log("Delete confirmed");
        // this.deleteRow(productId);
      } else {
        console.log("Delete action canceled");
      }
    });
  }
  // deleteRow(id: number) {
  //   this._itemService.deleteCustomerById(id).subscribe({
  //     next: (response: any) => {
  //       this.showSuccessMessage(response.message);
  //       this.getProductList();
  //     },
  //     error: (err) => {
  //       this.handleError(err);
  //       console.error("Error deleting row:", err);
  //     },
  //   });
  // }
  onPaginationChanged(params: any) {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    this.currentPageNumber = currentPage + 1;
    this.currentPageSize = pageSize;
  }
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
  gridOptions = {
    noRowsOverlayComponentParams: {
      noRowsMessageFunc: () => "Data is not found",
    },
  };

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.gridApi.hideOverlay();
    this.getProductList();
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
  renderActionIcons(params: any): string {
    return `
      <div class="action-icons d-flex align-items-center justify-content-around">
        <span class="icon-container text-primary edit-icon" data-id="${params.data.id}" style="display: block; width: 20px; height: 20px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </span>
      </div>
    `;
  }
  private showSuccessMessage(message: string) {
    this._successMessage.openFromComponent(SuccessModalComponent, {
      data: { message },
      duration: 4000,
      panelClass: ["custom-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
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

  ngOnDestroy(): void {
    this._unsubscribeAll$.next(this._itemService);
    this._unsubscribeAll$.complete();
  }
}

