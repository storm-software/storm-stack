/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

function handleSync<R, E = Error>(fn: () => R): R | E {
  try {
    return fn();
  } catch (error_: unknown) {
    return error_ as E;
  }
}

async function handleAsync<R, E = Error>(
  fn: () => Promise<R> | R
): Promise<R | E> {
  try {
    return await fn();
  } catch (error_: unknown) {
    return error_ as E;
  }
}

/**
 * Executes a function, catches exceptions, and returns any outcome.
 * @param fn - to be executed
 */
const handle = handleSync as typeof handleSync & {
  async: typeof handleAsync;
};

handle.async = handleAsync;

export { handle };

const skip = Symbol("skip");

type SyncTransformer<I, R> = (item: I, key: number) => R | typeof skip;
type ASyncTransformer<I, R> = (
  item: I,
  key: number
) => Promise<R | typeof skip>;

function transduceSync<I, R>(
  list: Array<I>,
  transformer: SyncTransformer<I, R>
) {
  const transduced = [] as R[];

  for (const [i, element_] of list.entries()) {
    const transformed = transformer(element_, i);

    if (transformed !== skip) {
      transduced[transduced.length] = transformed;
    }
  }

  return transduced;
}

async function transduceAsync<I, R>(
  list: Array<I>,
  transformer: ASyncTransformer<I, R>
) {
  const transduced = [] as R[];

  await Promise.all(
    list.entries().map(async ([i, element_]) => {
      const transformed = await transformer(element_, i);

      if (transformed !== skip) {
        transduced[transduced.length] = transformed;
      }
    })
  );

  return transduced;
}

const Filter =
  <I>(filter: (item: I) => boolean) =>
  (item: I) => {
    return filter(item) ? item : (skip as never);
  };

const Mapper =
  <I, R>(mapper: (item: I) => R) =>
  (item: I) => {
    return mapper(item);
  };

/**
 * Transducers enable efficient data processing. They allow the composition of
 * mappers and filters to be applied on a list. And this is applied in a single
 * pass, that's the efficient pipeline processing.
 *
 * (does not reduce at the same time)
 *
 * @see https://medium.com/javascript-scene/7985330fe73d
 *
 * @param list - to transform
 * @param transformer - to apply

 * @example
 * ```ts
 * const filterEven = Filter(<U>(unit: U) =>
 *   typeof unit === 'number' ? !(unit % 2) : true,
 * )
 * const mapTimes2 = Mapper(<U>(unit: U) =>
 *   typeof unit === 'number' ? unit * 2 : unit,
 * )
 * const mapString = Mapper(<U>(unit: U) => `${unit}`)
 *
 * const test0 = transduce(
 *   [1, 2, 3, 4, 5, 6, 7, 'a'],
 *   pipe(filterEven, mapTimes2, mapTimes2, mapString, filterEven),
 * )
 * ```
 */
const transduce = transduceSync as typeof transduceSync & {
  async: typeof transduceAsync;
};

transduce.async = transduceAsync;

export { Filter, Mapper, skip, transduce };

type Function<P extends Array<any> = any, R extends any = any> = (
  ...args: P
) => R;
type Await<P extends any> = P extends Promise<infer A> ? A : P;

function pipeSync(fn: Function, ...fns: Function[]) {
  return (...args: unknown[]) => {
    let result = fn(...args);

    for (let i = 0; result !== skip && i < fns.length; ++i) {
      result = fns[i]?.(result);
    }

    return result;
  };
}

function pipeAsync(fn: Function, ...fns: Function[]) {
  return async (...args: unknown[]) => {
    let result = await fn(...args);

    for (let i = 0; result !== skip && i < fns.length; ++i) {
      // eslint-disable-next-line no-await-in-loop
      result = await fns[i]?.(result);
    }

    return result;
  };
}

/**
 * Pipe the input and output of functions.
 *
 * @param fn - parameter-taking function
 * @param fns - subsequent piped functions
 * @returns
 */
const pipe = pipeSync as PipeMultiSync & {
  async: PipeMultiAsync;
};

pipe.async = pipeAsync;

// TODO: use the one from ts-toolbelt (broken atm since ts 4.1)
export declare type PipeMultiSync = {
  <R0, P extends any[]>(...fns: [Function<P, R0>]): Function<P, R0>;
  <R0, R1, P extends any[]>(
    ...fns: [Function<P, R0>, Function<[R0], R1>]
  ): Function<P, R1>;
  <R0, R1, R2, P extends any[]>(
    ...fns: [Function<P, R0>, Function<[R0], R1>, Function<[R1], R2>]
  ): Function<P, R2>;
  <R0, R1, R2, R3, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[R0], R1>,
      Function<[R1], R2>,
      Function<[R2], R3>
    ]
  ): Function<P, R3>;
  <R0, R1, R2, R3, R4, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[R0], R1>,
      Function<[R1], R2>,
      Function<[R2], R3>,
      Function<[R3], R4>
    ]
  ): Function<P, R4>;
  <R0, R1, R2, R3, R4, R5, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[R0], R1>,
      Function<[R1], R2>,
      Function<[R2], R3>,
      Function<[R3], R4>,
      Function<[R4], R5>
    ]
  ): Function<P, R5>;
  <R0, R1, R2, R3, R4, R5, R6, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[R0], R1>,
      Function<[R1], R2>,
      Function<[R2], R3>,
      Function<[R3], R4>,
      Function<[R4], R5>,
      Function<[R5], R6>
    ]
  ): Function<P, R6>;
  <R0, R1, R2, R3, R4, R5, R6, R7, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[R0], R1>,
      Function<[R1], R2>,
      Function<[R2], R3>,
      Function<[R3], R4>,
      Function<[R4], R5>,
      Function<[R5], R6>,
      Function<[R6], R7>
    ]
  ): Function<P, R7>;
  <R0, R1, R2, R3, R4, R5, R6, R7, R8, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[R0], R1>,
      Function<[R1], R2>,
      Function<[R2], R3>,
      Function<[R3], R4>,
      Function<[R4], R5>,
      Function<[R5], R6>,
      Function<[R6], R7>,
      Function<[R7], R8>
    ]
  ): Function<P, R8>;
  <R0, R1, R2, R3, R4, R5, R6, R7, R8, R9, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[R0], R1>,
      Function<[R1], R2>,
      Function<[R2], R3>,
      Function<[R3], R4>,
      Function<[R4], R5>,
      Function<[R5], R6>,
      Function<[R6], R7>,
      Function<[R7], R8>,
      Function<[R8], R9>
    ]
  ): Function<P, R9>;
};

export declare type PipeMultiAsync = {
  <R0, P extends any[]>(
    ...fns: [Function<P, R0>]
  ): Function<P, Promise<Await<R0>>>;
  <R0, R1, P extends any[]>(
    ...fns: [Function<P, R0>, Function<[Await<R0>], R1>]
  ): Function<P, Promise<Await<R1>>>;
  <R0, R1, R2, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[Await<R0>], R1>,
      Function<[Await<R1>], R2>
    ]
  ): Function<P, Promise<Await<R2>>>;
  <R0, R1, R2, R3, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[Await<R0>], R1>,
      Function<[Await<R1>], R2>,
      Function<[Await<R2>], R3>
    ]
  ): Function<P, Promise<Await<R3>>>;
  <R0, R1, R2, R3, R4, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[Await<R0>], R1>,
      Function<[Await<R1>], R2>,
      Function<[Await<R2>], R3>,
      Function<[Await<R3>], R4>
    ]
  ): Function<P, Promise<Await<R4>>>;
  <R0, R1, R2, R3, R4, R5, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[Await<R0>], R1>,
      Function<[Await<R1>], R2>,
      Function<[Await<R2>], R3>,
      Function<[Await<R3>], R4>,
      Function<[Await<R4>], R5>
    ]
  ): Function<P, Promise<Await<R5>>>;
  <R0, R1, R2, R3, R4, R5, R6, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[Await<R0>], R1>,
      Function<[Await<R1>], R2>,
      Function<[Await<R2>], R3>,
      Function<[Await<R3>], R4>,
      Function<[Await<R4>], R5>,
      Function<[Await<R5>], R6>
    ]
  ): Function<P, Promise<Await<R6>>>;
  <R0, R1, R2, R3, R4, R5, R6, R7, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[Await<R0>], R1>,
      Function<[Await<R1>], R2>,
      Function<[Await<R2>], R3>,
      Function<[Await<R3>], R4>,
      Function<[Await<R4>], R5>,
      Function<[Await<R5>], R6>,
      Function<[Await<R6>], R7>
    ]
  ): Function<P, Promise<Await<R7>>>;
  <R0, R1, R2, R3, R4, R5, R6, R7, R8, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[Await<R0>], R1>,
      Function<[Await<R1>], R2>,
      Function<[Await<R2>], R3>,
      Function<[Await<R3>], R4>,
      Function<[Await<R4>], R5>,
      Function<[Await<R5>], R6>,
      Function<[Await<R6>], R7>,
      Function<[Await<R7>], R8>
    ]
  ): Function<P, Promise<Await<R8>>>;
  <R0, R1, R2, R3, R4, R5, R6, R7, R8, R9, P extends any[]>(
    ...fns: [
      Function<P, R0>,
      Function<[Await<R0>], R1>,
      Function<[Await<R1>], R2>,
      Function<[Await<R2>], R3>,
      Function<[Await<R3>], R4>,
      Function<[Await<R4>], R5>,
      Function<[Await<R5>], R6>,
      Function<[Await<R6>], R7>,
      Function<[Await<R7>], R8>,
      Function<[Await<R8>], R9>
    ]
  ): Function<P, Promise<Await<R9>>>;
};

export { pipe };
