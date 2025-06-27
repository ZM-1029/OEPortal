import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { RolePermissionService } from '../role-permission.service';
import { MarketingService } from '../../marketing/marketing.service';
import { MarketingList, marketingListCheckBoxValueI } from 'src/app/shared/types/marketing.type';
import { MatOptionModule } from '@angular/material/core';

interface Role {
  id: number;
  name: string;
}


interface RolePermission {
  id: number;
  formId: number;
  form: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  isDownload: boolean
}

interface RolePermissionResponse {
  success: boolean;
  message: string;
  data: RolePermission[];
}
@Component({
  selector: 'app-role-permission',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    AsyncPipe,
    MatInputModule,
    MatListModule, MatTabsModule, 
    NgClass,
    NgFor, NgIf, MatOptionModule,
  ],
  templateUrl: './role-permission.component.html',
  styleUrl: './role-permission.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolePermissionComponent implements OnInit {
  // Searchable Dropdown - Start
  roleControl = new FormControl<string | Role>('');
  rolesList: Role[] = [];
  filteredRoles!: Observable<Role[]>;
  marketingList: MarketingList[] = []
  marketingListCheckBoxValue: marketingListCheckBoxValueI[] = []
  // Searchable Dropdown - End
  public menuData: any[] = [];
  public roles = new FormControl('');
  public formStates: { formId: number; view: boolean; add: boolean; edit: boolean; roleId: number }[] = [];
  private selectedRoleId?: number;
  selectedRole: number = 0;
  roleId: number = 0;
  isPDFDownloadOptionShow: boolean = false;
  isDisabled: boolean = true;
  private permissions: RolePermission[] = [];

  constructor(private rolePermissionService: RolePermissionService,
    private _changeDetectorRef: ChangeDetectorRef, private marketingService: MarketingService,
    private _successMessage: MatSnackBar,) { }

  ngOnInit(): void {
    this.roleId = Number(localStorage.getItem('role'));
    this.getRoles();
    if (this.roleId) {
      this.fetchRolePermissions(this.roleId);
    }
  }

  // Fetch Roles List
  getRoles() {
    this.rolePermissionService.getActiveRoles().subscribe((response: any) => {
      if (response.success) {
        this.rolesList = response.data;
        this.initializeFilter();
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  // Searchable Dropdown - Start
  initializeFilter() {
    this.filteredRoles = this.roleControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterRoles(name) : this.rolesList.slice();
      })
    );
  }

  private _filterRoles(name: string): Role[] {
    const filterValue = name.toLowerCase();
    return this.rolesList.filter(role => role.name.toLowerCase().includes(filterValue));
  }

  displayRoleFn(role: Role): string {
    return role ? role.name : '';
  }

  onRoleSelected(event: MatAutocompleteSelectedEvent) {
    const selectedRole = event.option.value;
    this.selectedRole = selectedRole.id
    this.fetchRolePermissions(selectedRole.id);
    this.getMarketingList();
    this.GetPermissionsByRoleIdForMarketing(this.selectedRole);
  }

  fetchRolePermissions(roleId: any) {
    if (roleId == 1) {
      this.rolePermissionService.getPermissionsByRoleId(roleId).subscribe((response: any) => {
        if (response.success && response.data !== null) {
          this.menuData = response.data.map((item: any) => ({
            ...item,
            view: false,
            add: false,
            edit: false,
            isDownload: false
          }));
          this.permissions = response.data;
          this.isDisabled=true;
          this._changeDetectorRef.detectChanges();
        }
      });
    } else {
      this.rolePermissionService.getPermissionsByRoleId(roleId).subscribe((response: any) => {
        if (response.success && response.data !== null) {
          this.menuData = response.data.map((item: any) => ({
            ...item,
            view: !!item.view,
            add: !!item.add,
            edit: !!item.edit,
            disabled: true
          }));
          this.isDisabled=false;
          this._changeDetectorRef.detectChanges();
        }
      });
    }
  }

  savePermission() {
    const updatedPermissions = this.menuData.map(menu => ({
      roleId: Number(this.selectedRole),
      formId: menu.formId,
      isActive: true,
      view: menu.view,
      add: menu.add,
      edit: menu.edit,
      isDownload: menu.isDownload
    }));

    const marketingPayload = this.marketingListCheckBoxValue
      .filter(item => (item.isView || item.isDownload) && item.marketingId !== 0)
      .map(item => ({
        roleId: this.selectedRole,
        marketingId: item.marketingId,
        isView: item.isView,
        isDownload: item.isDownload
      }));


    this.rolePermissionService.changePermission(marketingPayload).subscribe({
      next: (response: any) => {
        if (response.success) {
          // this.showSuccessMessage(response.message);
          this.marketingListCheckBoxValue = this.marketingListCheckBoxValue.map(item => ({
            ...item,
            isView: false,
            isDownload: false
          }));
          this._changeDetectorRef.detectChanges();
        } else {
          this.handleError(response.message);
        }
      },
      error: (err) => {
        this.handleError(err?.error?.message || 'Something went wrong.');
      }
    });

    if (this.selectedRole > 1) {
      this.rolePermissionService.addPermission(this.selectedRole, updatedPermissions).subscribe(
        {
          next: ((response: any) => {
            if (response.success) {
              this.showSuccessMessage(response.message);
              // Reset all checkboxes
              this.menuData = this.menuData.map(item => ({
                ...item,
                view: false,
                add: false,
                edit: false,
                isDownload: false
              }));
              // Clear selected role
              this.selectedRole = 0;
              this.roleControl.reset();
              this.roleControl.setValue('');
              this.isDisabled=true;
              this._changeDetectorRef.detectChanges();
            } else {
              this.handleError(response.message)
            }
          }), error: ((err) => {
            console.log(err.error);
            this.handleError(err.error.message)
          })

        }
      )
    }
  }

  // getMarketingList with Permission of marketing view start
  getMarketingList() {
    this.marketingService.getMarketingList().subscribe(
      {
        next: ((response) => {
          if (response.success) {
            this.marketingList = response.data
            this._changeDetectorRef.detectChanges();
          } else {
            this.marketingList = [];
            this.handleError(response.message);
          }
        }),
        error: ((err) => {
          this.handleError(err.error);
        })
      }
    )
  }

  // TrackBy function for ngFor
  trackByMenu(index: number, item: any): number {
    return item.formId;
  }

  // Function to handle checkbox changes
  onCheckboxChange(event: any, menu: any, permissionType: string) {
    menu[permissionType] = event.checked;
    if (menu.form == 'Marketing') {
      // this.isPDFDownloadOptionShow=true;
      if (menu.view) {
        this.getMarketingList();
        this.GetPermissionsByRoleIdForMarketing(this.selectedRole);
      }
    } else {
      // this.isPDFDownloadOptionShow=false;
    }
    console.log(`${permissionType} permission changed for ${menu.form}:`, menu[permissionType]);
  }

  getMarketingValue(marketingId: any, valueName: 'isView' | 'isDownload'): boolean {
    const item = this.marketingListCheckBoxValue.find(
      (item) => item.marketingId === marketingId
    );
    const value = !!item?.[valueName];
    return value;
  }
  onCheckboxChangeMarketing(event: MatCheckboxChange, marketingId: number, permissionType: 'isView' | 'isDownload') {
    if (!marketingId) return;

    let existing = this.marketingListCheckBoxValue.find(x => x.marketingId === marketingId);

    if (existing) {
      existing[permissionType] = event.checked;
    } else {
      const newPermission: marketingListCheckBoxValueI = {
        id: 0,
        roleId: this.selectedRole,
        marketingId: marketingId,
        isView: permissionType === 'isView' ? event.checked : false,
        isDownload: permissionType === 'isDownload' ? event.checked : false
      };
      this.marketingListCheckBoxValue.push(newPermission);
    }
  }

  GetPermissionsByRoleIdForMarketing(roleId: number) {
    this.rolePermissionService.GetPermissionsByRoleIdForMarketing(roleId).subscribe(
      {
        next: ((response: any) => {
          this.marketingListCheckBoxValue = response;
        }),
        error: ((error) => {
          console.error(error);
        })
      }
    )
  }
  // getMarketingList with Permission of marketing view end


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
    this._successMessage.open(err, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
}
