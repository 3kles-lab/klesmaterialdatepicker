import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { KLES_MAT_LUXON_FORMATS } from "./luxon-format";
import { KlesMatDateAdapter } from "../date-adapter";
import { MAT_LUXON_DATE_ADAPTER_OPTIONS } from "@angular/material-luxon-adapter";
import { NgModule } from "@angular/core";
import { KlesMatLuxonAdapter } from "./luxon-adapter";

@NgModule({
    providers: [
        {
            provide: KlesMatDateAdapter,
            useClass: KlesMatLuxonAdapter,
            deps: [MAT_DATE_LOCALE, MAT_LUXON_DATE_ADAPTER_OPTIONS]
        }
    ],
})
export class KlesLuxonDateModule { }


@NgModule({
    imports: [KlesLuxonDateModule],
    providers: [{ provide: MAT_DATE_FORMATS, useValue: KLES_MAT_LUXON_FORMATS }],
})
export class KlesMatLuxonModule { }