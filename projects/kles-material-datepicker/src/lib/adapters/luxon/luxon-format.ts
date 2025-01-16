import { MatDateFormats } from '@angular/material/core';

const DEFAULT = 'l, LTS';

export const KLES_MAT_LUXON_FORMATS: MatDateFormats = {
    parse: {
        dateInput: DEFAULT,
    },
    display: {
        dateInput: DEFAULT,
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

/*
const DEFAULT = 'D';

export const KLES_MAT_LUXON_FORMATS: MatDateFormats = {
    parse: {
        dateInput: DEFAULT,
    },
    display: {
        dateInput: DEFAULT,
        monthYearLabel: 'LLL yyyy',
        dateA11yLabel: 'DD',
        monthYearA11yLabel: 'LLLL yyyy',
    },
};
*/
