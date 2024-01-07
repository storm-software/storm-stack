/**
 * Factory class that returns an object instance based on some context.
 */
export class Factory {
  /**
   * Instantiate the object.
   * Any additional arguments are passed to the object constructor.
   *
   * @param context - The information we base on to decide which object to return.
   * @returns The instantiated object.
   */
  public static create<TClass = any>(context: any) {
    const constructorArgs = Array.prototype.slice.call(arguments);
    constructorArgs.shift();

    const Implementor = this.getClass<TClass>(context);

    // This is the ES5 friendly version of new Implementor(...constructorArgs)
    return new (Function.prototype.bind.apply(
      Implementor,
      [null].concat(constructorArgs) as [thisArg: any, ...argArray: any[]]
    ))();
  }

  /**
   * Decide which class to instantiate based on the context.
   *
   * @param context - The information we base on to decide which object to return.
   * @returns The class to instantiate.
   */
  protected static getClass<TClass = any>(
    context: any
  ): new (...argArray: any[]) => TClass {
    throw new Error(
      `The \`Factory.getClass\` method should be implemented in the factory subclasses. Context: ${context}`
    );
  }
}
