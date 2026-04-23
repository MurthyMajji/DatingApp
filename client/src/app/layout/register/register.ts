import { Component, inject, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { IRegisterCreds } from '../../types/user';
import { AccountServices } from '../../core/services/account-services';
import { InputField } from '../../shared/input-field/input-field';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, InputField],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private accountServices = inject(AccountServices);
  private router = inject(Router);
  protected creds = {} as IRegisterCreds;
  cancelRegister = output<boolean>();
  // Using FormGroup()
  // protected credentialsForm: FormGroup = new FormGroup({});

  // Using FormBuilder service which reduces the boiler place code while using reactive forms
  private formBilder = inject(FormBuilder);
  protected credentialsForm: FormGroup;
  protected profileForm: FormGroup;
  protected currentStep = signal<number>(1);
  protected validationErrors = signal<[]>([]);

  // Using FormGroup()
  // ngOnInit(): void {
  //   this.initialiseForm();
  // }
  // initialiseForm() {
  //   this.credentialsForm = new FormGroup({
  //     displayName: new FormControl('', Validators.required),
  //     email: new FormControl('', [Validators.required, Validators.email]),
  //     password: new FormControl('', [
  //       Validators.required,
  //       Validators.minLength(4),
  //       Validators.maxLength(12),
  //     ]),
  //     confirmPassword: new FormControl('', [Validators.required, this.matchValidator('password')]),
  //   });
  //   this.credentialsForm.controls['password'].valueChanges.subscribe(() => {
  //     this.credentialsForm.controls['confirmPassword'].updateValueAndValidity();
  //   });
  // }

  // Using FormBuilder
  constructor() {
    this.credentialsForm = this.formBilder.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(12)]],
      confirmPassword: ['', [Validators.required, this.matchValidator('password')]],
    });

    this.profileForm = this.formBilder.group({
      gender: ['male', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
    });

    this.credentialsForm.controls['password'].valueChanges.subscribe(() => {
      this.credentialsForm.controls['confirmPassword'].updateValueAndValidity();
    });
  }

  matchValidator(matchToString: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent) return null;

      const matchValue = parent.get(matchToString)?.value;
      return control.value === matchValue ? null : { passwordMismatch: true };
    };
  }

  nextStep() {
    if (this.credentialsForm.valid) {
      this.currentStep.update((prevStep) => prevStep + 1);
    }
  }

  prevStep() {
    if (this.credentialsForm.valid) {
      this.currentStep.update((prevStep) => prevStep - 1);
    }
  }

  getMaxDate() {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0];
  }

  register() {
    if (this.credentialsForm.valid && this.profileForm.valid) {
      const formData = { ...this.credentialsForm.value, ...this.profileForm.value };
      this.accountServices.register(formData).subscribe({
        next: (result) => {
          this.router.navigateByUrl('/members');
        },
        error: (error) => {
          console.warn(error);
          this.validationErrors.set(error);
        },
      });
    }
  }

  cancel() {
    this.cancelRegister.emit(false);
    console.log('Canceled Registrastion');
  }
}
