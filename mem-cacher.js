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
 * Check option consistency.
 * @param {Object} option
 * @throws {TypeError}
 * @throws {Error}
 */
function checkOptionConsistency(option) {
  if (option.maxAge && !Number.isInteger(option.maxAge))
    throw new TypeError("option.maxAge is not an integer");
  if (option.expirationDate && !isDateValid(option.expirationDate))
    throw new TypeError("option.expirationDate is not a date");
  if (option.maxAge && option.expirationDate)
    throw new Error(
      "Cannot use option.maxAge and option.expirationDate at the same time"
    );
}

/**
 * Memoize function.
 * @param {Function} func
 * @param {JSON} option
 * @param {Number} option.maxAge Cache max age. (seconds) Cannot use with expirationDate.
 * @param {Date} option.expirationDate Cache expiration date time. Cannot use with maxAge.
 * @returns {Function} Memoized function.
 */
function memoizeFunction(func, option = {}) {
  checkOptionConsistency(option);

  const cache = {};

  const setCacheDeleteTimer = (key, ms) => {
    setTimeout(() => {
      delete cache[key];
    }, ms);
  };

  return new Proxy(func, {
    apply(target, thisArg, args) {
      const cacheKey = JSON.stringify(args);
      const cacheData = cache[cacheKey];
      if (cacheData) {
        return cacheData;
      } else {
        const result = target.apply(thisArg, args);

        option.maxAge && setCacheDeleteTimer(cacheKey, option.maxAge);
        option.expirationDate &&
          setCacheDeleteTimer(
            cacheKey,
            calcTimeDiff(option.expirationDate, new Date())
          );

        cache[cacheKey] = result;
        return result;
      }
    },
  });
}

export { memoizeFunction };
