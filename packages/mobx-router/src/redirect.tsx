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
}

/**
 * Provides a simple router redirection.
 * @param props
 */
export const Redirect: React.FunctionComponent<IRedirectProps> = props => {
    const { to, params } = props,
        router = useRouter();
    useEffect(() => {
        router.go(to, params);
    });
    return <i />;
};
