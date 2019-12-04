# Mobx React Router

This package provides a URL Router component based on Mobx and the History API.

The utilities and the component is this package are written in TypeScript and
they are meant to be used in a React TypeScript project.

## Installation

```sh
npm install @blendsdk/mobx-router --save
```

```sh
yarn add @blendsdk/mobx-router
```

## Usage

```ts
import {
    createBrowserHistory,
    initRouter,
    IRoute,
    Link,
    Redirect,
    ROUTE_404,
    ROUTE_CATCH_ALL,
    Router,
    useRouter
} from "@blendsdk/mobx-router";

// Step 1: First we initialize the History provider
// For more information the the history package on npmjs
initRouter(createBrowserHistory());

// Step 2: Create some routes
//     Every rout needs to have:
//          - A name; that is used to identify the Route
//          - A path; that is used as a template to generate an URL
//          - A component; that is rendered in the incoming URL is matched to the path
//          - Optionally; a key/value pare providing default values for the path parameters
const routes: IRoute[] = [
    {
        name: "dashboard",
        path: "/",
        component: Dashboard
    },
    {
        name: "greet",
        path: "/greet/:name/name",
        component: Greet,
        // The default value of the :name parameter
        defaults: {
            name: "Johny Bravo"
        }
    },
    {
        // If no route is matched then this one is chosen as fallback
        name: ROUTE_CATCH_ALL,
        path: "",
        component: Dashboard
    }
];

// Step 3: Render the router with the routes parameter
const Main = () => {
    return <Router routes={routes}></Router>;
};

ReactDOM.render(<Main />, document.getElementById("root"));
```

## 404 Route

If you do not wish to configure a `catch all` route then you have the option to configure a 404
route to catch the unmatched location changes. The `Router` component provides a default 404 route
if the incoming URL is not matched and there is also no `catch all` route.

To customize the built-in 404 route, just configure a route similar to:

```ts
....
    {
        name: ROUTE_404,
        path:"/not-found", // or something meaningful path name
        component: My404PageComponent // your custom 404 page
    }
....
```

## The `Link` component

This component provides an easy way to render a link that is handled by the `Router`.

Properties:

-   `to` is the name of the route
-   `params` is a key/value pare to set the route parameters
-   `reload` an optional boolean that if set to true will reload the page when the link is clicked

```ts
<Link to='name-of-the-route' params={{ name: "sally" }} reload={true}>
    Text goes here...
</Link>
```

```ts
<Link to='order-items' params={{ order: someValue }}>
    Text goes here
</Link>
```

## The `Redirect` component

This component is similar to the `Link` component except that is does not generate a user interface.
When this component is rendered it will immediately redirect the to provided route.

Properties:

-   `to` is the name of the route
-   `params` is a key/value pare to set the route parameters
-   `reload` an optional boolean that if set to true will redirect by reloading the page.

```ts
const SomeComponent = () => {
    return authenticated ? <Dashboard /> : <Redirect to='login' params={{ param1: true }} reload={true} />;
};
```

## Hooks

In order to get a reference to the router you can make use of the `useRouter` hook

```ts
const Component = () => {
    const router = useRouter();
    ...
};
```

## API

The router component provides the following API

### The `go` method

```ts
    const router = useRouter();

    // Navigate to a route
    router.go('name-of-the-route', { param1,'value1' });

    // Navigate to a route by reloading the page
    router.go('name-of-the-route', { param1,'value1' }, true);
```

### The `generateUrl`

This method generates a URL based on a path name or a parameters.

```ts
const router = useRouter();
const url = router.generateUrl("order-item", { orderNumber: 1000 });
```

## License

MIT
