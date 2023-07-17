import Security from "./security";

interface OperationInput {
  httpMethod: string;
  baseUrl: string;
  path: string;
  details: any;
  securities: Security[];
}

const EMPTY_ARGUMENT: object = {};

export default class Operation {
  httpMethod: string = "get";
  baseUrl: string;
  path: string;
  details: any;
  securities: Security[];

  constructor({
    httpMethod,
    baseUrl,
    path,
    details,
    securities,
  }: OperationInput) {
    this.httpMethod = httpMethod.toLowerCase();
    this.baseUrl = baseUrl;
    this.path = path;
    this.details = details;
    this.securities = securities;
  }

  summary(): string {
    return this.details["summary"].replace(/\.$/, "");
  }

  description(): string {
    return this.details["description"];
  }

  url(): string {
    return [this.baseUrl.replace(/\/$/, ""), this.path.replace(/^\//, "")].join(
      "/"
    );
  }

  async sendRequest({ headers, body, authData }: any) {
    // TODO: handle auth that's not in the headers.
    const auth = this._computeAuth(authData);
    const response = await fetch(this.url(), {
      method: this.httpMethod,
      body,
      headers: {
        ...this._requestContentType(),
        ...auth,
        ...(headers || {}),
      },
    });
    const json = await response.json();

    return json;
  }

  toFunction() {
    return {
      name: this.details["operationId"].replaceAll("-", "_"),
      description: this.summary(),
      parameters: this._parameters(),
    };
  }

  _requestContentType() {
    if (this.details?.requestBody?.content["application/json"]) {
      return { "Content-Type": "application/json" };
    } else {
      throw new Error(
        'Only "application/json" requestBody type is currently supported.'
      );
    }
  }

  _parameters() {
    const schema =
      this.details?.requestBody?.content["application/json"]?.schema;

    if (schema && Object.keys(schema).length) {
      return this._computeParameters(schema);
    } else {
      return EMPTY_ARGUMENT;
    }
  }

  _computeParameters(schema: any) {
    // TODO: handle query params
    const requiredItems: string[] = [];
    const properties: any = {};

    // console.log(JSON.stringify(schema))

    // What if requestBody.properties not an object?
    for (let propName in schema.properties) {
      const { required: isRequired, ...remainingProperty } =
        schema.properties[propName];

      properties[propName] = remainingProperty;

      if (isRequired) {
        requiredItems.push(propName);
      }
    }

    if (schema.required) {
      requiredItems.concat(schema.required);
    }

    return {
      type: "object",
      properties,
      required: [...new Set(requiredItems)],
    };
  }

  _computeAuth(data: any) {
    if (this.securities?.length === 0) {
      return {};
    }

    const errors: string[] = [];
    let result: any;

    this.securities.forEach((security) => {
      try {
        result = security.authData(data);
        if (result && Object.keys(result).length) {
          return;
        }
      } catch (error: any) {
        errors.push(error);
      }
    });

    if (result) {
      return result;
    } else if (errors.length) {
      throw errors[0];
    } else {
      return {};
    }
  }
}
