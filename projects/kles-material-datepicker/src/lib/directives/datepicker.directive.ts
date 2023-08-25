import { Directionality } from "@angular/cdk/bidi";
import { BooleanInput, coerceBooleanProperty, coerceStringArray } from "@angular/cdk/coercion";
import { ScrollStrategy, OverlayRef, Overlay, FlexibleConnectedPositionStrategy, OverlayConfig } from "@angular/cdk/overlay";
import { _getFocusedElementPierceShadowDom } from "@angular/cdk/platform";
import { ComponentType, TemplatePortal, ComponentPortal } from "@angular/cdk/portal";
import { DOCUMENT } from "@angular/common";
import { Directive, OnDestroy, OnChanges, inject, Input, Output, ComponentRef, NgZone, ViewContainerRef, Inject, Optional, SimpleChanges, EventEmitter } from "@angular/core";
import { ThemePalette, DateAdapter } from "@angular/material/core";
import { ExtractDateTypeFromSelection, DatepickerDropdownPositionX, DatepickerDropdownPositionY, MatCalendarView, MatCalendarCellClassFunction, DateFilterFn, MAT_DATEPICKER_SCROLL_STRATEGY, MatDateSelectionModel } from "@angular/material/datepicker";
import { Subscription, Subject, merge } from "rxjs";
import { take, filter } from "rxjs/operators";

import {
    DOWN_ARROW,
    ESCAPE,
    hasModifierKey,
    LEFT_ARROW,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    UP_ARROW,
} from '@angular/cdk/keycodes';
import { KlesMatDatepickerContent } from "../datepicker-content/datepicker-content";
import { KlesMatDatepickerControl, KlesMatDatepickerPanel } from "../interfaces/datepicker.interface";


let datepickerUid = 0;

@Directive()
export abstract class KlesMatDatepickerBase<
    C extends KlesMatDatepickerControl<D>,
    S,
    D = ExtractDateTypeFromSelection<S>,
> implements KlesMatDatepickerPanel<C, S, D>, OnDestroy, OnChanges {
    private _scrollStrategy: () => ScrollStrategy;
    private _inputStateChanges = Subscription.EMPTY;
    private _document = inject(DOCUMENT);

    /** An input indicating the type of the custom header component for the calendar, if set. */
    @Input() calendarHeaderComponent: ComponentType<any>;
    @Input() hasBackdrop!: boolean;

    /** The date to open the calendar to initially. */
    @Input()
    get startAt(): D | null {
        // If an explicit startAt is set we start there, otherwise we start at whatever the currently
        // selected value is.
        return this._startAt || (this.datepickerInput ? this.datepickerInput.getStartValue() : null);
    }
    set startAt(value: D | null) {
        this._startAt = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    private _startAt: D | null;

    /** The view that the calendar should start in. */
    @Input() startView: 'month' | 'year' | 'multi-year' = 'month';

    /** Color palette to use on the datepicker's calendar. */
    @Input()
    get color(): ThemePalette {
        return (
            this._color || (this.datepickerInput ? this.datepickerInput.getThemePalette() : undefined)
        );
    }
    set color(value: ThemePalette) {
        this._color = value;
    }
    _color: ThemePalette;

    /**
     * Whether the calendar UI is in touch mode. In touch mode the calendar opens in a dialog rather
     * than a dropdown and elements have more padding to allow for bigger touch targets.
     */
    @Input()
    get touchUi(): boolean {
        return this._touchUi;
    }
    set touchUi(value: BooleanInput) {
        this._touchUi = coerceBooleanProperty(value);
    }
    private _touchUi = false;

    /** Whether the datepicker pop-up should be disabled. */
    @Input()
    get disabled(): boolean {
        return this._disabled === undefined && this.datepickerInput
            ? this.datepickerInput.disabled
            : !!this._disabled;
    }
    set disabled(value: BooleanInput) {
        const newValue = coerceBooleanProperty(value);

        if (newValue !== this._disabled) {
            this._disabled = newValue;
            this.stateChanges.next(undefined);
        }
    }
    private _disabled: boolean;

    /** Preferred position of the datepicker in the X axis. */
    @Input()
    xPosition: DatepickerDropdownPositionX = 'start';

    /** Preferred position of the datepicker in the Y axis. */
    @Input()
    yPosition: DatepickerDropdownPositionY = 'below';

    /**
     * Whether to restore focus to the previously-focused element when the calendar is closed.
     * Note that automatic focus restoration is an accessibility feature and it is recommended that
     * you provide your own equivalent, if you decide to turn it off.
     */
    @Input()
    get restoreFocus(): boolean {
        return this._restoreFocus;
    }
    set restoreFocus(value: BooleanInput) {
        this._restoreFocus = coerceBooleanProperty(value);
    }
    private _restoreFocus = true;

    /**
     * Emits selected year in multiyear view.
     * This doesn't imply a change on the selected date.
     */
    @Output() readonly yearSelected: EventEmitter<D> = new EventEmitter<D>();

    /**
     * Emits selected month in year view.
     * This doesn't imply a change on the selected date.
     */
    @Output() readonly monthSelected: EventEmitter<D> = new EventEmitter<D>();

    /**
     * Emits when the current view changes.
     */
    @Output() readonly viewChanged: EventEmitter<MatCalendarView> = new EventEmitter<MatCalendarView>(
        true,
    );

    /** Function that can be used to add custom CSS classes to dates. */
    @Input() dateClass: MatCalendarCellClassFunction<D>;

    /** Emits when the datepicker has been opened. */
    @Output('opened') readonly openedStream = new EventEmitter<void>();

    /** Emits when the datepicker has been closed. */
    @Output('closed') readonly closedStream = new EventEmitter<void>();

    /**
     * Classes to be passed to the date picker panel.
     * Supports string and string array values, similar to `ngClass`.
     */
    @Input()
    get panelClass(): string | string[] {
        return this._panelClass;
    }
    set panelClass(value: string | string[]) {
        this._panelClass = coerceStringArray(value);
    }
    private _panelClass: string[];

    /** Whether the calendar is open. */
    @Input()
    get opened(): boolean {
        return this._opened;
    }
    set opened(value: BooleanInput) {
        coerceBooleanProperty(value) ? this.open() : this.close();
    }
    private _opened = false;

    /** The id for the datepicker calendar. */
    id: string = `mat-datepicker-${datepickerUid++}`;

    /** The minimum selectable date. */
    _getMinDate(): D | null {
        return this.datepickerInput && this.datepickerInput.min;
    }

    /** The maximum selectable date. */
    _getMaxDate(): D | null {
        return this.datepickerInput && this.datepickerInput.max;
    }

    _getDateFilter(): DateFilterFn<D> {
        return this.datepickerInput && this.datepickerInput.dateFilter;
    }

    /** A reference to the overlay into which we've rendered the calendar. */
    private _overlayRef: OverlayRef | null;

    /** Reference to the component instance rendered in the overlay. */
    private _componentRef: ComponentRef<KlesMatDatepickerContent<S, D>> | null;

    /** The element that was focused before the datepicker was opened. */
    private _focusedElementBeforeOpen: HTMLElement | null = null;

    /** Unique class that will be added to the backdrop so that the test harnesses can look it up. */
    private _backdropHarnessClass = `${this.id}-backdrop`;

    /** Currently-registered actions portal. */
    private _actionsPortal: TemplatePortal | null;

    /** The input element this datepicker is associated with. */
    datepickerInput: C;

    /** Emits when the datepicker's state changes. */
    readonly stateChanges = new Subject<void>();

    constructor(
        private _overlay: Overlay,
        private _ngZone: NgZone,
        private _viewContainerRef: ViewContainerRef,
        @Inject(MAT_DATEPICKER_SCROLL_STRATEGY) scrollStrategy: any,
        @Optional() private _dateAdapter: DateAdapter<D>,
        @Optional() private _dir: Directionality,
        private _model: MatDateSelectionModel<S, D>,
    ) {

        this._scrollStrategy = scrollStrategy;
    }

    ngOnChanges(changes: SimpleChanges) {
        const positionChange = changes['xPosition'] || changes['yPosition'];

        if (positionChange && !positionChange.firstChange && this._overlayRef) {
            const positionStrategy = this._overlayRef.getConfig().positionStrategy;

            if (positionStrategy instanceof FlexibleConnectedPositionStrategy) {
                this._setConnectedPositions(positionStrategy);

                if (this.opened) {
                    this._overlayRef.updatePosition();
                }
            }
        }

        this.stateChanges.next(undefined);
    }

    ngOnDestroy() {
        this._destroyOverlay();
        this.close();
        this._inputStateChanges.unsubscribe();
        this.stateChanges.complete();
    }

    /** Selects the given date */
    select(date: D): void {
        this._model.add(date);
    }

    /** Emits the selected year in multiyear view */
    _selectYear(normalizedYear: D): void {
        this.yearSelected.emit(normalizedYear);
    }

    /** Emits selected month in year view */
    _selectMonth(normalizedMonth: D): void {
        this.monthSelected.emit(normalizedMonth);
    }

    /** Emits changed view */
    _viewChanged(view: MatCalendarView): void {
        this.viewChanged.emit(view);
    }

    /**
     * Register an input with this datepicker.
     * @param input The datepicker input to register with this datepicker.
     * @returns Selection model that the input should hook itself up to.
     */
    registerInput(input: C): MatDateSelectionModel<S, D> {
        this._inputStateChanges.unsubscribe();
        this.datepickerInput = input;
        this._inputStateChanges = input.stateChanges.subscribe(() => this.stateChanges.next(undefined));
        return this._model;
    }

    /**
     * Registers a portal containing action buttons with the datepicker.
     * @param portal Portal to be registered.
     */
    registerActions(portal: TemplatePortal): void {
        this._actionsPortal = portal;
        this._componentRef?.instance._assignActions(portal, true);
    }

    /**
     * Removes a portal containing action buttons from the datepicker.
     * @param portal Portal to be removed.
     */
    removeActions(portal: TemplatePortal): void {
        if (portal === this._actionsPortal) {
            this._actionsPortal = null;
            this._componentRef?.instance._assignActions(null, true);
        }
    }

    /** Open the calendar. */
    open(): void {
        if (this._opened || this.disabled) {
            return;
        }

        this._focusedElementBeforeOpen = _getFocusedElementPierceShadowDom();
        this._openOverlay();
        this._opened = true;
        this.openedStream.emit();
    }

    /** Close the calendar. */
    close(): void {
        if (!this._opened) {
            return;
        }

        const canRestoreFocus =
            this._restoreFocus &&
            this._focusedElementBeforeOpen &&
            typeof this._focusedElementBeforeOpen.focus === 'function';

        const completeClose = () => {
            // The `_opened` could've been reset already if
            // we got two events in quick succession.
            if (this._opened) {
                this._opened = false;
                this.closedStream.emit();
            }
        };

        if (this._componentRef) {
            const { instance, location } = this._componentRef;
            instance._startExitAnimation();
            instance._animationDone.pipe(take(1)).subscribe(() => {
                const activeElement = this._document.activeElement;

                // Since we restore focus after the exit animation, we have to check that
                // the user didn't move focus themselves inside the `close` handler.
                if (
                    canRestoreFocus &&
                    (!activeElement ||
                        activeElement === this._document.activeElement ||
                        location.nativeElement.contains(activeElement))
                ) {
                    this._focusedElementBeforeOpen!.focus();
                }

                this._focusedElementBeforeOpen = null;
                this._destroyOverlay();
            });
        }

        if (canRestoreFocus) {
            // Because IE moves focus asynchronously, we can't count on it being restored before we've
            // marked the datepicker as closed. If the event fires out of sequence and the element that
            // we're refocusing opens the datepicker on focus, the user could be stuck with not being
            // able to close the calendar at all. We work around it by making the logic, that marks
            // the datepicker as closed, async as well.
            setTimeout(completeClose);
        } else {
            completeClose();
        }
    }

    /** Applies the current pending selection on the overlay to the model. */
    _applyPendingSelection() {
        this._componentRef?.instance?._applyPendingSelection();
    }

    /** Forwards relevant values from the datepicker to the datepicker content inside the overlay. */
    protected _forwardContentValues(instance: KlesMatDatepickerContent<S, D>) {
        instance.datepicker = this;
        instance.color = this.color;
        instance._dialogLabelId = this.datepickerInput.getOverlayLabelId();
        instance._assignActions(this._actionsPortal, false);
    }

    /** Opens the overlay with the calendar. */
    private _openOverlay(): void {
        this._destroyOverlay();

        const isDialog = this.touchUi;
        const portal = new ComponentPortal<KlesMatDatepickerContent<S, D>>(
            KlesMatDatepickerContent,
            this._viewContainerRef,
        );
        const overlayRef = (this._overlayRef = this._overlay.create(
            new OverlayConfig({
                positionStrategy: isDialog ? this._getDialogStrategy() : this._getDropdownStrategy(),
                hasBackdrop: this.hasBackdrop,
                backdropClass: [
                    isDialog ? 'cdk-overlay-dark-backdrop' : 'mat-overlay-transparent-backdrop',
                    this._backdropHarnessClass,
                ],
                direction: this._dir,
                scrollStrategy: isDialog ? this._overlay.scrollStrategies.block() : this._scrollStrategy(),
                panelClass: `mat-datepicker-${isDialog ? 'dialog' : 'popup'}`,
            }),
        ));

        this._getCloseStream(overlayRef).subscribe(event => {
            if (event) {
                event.preventDefault();
            }
            this.close();
        });

        // The `preventDefault` call happens inside the calendar as well, however focus moves into
        // it inside a timeout which can give browsers a chance to fire off a keyboard event in-between
        // that can scroll the page (see #24969). Always block default actions of arrow keys for the
        // entire overlay so the page doesn't get scrolled by accident.
        overlayRef.keydownEvents().subscribe(event => {
            const keyCode = event.keyCode;

            if (
                keyCode === UP_ARROW ||
                keyCode === DOWN_ARROW ||
                keyCode === LEFT_ARROW ||
                keyCode === RIGHT_ARROW ||
                keyCode === PAGE_UP ||
                keyCode === PAGE_DOWN
            ) {
                event.preventDefault();
            }
        });

        this._componentRef = overlayRef.attach(portal);
        this._forwardContentValues(this._componentRef.instance);

        // Update the position once the calendar has rendered. Only relevant in dropdown mode.
        if (!isDialog) {
            this._ngZone.onStable.pipe(take(1)).subscribe(() => overlayRef.updatePosition());
        }
    }

    /** Destroys the current overlay. */
    private _destroyOverlay() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = this._componentRef = null;
        }
    }

    /** Gets a position strategy that will open the calendar as a dropdown. */
    private _getDialogStrategy() {
        return this._overlay.position().global().centerHorizontally().centerVertically();
    }

    /** Gets a position strategy that will open the calendar as a dropdown. */
    private _getDropdownStrategy() {
        const strategy = this._overlay
            .position()
            .flexibleConnectedTo(this.datepickerInput.getConnectedOverlayOrigin())
            .withTransformOriginOn('.mat-datepicker-content')
            .withFlexibleDimensions(false)
            .withViewportMargin(8)
            .withLockedPosition();

        return this._setConnectedPositions(strategy);
    }

    /** Sets the positions of the datepicker in dropdown mode based on the current configuration. */
    private _setConnectedPositions(strategy: FlexibleConnectedPositionStrategy) {
        const primaryX = this.xPosition === 'end' ? 'end' : 'start';
        const secondaryX = primaryX === 'start' ? 'end' : 'start';
        const primaryY = this.yPosition === 'above' ? 'bottom' : 'top';
        const secondaryY = primaryY === 'top' ? 'bottom' : 'top';

        return strategy.withPositions([
            {
                originX: primaryX,
                originY: secondaryY,
                overlayX: primaryX,
                overlayY: primaryY,
            },
            {
                originX: primaryX,
                originY: primaryY,
                overlayX: primaryX,
                overlayY: secondaryY,
            },
            {
                originX: secondaryX,
                originY: secondaryY,
                overlayX: secondaryX,
                overlayY: primaryY,
            },
            {
                originX: secondaryX,
                originY: primaryY,
                overlayX: secondaryX,
                overlayY: secondaryY,
            },
        ]);
    }

    /** Gets an observable that will emit when the overlay is supposed to be closed. */
    private _getCloseStream(overlayRef: OverlayRef) {
        return merge(
            overlayRef.backdropClick(),
            overlayRef.detachments(),
            overlayRef.keydownEvents().pipe(
                filter(event => {
                    // Closing on alt + up is only valid when there's an input associated with the datepicker.
                    return (
                        (event.keyCode === ESCAPE && !hasModifierKey(event)) ||
                        (this.datepickerInput && hasModifierKey(event, 'altKey') && event.keyCode === UP_ARROW)
                    );
                }),
            ),
        );
    }
}