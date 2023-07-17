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
      description: this.details["summary"],
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
    const requestBody =
      this.details?.requestBody?.content["application/json"]?.schema;

    if (requestBody && Object.keys(requestBody).length) {
      return this._computeParameters(requestBody);
    } else {
      return EMPTY_ARGUMENT;
    }
  }

  _computeParameters(requestBody: any) {
    // TODO: handle query params
    const required: string[] = [];
    const properties: any = {};

    // What if requestBody.properties not an object?
    for (let propName in requestBody.properties) {
      const property = requestBody.properties[propName];

      properties[propName] = {
        type: property.type,
        description: property.description,
      };

      if (property.required) {
        required.push(propName);
      }
    }

    return {
      type: "object",
      properties,
      required,
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
