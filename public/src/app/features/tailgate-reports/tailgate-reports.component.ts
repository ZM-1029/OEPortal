import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AuditLogsComponent } from 'src/app/shared/components/UI/audit-logs/audit-logs.component';
import { DeleteModalComponent } from 'src/app/shared/components/UI/delete-modal/delete-modal.component';
import { LoaderComponent } from 'src/app/shared/components/UI/loader/loader.component';
import { PageHeaderComponent } from 'src/app/shared/components/UI/page-header/page-header.component';
import { SideDrawerComponent } from 'src/app/shared/components/UI/side-drawer/side-drawer.component';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { purchaseOrdersResponseI } from 'src/app/shared/types/purchaseOrder.type';
import { rolePermissionListI } from 'src/app/shared/types/roles.type';
import { PurchaseOrderCreateComponent } from '../purchaseOrders/purchase-order-create/purchase-order-create.component';
import { PurchaseOrdersService } from '../purchaseOrders/purchase-orders.service';
import { PurcheseOrdereViewComponent } from '../purchaseOrders/purchese-ordere-view/purchese-ordere-view.component';
import { RolePermissionService } from '../role-permissions/role-permission.service';
import { TailgateReportsCreateComponent } from './tailgate-reports-create/tailgate-reports-create.component';
import { TailgateReportsService } from './tailgate-reports.service';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-tailgate-reports',
  imports: [AgGridAngular,
    CommonModule,
    LoaderComponent,
    PageHeaderComponent,
    SideDrawerComponent,
    TailgateReportsCreateComponent],
  templateUrl: './tailgate-reports.component.html',
  styleUrl: './tailgate-reports.component.scss'
})
export class TailgateReportsComponent implements OnInit {
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
  HeadingName: string = "Tailgating Reports";
  rowData: any[] = [];
  public isAuditlogOpen: boolean = false;
  tableRowId: number = 0;
  tailgatingReportsAccess: rolePermissionListI = {
    id: 0,
    formId: 0,
    form: '',
    view: false,
    add: false,
    edit: false
  };


  columnDefs: any = [
    {
      headerName: "S. No",
      valueGetter: "node.rowIndex + 1",
      sortable: false,
      filter: false,
      pinned: "left",
      lockPinned: true,
      minWidth: 100,
      maxWidth: 100,
      cellStyle: () => {
        return { border: "none" };
      },
    },
    {
      field: "employeeId",
      headerName: "Employee Id",
      sortable: true,
      filter: true,
      minWidth: 200,
    },
    {
      field: "employeeName",
      headerName: "Employee Name",
      sortable: true,
      filter: true,
      minWidth: 200,
    },
    // {
    //   field: "ncDate",
    //   headerName: "NC Date",
    //   // cellRenderer: (params: any) => this.extractMonth(params),
    //   sortable: true,
    //   filter: true,
    //   minWidth: 100,
    // },
    {
      field: "ncDate",
      headerName: "Date",
      sortable: true,
      filter: true,
      minWidth: 120,
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      }
    },

    {
      field: "reportingManager",
      headerName: "Reporting Manager",
      sortable: true,
      filter: true,
      minWidth: 200,
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
    private rolePermissionService: RolePermissionService,
    private tailgateReportsService: TailgateReportsService,
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

  getPermissionToAccessPage(roleId: any) {
    this.rolePermissionService.getPermissionsByRoleId(roleId).subscribe({
      next: (response) => {
        if (response.success) {
          for (const tailgatingReportsAccess of response.data) {
            if (tailgatingReportsAccess.form === "Tailgating Reports") {
              this.tailgatingReportsAccess = tailgatingReportsAccess;
              if (this.tailgatingReportsAccess.view) {
                this.getTailgateReport();
              } else {
                this.rowData = [];
                this.showErrorOverlay("You have not permission");
              }
              // Hide "Actions" column if `edit` is false
              if (this.gridApi) {
                this.gridApi.setColumnsVisible(["actions"], this.tailgatingReportsAccess.edit);
              }

              this._changeDetectorRef.detectChanges();
            }
          }
        } else {
          this.handleError("please try again later");
        }
      },
      error: (err) => {
        this.handleError("please try again later");
      },
    });
  }

  getTailgateReport() {
    this.tailgateReportsService.GetTailgatingNCList()
      .subscribe(
        {
          next: ((result: any) => {
            if (result.success) {
              this.rowData = result.data;
              this._changeDetectorRef.detectChanges();
            } else {
              this.rowData = [];
              this.gridApi.hideOverlay();
              this.showErrorOverlay("Data is not found");
              console.log("No customer data returned from API.");
            }
          }), error: ((err) => {
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
      this.getTailgateReport();
      this.handleSideDrawer();
      this.PurchaseOrderRowId = 0;
      this._changeDetectorRef.detectChanges();
    } else {
      console.log(event);
    }
  }

  // side Drawer close
  handleSideDrawer(event?: boolean) {
    if (event === false) {
      this.isSideDrawerOpen = event;
    }
    if (this.isSideDrawerOpen) {
      this.isSideDrawerOpen = false;
    }
  }
  handleSideDrawerLogs(event?: boolean) {
    if (this.isAuditlogOpen) {
      this.isAuditlogOpen = false;
    } else {
      this.isAuditlogOpen = true;
    }
  }

  // show message in table if api is false.. start
  gridOptions = {
    noRowsOverlayComponentParams: {
      noRowsMessageFunc: () => "Data is not found",
    },
  };

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
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
  // show message in table if api is false.. end

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

  isColumnDisplayed(column: any): boolean {
    return this.displayedColumns.some((col) => col.field === column.field);
  }

  preventClose(event: MouseEvent) {
    event.stopPropagation();
  }
  // for Manage Columns end

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
