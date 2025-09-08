export interface IDateTime {
  now(): Date;
  addSeconds(date: Date, seconds: number): Date;
  addMinutes(date: Date, minutes: number): Date;
  addDays(date: Date, days: number): Date;
}
