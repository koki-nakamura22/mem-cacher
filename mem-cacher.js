"use strict";

/**
 * Memoize function.
 * @param {Function} func
 * @param {JSON} option
 * @param {Number} option.duration Cache duration. (seconds)
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

        if (option.duration && Number.isInteger(option.duration)) {
          setTimeout(() => {
            delete cache[cacheKey];
          }, option.duration);
        }

        cache[cacheKey] = result;
        return result;
      }
    },
  });
}

export { memoizeFunction };
