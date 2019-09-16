import { IDictionary } from "@blendsdk/stdlib/dist/types";
import React, { ReactNode } from "react";
import { useRouter } from "./context";

/**
 * Interface describing the parameters of a Link
 *
 * @export
 * @interface ILinkProps
 * @extends {IDictionary}
 */
export interface ILinkProps extends IDictionary {
    to: string;
    reload?: boolean;
    params?: IDictionary;
    children?: ReactNode;
}

/**
 * Provides a simple router redirection using an HTML Anchor
 * @param props
 */
export const Link: React.FunctionComponent<ILinkProps> = props => {
    const { children, to, params, reload } = props,
        reduced = { ...props },
        router = useRouter(),
        rel = reload === undefined ? false : reload,
        handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            if (!rel) {
                e.preventDefault();
                router.go(to, params);
            }
        },
        handleKeyPress = (e: React.KeyboardEvent) => {
            if (!rel) {
                e.preventDefault();
                if ((e.charCode || e.keyCode || e.which) === 13 || (e.charCode || e.keyCode || e.which) === 32) {
                    router.go(to, params);
                }
            }
        };

    ["to", "params"].forEach(p => {
        delete reduced[p];
    });
    return (
        <a href={router.generateUrl(to, params)} onClick={handleClick} onKeyPress={handleKeyPress}>
            {children}
        </a>
    );
};
