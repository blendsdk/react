import { IDictionary } from "@blendsdk/stdlib/dist/types";
import React, { useEffect } from "react";
import { useRouter } from "./context";

/**
 * Interface describing the parameters of a Redirect
 *
 * @export
 * @interface IRedirectProps
 * @extends {IDictionary}
 */
export interface IRedirectProps extends IDictionary {
    to: string;
    params?: IDictionary;
    reload?: boolean;
}

/**
 * Provides a simple router redirection.
 * @param props
 */
export const Redirect: React.FunctionComponent<IRedirectProps> = props => {
    const { to, params, reload } = props,
        router = useRouter();
    useEffect(() => {
        router.go(to, params, reload);
    });
    return <i />;
};
