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
import { createBrowserHistory, initRouter } from "@blendsdk/mobx-router";

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
