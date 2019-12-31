import { TServerRequest } from "@blendsdk/clientkit";
import { action, decorate, observable, runInAction } from "mobx";
import { IReactiveRequest, TReactiveFetchAction } from "./types";

export interface IReactiveAction<RequestType, ResponseType> extends IReactiveRequest<ResponseType> {
    fetch: TReactiveFetchAction<RequestType>;
}

/**
 * Method signature of the handler that is  provided to the makeReactive(...) method.
 */
export type TReactiveResultHandler<ResponseType> = (result: ResponseType, err?: Error) => void;

/**
 * Creates a reactive version of a REST API.
 *
 * @export
 * @template RequestType
 * @template ResponseType
 * @param {TServerRequest<RequestType, ResponseType>} restAPI
 * @returns {IReactiveRequest<RequestType, ResponseType>}
 */
export function makeReactiveAction<RequestType, ResponseType>(
    restAPI: TServerRequest<RequestType, ResponseType>,
    handler?: TReactiveResultHandler<ResponseType>
): IReactiveAction<RequestType, ResponseType> {
    const clazz = class implements IReactiveRequest<ResponseType> {
        /**
         * Observable property indicating whether the fetch request
         * is still in progress
         *
         * @readonly
         * @type {boolean}
         */
        public fetching: boolean = false;

        /**
         * Observable property returning the fetch error.
         *
         * @readonly
         * @type {Error}
         */
        public error: Error = null;

        /**
         * Observable property returning the fetched results
         *
         * @readonly
         * @type {ResponseType}
         */
        public result: ResponseType = null;

        /**
         * Fetches result by performing the REST API request
         *
         * @param {RequestType} [params]
         * @param {TReactiveResultHandler<ResponseType>} [handler]
         */
        public async fetch(params?: RequestType) {
            // reset the fetch
            try {
                runInAction(() => {
                    this.fetching = true;
                    this.error = null;
                });
                const response = await restAPI(params || ({} as RequestType));
                runInAction(() => {
                    this.result = response;
                    if (handler) {
                        handler(response, this.error);
                    }
                });
            } catch (err) {
                runInAction(() => {
                    this.error = err;
                });
            } finally {
                runInAction(() => {
                    this.fetching = false;
                });
            }
        }
    };
    decorate(clazz, {
        fetching: observable,
        error: observable,
        result: observable,
        fetch: action.bound
    });
    return new clazz();
}
