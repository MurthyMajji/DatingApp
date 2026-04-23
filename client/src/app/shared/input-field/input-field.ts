import { Component, input, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  imports: [ReactiveFormsModule],
  templateUrl: './input-field.html',
  styleUrl: './input-field.css',
})
export class InputField implements ControlValueAccessor {
  label = input<string>('');
  type = input<string>('text');
  max = input<string>('');

  // @Self() should be written because if we haven't added it then it will check
  // for type filed let's say type(text) field in whole NgControl tree instead of current one
  constructor(@Self() public ngControl: NgControl) {
    this.ngControl.valueAccessor = this;
  }

  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}

  get control(): FormControl {
    return this.ngControl.control as FormControl;
  }
}
