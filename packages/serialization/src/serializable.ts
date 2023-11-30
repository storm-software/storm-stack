import {
  ClassTypeCheckable,
  ITyped,
  isFunction
} from "@storm-software/utilities";
import { register } from "./json-parser";
import {
  ClassSerializable,
  DeserializeFunct,
  JsonValue,
  SerializationFunct,
  SerializationMetadata
} from "./types";

export const Serializable = <TData = any>(options: {
  /**
   * The type and/or name of the record
   */
  name?: string;

  /**
   * Serialize the class to a JSON object or string
   *
   * @param data - The data object to serialize
   * @returns The serialized JSON object
   */
  serialize: SerializationFunct<TData>;

  /**
   * Deserialize the class from a JSON object or string
   *
   * @param json - The JSON object to deserialize from
   * @returns The deserialized data
   */
  deserialize: DeserializeFunct<TData>;
}) => {
  const decorator = <
    TClass extends new (...args: any) => any = new (...args: any) => TData
  >(
    target: TClass,
    context: ClassDecoratorContext<TClass>
  ) => {
    const name = options.name
      ? options.name
      : context.name
        ? context.name
        : target.name;

    let isTypeOf!: ClassTypeCheckable<TData>["isTypeOf"];
    if (isFunction((target.prototype as ClassTypeCheckable<TData>)?.isTypeOf)) {
      isTypeOf = (target.prototype as ClassTypeCheckable<TData>).isTypeOf;
    } else {
      isTypeOf = (value: any): value is TData =>
        value instanceof target || value?.__typename === name;
    }

    context.addInitializer(function (this: TClass) {
      if (
        !isFunction(this.prototype.serialize) ||
        !isFunction(this.prototype.deserialize)
      ) {
        throw new Error(
          `The class ${name} must implement the serialize and deserialize methods`
        );
      }

      context.metadata[name] = {
        ...options,
        name,
        __typename: name,
        isTypeOf
      } as SerializationMetadata<TData>;

      register(name, options.serialize, options.deserialize, isTypeOf);
    });

    return class
      extends target
      implements ClassSerializable<TData>, ClassTypeCheckable<TData>, ITyped
    {
      /**
       * The name of the class's type
       */
      public __typename = name;

      /**
       * Serialize the class to a JSON object
       *
       * @returns The data object to serialize
       */
      public serialize = (): JsonValue => {
        return (
          context.metadata[name] as SerializationMetadata<TData>
        )?.serialize(this as unknown as TData);
      };

      /**
       * Deserialize the class from a JSON object
       *
       * @param json - The JSON object to deserialize from
       */
      public deserialize = (json: JsonValue) => {
        (context.metadata[name] as SerializationMetadata<TData>)?.deserialize(
          json
        );
      };

      /**
       * Run type check on the given value
       * @param value - The value to check
       * @returns True if the value is of the type of the class
       */
      public isTypeOf(value: any): value is TData {
        return isTypeOf(value);
      }
    };
  };

  return decorator;
};