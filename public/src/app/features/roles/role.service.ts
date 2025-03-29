import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private http: HttpClient) { }

  getActiveRoles() {
     return this.http.get(
       `${environment.apiUrl}GetActiveRoles`,
     );
   }

  createRole(name:any) {
     return this.http.post(
       `${environment.apiUrl}AddRole`,name
     );
   }
}
