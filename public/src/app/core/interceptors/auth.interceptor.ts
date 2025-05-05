import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthenticationService } from '../auth/authentication.service';
import { environment } from 'src/environments/environment';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const authService = inject(AuthenticationService);
//   const router = inject(Router);

//   const token = authService.accessToken;

//   const authReq = token
//     ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
//     : req;

//   return next(authReq).pipe(
//     catchError((error) => {
//       if (error.status === 401) {
//         authService.logout();
//         router.navigate(['/login']);
//       }
//       return throwError(() => error);
//     })
//   );
// };

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  let modifiedReq = req;

  // Match API1 and attach accessToken
  if (req.url.startsWith(environment.apiUrl)) {
    const token = authService.accessToken;
    if (token) {
      modifiedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  // Match API2 and attach api2Token
  else if (req.url.startsWith(environment.apiUrl2)) {
    const token2 = localStorage.getItem('api2Token');
    if (token2) {
      modifiedReq = req.clone({
        setHeaders: {
          Authorization: `bearer ${token2}` // lowercase 'bearer' if required by API 2
        }
      });
    }
  }

  return next(modifiedReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
