import { Injectable } from "@angular/core";
import { MatDatepickerIntl } from "@angular/material/datepicker";

@Injectable({ providedIn: 'root' })
export class KlesMatDatepickerIntl extends MatDatepickerIntl {
    validateCalendarLabel = 'Confirm';
    cancelCalendarLabel = 'Cancel';
}