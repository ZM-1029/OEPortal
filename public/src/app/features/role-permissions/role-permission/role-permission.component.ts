import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { RoleService } from '../role.service';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';

interface Role {
  id: number;
  name: string;
}

interface Menu {
  form: string;
  view: boolean;
  edit: boolean;
  add: boolean;
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
    MatListModule, MatTabsModule, NgFor
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
  // Searchable Dropdown - End

  public menuData: any[] = [];
  public roles = new FormControl('');
  public formStates: { formId: number; view: boolean; add: boolean; edit: boolean; roleId: number }[] = [];
  private selectedRoleId?: number;
  selectedRole: number = 0;
  roleId:number=0;
  menuChackbox: Menu[] = [
    { form: 'Dashboard', view: false, edit: false, add: false },
    { form: 'Users', view: false, edit: false, add: false },
    { form: 'Reports', view: false, edit: false, add: false }
  ];

  constructor(private roleService: RoleService, private _changeDetectorRef: ChangeDetectorRef,private _successMessage: MatSnackBar,) { }

  ngOnInit(): void {
    this.roleId = Number(localStorage.getItem('role')) ;
    console.log(this.roleId,"tttt");
    
    this.getRoles();
    if (this.roleId) {
      this.fetchRolePermissions(this.roleId);
    }
  }

  // Fetch Roles List
  getRoles() {
    this.roleService.getActiveRoles().subscribe((response: any) => {
      if (response.success) {
        this.rolesList = response.data;
        console.log(this.rolesList, "Role List");
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
    console.log('Selected Role ID:', this.selectedRole);
    // this.fetchRolePermissions(selectedRole.id);
  }
  // Searchable Dropdown - End

  // fetchRolePermissions(roleId: any) {
  //   this.roleService.getPermissionsByRoleId(roleId).subscribe((response: any) => {
  //     if (response.success && response.data !== null) {
  //       this.menuData = response.data.map((item: any) => ({
  //         ...item,
  //         view: !!item.view,  
  //         add: !!item.add,
  //         edit: !!item.edit
  //       }));
  //       console.log(this.menuData, "Menu Data");
  //       this._changeDetectorRef.detectChanges();
  //     }
  //   });
  // }

  fetchRolePermissions(roleId: any) {
    if (roleId == 1) {
      this.roleService.getPermissionsByRoleId(roleId).subscribe((response: any) => {
        if (response.success && response.data !== null) {
          this.menuData = response.data.map((item: any) => ({
            ...item,
            view: false,  
            add: false,
            edit: false
          }));
          console.log(this.menuData, "Menu Data with all checkboxes unchecked");
          this._changeDetectorRef.detectChanges();
        }
      });
    } else {
      this.roleService.getPermissionsByRoleId(roleId).subscribe((response: any) => {
        if (response.success && response.data !== null) {
          this.menuData = response.data.map((item: any) => ({
            ...item,
            view: !!item.view,
            add: !!item.add,
            edit: !!item.edit,
            disabled: true
          }));
          console.log(this.menuData, "Menu Data");
          this._changeDetectorRef.detectChanges();
        }
      });
    }
  }


  // TrackBy function for ngFor
  trackByMenu(index: number, item: any): number {
    return item.formId;
  }

  // Function to handle checkbox changes
  onCheckboxChange(event: any, menu: any, permissionType: string) {
    menu[permissionType] = event.checked;
    console.log(`${permissionType} permission changed for ${menu.form}:`, menu[permissionType]);
  }


  savePermission() {
    const updatedPermissions = this.menuData.map(menu => ({
      roleId: Number(this.selectedRole),
      formId: menu.formId,
      isActive: true,
      view: menu.view,
      add: menu.add,
      edit: menu.edit
    }));

    if (this.selectedRole > 1) {
      this.roleService.addPermission(this.selectedRole, updatedPermissions).subscribe(
        {
          next: ((response: any) => {
            if (response.success) {
              // alert(response.message);
              console.log(response.message);
            } else {
              console.log(response.message);
            }
          }), error: ((err) => {
            console.log(err);
          })

        }
      )
    }
    console.log('Updated Permissions:', updatedPermissions);
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
    this._successMessage.open(err.error.message, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
}
