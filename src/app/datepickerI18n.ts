import { TranslateService } from "@ngx-translate/core";
import { KlesMatDatepickerIntl } from "kles-material-datepicker";

export class DatepickerI18n {

    constructor(private readonly translate: TranslateService) { }

    getDatepickerIntl(): KlesMatDatepickerIntl {
        const datepickerIntl = new KlesMatDatepickerIntl();
        datepickerIntl.cancelCalendarLabel = this.translate.instant('annuler');
        datepickerIntl.validateCalendarLabel = this.translate.instant('ok');
        return datepickerIntl;
    }
}