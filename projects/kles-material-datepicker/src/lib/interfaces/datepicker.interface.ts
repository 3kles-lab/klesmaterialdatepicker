import { ElementRef, EventEmitter } from "@angular/core";
import { ThemePalette } from "@angular/material/core";
import { DateFilterFn, ExtractDateTypeFromSelection, MatDateSelectionModel } from "@angular/material/datepicker";
import { Observable, Subject } from "rxjs";

/** Form control that can be associated with a datepicker. */
export interface KlesMatDatepickerControl<D> {
    getStartValue(): D | null;
    getThemePalette(): ThemePalette;
    min: D | null;
    max: D | null;
    disabled: boolean;
    dateFilter: DateFilterFn<D>;
    getConnectedOverlayOrigin(): ElementRef;
    getOverlayLabelId(): string | null;
    stateChanges: Observable<void>;
}

export interface KlesMatDatepickerPanel<
    C extends KlesMatDatepickerControl<D>,
    S,
    D = ExtractDateTypeFromSelection<S>,
> {
    /** Stream that emits whenever the date picker is closed. */
    closedStream: EventEmitter<void>;
    /** Color palette to use on the datepicker's calendar. */
    color: ThemePalette;
    /** The input element the datepicker is associated with. */
    datepickerInput: C;
    /** Whether the datepicker pop-up should be disabled. */
    disabled: boolean;
    /** The id for the datepicker's calendar. */
    id: string;
    /** Whether the datepicker is open. */
    opened: boolean;
    /** Stream that emits whenever the date picker is opened. */
    openedStream: EventEmitter<void>;
    /** Emits when the datepicker's state changes. */
    stateChanges: Subject<void>;
    /** Opens the datepicker. */
    open(): void;
    /** Register an input with the datepicker. */
    registerInput(input: C): MatDateSelectionModel<S, D>;
}