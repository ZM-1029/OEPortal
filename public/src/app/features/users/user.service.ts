import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { userListResponseI } from 'src/app/shared/types/user.type';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUserList() {
    return this.http.get<userListResponseI>(
      `${environment.apiUrl}GetUserList`,
    );
  }
 
  
  getUserById(userId:any) {
    return this.http.get(
      `${environment.apiUrl}GetUserById/${userId}`,
    );
  }

createUser(userData:any) {
    return this.http.post(
      `${environment.apiUrl}AddUser`,userData
    );
  }

updateUser(userData:any) {
    return this.http.post(
      `${environment.apiUrl}UpdateUser`,userData
    );
  }
  // GetUserList
}
