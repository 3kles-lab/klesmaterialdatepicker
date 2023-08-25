import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { DateAdapter } from "@angular/material/core";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { KlesMatDatepickerIntl } from "../datepicker-intl/datepicker-intl";

@Component({
    selector: 'kles-time-picker',
    templateUrl: 'timepicker.component.html',
    styleUrls: ['timepicker.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class KlesTimePicker implements OnInit, OnDestroy {

    _timePickerTextLabel: string;
    private _onDestroy = new Subject<void>()
    form: FormGroup;

    @Output() timeChanged = new EventEmitter<any>();
    @Input() value: {
        hour: string;
        minute: string;
        second?: string;
    };

    year?: number;
    month?: string;
    date?: number;
    day?: string;

    @Input() set selection(s: any) {
        if (s) {
            this.year = this.dateAdapter.getYear(s);
            this.month = this.dateAdapter.format(s, 'MMMM');
            this.date = this.dateAdapter.getDate(s);
            this.day = this.dateAdapter.format(s, 'dddd');
        }

    }

    constructor(private dateAdapter: DateAdapter<any>, intl: KlesMatDatepickerIntl) {
        this.initForm();
        this._timePickerTextLabel = intl.timePickerTextLabel;
    }

    ngOnInit(): void {
        if (this.value) {
            this.form.patchValue({ time: this.value }, { emitEvent: false })
        }

        this.form.valueChanges
            .pipe(
                takeUntil(this._onDestroy),
                filter(() => this.form.valid)
            )
            .subscribe(value => {
                this.timeChanged.emit(value);
            })
    }

    ngOnDestroy(): void {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    protected initForm(): void {
        this.form = new FormGroup({
            time: new FormControl(null, Validators.required)
        });
    }
}