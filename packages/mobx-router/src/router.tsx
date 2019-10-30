import { observer } from "mobx-react";
import React, { ReactNode, useEffect } from "react";
import { routerProvider, useRouter } from "./context";
import { IRoute } from "./store";

export interface IRouterProps {
    routes: IRoute[];
}

export const Router = observer(({ routes }: IRouterProps) => {
    const routerStore = useRouter();
    routerStore.initRoutes(routes);

    useEffect(() => {
        // no-op
    }, [routerStore.location]);

    const { component, params, routeName } = routerStore.MatchedComponent;

    if (component) {
        // Why ?
        const Component = component;
        return <Component {...params} />;
    } else {
        throw new Error(`Invalid React component provided for route ${routeName}: ${component}`);
    }
});

export const Dummy = observer(() => {
    return <div>Dummy</div>;
});

export interface IRouterProviderProps {
    children?: ReactNode;
}

export const RouterProvider = ({ children }: IRouterProviderProps) => {
    const store = React.useContext(routerProvider);
    return <routerProvider.Provider value={store}>{children}</routerProvider.Provider>;
};
