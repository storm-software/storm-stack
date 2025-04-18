/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { parseTypeDefinition } from "@stryke/convert/parse-type-definition";
import { existsSync } from "@stryke/path/exists";
import { joinPaths } from "@stryke/path/join-paths";
import { isObject } from "@stryke/type-checks/is-object";
import defu from "defu";
import type {
  ClassDeclaration,
  InterfaceDeclaration,
  Project,
  PropertySignature,
  Type,
  TypeAliasDeclaration
} from "ts-morph";
import { SyntaxKind } from "ts-morph";
import type {
  Context,
  Options,
  ResolvedDotenvTypeDefinition,
  ResolvedDotenvTypeDefinitionProperty,
  ResolvedDotenvTypeDefinitionPropertyType,
  ResolvedDotenvTypeDefinitions
} from "../../types/build";
import type { LogFn } from "../../types/config";

const DEFAULT_VARIABLES = {
  __STORM_INJECTED__: {
    text: "string",
    defaultValue: "{}",
    description:
      "The serialized environment variables injected into the application.",
    isOptional: false
  },
  BUILD_ID: {
    text: "string",
    description:
      "The build ID of the application. This value is injected by the Storm Stack build process.",
    isOptional: false
  },
  BUILD_TIMESTAMP: {
    text: "number",
    description:
      "The build timestamp of the application. This value is injected by the Storm Stack build process.",
    isOptional: false
  },
  RELEASE_ID: {
    text: "string",
    description:
      "The release ID of the application. This value is injected by the Storm Stack build process.",
    isOptional: false
  },
  APP_NAME: {
    text: "string",
    description: "The name of the application.",
    isOptional: false
  },
  APP_VERSION: {
    text: "string",
    defaultValue: "1.0.0",
    description: "The version of the application.",
    isOptional: false
  },
  STACKTRACE: {
    text: "boolean",
    defaultValue: false,
    description: "Indicates if error stack traces should be captured.",
    isOptional: false
  },
  INCLUDE_ERROR_DATA: {
    text: "boolean",
    defaultValue: false,
    description: "Indicates if error data should be included.",
    isOptional: false
  },
  ERROR_URL: {
    text: "string",
    description:
      "The URL to send error data to. This value is used by the Storm Stack error tracking system.",
    isOptional: false
  },
  DEFAULT_TIMEZONE: {
    text: "string",
    defaultValue: "America/New_York",
    description: "The default timezone to use in the application.",
    isOptional: false
  },
  DEFAULT_LOCALE: {
    text: "string",
    defaultValue: "en_US",
    description: "The default locale to use in the application.",
    isOptional: false
  },
  PLATFORM: {
    text: "string",
    defaultValue: "node",
    description: "The type of platform the application is running on.",
    isOptional: false
  },
  MODE: {
    text: '"development" | "staging" | "production"',
    defaultValue: "production",
    description: "The processing mode of the application.",
    isOptional: false
  },
  ENVIRONMENT: {
    text: "string",
    defaultValue: "production",
    description:
      "The environment the application is running in. This value will be populated with the value of `MODE` if not provided.",
    isOptional: false
  },
  DEVELOPMENT: {
    text: "boolean",
    defaultValue: false,
    description: "Indicates if the application is running in development mode.",
    isOptional: false
  },
  STAGING: {
    text: "boolean",
    defaultValue: false,
    description: "Indicates if the application is running in staging mode.",
    isOptional: false
  },
  PRODUCTION: {
    text: "boolean",
    defaultValue: true,
    description: "Indicates if the application is running in production mode.",
    isOptional: false
  },
  DEBUG: {
    text: "boolean",
    defaultValue: false,
    description: "Indicates if the application is running in debug mode.",
    isOptional: false
  },
  NODE_ENV: {
    text: '"development" | "staging" | "production"',
    defaultValue: "production",
    description:
      "The environment the application is running in. This variable is a duplicate of `ENVIRONMENT` to support use in external packages.",
    isOptional: false
  },
  LOG_LEVEL: {
    text: '"fatal" | "error" | "warn" | "info" | "debug" | null',
    defaultValue: "info",
    description: "The lowest logging level for the application.",
    isOptional: false
  }
} as Record<string, ResolvedDotenvTypeDefinitionProperty>;

const getType = (type: Type): ResolvedDotenvTypeDefinitionPropertyType => {
  return {
    isAnonymous: type.isAnonymous(),
    isArray: type.isArray(),
    isBoolean: type.isBoolean(),
    isClass: type.isClass(),
    isEnum: type.isEnum(),
    isEnumLiteral: type.isEnumLiteral(),
    isIntersection: type.isIntersection(),
    isLiteral: type.isLiteral(),
    isNumber: type.isNumber(),
    isObject: type.isObject(),
    isString: type.isString() || type.getText().includes("string"),
    isStringLiteral: type.isStringLiteral(),
    isTuple: type.isTuple(),
    isTypeParameter: type.isTypeParameter(),
    isUndefined: type.isUndefined(),
    isUnion: type.isUnion(),
    isUnknown: type.isUnknown(),
    isVoid: type.isVoid(),
    isNull: type.isNull(),
    isAny: type.isAny(),
    isNever: type.isNever(),
    isBigInt: type.isBigInt(),
    isInterface: type.isInterface(),
    isClassOrInterface: type.isClassOrInterface(),
    isReadonlyArray: type.isReadonlyArray?.() ?? false,
    isTemplateLiteral: type.isTemplateLiteral?.() ?? false,
    isBooleanLiteral: type.isBooleanLiteral?.() ?? false,
    isBigIntLiteral: type.isBigIntLiteral?.() ?? false,
    isNumberLiteral: type.isNumberLiteral?.() ?? false,
    isUnionOrIntersection: type.isUnionOrIntersection?.() ?? false
  };
};

const getDeclarationPropertiesFromPropertySignatures = (
  properties: PropertySignature[],
  current: Record<string, ResolvedDotenvTypeDefinitionProperty> = {}
) => {
  return properties.reduce((ret, prop) => {
    const jsDocs = prop.getJsDocs();
    const defaultValue = jsDocs?.reduce(
      (ret, jsDoc) => {
        const tag = jsDoc
          .getTags()
          .find(
            tag =>
              tag.getTagName() === "default" ||
              tag.getTagName() === "defaultValue"
          );
        if (tag) {
          return tag
            .getText()
            .replace("@defaultValue", "")
            .replace("@default", "")
            .trim();
        }

        return ret;
      },
      undefined as string | undefined
    );

    ret[prop.getName()] = {
      type: getType(prop.getType()),
      text: prop.getType().getText(),
      defaultValue,
      description:
        jsDocs && jsDocs.length > 0 && jsDocs[0]
          ? jsDocs[0].getDescription().trim()
          : undefined,
      isOptional: Boolean(prop.getQuestionTokenNode()),
      comment: jsDocs?.map(jsDoc => jsDoc.getCommentText()).join("\n") ?? ""
    };

    return ret;
  }, current);
};

const getInterfaceDeclarationProperties = (decl?: InterfaceDeclaration) => {
  if (!decl?.isKind(SyntaxKind.InterfaceDeclaration)) {
    throw new Error("Invalid type definition.");
  }

  const baseDecls = decl.getBaseDeclarations();

  let result = {} as Record<string, ResolvedDotenvTypeDefinitionProperty>;
  for (const extend of baseDecls) {
    // eslint-disable-next-line ts/no-use-before-define
    result = defu(result, getDeclarationProperties(extend));
  }

  return getDeclarationPropertiesFromPropertySignatures(
    decl.getProperties(),
    result
  );
};

const getTypeAliasDeclarationProperties = (decl?: TypeAliasDeclaration) => {
  if (!decl?.isKind(SyntaxKind.TypeAliasDeclaration)) {
    throw new Error("Invalid type definition.");
  }

  const intersectionTypes = decl.getDescendantsOfKind(
    SyntaxKind.IntersectionType
  );
  if (intersectionTypes.length > 0) {
    let result = {} as Record<string, ResolvedDotenvTypeDefinitionProperty>;
    for (const intersectionType of intersectionTypes) {
      for (const intersectionTypeChild of intersectionType.getChildren()) {
        if (intersectionTypeChild.isKind(SyntaxKind.TypeReference)) {
          const typeDecl = decl
            .getSourceFile()
            .getTypeAlias(intersectionTypeChild.getTypeName().getText());
          if (typeDecl) {
            result = defu(result, getTypeAliasDeclarationProperties(typeDecl));
          }
        } else if (intersectionTypeChild.isKind(SyntaxKind.TypeLiteral)) {
          result = getDeclarationPropertiesFromPropertySignatures(
            intersectionTypeChild.getProperties(),
            result
          );
        } else {
          throw new Error("Invalid IntersectionType definition.");
        }
      }
    }

    return result;
  }

  const typeLiterals = decl.getDescendantsOfKind(SyntaxKind.TypeLiteral);
  if (typeLiterals.length > 0) {
    let result = {} as Record<string, ResolvedDotenvTypeDefinitionProperty>;
    for (const typeLiteral of typeLiterals) {
      result = getDeclarationPropertiesFromPropertySignatures(
        typeLiteral.getProperties(),
        result
      );
    }

    return result;
  }

  return {};
};

const getDeclarationProperties = (
  decl?: TypeAliasDeclaration | InterfaceDeclaration | ClassDeclaration
): Record<string, ResolvedDotenvTypeDefinitionProperty> => {
  if (decl?.isKind(SyntaxKind.InterfaceDeclaration)) {
    return getInterfaceDeclarationProperties(decl);
  } else if (decl?.isKind(SyntaxKind.TypeAliasDeclaration)) {
    return getTypeAliasDeclarationProperties(decl);
  }

  throw new Error("Invalid type definition.");
};

const getResolvedDotenvTypeDefinitionProperties = (
  log: LogFn,
  options: Options,
  project: Project,
  filePath: string,
  name: string
) => {
  const sourceFile = project.getSourceFile(
    joinPaths(options.projectRoot, filePath)
  );
  if (!sourceFile) {
    log(
      LogLevelLabel.WARN,
      `The type definition file "${filePath}" could not be found.`
    );
    return {};
  }

  let decl:
    | TypeAliasDeclaration
    | InterfaceDeclaration
    | ClassDeclaration
    | undefined = sourceFile.getInterface(name);
  if (!decl) {
    decl = sourceFile.getTypeAlias(name);
    if (!decl) {
      decl = sourceFile.getClass(name);
      if (!decl) {
        log(
          LogLevelLabel.WARN,
          `The type definition \`${name}\` could not be found in "${filePath}".`
        );
        return {};
      }
    }
  }

  return getDeclarationProperties(decl);
};

export const getDotenvTypeDefinitions = <TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>
): ResolvedDotenvTypeDefinitions => {
  const result = {} as ResolvedDotenvTypeDefinitions;

  if (!context.dotenv?.types) {
    log(
      LogLevelLabel.WARN,
      "No environment variable type definitions were provided in the `dotenv.types` configuration."
    );
  } else {
    const params = isObject(context.dotenv.types)
      ? context.dotenv.types
      : {
          variables: `${context.dotenv.types}#Variables`,
          secrets: `${context.dotenv.types}#Secrets`
        };

    if (params.variables) {
      result.variables = parseTypeDefinition(
        params.variables
      ) as ResolvedDotenvTypeDefinition;
      if (!result.variables?.file) {
        throw new Error(
          "Invalid type definition for variables found in `dotenv.types.variables` of the provided configuration."
        );
      }

      if (existsSync(joinPaths(context.projectRoot, result.variables.file))) {
        result.variables.properties = getResolvedDotenvTypeDefinitionProperties(
          log,
          context,
          context.project,
          result.variables.file,
          result.variables.name || "Variables"
        );
      } else {
        log(
          LogLevelLabel.WARN,
          "Cannot find the `dotenv.types.variables` type definition in the provided configuration."
        );
      }
    } else {
      log(
        LogLevelLabel.WARN,
        "The `dotenv.types.variables` configuration parameter was not provided. Please ensure this is expected."
      );
    }

    if (params.secrets) {
      result.secrets = parseTypeDefinition(
        params.secrets
      ) as ResolvedDotenvTypeDefinition;
      if (!result.secrets?.file) {
        throw new Error(
          "Invalid type definition for secrets found in `dotenv.types.secrets` of the provided configuration."
        );
      }

      if (existsSync(joinPaths(context.projectRoot, result.secrets.file))) {
        result.secrets.properties = getResolvedDotenvTypeDefinitionProperties(
          log,
          context,
          context.project,
          result.secrets.file,
          result.secrets.name || "Secrets"
        );
      } else {
        log(
          LogLevelLabel.WARN,
          "Cannot find the `dotenv.types.secrets` type definition in the provided configuration."
        );
      }
    } else {
      log(
        LogLevelLabel.WARN,
        "The `dotenv.types.secrets` configuration parameter was not provided. Please ensure this is expected."
      );
    }
  }

  result.variables ??= { properties: {} };
  result.variables.properties = defu(
    result.variables.properties,
    DEFAULT_VARIABLES
  );

  log(
    LogLevelLabel.TRACE,
    `Resolved ${Object.keys(result.variables.properties).length} variable and ${Object.keys(result.secrets?.properties ?? {}).length} secret dotenv definitions`
  );

  return result;
};
