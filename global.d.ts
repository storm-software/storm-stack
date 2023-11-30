export declare const Storm: any;
declare global {
  interface StormGlobal {
    config: any;
    log: any;
    repositories: Record<string, any>;
  }

  var Storm: StormGlobal;
  namespace NodeJS {
    interface Global {
      Storm: StormGlobal;
    }
  }
}
