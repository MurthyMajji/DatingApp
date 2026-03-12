import { CanActivateFn } from '@angular/router';
import { AccountServices } from '../services/account-services';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast-service';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountServices);
  const toast = inject(ToastService);

  if (accountService.currentUser()) {
    return true;
  } else {
    toast.error('You shall not pass');
    return false;
  }
};
