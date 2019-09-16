import { deepCopy } from "@blendsdk/stdlib/dist/deepcopy";
import { IDictionary } from "@blendsdk/stdlib/dist/types";
import { wrapInArray } from "@blendsdk/stdlib/dist/wrapInArray";
import { History } from "history";
import { observable, reaction } from "mobx";
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

type TConfiguredRoute = [RegExp, Key[], PathFunction<any>, TRouterComponent, IDictionary];
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
        [name: string]: TConfiguredRoute
    } = {};

    /**
     * Reference to the provide history object from the
     * constructor
     *
     * @protected
     * @type {(History<any> | undefined)}
     * @memberof RouterStore
     */
    protected history: History<any> | undefined;

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

    public initRoutes(routes: IRoute[]) {
        let me = this;
        if (!me.initialized) {
            wrapInArray<IRoute>(routes || []).forEach(route => {
                // make sure we always have a name
                route.name = route.name || route.path;
                if (!me.urlBuilderCache[route.name]) {
                    const matcherKeys: Key[] = [],
                        matcher = pathToRegexp(route.path, matcherKeys);

                    me.urlBuilderCache[route.name] = [
                        matcher,
                        matcherKeys,
                        pathToRegexp.compile(route.path),
                        route.component, route.defaults || {}];
                }
            });
            me.initialized = true;
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
        let result: IMatchedComponent = { component: null, params: null } as any;
        (Object.values(me.urlBuilderCache) || []).forEach((item: TConfiguredRoute) => {
            if (!result) {
                const [
                    matcher,
                    matcherKeys,
                    toPath,
                    component,
                    defaults] = item;

                if (matcher.test(me.location)) {
                    // we have matched the route
                    const matched = (matcher.exec(me.location) || []).splice(1);
                    const params = deepCopy(defaults || {});
                    matcherKeys.forEach((key, index) => {
                        params[key.name] = matched[index] || undefined;
                    });
                    result = { component, params };
                }
            }
        });
        return result;
    }
}
