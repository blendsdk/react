import { Redirect } from "@blendsdk/react-router";
import { observer } from "mobx-react";
import React, { Fragment } from "react";
import { getRedirectionConfig } from "./Configuration";

/**
 * Interface for describing the authentication
 * state properties.
 *
 * @export
 * @interface IWithAuthentication
 */
export interface IAuthenticationProps {
    redirectLocation?: string;
}

/**
 * The two components below do not use a computed property
 * from the sessionStore.
 *
 * The hasSession(...) is not computed. This means that the redirection
 * logic will only work on a page (re)load. This is intentional because
 * we want to show the user that their session has expired and their need to log
 * on again.
 */

/**
 * Redirection component that is used to redirect the UI logic
 * for views that must not have an authenticated user
 */
export const NotAuthenticated: React.FC<IAuthenticationProps> = observer<
    React.FC<IAuthenticationProps>
>(({ redirectLocation, children }) => {
    const { sessionStore, dashboardRoute } = getRedirectionConfig();
    return sessionStore.hasSession() === true ? (
        <Redirect to={redirectLocation || dashboardRoute} reload={true} />
    ) : (
        <Fragment>{children}</Fragment>
    );
});

/**
 * Redirection component that is used to redirect the UI logic
 * for views that must have an authenticated user
 */

export const WithAuthentication: React.FC<IAuthenticationProps> = observer<
    React.FC<IAuthenticationProps>
>(({ redirectLocation, children }) => {
    const { sessionStore, loginRoute } = getRedirectionConfig();
    return sessionStore.hasSession() === false ? (
        <Redirect to={redirectLocation || loginRoute} reload={true} />
    ) : (
        <Fragment>{children}</Fragment>
    );
});
