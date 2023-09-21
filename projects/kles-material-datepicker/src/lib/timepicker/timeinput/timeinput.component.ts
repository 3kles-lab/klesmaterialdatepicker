import { FocusMonitor } from "@angular/cdk/a11y";
import { BooleanInput, coerceBooleanProperty } from "@angular/cdk/coercion";
import { Component, ElementRef, Inject, Input, OnDestroy, Optional, Self, ViewChild } from "@angular/core";
import { AbstractControl, ControlValueAccessor, FormBuilder, FormControl, FormGroup, NgControl, Validators } from "@angular/forms";
import { MAT_LEGACY_FORM_FIELD as MAT_FORM_FIELD, MatLegacyFormField as MatFormField, MatLegacyFormFieldControl as MatFormFieldControl } from "@angular/material/legacy-form-field";
import { min } from "moment";
import { Subject } from "rxjs";

export class TimeData {
    constructor(public hour: string, public minute: string) { }
}


@Component({
    selector: 'kles-time-input',
    templateUrl: 'timeinput.component.html',
    styleUrls: ['./timeinput.component.scss'],
    host: {
        '[class.kles-floating]': 'shouldLabelFloat',
        '[id]': 'id',
    },
    providers: [{ provide: MatFormFieldControl, useExisting: KlesTimeInput }],
})
export class KlesTimeInput implements ControlValueAccessor, MatFormFieldControl<TimeData>, OnDestroy {
    static nextId = 0;
    @ViewChild('hour') hourInput: HTMLInputElement;
    @ViewChild('minute') minuteInput: HTMLInputElement;

    parts: FormGroup<{
        hour: FormControl<string | null>;
        minute: FormControl<string | null>;
    }>;
    stateChanges = new Subject<void>();
    focused = false;
    touched = false;
    controlType = 'kles-time-input';
    id = `kles-time-input-${KlesTimeInput.nextId++}`;
    onChange = (_: any) => { };
    onTouched = () => { };

    get empty() {
        const {
            value: { hour, minute },
        } = this.parts;

        return !hour && !minute;
    }

    get shouldLabelFloat() {
        return this.focused || !this.empty;
    }

    @Input('aria-describedby') userAriaDescribedBy: string;

    @Input()
    get placeholder(): string {
        return this._placeholder;
    }
    set placeholder(value: string) {
        this._placeholder = value;
        this.stateChanges.next();
    }
    private _placeholder: string;

    @Input()
    get required(): boolean {
        return this._required;
    }
    set required(value: BooleanInput) {
        this._required = coerceBooleanProperty(value);
        this.stateChanges.next();
    }
    private _required = false;

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(value: BooleanInput) {
        this._disabled = coerceBooleanProperty(value);
        this._disabled ? this.parts.disable() : this.parts.enable();
        this.stateChanges.next();
    }
    private _disabled = false;

    @Input()
    get value(): TimeData | null {
        if (this.parts.valid) {
            const {
                value: { hour, minute },
            } = this.parts;
            return new TimeData(hour!, minute!);
        }
        return null;
    }
    set value(time: TimeData | null) {
        const { hour, minute } = time || new TimeData(null, null);
        this.parts.setValue({ hour: hour?.toString() ? hour.toString().padStart(2, '0') : null, minute: minute?.toString() ? minute.toString().padStart(2, '0') : null });
        this.stateChanges.next();
    }

    get errorState(): boolean {
        return this.parts.invalid && this.touched;
    }

    constructor(
        formBuilder: FormBuilder,
        private _focusMonitor: FocusMonitor,
        private _elementRef: ElementRef<HTMLElement>,
        @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
        @Optional() @Self() public ngControl: NgControl,
    ) {
        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }

        this.parts = formBuilder.group({
            hour: [null as string, [Validators.required]],
            minute: [null as string, [Validators.required]],
        });

        _focusMonitor.monitor(_elementRef, true).subscribe(origin => {
            if (this.focused && !origin) {
                this.onTouched();
            }
            this.focused = !!origin;
            this.stateChanges.next();
        });
    }

    ngOnDestroy() {
        this.stateChanges.complete();
        this._focusMonitor.stopMonitoring(this._elementRef);
    }

    onFocusIn(event: FocusEvent) {
        if (!this.focused) {
            this.focused = true;
            this.stateChanges.next();
        }
    }

    onFocusOut(event: FocusEvent) {
        if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
            this.touched = true;
            this.focused = false;
            this.onTouched();
            this.stateChanges.next();
        }
    }

    autoFocusNext(control: AbstractControl, nextElement?: HTMLInputElement): void {
        if (!control.errors && nextElement) {
            this._focusMonitor.focusVia(nextElement, 'program');
        }
    }

    setDescribedByIds(ids: string[]) {
        const controlElement = this._elementRef.nativeElement.querySelector(
            '.kles-time-input-container',
        )!;
        controlElement.setAttribute('aria-describedby', ids.join(' '));
    }

    onContainerClick(event: MouseEvent) {
        if ((event.target as Element).tagName.toLowerCase() != 'input') {
            this._elementRef.nativeElement.querySelector('input')!.focus();
        }
        // if (this.parts.controls.hour.valid) {
        //     this._focusMonitor.focusVia(this.minuteInput, 'program');
        // } else if (this.parts.controls.minute.valid) {
        //     this._focusMonitor.focusVia(this.minuteInput, 'program');
        // } else {
        //     this._focusMonitor.focusVia(this.hourInput, 'program');
        // }
    }

    writeValue(time: TimeData | null): void {
        this.value = time;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }


    _handleInputHour(hour: AbstractControl, nextElement?: HTMLInputElement) {
        if (hour !== null && typeof hour !== 'undefined' && hour.value !== null && typeof hour.value !== 'undefined' && hour.value !== '') {
            if (isNaN(hour.value)) {
                hour.setValue(hour.value.replace(/\D/g, ''));
            }
            if (hour.value > 23) {
                hour.setValue(hour.value.charAt(0));
            }

            if (hour.value?.length == 2) {
                this.autoFocusNext(hour, nextElement);
            }
        }

        this.onChange(this.parts.value);
    }

    _handleInputMinute(minute: AbstractControl, nextElement?: HTMLInputElement) {
        if (minute !== null && typeof minute !== 'undefined' && minute.value !== null && typeof minute.value !== 'undefined' && minute.value !== '') {
            if (isNaN(minute.value)) {
                minute.setValue(minute.value.replace(/\D/g, ''));
            }
            if (minute.value > 59) {
                minute.setValue(minute.value.charAt(0));
            }
        }
        this.onChange(this.parts.value);
    }

}