import { deepCopy } from "@blendsdk/stdlib/dist/deepcopy";
import { IDictionary } from "@blendsdk/stdlib/dist/types";
import { wrapInArray } from "@blendsdk/stdlib/dist/wrapInArray";
import { apply } from "@blendsdk/stdlib/dist/apply";
import { History } from "history";
import { observable, reaction, action } from "mobx";
import { NotFound404 } from "./404"
import pathToRegexp, { Key, PathFunction } from "path-to-regexp";

export type TRouterComponent = (...params: any[]) => any;

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
    matcher: RegExp,
    matcherKeys: Key[],
    toPath: PathFunction<any>
    component: TRouterComponent,
    defaults: IDictionary
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
        [name: string]: IParsedRoute
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
        let me = this;
        me.history = history;

        // listen to the history changes
        me.history.listen((location) => {
            me.location = location.pathname;
        });

        // fire a reaction
        reaction(
            () => me.location,
            (location) => {
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
            name: '404',
            path: '/404',
            component: NotFound404
        })
    }

    /**
     * Initialoizes a single route
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
            }
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
                me.initRoute(route)
            });
            me.init404();
            me.initialized = true;
        }
    }

    @action
    public go(pathName: string, params?: IDictionary) {
        const me = this,
            route = me.urlBuilderCache[pathName] || null;
        if (route) {
            const { toPath, defaults } = route;
            me.history.push(toPath(apply(params || {}, defaults)));
        } else {
            me.history.push(pathName)
        }
    }

    /**
     * Gets the component based on the matched location
     *
     * @readonly
     * @memberof RouterStore
     */
    get MatchedComponent(): IMatchedComponent {
        const me = this;
        for(let index in me.urlBuilderCache) {
            const item = me.urlBuilderCache[index];
            const {
                matcher,
                matcherKeys,
                component,
                defaults } = item;
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
        return { component: me.urlBuilderCache['404'].component, params: {} }
    }
}
