import { isString } from "@storm-stack/types";
import {
  cleanDoubleSlashes,
  parseAuth,
  ParsedAuth,
  ParsedHost,
  parsePath,
  parseQuery,
  parseURL,
  stringifyParsedURL
} from "ufo";
import { StormParser } from "./storm-parser";
import { StormURL } from "./types";

export class StormURLBuilder {
  #url: StormURL;

  constructor(url: string | StormURL) {
    const parsedURL = isString(url) ? parseURL(url) : url;

    this.#url = {
      __typename: "StormURL",
      query: {},
      ...parsedURL
    };
    if (this.#url.host) {
      this.withHost(this.#url.host);
    }
    if (this.#url.auth) {
      this.withAuth(this.#url.auth);
    }
  }

  public get url(): StormURL {
    return this.#url;
  }

  // public join(...paths: string[]): UrlBuilder {
  //   this.#url = joinURL(this.#url., ...paths.map(param => decodePath(param)));
  //   return this;
  // }

  public withHost(host: string | ParsedHost): StormURLBuilder {
    if (isString(host)) {
      this.#url.host = host;

      const parsedAuth = parseAuth(host);
      this.#url.username = parsedAuth.username;
      this.#url.password = parsedAuth.password;
    } else {
      this.#url.hostname = host.hostname;
      this.#url.port = host.port;

      this.#url.auth = `${host.hostname}${host.port ? `:${host.port}` : ""}`;
    }
    return this;
  }

  public withPath(path: string): URLBuilder {
    const parsedPath = parsePath(path);
    this.#url = {
      ...this.#url,
      ...parsedPath
    };

    return this;
  }

  public withAuth(auth: string | ParsedAuth): StormURLBuilder {
    if (isString(auth)) {
      this.#url.auth = auth;

      const parsedAuth = parseAuth(auth);
      this.#url.username = parsedAuth.username;
      this.#url.password = parsedAuth.password;
    } else {
      this.#url.username = auth.username;
      this.#url.password = auth.password;

      this.#url.auth = `${auth.username}:${auth.password}`;
    }

    return this;
  }

  public withQuery(
    query: string | [string, any] | Record<string, any>
  ): StormURLBuilder {
    this.#url.query = {} as Record<string, any>;
    this.addQueryParam(query);

    return this;
  }

  public addQueryParam(
    query: string | [string, any] | Record<string, any>
  ): StormURLBuilder {
    if (isString(query)) {
      const parsedQuery: Record<string, string | string[]> = parseQuery(query);
      for (const entry in Object.entries(parsedQuery)) {
        if (entry[0]) {
          this.#url.query[entry[0]] = this.parseQueryParamValue(entry[1]);
        }
      }
    } else if (Array.isArray(query) && query.length === 2) {
      this.#url.query[query[0]] = this.parseQueryParamValue(query[1]);
    } else {
      for (const entry in Object.entries(query)) {
        if (entry[0]) {
          this.#url.query[entry[0]] = this.parseQueryParamValue(entry[1]);
        }
      }
    }

    return this;
  }

  public build(): StormURL {
    return this.#url;
  }

  public toString(): string {
    return cleanDoubleSlashes(stringifyParsedURL(this.#url));
  }

  private parseQueryParamValue(value: any): any {
    if (Array.isArray(value)) {
      const values = [];
      for (const item in value) {
        values.push(this.parseQueryParamValue(item));
      }
      return values;
    } else {
      return StormParser.parse(value);
    }
  }
}
