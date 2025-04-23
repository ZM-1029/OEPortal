import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, GridApi, GridReadyEvent } from 'ag-grid-community';
import { LoaderComponent } from 'src/app/shared/components/UI/loader/loader.component';
import { PageHeaderComponent } from 'src/app/shared/components/UI/page-header/page-header.component';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { RoleService } from '../role.service';
import { MatDialog } from '@angular/material/dialog';
import { RoleCreateComponent } from '../role-create/role-create.component';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-role-list',
  imports: [AgGridAngular,
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    LoaderComponent,
    MatButtonModule,],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss'
})
export class RoleListComponent implements OnInit{
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  private gridApi!: GridApi<any>;
  rowData: any[]=[];
  HeadingName: string = "Roles";

  columnDefs: any = [
    {
      headerName: "S. No",
      valueGetter: "node.rowIndex + 1",
      sortable: true,
      filter: true,
      maxWidth: 100,
      pinned: "left",
    },
    {
      field: "name",
      headerName: "Name",
      sortable: true,
      filter: true,
      minWidth: 120,
      
    },
    
  ];


  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  };



  constructor(
    private roleService: RoleService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _successMessage: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  
  ngOnInit(): void {
    this.pageHeader_employee(this.HeadingName);
    
  }

  pageHeader_employee(employeeHeadingName: string) {
    this.HeadingName = employeeHeadingName;
  }

 
  getActiveRoles(){
    this.roleService.getActiveRoles().subscribe(
      {
        next:((response:any)=>{
          if(response.success){
            this.rowData=response.data
            this._changeDetectorRef.detectChanges();
          }else{
            this.rowData=[];
            this.showErrorOverlay("Data is not found")
          }
        }),
        error:((err)=>{
          this.rowData=[];
          this.showErrorOverlay("Data is not found")
        })
      }
    )
  }

  // it show message when api is false .... start

    createRole(): void {
      const dialogRef = this.dialog.open(RoleCreateComponent, {
        width: "400px",
        height: "150px",
        disableClose: true,
        data: "role",
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result == true) {
          console.log("create role");
          this.getActiveRoles();
        } else {
          console.log("not create  role");
        }
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
    this.getActiveRoles();
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
          overlay.innerHTML = `<span style="color: red; font-weight: bold;">${message}</span>`;
        }
        this._changeDetectorRef.detectChanges();
      }, 100);
    }
  }

   // it show message when api is false .... end

  onPaginationChanged(params: any) {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    this.currentPageNumber = currentPage + 1;
    this.currentPageSize = pageSize;
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
