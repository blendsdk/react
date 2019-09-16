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

    const { component, params } = routerStore.MatchedComponent;

    // Why ?
    const Component = component;

    return <Component {...params} />;
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
