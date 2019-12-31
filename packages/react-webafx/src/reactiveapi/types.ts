/**
 * Interface describing a reactive http request
 *
 * @export
 * @interface IReactiveRequest
 * @template ResponseType
 */
export interface IReactiveRequest<ResponseType> {
    /**
     * Indicates if the request is fetching
     *
     * @type {boolean}
     * @memberof IReactiveRequest
     */
    fetching: boolean;
    /**
     * Reference to the request error
     *
     * @type {Error}
     * @memberof IReactiveRequest
     */
    error: Error;
    /**
     * Reference to the request result.
     *
     * @type {ResponseType}
     * @memberof IReactiveRequest
     */
    result: ResponseType;
}

/**
 * Type describing  the fetch action of a reactive request
 */
export type TReactiveFetchAction<RequestType> = (params?: RequestType) => any;
