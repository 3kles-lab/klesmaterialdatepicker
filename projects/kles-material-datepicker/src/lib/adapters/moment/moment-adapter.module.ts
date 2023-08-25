import { NgModule } from "@angular/core";
import { KlesMatDateAdapter } from "../date-adapter";
import { KlesMatMomentAdapter } from "./moment-adapter";
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from "@angular/material-moment-adapter";
import { KLES_MAT_MOMENT_FORMATS } from "./moment-format";

@NgModule({
    providers: [
        {
            provide: KlesMatDateAdapter,
            useClass: KlesMatMomentAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        }
    ],
})
export class KlesMomentDateModule { }


@NgModule({
    imports: [KlesMomentDateModule],
    providers: [{ provide: MAT_DATE_FORMATS, useValue: KLES_MAT_MOMENT_FORMATS }],
})
export class KlesMatMomentModule { }