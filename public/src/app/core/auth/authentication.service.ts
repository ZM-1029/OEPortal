import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
_authenticated: boolean = false;

constructor(private http: HttpClient, private _router: Router) { 
  this.loadUserFromStorage();
}

set accessToken(token: string) {
  localStorage.setItem('accessToken', token);
}

get accessToken(): string {
  return localStorage.getItem('accessToken') ?? '';
}

private loadUserFromStorage() {
  const token = localStorage.getItem('token');
  if (token) {
    this._authenticated = true;
  }
}

isAuthenticated(): boolean {
  return this._authenticated;
}

login(values: any) {
  return this.http.post<any>(`${environment.apiUrl}Login`, values).pipe(
    map((user: any) => {
      if (user.success) {
        this._authenticated = true;
        this.accessToken = user.data.Token;
        localStorage.setItem('userId', user.data.UserId);
        localStorage.setItem('role', user.data.UserRoles);
        localStorage.setItem('name', user.Name);
        localStorage.setItem('roleName', user.RoleName);     
      } else {
        this._authenticated = false;
      }
      return user;
    })
  )
}

logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('role');
  localStorage.removeItem('name');
  localStorage.removeItem('roleName');
  this._authenticated = false;
  this._router.navigateByUrl("/login");
}
}
