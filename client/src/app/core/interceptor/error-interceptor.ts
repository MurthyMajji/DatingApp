import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs';
import { ToastService } from '../services/toast-service';
import { NavigationExtras, Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error) {
        switch (error.status) {
          case 400:
            var errors = error.error.errors;
            if (errors) {
              const modelStateErrors = [];
              for (const key in errors) {
                modelStateErrors.push(errors[key]);
              }

              throw modelStateErrors.flat();
            } else {
              toast.error(error.error + ' ' + error.status);
              throw [error.error];
            }
            break;
          case 401:
            toast.error('Unthorized');
            break;
          case 404:
            router.navigateByUrl('/not-found');
            break;
          case 500:
            const navigationExtras: NavigationExtras = { state: { error: error.error } };
            router.navigateByUrl('/server-error', navigationExtras);
            break;
          default:
            toast.error('Something went wrong');
            break;
        }
      }
      throw error;
    }),
  );
};
