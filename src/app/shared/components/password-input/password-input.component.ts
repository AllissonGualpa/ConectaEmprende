import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-input.component.html',
  styleUrls: ['./password-input.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PasswordInputComponent),
    multi: true
  }]
})
export class PasswordInputComponent implements ControlValueAccessor {
  @Input() label: string = 'Contraseña';
  @Input() placeholder: string = 'Introduce tu contraseña';
  @Input() id: string = 'password';
  @Input() errorMessage: string = '';
  @Input() showError: boolean = false;

  showPassword: boolean = false;
  value: string = '';
  disabled: boolean = false;
  
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: any): void {
    this.value = event.target.value;
    this.onChange(this.value);
    this.onTouched();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}