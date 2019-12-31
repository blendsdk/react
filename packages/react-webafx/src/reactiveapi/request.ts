import { TServerRequest } from "@blendsdk/clientkit";
import { useRef, useState } from "react";
import { IReactiveRequest, TReactiveFetchAction } from "./types";

/**
 * Type describing the return type of a reactive request.
 * The return type has a reference to the fetch function a and the
 * call state.
 */
export type TReactiveRequestHookResult<RequestType, ResultType> = [
    IReactiveRequest<ResultType>,
    TReactiveFetchAction<RequestType>
];

/**
 * Describing the hook function that is returned from makeReactiveHttpRequest(...) method.
 */
export type TReactiveRequestHook<RequestType, ResultType> = (
    defaultValue?: ResultType
) => TReactiveRequestHookResult<RequestType, ResultType>;

/**
 * This function takes an httpRequest from "@blendsdk/clientkit"
 * and returns a reactive version of the httpRequest.
 *
 * @export
 * @template RequestType
 * @template ResponseType
 * @template ResultType
 * @param {TServerRequest<RequestType, ResponseType>} httpRequest
 * @param {(response: ResponseType) => ResultType} [converter]
 * @returns
 */
export function makeReactiveHttpRequest<RequestType, ResponseType, ResultType>(
    httpRequest: TServerRequest<RequestType, ResponseType>,
    converter?: (response: ResponseType) => ResultType
): TReactiveRequestHook<RequestType, ResultType> {
    let isFetching = false;
    const defaultConverter = (res: ResponseType): ResultType => {
        return (res as any) as ResultType;
    };
    return (defaultValue?: ResultType): TReactiveRequestHookResult<RequestType, ResultType> => {
        const [state, setState] = useState({
            fetching: false,
            result: defaultValue,
            error: null
        });
        const fetch = (params?: RequestType) => {
            if (!isFetching) {
                isFetching = true;
                setState({ ...state, fetching: true, error: null });
                httpRequest(params || ({} as any))
                    .then(res => {
                        setState({ ...state, fetching: false, result: (converter || defaultConverter)(res) });
                    })
                    .catch(err => {
                        setState({ ...state, fetching: false, error: err });
                    })
                    .finally(() => {
                        isFetching = false;
                    });
            }
        };
        return [state, useRef(fetch).current];
    };
}
