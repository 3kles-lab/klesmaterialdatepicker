import {
    DateRange,
    ExtractDateTypeFromSelection,
    MAT_DATE_RANGE_SELECTION_STRATEGY,
    MatCalendar,
    MatCalendarUserEvent,
    MatDateRangeSelectionStrategy,
    MatDateSelectionModel,
} from '@angular/material/datepicker';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, Input, OnDestroy, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { Subscription } from 'rxjs';
import { TemplatePortal } from '@angular/cdk/portal';
import { KlesMatDateAdapter } from '../adapters/date-adapter';
import { KlesMatDatepickerIntl } from '../datepicker-intl/datepicker-intl';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../modules/material.module';
import { KlesTimePicker } from '../timepicker/timepicker.component';

@Component({
    selector: 'mat-datepicker-content',
    templateUrl: 'datepicker-content.html',
    styleUrls: ['datepicker-content.scss'],
    host: {
        class: 'mat-datepicker-content',
        '[class.mat-datepicker-content-touch]': 'datepicker.touchUi',
    },
    exportAs: 'klesMatDatepickerContent',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MaterialModule, KlesTimePicker],
    inputs: ['color'],
    standalone: true
})
export class KlesMatDatepickerContent<S, D = ExtractDateTypeFromSelection<S>> implements OnInit, AfterViewInit, OnDestroy {
    private _subscriptions = new Subscription();
    _model!: MatDateSelectionModel<S, D>;

    @Input() color: ThemePalette;

    @HostBinding('class')
    get colorClass(): string {
        return this.color ? `mat-${this.color}` : '';
    }

    calendarValue: D | null = null;
    timeValue: any;

    /** Reference to the internal calendar component. */
    @ViewChild(MatCalendar) _calendar!: MatCalendar<D>;

    /** Reference to the datepicker that created the overlay. */
    datepicker: any;

    /** Start of the comparison range. */
    comparisonStart: D | null = null;

    /** End of the comparison range. */
    comparisonEnd: D | null = null;

    /** Whether the datepicker is above or below the input. */
    _isAbove!: boolean;

    /** Text for the close button. */
    // _closeButtonText: string;
    _cancelButtonText: string;
    _validateButtonText: string;

    /** Whether the close button currently has focus. */
    _closeButtonFocused!: boolean;

    /** Portal with projected action buttons. */
    _actionsPortal: TemplatePortal | null = null;

    /** Id of the label for the `role="dialog"` element. */
    _dialogLabelId: string | null = null;

    constructor(
        elementRef: ElementRef,
        private _changeDetectorRef: ChangeDetectorRef,
        private _globalModel: MatDateSelectionModel<S, D>,
        private _dateAdapter: KlesMatDateAdapter<D>,
        @Optional()
        @Inject(MAT_DATE_RANGE_SELECTION_STRATEGY)
        private _rangeSelectionStrategy: MatDateRangeSelectionStrategy<D>,
        intl: KlesMatDatepickerIntl,
    ) {
        this._cancelButtonText = intl.cancelCalendarLabel;
        this._validateButtonText = intl.validateCalendarLabel;
    }

    ngOnInit() {
        this.calendarValue = this._model.selection as any;
        this.timeValue = {
            minute: this._model.selection ? this._dateAdapter.getMinutes(this._model.selection as any) : null,
            hour: this._model.selection ? this._dateAdapter.getHours(this._model.selection as any) : null,
            second: this._model.selection ? this._dateAdapter.getSeconds(this._model.selection as any) : null,
        };
    }

    ngAfterViewInit() {
        this._subscriptions.add(
            this.datepicker.stateChanges.subscribe(() => {
                this._changeDetectorRef.markForCheck();
            }),
        );
        this._calendar.focusActiveCell();
    }

    ngOnDestroy() {
        this._subscriptions.unsubscribe();
    }

    _handleUserSelection(event: MatCalendarUserEvent<D | null>) {
        const value = event.value;
        this.calendarValue = value;
    }

    _handleUserTimeSelection(value: any) {
        this.timeValue = value?.time;
    }

    close() {
        if (this.calendarValue) {
            this.calendarValue = (this._dateAdapter).setTime(this.calendarValue, this.timeValue.hour, this.timeValue.minute, this.timeValue.second);
            this._model.add(this.calendarValue);
        }

        this.datepicker.close();
    }

    _getSelected() {
        return this._model.selection as unknown as D | DateRange<D> | null;
    }

    /** Applies the current pending selection to the global model. */
    _applyPendingSelection() {
        if (this._model !== this._globalModel) {
            this._globalModel.updateSelection(this._model.selection, this);
        }
    }

    /**
     * Assigns a new portal containing the datepicker actions.
     * @param portal Portal with the actions to be assigned.
     * @param forceRerender Whether a re-render of the portal should be triggered. This isn't
     * necessary if the portal is assigned during initialization, but it may be required if it's
     * added at a later point.
     */
    _assignActions(portal: TemplatePortal<any> | null, forceRerender: boolean) {
        this._model = portal ? (this._globalModel.clone() as any) : this._globalModel;
        this._actionsPortal = portal;

        if (forceRerender) {
            this._changeDetectorRef.detectChanges();
        }
    }
}
