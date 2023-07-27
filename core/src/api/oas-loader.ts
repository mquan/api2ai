import SwaggerParser from "@apidevtools/swagger-parser";
import Operation from "./operation";
import Security from "./security";

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

export const parse = async (filename: string) => {
  const api = await SwaggerParser.dereference(filename);
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
        })
      );
    }
  }

  return operations;
};
