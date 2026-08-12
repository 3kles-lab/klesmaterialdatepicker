import { DateAdapter } from '@angular/material/core';


export abstract class KlesMatDateAdapter<D> extends DateAdapter<D> {
    abstract getDay(date: D): string;

    isSameTime(a: D, b: D): boolean {
        if (a == null || b == null) return true;
        return this.getHours(a) === this.getHours(b)
            && this.getMinutes(a) === this.getMinutes(b)
            && this.getSeconds(a) === this.getSeconds(b);
    }

    copyTime(toDate: D, fromDate: D) {
        toDate = this.setTime(toDate, this.getHours(fromDate), this.getMinutes(fromDate), this.getSeconds(fromDate));
    }

    compareDateWithTime(first: D, second: D, showSeconds?: boolean): number {
        let res = super.compareDate(first, second) ||
            this.getHours(first) - this.getHours(second) ||
            this.getMinutes(first) - this.getMinutes(second);
        if (showSeconds) {
            res = res || this.getSeconds(first) - this.getSeconds(second);
        }
        return res;
    }

    setTimeByDefaultValues(date: D, defaultTime: number[]) {
        if (!Array.isArray(defaultTime)) {
            throw Error('@Input DefaultTime should be an array');
        }
        date = this.setTime(date, defaultTime[0] || 0, defaultTime[1] || 0, defaultTime[2] || 0);
    }

}