export default class Security {
  type: string;
  scheme?: string;
  name?: string;
  inKey?: string;

  constructor(authInput: any) {
    this.type = authInput.type;
    this.scheme = authInput.scheme;
    this.name = authInput.name;
    this.inKey = authInput.in;

    this.validateInput();
  }

  validateInput() {
    if (this.type === "http") {
      if (this.scheme !== "bearer" && this.scheme !== "basic") {
        throw new Error(`Security scheme '${this.scheme}' is not supported.`);
      }
    } else if (this.type === "apiKey") {
      if (!this.name) {
        throw new Error("Security type apiKey requires `name`.");
      }
    } else {
      throw new Error(`Security type '${this.type}' is not supported.`);
    }
  }

  authData(data: any) {
    const val: any = {};

    if (this.type === "http") {
      if (this.scheme === "bearer") {
        if (!data?.token) {
          throw new Error("`token` is required for bearer auth");
        }
        val["Authorization"] = `Bearer ${data.token}`;
      } else if (this.scheme === "basic") {
        if (!data?.username || !data?.password) {
          throw new Error(
            "`username` and `password` are required for basic auth"
          );
        }

        val["Authorization"] = `Basic ${Buffer.from(
          `${data.username}:${data.password}`
        ).toString("base64")}`;
      } else {
        throw new Error(`Security scheme '${this.scheme}' is not supported.`);
      }
    } else if (this.type === "apiKey") {
      if (this.name && (!data || !data[this.name])) {
        throw new Error(`"${this.name}" is required for API key auth`);
      }

      if (this.name && data[this.name]) {
        val[this.name] = data[this.name];
      }
    }

    return val;
  }
}
