import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gender-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gender-selector.component.html',
  styleUrls: ['./gender-selector.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => GenderSelectorComponent),
    multi: true
  }]
})
export class GenderSelectorComponent implements ControlValueAccessor {
  @Input() showError: boolean = false;
  @Input() errorMessage: string = 'Selecciona un género';

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

  selectGender(gender: string): void {
    if (!this.disabled) {
      this.value = gender;
      this.onChange(this.value);
      this.onTouched();
    }
  }
}