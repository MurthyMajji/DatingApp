import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountServices } from '../../core/services/account-services';

@Component({
  selector: 'app-header',
  imports: [FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected accountServices = inject(AccountServices);
  protected creds: any = {};

  login() {
    this.accountServices.login(this.creds).subscribe({
      next: (result) => {
        this.creds = {};
        console.log(result);
      },
      error: (err) => console.warn(err),
    });
  }

  logout() {
    this.accountServices.logout();
  }
}
