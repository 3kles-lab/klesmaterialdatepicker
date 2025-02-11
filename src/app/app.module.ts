import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { MaterialModule } from './modules/material.module';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import localeFr from '@angular/common/locales/fr';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KlesMatMomentModule } from '@3kles/kles-material-moment-adapter';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { KlesMaterialDatepickerModule } from '@3kles/kles-material-datepicker';
import { KlesMatLuxonModule } from '@3kles/kles-material-luxon-adapter';
import { MatLuxonDateModule } from '@angular/material-luxon-adapter';

registerLocaleData(localeFr);

@NgModule({
    declarations: [
        AppComponent,
    ],
    exports: [],
    bootstrap: [AppComponent],
    imports: [
        CommonModule,
        BrowserModule,
        AppRoutingModule,
        MaterialModule,
        // MatMomentDateModule,
        MatLuxonDateModule,
        KlesMaterialDatepickerModule,
        // KlesMatMomentModule,
        KlesMatLuxonModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (HttpLoaderFactory),
                deps: [HttpClient]
            }
        })
    ],
    providers: [
        TranslateService,
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        /*{
            provide: KlesMatDatepickerIntl, deps: [TranslateService],
            useFactory: (translateService: TranslateService) => new DatepickerI18n(translateService).getDatepickerIntl()
        },*/
        provideHttpClient(withInterceptorsFromDi())
    ]
})
export class AppModule {
}

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
