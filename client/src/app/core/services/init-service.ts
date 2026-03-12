import { inject, Injectable } from '@angular/core';
import { AccountServices } from './account-services';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private accountServices = inject(AccountServices);

  init(): Observable<null> {
    const userString = localStorage.getItem('user');
    if (!userString) return of(null);
    const user = JSON.parse(userString);
    this.accountServices.currentUser.set(user);

    return of(null);
  }
}
