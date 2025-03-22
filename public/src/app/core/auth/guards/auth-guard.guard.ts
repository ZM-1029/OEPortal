import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from '../authentication.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  const token = localStorage.getItem('accessToken'); 
  if (token) {
    authService._authenticated = true; 
    return true;
  } else {
    authService._authenticated = false;
    router.navigate(['/login']);
    return false;
  }
};
