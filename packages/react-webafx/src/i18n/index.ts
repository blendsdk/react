import { ITranslationDatabase, Translation, TTranslatorFunction } from "@blendsdk/i18n";
import { useEffect, useState } from "react";

/**
 * Interface describing a translation response
 *
 * @export
 * @interface ITranslationsResponse
 */
export interface ITranslationsResponse {
    translations: ITranslationDatabase;
}

export function makeTranslations<T extends ITranslationsResponse>(loader: () => Promise<T>) {
    const translator = new Translation();
    /**
     * Indicate if the translations is already loaded before
     * so we don't make a new call to the backend.
     */
    let isLoaded = false;

    /**
     * Actual hook function that is returned to the consumer.
     */
    return (): [boolean, TTranslatorFunction, (locale: string) => void] => {

        /**
         * State indicating when the translation are loaded and ready to be used.
         */
        const [ready, setReady] = useState(false);
        /**
         *
         * @param key Wrapper function for translator.translate(...)
         * @param parameters
         * @param plural
         * @param tlocale
         */
        const translate = (key: string, parameters?: any, plural?: boolean, tlocale?: string): string => {
            return translator.translate(key, parameters, plural, tlocale);
        };
        /**
         * Side effect that triggers the load process
         */
        useEffect(() => {
            // only load if the translations database is noy loaded before
            if (!isLoaded) {
                isLoaded = true;
                loader().then(result => {
                    translator.loadTranslation(result.translations);
                    setReady(true);
                });
            }
        }, []);

        return [
            ready,
            translate,
            (locale: string) => {
                translator.setLocale(locale);
            }
        ];
    };
}