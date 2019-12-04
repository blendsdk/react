import { apply } from "@blendsdk/stdlib/dist/apply";
import { SessionStore } from "./SessionStore";

/**
 * Interface that is used to configure the redirection routes
 *
 * @export
 * @interface IRedirectionConfig
 */
export interface IRedirectionConfig {
    loginRoute: string;
    dashboardRoute: string;
    sessionStore: SessionStore;
}

/**
 * Local instance of the redirection configuration
 */
let redirectionConfig: IRedirectionConfig = {
    loginRoute: null,
    dashboardRoute: null,
    sessionStore: null
};

/**
 * Configure the redirection configuration
 *
 * @export
 * @param {IRedirectionConfig} config
 */
export const configureRedirection = (config: IRedirectionConfig) => {
    redirectionConfig = apply(redirectionConfig, config, { overwrite: true });
};

/**
 * Get the session storage configuration
 */
export const getRedirectionConfig = (): IRedirectionConfig => {
    return redirectionConfig;
};
