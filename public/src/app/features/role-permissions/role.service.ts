import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
 constructor(private http: HttpClient) { }

 getPermissionsByRoleId(roleId:number) {
    return this.http.get(
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
