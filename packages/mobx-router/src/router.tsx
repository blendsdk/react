import { observer } from "mobx-react";
import React, { useEffect, ReactNode } from "react";
import { useRouter, routerProvider } from "./context";
import { IRoute } from "./store";

export interface RouterProps {
    routes: IRoute[];
}

export const Router = observer(({ routes }: RouterProps) => {
    const routerStore = useRouter();
    routerStore.initRoutes(routes);

    useEffect(() => {
        // no-op
    }, [routerStore.location]);

    const {component, params} = routerStore.MatchedComponent;

    // Why ?
    const Component = component;

    return <Component {...params} />;
});

export const Dummy = observer(() => {
    return <div>Dummy</div>
});

export interface RouterProviderProps {
    children?: ReactNode
}

export const RouterProvider = ({children}:RouterProviderProps) => {
    const store = React.useContext(routerProvider);
    return <routerProvider.Provider value={store}>{children}</routerProvider.Provider>
}