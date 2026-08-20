import { addMinutes, addHours, addDays, isAfter, isBefore, format } from 'date-fns';

export class DateUtil {
  static addMinutes(date: Date | number, amount: number): Date {
    return addMinutes(date, amount);
  }

  static addHours(date: Date | number, amount: number): Date {
    return addHours(date, amount);
  }

  static addDays(date: Date | number, amount: number): Date {
    return addDays(date, amount);
  }

  static isExpired(expiryDate: Date): boolean {
    return isBefore(expiryDate, new Date());
  }

  static isFuture(date: Date): boolean {
    return isAfter(date, new Date());
  }

  static formatDate(date: Date | number, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
    return format(date, formatStr);
  }
}
