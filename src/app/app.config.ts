import { registerLocaleData } from "@angular/common";
import localeFr from "@angular/common/locales/fr";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { ApplicationConfig, LOCALE_ID } from "@angular/core";
import { provideTranslateService } from "@ngx-translate/core";

registerLocaleData(localeFr);
export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withInterceptorsFromDi()),
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        provideTranslateService({
            fallbackLang: 'en',
            lang: 'en'
        })
    ]
};
