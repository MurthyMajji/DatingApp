import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Header } from './layout/header/header';
import { AccountServices } from './core/services/account-services';
import { Home } from './pages/home/home';
import { IUser } from './types/user';

@Component({
  selector: 'app-root',
  imports: [Header, Home],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private accountServices = inject(AccountServices);
  private http = inject(HttpClient);
  protected readonly title = signal('Dating App');
  protected members = signal<IUser[]>([]);

  // ngOnInit(): void {
  //   this.http.get('https://localhost:5001/api/members').subscribe({
  //     next: (response) => {
  //       this.members.set(response);
  //     },
  //     error: (error) => {
  //       console.warn(error);
  //     },
  //     complete: () => {
  //       console.log('Completed the HTTP request.');
  //     },
  //   });
  // }

  // Instead of Subscribe we can make use of promise because subscribe won't stop until it is completed
  // as we won't know in some cases it won't stop.

  async ngOnInit() {
    this.members.set(await this.getMembers());
    this.setCurrentuser();
  }

  setCurrentuser() {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    this.accountServices.currentUser.set(user);
  }

  async getMembers() {
    try {
      return firstValueFrom(this.http.get<IUser[]>('https://localhost:5001/api/members'));
    } catch (error) {
      console.warn('Error', error);
      throw error;
    }
  }
}
