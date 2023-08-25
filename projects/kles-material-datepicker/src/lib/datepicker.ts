import { ChangeDetectionStrategy, Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER } from '@angular/material/datepicker';
import { KlesMatDatepickerBase } from './directives/datepicker.directive';
import { KlesMatDatepickerControl } from './interfaces/datepicker.interface';


@Component({
    selector: 'kles-mat-datepicker',
    template: '',
    exportAs: 'klesMatDatepicker',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER,
        { provide: KlesMatDatepickerBase, useExisting: KlesMatDatepicker },
    ],
})
export class KlesMatDatepicker<D> extends KlesMatDatepickerBase<KlesMatDatepickerControl<D>, D | null, D> {

    @Output() readonly timeSelected: EventEmitter<D> = new EventEmitter<D>();

    _selectTime(time: any) {
        this.timeSelected.emit(time);
    }
}