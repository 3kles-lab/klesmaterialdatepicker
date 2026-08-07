import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { KlesMatDateAdapter, KlesMatDatepickerIntl, KlesMaterialDatepickerModule } from 'kles-material-datepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField, MatLabel, MatHint, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { KLES_MAT_LUXON_FORMATS, KlesMatLuxonAdapter } from '@3kles/kles-material-luxon-adapter';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { DatepickerI18n } from './datepickerI18n';
import { KLES_MAT_MOMENT_FORMATS, KlesMatMomentAdapter } from '@3kles/kles-material-moment-adapter';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatHint,
        MatSuffix,
        MatDatepickerModule,
        KlesMaterialDatepickerModule
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [
        { provide: KlesMatDateAdapter, useClass: KlesMatLuxonAdapter },
        { provide: DateAdapter, useClass: LuxonDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: KLES_MAT_LUXON_FORMATS },
        // { provide: KlesMatDateAdapter, useClass: KlesMatMomentAdapter },
        // { provide: DateAdapter, useClass: MomentDateAdapter },
        // { provide: MAT_DATE_FORMATS, useValue: KLES_MAT_MOMENT_FORMATS },
        {
            provide: KlesMatDatepickerIntl, deps: [TranslateService],
            useFactory: (translateService: TranslateService) => new DatepickerI18n(translateService).getDatepickerIntl()
        }
    ]
})
export class AppComponent {
    form: FormGroup;

    constructor(private dateAdapter: DateAdapter<any>) {
        console.log(this.dateAdapter);
        console.log(this.dateAdapter.getMonthNames('long'));
        console.log(this.dateAdapter.getMonthNames('short'));
        console.log(this.dateAdapter.getMonthNames('narrow'));
        console.log(this.dateAdapter.getDayOfWeekNames('short'));
        this.form = new FormGroup({
            date: new FormControl()
        });

        this.form.valueChanges.subscribe((value) => console.log('form value change!', value))
    }
}
