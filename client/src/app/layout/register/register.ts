import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IRegisterCreds } from '../../types/user';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  protected creds = {} as IRegisterCreds;

  register() {
    console.log(this.creds);
  }

  cancel() {
    console.log('Canceled Registrastion');
  }
}
