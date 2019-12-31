import { apply } from "@blendsdk/stdlib/dist/apply";
import { wrapInArray } from "@blendsdk/stdlib/dist/wrapInArray";
import Cookie from "js-cookie";
import { computed, observable } from "mobx";

/**
 * Interface for configuring a SessionStore
 *
 * @export
 * @interface ISessionStoreConfig
 */
export interface ISessionStoreConfig {
    /**
     * A list of paths to skip the session checking
     *
     * @type {(string | string[])}
     * @memberof ISessionStoreConfig
     */
    skipPaths: string | string[];
    /**
     * TTL that the session will be refreshed (extended)
     *
     * @type {number}
     * @memberof ISessionStoreConfig
     */
    userInactivityTTLSeconds?: number;
    /**
     * An asynchronous function that is called to keep the session alive
     *
     * @memberof ISessionStoreConfig
     */
    keepAliveAPI: (...params: any[]) => Promise<any>;
}

/**
 * This class handles the current use session
 * and is responsible for refreshing the user token.
 * It also checks the user activity based on mousemove
 * and keypress events.
 *
 * @export
 * @class SessionStore
 */
export class SessionStore {

    protected config: ISessionStoreConfig;

    /**
     * List of paths to be skip for session checking
     *
     * @protected
     * @type {string[]}
     * @memberof SessionStore
     */
    protected skipPaths: string[];
    /**
     * A countdown that is used to track the user's mouse
     * and keyboard activity
     *
     * @protected
     * @type {number}
     * @memberof SessionStore
     */
    protected userActivityCountDown: number;
    /**
     * Session checker process ID
     *
     * @protected
     * @type {*}
     * @memberof SessionStore
     */
    protected userSessionInterval: any = null;
    /**
     * Time to refresh mark
     *
     * @protected
     * @type {number}
     * @memberof SessionStore
     */
    protected TTR: number;
    /**
     * Flag indicating if the token is being refreshed
     *
     * @protected
     * @type {boolean}
     * @memberof SessionStore
     */
    @observable protected _isTokenRefreshing: boolean = false;
    /**
     * Flag indicating if the session has timed out
     *
     * @type {boolean}
     * @memberof SessionStore
     */
    @observable protected _isSessionTimeout: boolean = false;

    /**
     * Computed property indicating if the session has timed out
     *
     * @readonly
     * @type {boolean}
     * @memberof SessionStore
     */
    @computed get sessionTimeout(): boolean {
        return this._isSessionTimeout;
    }

    /**
     * Computed property indicating if the current token is being refreshed
     */
    @computed get isTokenRefreshing(): boolean {
        return this._isTokenRefreshing;
    }

    /**
     * Creates an instance of SessionStore.
     * @param {(string | string[])} skipPaths
     * @memberof SessionStore
     */
    constructor(config?: ISessionStoreConfig) {
        this.config = config || {} as ISessionStoreConfig;
        this.config = apply(this.config, {
            skipPaths: [],
            userInactivityTTLSeconds: 15, // 15 minutes
            keepAliveAPI: null
        });
        this.skipPaths = wrapInArray<string>(this.config.skipPaths);
        this.setupDomEvents();
        this.watchUserSession();
    }

    /**
     * Check if the given current window.location is one of the
     * given paths, so the session checking can be skipped later.
     *
     * @protected
     * @param {(string | string[])} paths
     * @returns
     * @memberof SessionStore
     */
    protected shouldCheck() {
        for (const item in this.skipPaths) {
            if (item && window.location.href.indexOf(this.skipPaths[item]) !== -1) {
                return false;
            }
        }
        return true;
    }

    /**
     * Indicates if the user still has a session (token)
     *
     * @protected
     * @returns {number}
     * @memberof SessionStore
     */
    protected getTTL(): number {
        return parseFloat(Cookie.get("_session") || "") || -1;
    }

    /**
     * Check if the current user is authenticated and
     * has a session.
     *
     * @export
     * @returns {boolean}
     */
    public hasSession(): boolean {
        return this.getTTL() > Date.now();
    }

    /**
     * Calculates if the token should refresh
     *
     * @protected
     * @returns
     * @memberof SessionStore
     */
    protected shouldRefreshToken() {
        const now = Date.now();
        if (!this.TTR) {
            this.TTR = now + ((this.getTTL() - now) * 0.8);
        }
        return now > this.TTR;
    }

    /**
     * Check if the user is still active of the page
     *
     * @protected
     * @returns
     * @memberof SessionStore
     */
    protected isUserActive() {
        return this.userActivityCountDown > 0;
    }

    /**
     * Watch the user session and refresh the user token if needed.
     *
     * @protected
     * @memberof SessionStore
     */
    protected watchUserSession() {
        if (this.shouldCheck()) {
            if (!this.userSessionInterval) {
                // start fresh!
                this.resetUserActivity();
                this.userSessionInterval = setInterval(async () => {
                    if (this.hasSession()) {
                        if (this.shouldRefreshToken() && this.isUserActive()) {
                            this._isTokenRefreshing = true;
                            await this.config.keepAliveAPI();
                            this._isTokenRefreshing = false;
                            this.TTR = undefined;
                        }
                    } else {
                        this._isTokenRefreshing = false;
                        this._isSessionTimeout = true;
                        clearInterval(this.userSessionInterval);
                    }
                    this.userActivityCountDown = this.userActivityCountDown - 1;
                }, 1000);

            }
        }
    }

    /**
     * Extends (resets) the current user activity
     *
     * @protected
     * @memberof SessionStore
     */
    protected resetUserActivity() {
        if (this.hasSession()) {
            this.userActivityCountDown = this.config.userInactivityTTLSeconds;
        }
    }

    /**
     * Sets up the mouse and keyboard activity events
     *
     * @protected
     * @memberof SessionStore
     */
    protected setupDomEvents() {
        window.document.addEventListener("mousemove", this.resetUserActivity.bind(this));
        window.document.addEventListener("keydown", this.resetUserActivity.bind(this));
    }

}
