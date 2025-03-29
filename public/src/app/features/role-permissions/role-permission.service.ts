import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { rolePermissionResponseI } from 'src/app/shared/types/roles.type';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService {
  constructor(private http: HttpClient) { }

  getPermissionsByRoleId(roleId:number) {
     return this.http.get<rolePermissionResponseI>(
       `${environment.apiUrl}GetRolePermission?roleId=${roleId}`,
     );
   }
 
   addPermission(roleId:number,data:any){
     return this.http.post(
       `${environment.apiUrl}ChangeRolePermission?roleId=${roleId}`,data
     );
   }
 
   getActiveRoles(){
     return this.http.get(
       `${environment.apiUrl}GetActiveRoles`,
     );
   }
   // ChangeRolePermission?roleId=1
}
