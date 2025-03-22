import { CanActivateFn } from '@angular/router';

export const noAuthGuardGuard: CanActivateFn = (route, state) => {
  return true;
};
