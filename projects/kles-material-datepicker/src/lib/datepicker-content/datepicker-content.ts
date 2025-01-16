import { DateRange, ExtractDateTypeFromSelection, MAT_DATE_RANGE_SELECTION_STRATEGY, MatCalendar, MatCalendarUserEvent, MatDateRangeSelectionStrategy, MatDateSelectionModel, MatDatepickerIntl, matDatepickerAnimations } from "@angular/material/datepicker";
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { CanColor, DateAdapter, mixinColor } from "@angular/material/core";
import { Subject, Subscription } from "rxjs";
import { TemplatePortal } from "@angular/cdk/portal";
import { KlesMatDateAdapter } from "../adapters/date-adapter";
import { KlesMatDatepickerIntl } from "../datepicker-intl/datepicker-intl";

const _MatDatepickerContentBase = mixinColor(
    class {
        constructor(public _elementRef: ElementRef) { }
    },
);


@Component({
    selector: 'mat-datepicker-content',
    templateUrl: 'datepicker-content.html',
    styleUrls: ['datepicker-content.scss'],
    host: {
        'class': 'mat-datepicker-content',
        '[@transformPanel]': '_animationState',
        '(@transformPanel.done)': '_animationDone.next()',
        '[class.mat-datepicker-content-touch]': 'datepicker.touchUi',
    },
    animations: [matDatepickerAnimations.transformPanel, matDatepickerAnimations.fadeInCalendar],
    exportAs: 'klesMatDatepickerContent',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    inputs: ['color'],
})
export class KlesMatDatepickerContent<S, D = ExtractDateTypeFromSelection<S>>
    extends _MatDatepickerContentBase
    implements OnInit, AfterViewInit, OnDestroy, CanColor {
    private _subscriptions = new Subscription();
    _model: MatDateSelectionModel<S, D>;

    calendarValue: D;
    timeValue: any;

    /** Reference to the internal calendar component. */
    @ViewChild(MatCalendar) _calendar: MatCalendar<D>;

    /** Reference to the datepicker that created the overlay. */
    datepicker: any;

    /** Start of the comparison range. */
    comparisonStart: D | null;

    /** End of the comparison range. */
    comparisonEnd: D | null;

    /** Whether the datepicker is above or below the input. */
    _isAbove: boolean;

    /** Current state of the animation. */
    _animationState: 'enter-dropdown' | 'enter-dialog' | 'void';

    /** Emits when an animation has finished. */
    readonly _animationDone = new Subject<void>();

    /** Text for the close button. */
    // _closeButtonText: string;
    _cancelButtonText: string;
    _validateButtonText: string;

    /** Whether the close button currently has focus. */
    _closeButtonFocused: boolean;

    /** Portal with projected action buttons. */
    _actionsPortal: TemplatePortal | null = null;

    /** Id of the label for the `role="dialog"` element. */
    _dialogLabelId: string | null;

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
        super(elementRef);
        this._cancelButtonText = intl.cancelCalendarLabel;
        this._validateButtonText = intl.validateCalendarLabel;
    }

    ngOnInit() {
        this.calendarValue = this._model.selection as any;
        this.timeValue = {
            minute: this._model.selection ? this._dateAdapter.getMinute(this._model.selection as any) : null,
            hour: this._model.selection ? this._dateAdapter.getHour(this._model.selection as any) : null,
            second: this._model.selection ? this._dateAdapter.getSecond(this._model.selection as any) : null,
        }

        this._animationState = this.datepicker.touchUi ? 'enter-dialog' : 'enter-dropdown';
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
        this._animationDone.complete();
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
            console.log(this.calendarValue);
            this.calendarValue = (this._dateAdapter as any).setHour(this.calendarValue, this.timeValue.hour);
            console.log(this.calendarValue);
            this.calendarValue = (this._dateAdapter as any).setMinute(this.calendarValue, this.timeValue.minute);
            console.log(this.calendarValue);
            this._model.add(this.calendarValue);
        }

        this.datepicker.close()
    }

    _startExitAnimation() {
        this._animationState = 'void';
        this._changeDetectorRef.markForCheck();
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