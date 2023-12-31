import Security from "./security";

interface OperationInput {
  group: string;
  httpMethod: string;
  baseUrl: string;
  path: string;
  details: any;
  securities: Security[];
  auth?: any;
}

const EMPTY_ARGUMENT: object = {};

export default class Operation {
  group: string;
  httpMethod: string = "get";
  baseUrl: string;
  path: string;
  details: any;
  securities: Security[];
  auth: any;

  constructor({
    group,
    httpMethod,
    baseUrl,
    path,
    details,
    securities,
    auth,
  }: OperationInput) {
    this.group = group;
    this.httpMethod = httpMethod.toLowerCase();
    this.baseUrl = baseUrl;
    this.path = path;
    this.details = details;
    this.securities = securities;
    this.auth = auth;
  }

  operationId(): string {
    return this.details["operationId"];
  }

  summary(): string {
    return this.details["summary"].replace(/\.$/, "");
  }

  description(): string {
    return this.details["description"];
  }

  url(parsedParams?: any): string {
    const fullUrl: string = [
      this.baseUrl.replace(/\/$/, ""),
      this.path.replace(/^\//, ""),
    ].join("/");

    // Replace path params
    const urlParams: any = this._urlParams();

    if (Object.keys(urlParams).length === 0) {
      return fullUrl;
    }

    const selectedParams = this._selectParams({
      target: urlParams.properties,
      allParams: parsedParams,
    });

    let url: string = fullUrl;
    // TODO: raise an error if a required param is missing.
    for (let param in selectedParams) {
      url = url.replace(`{${param}}`, selectedParams[param]);
    }

    // TODO: add query param
    return url;
  }

  // TODO: accept context data for use in body and url params.
  async sendRequest({ headers, parsedParams, authData }: any) {
    // TODO: handle auth that's not in the headers.
    const auth = this._computeAuth(authData || this.auth);
    const requestHeaders = {
      ...this._requestContentType(),
      ...auth,
      ...(headers || {}),
    };
    const url = this.url(parsedParams);

    const body = this._selectParams({
      target: this._bodyParams()?.properties,
      allParams: parsedParams,
    });

    const requestBody = ["get", "head"].includes(this.httpMethod)
      ? {}
      : { body: JSON.stringify(body) };

    const response = await fetch(url, {
      method: this.httpMethod,
      headers: requestHeaders,
      ...requestBody,
    });
    const responseBody = await response.json();

    return {
      request: {
        url,
        method: this.httpMethod,
        headers: requestHeaders,
        ...requestBody,
      },
      response: {
        headers: response.headers,
        status: response.status,
        body: responseBody,
      },
    };
  }

  toFunction() {
    return {
      name: this.details["operationId"].replaceAll(/[^\w\_]/g, "_"),
      description: this.summary(),
      parameters: this._allParams(),
    };
  }

  _allParams() {
    const bodyParams: any = this._bodyParams();
    const urlParams: any = this._urlParams();

    const allParams = {
      ...(urlParams?.properties || {}),
      ...(bodyParams?.properties || {}),
    };

    const allRequired = bodyParams?.required || [];

    if (Object.keys(allParams).length) {
      return {
        type: "object",
        required: allRequired,
        properties: allParams,
      };
    } else {
      return EMPTY_ARGUMENT;
    }
  }

  _bodyParams() {
    const schema =
      this.details?.requestBody?.content["application/json"]?.schema;

    if (schema && Object.keys(schema).length) {
      return this._computeBodyParameters(schema);
    } else {
      return null;
    }
  }

  _urlParams() {
    const definedParams: any = this.details?.parameters || [];

    let params: any = {};
    let requiredItems: string[] = [];

    definedParams.forEach((param: any) => {
      // TODO: save the in key (path vs. query)
      // see if openai accept it

      params[param.name] = {
        type: param.schema?.type,
        description: param.description,
      };

      if (param.required) {
        requiredItems.push(param.name);
      }
    });

    if (Object.keys(params).length) {
      return {
        type: "object",
        properties: params,
        required: requiredItems,
      };
    } else {
      return EMPTY_ARGUMENT;
    }
  }

  _selectParams({ target, allParams }: any) {
    if (!target) {
      return {};
    }

    let result: any = {};

    for (let param in allParams) {
      if (target[param] && allParams[param]) {
        result[param] = allParams[param];
      }
    }

    return result;
  }

  _computeBodyParameters(schema: any) {
    let requiredItems: string[] = [];
    const properties: any = {};

    for (let propName in schema.properties) {
      const { required: isRequired, ...remainingProperty } =
        schema.properties[propName];

      properties[propName] = remainingProperty;

      if (isRequired) {
        requiredItems.push(propName);
      }
    }

    if (schema.required) {
      requiredItems = requiredItems.concat(schema.required);
    }

    const requiredSet = new Set(requiredItems);

    return {
      type: "object",
      properties,
      required: Array.from(requiredSet),
    };
  }

  _requestContentType() {
    if (
      !this.details?.requestBody ||
      this.details?.requestBody?.content["application/json"]
    ) {
      return { "Content-Type": "application/json" };
    } else if (this.details?.requestBody) {
      throw new Error(
        'Only "application/json" requestBody type is currently supported.'
      );
    }
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
