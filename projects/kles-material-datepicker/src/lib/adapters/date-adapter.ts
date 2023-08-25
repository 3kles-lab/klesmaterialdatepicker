import { DateAdapter } from '@angular/material/core';


export abstract class KlesMatDateAdapter<D> extends DateAdapter<D> {
   
    abstract getHour(date: D): number;
    abstract getMinute(date: D): number;
    abstract getSecond(date: D): number;
    abstract setHour(date: D, value: number): void;
    abstract setMinute(date: D, value: number): void;
    abstract setSecond(date: D, value: number): void;

    isSameTime(a: D, b: D): boolean {
        if (a == null || b == null) return true;
        return this.getHour(a) === this.getHour(b)
            && this.getMinute(a) === this.getMinute(b)
            && this.getSecond(a) === this.getSecond(b);
    }

    copyTime(toDate: D, fromDate: D) {
        this.setHour(toDate, this.getHour(fromDate));
        this.setMinute(toDate, this.getMinute(fromDate));
        this.setSecond(toDate, this.getSecond(fromDate));
    }

    compareDateWithTime(first: D, second: D, showSeconds?: boolean): number {
        let res = super.compareDate(first, second) ||
            this.getHour(first) - this.getHour(second) ||
            this.getMinute(first) - this.getMinute(second);
        if (showSeconds) {
            res = res || this.getSecond(first) - this.getSecond(second);
        }
        return res;
    }

    setTimeByDefaultValues(date: D, defaultTime: number[]) {
        if (!Array.isArray(defaultTime)) {
            throw Error('@Input DefaultTime should be an array');
        }
        this.setHour(date, defaultTime[0] || 0);
        this.setMinute(date, defaultTime[1] || 0);
        this.setSecond(date, defaultTime[2] || 0);
    }

}