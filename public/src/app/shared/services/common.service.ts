import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { getMenuMasterI } from '../types/sidebar.type';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
constructor(private http: HttpClient) {}

GetMenuMasterList(roleId:string|null) {
    return this.http.get<getMenuMasterI>(
      `${environment.apiUrl}GetMenuMasterList?roleId=${roleId}`,
    );
  }
  // GetMenuMasterList?roleId=1
  // GetMenuMasterList(){

  // }
}
