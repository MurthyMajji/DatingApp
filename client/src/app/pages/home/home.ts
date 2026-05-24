import { Component, inject, signal } from '@angular/core';
import { Register } from '../../layout/register/register';
import { AccountServices } from '../../core/services/account-services';

@Component({
  selector: 'app-home',
  imports: [Register],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected accountService = inject(AccountServices);
  protected registerMode = signal(false);

  showRegister(value: boolean) {
    this.registerMode.set(value);
  }
}
