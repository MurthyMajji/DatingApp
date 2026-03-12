import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountServices } from '../../core/services/account-services';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../core/services/toast-service';

@Component({
  selector: 'app-header',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected accountServices = inject(AccountServices);
  protected router = inject(Router);
  private toast = inject(ToastService);
  protected creds: any = {};

  login() {
    this.accountServices.login(this.creds).subscribe({
      next: (result) => {
        this.router.navigateByUrl('/members');
        this.creds = {};
        console.log(result);
        this.toast.success('Logged in successfully!');
      },
      error: (err) => {
        console.warn(err.error);
        this.toast.error(err.error);
      },
    });
  }

  logout() {
    this.router.navigateByUrl('/');
    this.accountServices.logout();
  }
}
