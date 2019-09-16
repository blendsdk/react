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
```
