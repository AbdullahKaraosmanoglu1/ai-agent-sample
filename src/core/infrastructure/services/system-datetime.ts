import { Injectable } from '@nestjs/common';
import type { IDateTime } from '../../application/ports/datetime.port';

@Injectable()
export class SystemDateTime implements IDateTime {
  now(): Date {
    return new Date();
  }

  addSeconds(date: Date, seconds: number): Date {
    const result = new Date(date);
    result.setSeconds(result.getSeconds() + seconds);
    return result;
  }

  addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
