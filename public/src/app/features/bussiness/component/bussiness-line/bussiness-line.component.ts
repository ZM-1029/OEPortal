
import { ChangeDetectorRef, Component, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, GridApi, GridReadyEvent, ModuleRegistry } from 'ag-grid-community';
import { MatButtonModule } from '@angular/material/button';

// Import your form component

import { AddBussinessComponent } from '../add-bussiness/add-bussiness.component';
import { SideDrawerComponent } from 'src/app/shared/components/UI/side-drawer/side-drawer.component';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { DeleteModalComponent } from 'src/app/shared/components/UI/delete-modal/delete-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { PageHeaderComponent } from 'src/app/shared/components/UI/page-header/page-header.component';
import { Route, Router } from '@angular/router';
import { BussinessService } from '../../bussiness.service';
ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-bussiness-line',
  standalone: true, 
  imports: [
    CommonModule,
    AgGridAngular,
    MatButtonModule,
    AddBussinessComponent,
    SideDrawerComponent,
    PageHeaderComponent,
    
  ],
  templateUrl: './bussiness-line.component.html',
  styleUrl: './bussiness-line.component.scss'
})
export class BussinessLineComponent {
  
















  columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Business', sortable: true, filter: true },
    { field: 'description', headerName: 'Discription', sortable: true, filter: true },
    
    
    {
      headerName: 'Actions',
      cellRenderer: (params: any) => this.renderActionIcons(params),
      onCellClicked: (params) => this.updateBussiness(params)
    }
  ];


  defaultColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  rowData: any[] = [];
  private gridApi!: GridApi<any>;
  private _unsubscribeAll$: Subject<any> = new Subject<any>();
  public isSideDrawerOpen: boolean = false;
  public bussinesid: number = 0;

  constructor(
    private _route:Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private apiservice:BussinessService
  ) {}



  openAddCountryDrawer(): void {
    this.bussinesid = 0;  // Set ID to 0 for adding a new country
    this.isSideDrawerOpen = true;
  }

  closeSideDrawer(): void {
    this.isSideDrawerOpen = false;
    this.getbussiness(); // Refresh country list after closing
  }

  formClose(event: any) {
    this.sideDrawer();
    if (event) {
      this.getbussiness();
      this.bussinesid = 0;
    }
  }

  ngOnInit(): void {
    this.getbussiness();
  }

  getbussiness() {
  
    this.apiservice.getService().subscribe({next:(data:any)=>{
      this.rowData=data.data;
      this._changeDetectorRef.detectChanges();
    }})

    
     
  }
  sideDrawer() {
    if (this.isSideDrawerOpen) {
      this.isSideDrawerOpen = false;
      this._changeDetectorRef.detectChanges();
    }
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.gridApi.hideOverlay();
    this.getbussiness();
  }

  renderActionIcons(params: any): string {
    return `
      <div class="action-icons d-flex align-items-center justify-content-around">
        <span class="icon-container text-primary edit-icon" data-id="${params.data.id}" style="display: block; width: 20px; height: 20px; cursor:pointer">
          <i style="cursor:pointer; font-size:1.2rem" class="fa-solid fa-eye"></i>
        </span>
       
      </div>
    `;
  }


  updateBussiness(event: any): void {   
      this.bussinesid = Number(event.data.id);
      this._route.navigate(["/admin/business", this.bussinesid]);
  }

  openDeleteModal(bussinesid: number): void {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      width: "400px",
      height: "175px",
      disableClose: true,
      data: "Country",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteRow(bussinesid);
      }
    });
  }

  deleteRow(id: number) {
    // this._countryService.deleteCountryById(id).subscribe({
    //   next: (response: any) => {
    //     this.showSuccessMessage(response.message);
    //     this.getCountryList();
    //   },
    //   error: (err) => {
    //     this.showErrorMessage(err);
    //   },
    // });
  }

  showSuccessMessage(message: string) {
    this._snackBar.openFromComponent(SuccessModalComponent, {
      data: { message },
      duration: 4000,
      panelClass: ["custom-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }

  showErrorMessage(err: any) {
    this._snackBar.open(err.error.message, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }

  showErrorOverlay(message: string) {
    if (this.gridApi) {
      this.gridApi.showNoRowsOverlay();
      setTimeout(() => {
        const overlay = document.querySelector(".ag-overlay-no-rows-center");
        if (overlay) overlay.innerHTML = `<span style="color: #2e3b64; font-weight: bold;">${message}</span>`;
        this._changeDetectorRef.detectChanges();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll$.next(null);
    this._unsubscribeAll$.complete();
  }
}
