import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { IUser } from '../../types/user';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountServices {
  private http = inject(HttpClient);
  currentUser = signal<IUser | null>(null);

  baseUrl = 'https://localhost:5001/api/';

  login(creds: any) {
    return this.http.post<IUser>(this.baseUrl + 'account/login', creds).pipe(
      tap((user) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUser.set(user);
        }
      }),
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }
}
