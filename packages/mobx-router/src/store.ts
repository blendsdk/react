import { apply } from "@blendsdk/stdlib/dist/apply";
import { deepCopy } from "@blendsdk/stdlib/dist/deepcopy";
import { isNullOrUndefDefault } from "@blendsdk/stdlib/dist/isNullOrUndef";
import { IDictionary } from "@blendsdk/stdlib/dist/types";
import { wrapInArray } from "@blendsdk/stdlib/dist/wrapInArray";
import { History } from "history";
import { action, observable, reaction } from "mobx";
import pathToRegexp, { Key, PathFunction } from "path-to-regexp";
import { NotFound404 } from "./404";

export type TRouterComponent = (...params: any[]) => any;

/**
 * Name of a 404 route
 */
export const ROUTE_404 = "404";
/**
 * Name of a catch-all route
 */
export const ROUTE_CATCH_ALL = "*";

/**
 * Interface describing a Route
 *
 * @export
 * @interface IRoute
 */
export interface IRoute {
    /**
     * Name of this route
     *
     * @type {string}
     * @memberof IRoute
     */
    name?: string;
    /**
     * Path of this route. The path accepts path-to-regexp parameters
     *
     * @type {string}
     * @memberof IRoute
     */
    path: string;
    /**
     * The component that need to be rendered when the path is matched.
     *
     * @type {TRouterComponent}
     * @memberof IRoute
     */
    component: TRouterComponent;
    /**
     * Default parameter values
     *
     * @type {IDictionary}
     * @memberof IRoute
     */
    defaults?: IDictionary;
}

/**
 * Interface describing a parsed IRoute object
 *
 * @interface IParsedRoute
 */
interface IParsedRoute {
    matcher: RegExp;
    matcherKeys: Key[];
    toPath: PathFunction<any>;
    component: TRouterComponent;
    defaults: IDictionary;
}

/**
 * Interface describing a matched component
 *
 * @export
 * @interface IMatchedComponent
 */
export interface IMatchedComponent {
    component: TRouterComponent;
    params: IDictionary;
}

/**
 * A mobx store handling the URl changes
 *
 * @export
 * @class RouterStore
 */
export class RouterStore {
    /**
     * The observable location of the matched path
     *
     * @type {string}
     * @memberof RouterStore
     */
    @observable public location: string = "";

    /**
     * Global cache of compiled path-to-regexp instances
     *
     * @protected
     * @type {IDictionary}
     * @memberof RouterStore
     */
    protected urlBuilderCache: {
        [name: string]: IParsedRoute;
    } = {};

    /**
     * Reference to the provide history object from the
     * constructor
     *
     * @protected
     * @type {(History<any> | undefined)}
     * @memberof RouterStore
     */
    protected history?: History<any>;

    /**
     * Check if the urlBuilderCache is already initialized.
     *
     * @protected
     * @type {boolean}
     * @memberof RouterStore
     */
    protected initialized: boolean = false;

    /**
     * Creates an instance of RouterStore.
     * @param {History<any>} history
     * @memberof RouterStore
     */
    constructor(history: History<any>) {
        const me = this;
        me.history = history;

        // listen to the history changes
        me.history.listen(location => {
            if (location.state.reload) {
                window.location.reload(true);
            } else {
                me.location = location.pathname;
            }
        });

        // fire a reaction
        reaction(
            () => me.location,
            location => {
                me.location = location;
            }
        );

        // kick start the reaction for the first time
        this.location = history.location.pathname;
    }

    /**
     * Initializes a default 404 route
     *
     * @protected
     * @memberof RouterStore
     */
    protected init404() {
        const me = this;
        me.initRoute({
            name: ROUTE_404,
            path: `/${ROUTE_404}`,
            component: NotFound404
        });
    }

    /**
     * Initializes a single route
     *
     * @protected
     * @param {IRoute} route
     * @memberof RouterStore
     */
    protected initRoute(route: IRoute) {
        const me = this;
        route.name = route.name || route.path;
        if (!me.urlBuilderCache[route.name]) {
            const matcherKeys: Key[] = [],
                matcher = pathToRegexp(route.path, matcherKeys);
            me.urlBuilderCache[route.name] = {
                matcher,
                matcherKeys,
                toPath: pathToRegexp.compile(route.path),
                component: route.component,
                defaults: route.defaults
            };
        }
    }

    /**
     * Initializes the routes
     *
     * @param {IRoute[]} routes
     * @memberof RouterStore
     */
    public initRoutes(routes: IRoute[]) {
        const me = this;
        if (!me.initialized) {
            wrapInArray<IRoute>(routes || []).forEach(route => {
                me.initRoute(route);
            });
            me.init404();
            me.initialized = true;
        }
    }

    /**
     * Generates a URL based on a path name or a parameters.
     *
     * @param {string} pathName
     * @param {IDictionary} params
     * @returns
     * @memberof RouterStore
     */
    public generateUrl(pathName: string, params: IDictionary) {
        params = params || {};
        const me = this,
            route = me.urlBuilderCache[pathName] || null;
        if (route) {
            const { toPath, defaults } = route;
            return toPath(apply(params || {}, defaults));
        } else {
            return pathName;
        }
    }

    /**
     * Navigates the current location to a given route name
     *
     * @param {string} pathName
     * @param {IDictionary} [params]
     * @param {boolean} [reload]
     * @memberof RouterStore
     */
    @action
    public go(pathName: string, params?: IDictionary, reload?: boolean) {
        const me = this;
        me.history.push(me.generateUrl(pathName, params), { reload: isNullOrUndefDefault(reload, false) });
    }

    /**
     * Gets a fallback component in case no route is matched.
     *
     * @protected
     * @returns {IMatchedComponent}
     * @memberof RouterStore
     */
    protected getFallbackComponent(): IMatchedComponent {
        const me = this;
        return {
            component: (me.urlBuilderCache["*"] || me.urlBuilderCache[ROUTE_404]).component,
            params: {}
        };
    }

    /**
     * Gets the component based on the matched location
     *
     * @readonly
     * @memberof RouterStore
     */
    get MatchedComponent(): IMatchedComponent {
        const me = this;
        for (const name in me.urlBuilderCache) {
            if (me.urlBuilderCache[name]) {
                const item = me.urlBuilderCache[name];
                const { matcher, matcherKeys, component, defaults } = item;
                if (matcher.test(me.location)) {
                    // we have matched the route
                    const matched = (matcher.exec(me.location) || []).splice(1);
                    const params = deepCopy(defaults || {});
                    matcherKeys.forEach((key, index) => {
                        params[key.name] = matched[index] || undefined;
                    });
                    return { component, params };
                }
            }
        }
        return me.getFallbackComponent();
    }
}
