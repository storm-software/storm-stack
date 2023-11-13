import {
  ITyped,
  TypedCheckedClass,
  isFunction
} from "@storm-software/utilities";
import { register } from "./json-parser";
import { ClassMetadata, JsonValue, SerializableClass } from "./types";

export const Serializable = (
  options: {
    name?: string;
  } = {}
) => {
  const decorator = <
    TClass extends new (...args: any) => any = new (...args: any) => any
  >(
    target: any,
    context: ClassDecoratorContext<TClass>
  ) => {
    const name = options.name
      ? options.name
      : context.name
        ? context.name
        : target.name;

    let isTypeOf!: TypedCheckedClass<SerializableClass>["isTypeOf"];
    if (
      isFunction(
        (target.prototype as TypedCheckedClass<SerializableClass>)?.isTypeOf
      )
    ) {
      isTypeOf = (target.prototype as TypedCheckedClass<SerializableClass>)
        .isTypeOf;
    } else {
      isTypeOf = (value: any): value is SerializableClass =>
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
        name,
        serialize: this.prototype.serialize,
        deserialize: this.prototype.deserialize,
        isTypeOf
      } as ClassMetadata<SerializableClass>;

      register(
        name,
        (data: SerializableClass) => data.serialize(),
        (json: JsonValue) => {
          const deserialized = new this();
          deserialized.deserialize(json);

          return deserialized;
        },
        isTypeOf
      );
    });

    return class
      extends target
      implements
        SerializableClass,
        TypedCheckedClass<SerializableClass>,
        ITyped
    {
      /**
       * The name of the class's type
       */
      public __typename = name;

      /**
       * Serialize the class to a JSON object
       */
      public serialize(): JsonValue {
        return (
          context.metadata[name] as ClassMetadata<SerializableClass>
        )?.serialize.call(this);
      }

      /**
       * Deserialize the class from a JSON object
       *
       * @param json - The JSON object to deserialize from
       */
      public deserialize(json: JsonValue) {
        (
          context.metadata[name] as ClassMetadata<SerializableClass>
        )?.deserialize.call(this, json);
      }

      /**
       * Run type check on the given value
       * @param value - The value to check
       * @returns True if the value is of the type of the class
       */
      public isTypeOf(value: any): value is SerializableClass {
        return isTypeOf(value);
      }
    };
  };

  return decorator;
};
