"use strict";

function memoizeFunction(func) {
  let cache = {};
  return new Proxy(func, {
    apply(target, thisArg, args) {
      const cacheKey = JSON.stringify(args);
      const cacheData = cache[cacheKey];
      if (cacheData) {
        return cacheData;
      } else {
        const result = target.apply(thisArg, args);
        cache[cacheKey] = result;
        return result;
      }
    },
  });
}

export { memoizeFunction };
