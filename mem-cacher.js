"use strict";

/**
 * Check if the date format is valid or invalid.
 * @param {Date} date
 * @returns {Boolean} True: Valid. / False: Invalid.
 */
function isDateValid(date) {
  return !Number.isNaN(new Date(date).valueOf());
}

/**
 * Calculate the difference of the time between datetime1 and datetime2.
 * @param {Date} datetime1
 * @param {Date} datetime2
 * @returns {Number} The difference of the time between datetime1 and datetime2.
 */
function calcTimeDiff(datetime1, datetime2) {
  return Math.ceil(Math.abs(datetime1.getTime() - datetime2.getTime()));
}

/**
 * Memoize function.
 * @param {Function} func
 * @param {JSON} option
 * @param {Number} option.maxAge Cache max age. (seconds)
 * @param {Date} option.expirationDate Cache expiration date time.
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

        if (option.expirationDate && isDateValid(option.expirationDate)) {
          const millisecond = calcTimeDiff(option.expirationDate, new Date());
          setTimeout(() => {
            delete cache[cacheKey];
          }, millisecond);
        }

        cache[cacheKey] = result;
        return result;
      }
    },
  });
}

export { memoizeFunction };
