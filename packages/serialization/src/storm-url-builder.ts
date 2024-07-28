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

/**
 * A class used to build URLs
 *
 * @remarks
 * This class is used to build URLs with a fluent API
 */
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

  /**
   * Set the protocol of the URL
   *
   * @param protocol - The protocol to set
   * @returns The URL builder
   */
  public withProtocol(protocol: string): StormURLBuilder {
    this.#url.protocol = protocol;
    return this;
  }

  /**
   * Set the hostname of the URL
   *
   * @param hostname - The hostname to set
   * @returns The URL builder
   */
  public withHostname(hostname: string): StormURLBuilder {
    this.#url.hostname = hostname;
    return this;
  }

  /**
   * Set the port of the URL
   *
   * @param port - The port to set
   * @returns The URL builder
   */
  public withPort(port: number): StormURLBuilder {
    this.#url.port = String(port);
    return this;
  }

  /**
   * Set the username of the URL
   *
   * @param username - The username to set
   * @returns The URL builder
   */
  public withUsername(username: string): StormURLBuilder {
    this.#url.username = username;
    return this;
  }

  /**
   * Set the password of the URL
   *
   * @param password - The password to set
   * @returns The URL builder
   */
  public withPassword(password: string): StormURLBuilder {
    this.#url.password = password;
    return this;
  }

  /**
   * Set the pathname of the URL
   *
   * @param pathname - The pathname to set
   * @returns The URL builder
   */
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

  /**
   * Set the path of the URL
   *
   * @param path - The path to set
   * @returns The URL builder
   */
  public withPath(path: string): StormURLBuilder {
    const parsedPath = parsePath(path);
    this.#url = {
      ...this.#url,
      ...parsedPath
    };

    return this;
  }

  /**
   * Set the hash of the URL
   *
   * @param hash - The hash to set
   * @returns The URL builder
   */
  public withHash(hash: string): StormURLBuilder {
    this.#url.hash = hash;
    return this;
  }

  /**
   * Set the auth of the URL
   *
   * @param auth - The auth to set
   * @returns The URL builder
   */
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

  /**
   * Set the query of the URL
   *
   * @param query - The query to set
   * @returns The URL builder
   */
  public withQuery(
    query: string | [string, any] | Record<string, any>
  ): StormURLBuilder {
    this.#url.query = {} as Record<string, any>;
    this.addQueryParam(query);

    return this;
  }

  /**
   * Add a query parameter to the URL
   *
   * @param query - The query parameter to add
   * @returns The URL builder
   */
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

  /**
   * Returns the built URL
   *
   * @returns The built URL
   */
  public build(): StormURL {
    return this.#url;
  }

  /**
   * Returns the string representation of the URL
   *
   * @returns The string representation of the URL
   */
  public toString(): string {
    return cleanDoubleSlashes(stringifyParsedURL(this.#url));
  }

  /**
   * Parse a query parameter value
   *
   * @param value - The value to parse
   * @returns The parsed value
   */
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
