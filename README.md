# ☁️⇨🤖🧠 api2ai

⚡ Generate a conversational AI from any Open API spec ⚡

<img width="680" alt="api2ai demo with multiple APIs" src="https://github.com/mquan/api2ai/assets/138784/6719fdb2-6687-4768-a599-d61d7ab454a6">

## Features

**api2ai** lets you to interface with any API using English, or any natural language.

- Automatically parses API spec and auth schemes
- Select endpoint and parse arguments provided in user prompt
- Invoke the API call and return the response
- Comes with a local API

<img width="901" alt="api2ai demo with multiple languages" src="https://github.com/mquan/api2ai/assets/138784/aead4548-7d61-4ec6-8228-7c999e182cf0">

## Installation

`yarn add --save @api2ai/core`

## Quickstart

The following example builds on top of OpenAI API, essentially creating a single endpoint for all OpenAI endpoints. Please check out the [demo code](https://github.com/mquan/api2ai/blob/main/demo/pages/api/ai.ts) for more details.

```typescript
import { ApiAgent } from "@api2ai/core";

const OPEN_AI_KEY = "sk-...";

const agent = new ApiAgent({
  apiKey: OPEN_AI_KEY,
  model: "gpt-3.5-turbo-0613", // "gpt-4-0613" also works
  api: "path/to/your/open-api-spec.yaml",
});

const result = await agent.execute({
  userPrompt: "Create an image of Waikiki beach",
  context: { token: OPEN_AI_KEY },
  verbose: true, // default: false
});
```

## Development & Contributing

We use yarn and [turbo](https://turbo.build/). Please clone the repo and install both in order to run the demo and build in your machine.

```
yarn install
yarn build
```

To run the demo app

`yarn dev`

Access the demo from `http://localhost:5555/`

To run all tests

`yarn test`

Run a single test file

`turbo run test -- core/src/api/__tests__/operation.test.ts`
