import {
    CUSTOM_ELEMENTS_SCHEMA,
    NgModule,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './modules/material.module';
import { KlesTimeInput } from './timepicker/timeinput/timeinput.component';
import { KlesMatDatepicker } from './datepicker';
import { KlesMatDatepickerContent } from './datepicker-content/datepicker-content';
import { KlesTimePicker } from './timepicker/timepicker.component';

const components = [
    KlesMatDatepicker,
    KlesMatDatepickerContent,
    KlesTimePicker,
    KlesTimeInput,
];

@NgModule({
    imports: [
        components,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MaterialModule,
    ],
    exports: [components],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class KlesMaterialDatepickerModule {
    static declarations = [components];
}
