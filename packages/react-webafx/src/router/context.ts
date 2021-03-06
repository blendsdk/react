import { History } from "history";
import React from "react";
import { RouterStore } from "./store";

/**
 * Internal context of the RouterStore
 */
export let routerProvider: React.Context<RouterStore>;

/**
 * Instance to the RouterStore
 */
let routerStore: RouterStore = null;

/**
 * Returns a reference to the router store
 *
 * @export
 * @returns {RouterStore}
 */
export function getRouterStore(): RouterStore {
    return routerStore;
}

/**
 * Initializes the RouterStore provided
 * a History provider instance
 *
 * @export
 * @param {History<any>} history
 */
export function initRouter(history: History<any>) {
    routerStore = new RouterStore(history);
    routerProvider = React.createContext(routerStore);
}

/**
 * Hook providing the context to the RouterStore
 *
 * @export
 * @returns
 */
export function useRouter() {
    const store = React.useContext(routerProvider);
    if (!store) {
        throw new Error("You have forgot to use RouterProvider, shame on you.");
    }
    return store;
}
