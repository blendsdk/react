import React from "react";

export type TReactNodeProvider = () => React.FunctionComponent | JSX.Element;

export interface IRoute {
    path: string;
    component?: JSX.Element | TReactNodeProvider;
    defaults?: any;
}

interface IRouterStoreConfig {
    routes: IRoute[];
    onRoute?: (newRoute: IRoute, prevRoute: IRoute) => TReactNodeProvider | undefined;
}

export function NotFound404() {
    return <div>The page you are looking for is not found!</div>;
}

export const config: IRouterStoreConfig = {
    routes: [
        {
            path: "/dashboard"
        },
        {
            path: "/login"
        },
        {
            path: "/reset-password"
        },
        {
            path: "sign-up"
        },
        {
            path: "*", // catch all,
            component: NotFound404
        }
    ]
};

export class RouterStore {
    public installRoutes(config: IRouterStoreConfig) {
        if (config) {
        }
    }
}

const routerStore: RouterStore = new RouterStore();
export const routerProvider = React.createContext<RouterStore>(routerStore);

export function createRouter(config: IRouterStoreConfig) {
    routerStore.installRoutes(config);
}

export function useRouter() {
    const store = React.useContext(routerProvider);
    if (!store) {
        throw new Error("The RouterProvider is not present!");
    }
    return store;
}
