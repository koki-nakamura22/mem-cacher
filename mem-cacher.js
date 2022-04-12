"use strict";

/**
 * Memoize function.
 * @param {Function} func
 * @param {JSON} option
 * @param {Number} option.maxAge Cache max age. (seconds)
 * @returns {Function} Memoized function.
 */
function memoizeFunction(func, option = {}) {
  let cache = {};
  return new Proxy(func, {
    apply(target, thisArg, args) {
      const cacheKey = JSON.stringify(args);
      const cacheData = cache[cacheKey];
      if (cacheData) {
        return cacheData;
      } else {
        const result = target.apply(thisArg, args);

        if (option.maxAge && Number.isInteger(option.maxAge)) {
          setTimeout(() => {
            delete cache[cacheKey];
          }, option.maxAge);
        }

        cache[cacheKey] = result;
        return result;
      }
    },
  });
}

export { memoizeFunction };
