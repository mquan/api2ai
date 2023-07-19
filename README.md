# ☁️🔗🧠 api2ai

⚡ Generate a conversational AI from any Open API spec ⚡

## Installation & Basic Usage

`yarn add --save api2ai`

The following example builds on top of OpenAI API, essentially creating a single endpoint for all OpenAI endpoints. Please check out the [demo code](https://github.com/mquan/api2ai/blob/main/demo/pages/api/ai.ts) for more details.

```typescript
import { ApiAgent } from "@api2ai";

const OPEN_AI_KEY = "sk-...";

// This example builds on top of the OpenAI API, essentially creating a single API for all OpenAI endpoints.
const agent = new ApiAgent({
  apiKey: OPEN_AI_KEY,
  model: "gpt-3.5-turbo-0613", // "gpt-4-turbo-0613" also works
  api: "path/to/your/open-api-spec.yaml",
});

const result = await agent.execute({
  userPrompt: "Create an image of Waikiki beach",
  context: { token: OPEN_AI_KEY },
});
```

## Features

api2ai allows you to integrate to any API using English, or any natural language:

- Automatically parses API spec and auth schemes
- Select endpoint and parse arguments provided in user prompt
- Invoke the API call and return the response
- Conserve tokens to reduce OpenAI cost, also bypass OpenAI 64 functions limit.

## Development

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
