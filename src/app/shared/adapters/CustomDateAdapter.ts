import { NativeDateAdapter } from '@angular/material/core';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    if (typeof value === 'string' && value.indexOf('/') > -1) {
      const str = value.split('/');
      
      const day = Number(str[0]);
      const month = Number(str[1]) - 1; 
      const year = Number(str[2]);

      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return null;
      }

      if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
        return null;
      }

      return new Date(year, month, day);
    }
    
    const timestamp = typeof value === 'number' ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }

  override format(date: Date, displayFormat: Object): string {
    if (!this.isValid(date)) {
      return '';
    }

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return this._to2digit(day) + '/' + this._to2digit(month) + '/' + year;
  }

  private _to2digit(n: number) {
    return ('00' + n).slice(-2);
  }

  override getFirstDayOfWeek(): number {
    return 1; 
  }
}