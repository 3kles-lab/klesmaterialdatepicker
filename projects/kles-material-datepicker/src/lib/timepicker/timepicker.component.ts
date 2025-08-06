import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { KlesMatDatepickerIntl } from "../datepicker-intl/datepicker-intl";
import { KlesMatDateAdapter } from "../adapters/date-adapter";
import { MaterialModule } from "../modules/material.module";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'kles-time-picker',
    templateUrl: 'timepicker.component.html',
    styleUrls: ['timepicker.component.scss'],
    imports: [MaterialModule, CommonModule, ReactiveFormsModule, FormsModule],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
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
            this.day = this.dateAdapter.getDay(s);
        }

    }

    constructor(private dateAdapter: KlesMatDateAdapter<any>, intl: KlesMatDatepickerIntl) {
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