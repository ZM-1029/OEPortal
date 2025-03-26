
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </span>
       
      </div>
    `;
  }


  updateBussiness(event: any): void {
    debugger
   
      this.bussinesid = Number(event.data.id);
      this._route.navigate(["/admin/bussiness", this.bussinesid]);

    
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
