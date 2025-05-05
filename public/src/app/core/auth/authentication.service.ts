import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
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
  const token = localStorage.getItem('accessToken');
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
        localStorage.setItem('email', user.Email);     
      } else {
        this._authenticated = false;
      }
      return user;
    })
  )
}

logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('role');
  localStorage.removeItem('name');
  localStorage.removeItem('roleName');
  localStorage.removeItem('api2Token');
  this._authenticated = false;
  this._router.navigateByUrl("/login");
}

loginToApi2() {
  const staticCredentials = {
    email: 'ay367@gmail.com',
    password: 'ankit123'
  };

  return this.http.post<any>(`${environment.apiUrl2}api/Authentication/Login`, staticCredentials).pipe(
    map((res: any) => {
      if (res.success) {
        localStorage.setItem('api2Token', res.data.Token);
      }
      return res;
    })
  );
}


}
