import { IDictionary } from "@blendsdk/stdlib/dist/types";
import { observer } from "mobx-react";
import React, { ReactNode, useEffect } from "react";
import { routerProvider, useRouter } from "./context";
import { IRoute } from "./store";

/**
 * Interface describing the parameters of a RouterLink
 *
 * @export
 * @interface IRouterLinkProps
 * @extends {IDictionary}
 */
export interface IRouterLinkProps extends IDictionary {
    to: string;
    params?: IDictionary;
    children?: ReactNode;
}

/**
 * Provides a simple router  redirection using an HTML Anchor
 * @param props
 */
export const RouterLink: React.FunctionComponent<IRouterLinkProps> = props => {
    const { children, to, params } = props,
        reduced = { ...props },
        router = useRouter(),
        handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            router.go(to, params);
        },
        handleKeypress = (e: React.KeyboardEvent) => {
            if ((e.keyCode || e.charCode || e.which) === 13 || (e.keyCode || e.charCode || e.which) === 32) {
                router.go(to, params);
            }
        };
    ["to", "params"].forEach(p => {
        delete reduced[p];
    });
    return (
        <a href="#" {...reduced} onClick={handleClick} onKeyPress={handleKeypress}>
            {children}
        </a>
    );
};
