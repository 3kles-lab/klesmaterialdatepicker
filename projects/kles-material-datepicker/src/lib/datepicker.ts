import { ChangeDetectionStrategy, Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { MatDateSelectionModel, MatSingleDateSelectionModel } from '@angular/material/datepicker';
import { KlesMatDatepickerBase } from './directives/datepicker.directive';
import { KlesMatDatepickerControl } from './interfaces/datepicker.interface';
import { MaterialModule } from './modules/material.module';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'kles-mat-datepicker',
    template: '',
    exportAs: 'klesMatDatepicker',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: MatDateSelectionModel, useClass: MatSingleDateSelectionModel },
        { provide: KlesMatDatepickerBase, useExisting: KlesMatDatepicker }
    ],
    imports: [CommonModule, MaterialModule],
    standalone: true,
})
export class KlesMatDatepicker<D> extends KlesMatDatepickerBase<KlesMatDatepickerControl<D>, D | null, D> {
    @Output() readonly timeSelected: EventEmitter<D> = new EventEmitter<D>();

    _selectTime(time: any) {
        this.timeSelected.emit(time);
    }
}
