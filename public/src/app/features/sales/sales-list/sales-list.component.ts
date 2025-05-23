import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { AllCommunityModule, GridApi, GridReadyEvent, ModuleRegistry } from "ag-grid-community";
import { CommonModule } from "@angular/common";
import { PageHeaderComponent } from "../../../shared/components/UI/page-header/page-header.component";
import { LoaderComponent } from "../../../shared/components/UI/loader/loader.component";
import { SideDrawerComponent } from "../../../shared/components/UI/side-drawer/side-drawer.component";
import { Subject } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { SaleCreateComponent } from '../sale-create/sale-create.component';
import { SalesService } from '../sales.service';
import { Quotation, QuotationListI } from "src/app/shared/types/sales.type";
import moment from 'moment';
import { ApproveQuatationComponent } from "../approve-quatation/approve-quatation.component";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute, Router } from "@angular/router";
import { RolePermissionService } from "../../role-permissions/role-permission.service";
import { rolePermissionListI } from "src/app/shared/types/roles.type";
ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-sales-list',
  imports: [AgGridAngular,
    CommonModule,
    LoaderComponent,
    PageHeaderComponent, MatIconModule,],
  templateUrl: './sales-list.component.html',
  styleUrl: './sales-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesListComponent {
  columnDefs: any = [
    {
      headerName: "S. No",
      valueGetter: "node.rowIndex + 1",
      sortable: false,
      filter: false,
      maxWidth: 100,
      minWidth: 100,
      pinned: "left",
    },
    {
      headerName: "Quotation No.",
      field: "quotationNumber",
      sortable: true,
      filter: true,
      pinned: "left",
      minWidth: 140,
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
        return { border: "none", cursor: "pointer" };
      },
    },
    {
      field: "salesOrderDate",
      headerName: "Sales Order Date",
      sortable: true,
      filter: true,
      minWidth: 170,
      valueFormatter: (params: any) => {
        const formattedDate = moment(params.value).format('DD/MM/YYYY');
        return formattedDate;
      },
    },
    {
      field: "total",
      headerName: "Total",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "customerName",
      headerName: "Customer Name",
      sortable: true,
      filter: true,
      minWidth: 200,
    },
    {
      field: "statusName",
      headerName: "Status Name",
      sortable: true,
      filter: true,
      minWidth: 200,
    }
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
  public quotationId: number = 0;
  public isSideDrawerOpen: boolean = false;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  HeadingName: string = "Quotation";
  rowData: Quotation[] = [];
  private gridApi!: GridApi<any>;
  private _unsubscribeAll$: Subject<any> = new Subject<any>();
  selectedQuotationId: number | null = null;
  isApprovePopupOpen: boolean = false;
  quotationAccess: rolePermissionListI = {
    id: 0,
    formId: 0,
    form: '',
    view: false,
    add: false,
    edit: false
  };

  constructor(
    private _salesService: SalesService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _successMessage: MatSnackBar,
    private router: Router, private route: ActivatedRoute,
    private rolePermissionService: RolePermissionService,
  ) { }

  ngOnInit(): void {
    this.pageHeader_quotation(this.HeadingName);
  }


  getPermissionToAccessPage(roleId: any) {
    this.rolePermissionService.getPermissionsByRoleId(roleId).subscribe({
      next: (response) => {
        if (response.success) {
          for (const quotationAccess of response.data) {
            if (quotationAccess.form === "Sales Order") {
              this.quotationAccess = quotationAccess;
              if (this.quotationAccess.view) {
                this.getQuotationList();
              } else {
                this.rowData = [];
                this.showErrorOverlay("You have not permission");
              }
              // Hide "Actions" column if `edit` is false
              if (this.gridApi) {
                this.gridApi.setColumnsVisible(["actions"], this.quotationAccess.edit);
              }

              this._changeDetectorRef.detectChanges();
            }
          }
        } else {
          this.handleError("please try again leter");
        }
      },
      error: (err) => {
        this.handleError("please try again leter");
      },
    });
  }


  addQuotation(event: Event) {
    this.quotationId = 0;
    // this.isSideDrawerOpen = true;
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  pageHeader_quotation(quotationHeadingName: string) {
    this.HeadingName = quotationHeadingName;
  }

  getQuotationList() {
    this._salesService.getQuotationList().subscribe((result: QuotationListI) => {
      if (result.success) {
        this.rowData = result.data;
        this.totalCount = result.data.length;
        this._changeDetectorRef.detectChanges();
      } else {
        this.rowData = [];
        this.showErrorOverlay('Data is not found');
      }
    });
  }

  formClose(event: any) {
    this.sideDrawer();
    if (event) {
      this.getQuotationList();
      this.quotationId = 0;
    }
  }

  sideDrawer() {
    if (this.isSideDrawerOpen) {
      this.isSideDrawerOpen = false;
      this._changeDetectorRef.detectChanges();
    }
    if (this.isApprovePopupOpen) {
      this.isApprovePopupOpen = false;
      this._changeDetectorRef.detectChanges();
    }
  }

  // updateQuotation(event: any): void {
  //   const target = event.event.target;
  //   if (target.closest(".edit-icon")) {
  //     const quotationId = target.closest(".edit-icon").getAttribute("data-id");
  //     this.quotationId = Number(quotationId);
  //     this.isSideDrawerOpen = true;
  //   }

  //   if (target.closest(".download-icon")) {
  //     const quotationId = target.closest(".download-icon").getAttribute("data-id");
  //     this.downloadPDF(Number(quotationId));
  //   }

  //   if (target.closest(".approve-icon")) {
  //     const quotationId = target.closest(".approve-icon").getAttribute("data-id");
  //     this.quotationId = Number(quotationId);
  //     this.isApprovePopupOpen = true;
  //   }

  //   if (target.closest(".download-invoice-icon")) {
  //     const invoiceURL = target.closest(".download-invoice-icon").getAttribute("data-url");
  //     this.downloadInvoice(invoiceURL);
  //   }
  // }

  updateQuotation(event: any): void {
    const target = event.event.target;
    const rowData = event.data;

    if (target.closest(".edit-icon")) {
      if (rowData.statusName?.toLowerCase() === 'closed') {
        return; // Don't allow editing closed status
      }
      const quotationId = target.closest(".edit-icon").getAttribute("data-id");
      this.quotationId = Number(quotationId);
      this.router.navigate(['edit', quotationId], { relativeTo: this.route });
    }

    // const target = event.event.target;
    // if (target.closest(".edit-icon")) {
    //   const quotationId = target.closest(".edit-icon").getAttribute("data-id");
    //   this.quotationId = Number(quotationId);
    //   this.router.navigate(['edit', quotationId], { relativeTo: this.route });
    // }

    if (target.closest(".download-icon")) {
      const quotationId = target.closest(".download-icon").getAttribute("data-id");
      this.downloadPDF(Number(quotationId));
    }

    if (target.closest(".approve-icon")) {
      const quotationId = target.closest(".approve-icon").getAttribute("data-id");
      this.router.navigate([quotationId], { relativeTo: this.route });
    }

    if (target.closest(".download-invoice-icon")) {
      const invoiceURL = target.closest(".download-invoice-icon").getAttribute("data-url");
      this.downloadInvoice(invoiceURL);
    }
  }



  downloadInvoice(url: string) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = url.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  onPaginationChanged(params: any) {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    this.currentPageNumber = currentPage + 1;
    this.currentPageSize = pageSize;
  }

  gridOptions = {
    noRowsOverlayComponentParams: {
      noRowsMessageFunc: () => "Data is not found",
    },
  };

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.gridApi.hideOverlay();
    this.getPermissionToAccessPage(Number(localStorage.getItem('role')));
    if (this.rowData.length == 0) {
      setTimeout(() => {
        if (this.gridApi) {
          this.showErrorOverlay("Data is not found");
        }
      });
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

  renderActionIcons(params: any): string {
    const isClosed = params.data.statusName?.toLowerCase() === 'closed';

    const editIcon = isClosed
      ? '' // No edit icon for "Closed" status
      : `<span class="icon-container text-primary edit-icon" data-id="${params.data.id}" style="display: block; width: 20px; height: 20px;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
      </span>`;

    const approveIcon = `<span class="icon-container text-success approve-icon" data-id="${params.data.id}" style="display: block; width: 20px; height: 20px; cursor: pointer;">
     <i style="color: rgba(var(--bs-primary-rgb), var(--bs-text-opacity)) !important;font-size:1rem" class="fa-solid fa-file-pen"></i>
     </span>`;

    return `
    <div class="action-icons d-flex align-items-center justify-content-around">
      ${editIcon}
      ${approveIcon}
    </div>
  `;
  }


  // renderActionIcons(params: any): string {
  //   const approveIcon = `<span class="icon-container text-success approve-icon" data-id="${params.data.id}" style="display: block; width: 20px; height: 20px; cursor: pointer;">
  //      <i style="color: rgba(var(--bs-primary-rgb), var(--bs-text-opacity)) !important;font-size:1rem" class="fa-solid fa-file-pen"></i>
  //   </span>`;
  //   return `
  //     <div class="action-icons d-flex align-items-center justify-content-around">
  //       <span class="icon-container text-primary edit-icon" data-id="${params.data.id}" style="display: block; width: 20px; height: 20px;">
  //         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  //           <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  //         </svg>
  //       </span>
  //       ${approveIcon}  
  //     </div>
  //   `;
  // }


  downloadPDF(quotationId: number): void {
    this._salesService.downloadPDF(quotationId).subscribe({
      next: (response: any) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Quotation_${quotationId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this._successMessage.open(error, 'Close', {
          duration: 3000,
          panelClass: ['error-toast'],
        });
      },
    });
  }

  // for Manage Columns start
  allColumns = [...this.columnDefs];
  displayedColumns = [...this.columnDefs];

  // Toggle column selection
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

  // Check if column is displayed
  isColumnDisplayed(column: any): boolean {
    return this.displayedColumns.some((col) => col.field === column.field);
  }

  // Prevent dropdown from closing while allowing checkbox toggle
  preventClose(event: MouseEvent) {
    event.stopPropagation();
  }
  // for Manage Columns end

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
    this._successMessage.open(err.error.message, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll$.next(this._salesService);
    this._unsubscribeAll$.complete();
  }
}


