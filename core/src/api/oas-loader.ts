import SwaggerParser from "@apidevtools/swagger-parser";
import Operation from "./operation";
import Security from "./security";

import postmanToOpenApi from "postman-to-openapi";

import { promises as fs } from "fs";

const parseSecurities = (api: any) => {
  if (!api.components?.securitySchemes) {
    console.warn("No `securitySchemes` found in this API spec.");
    return {};
  }

  const securities: any = {};

  for (const [name, data] of Object.entries(api.components?.securitySchemes)) {
    securities[name] = new Security(data);
  }

  return securities;
};

const selectSecurities = ({
  details,
  securities,
  api,
}: {
  details: any;
  securities: any;
  api: any;
}) => {
  /* Notes:
    - there can be multiple security schemes per endpoint/api
    - use the default api definition if endpoint does not override
    - fallback to empty array b/c it's possible an endpoint does not require auth.
  */
  const definedSecurities = details.security || api.security || [];

  return definedSecurities.map((rawSecurity: object) => {
    const name = Object.keys(rawSecurity)[0];
    if (!securities[name]) {
      throw new Error(`Invalid security '${name}' reference.`);
    }
    return securities[name];
  });
};

const parseJSON = async (filename: string) => {
  const rawText: string = await fs.readFile(filename, "utf8");

  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
};

const isPostmanCollection = async (filename: string) => {
  // Detect and parse postman collection into OAS or default to SwaggerParser.
  const json = await parseJSON(filename);

  return !!json?.info?._postman_id;
};

const parseAPI = async (filename: string) => {
  const isPostman = await isPostmanCollection(filename);

  if (isPostman) {
    const oas = await postmanToOpenApi(filename, undefined, {
      replaceVars: true,
      outputFormat: "json",
      operationId: "auto",
      defaultTag: "General",
    });

    return JSON.parse(oas);
  } else {
    return await SwaggerParser.dereference(filename);
  }
};

export const parse = async ({
  filename,
  auth,
}: {
  filename: string;
  auth?: object;
}) => {
  const api = await parseAPI(filename);
  const securities = parseSecurities(api);

  const operations: Operation[] = [];

  for (let path in api.paths) {
    for (let httpMethod in api.paths[path]) {
      const details = api.paths[path][httpMethod];

      const selectedSecurities = selectSecurities({ details, securities, api });

      operations.push(
        new Operation({
          group: api.info?.title,
          httpMethod,
          path,
          baseUrl: api.servers[0].url, // TODO: allow picking baseUrl
          details,
          securities: selectedSecurities,
          auth: auth,
        })
      );
    }
  }

  return operations;
};
