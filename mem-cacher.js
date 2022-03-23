"use strict";

/**
 * Copy the obj deeply.
 * @param {Object} obj
 * @returns {Object} Deep copied object.
 */
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Extract the function parameters names
 * @param {Function} func
 * @returns {Array} The function parameters names
 */
function extractFuncParamsNames(func) {
  const funcStr = func
    .toString()
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comments of the form /* ... */
    .replace(/\/\/(.)*/g, "") // Removing comments of the form //
    .replace(/{[\s\S]*}/, "") // Remove body of the function { ... }
    .replace(/^async /, "") // Remove a leading async keyword
    .replace(/=>/g, "") // removing '=>' if func is arrow function
    .trim();

  // Start parameter names after first '('
  // If '(' does not find, the start position is 0
  const start = funcStr.indexOf("(") + 1;

  // End parameter names is just before last ')' or end of string if ')' does not find
  const end = funcStr.length - (funcStr.slice(-1) === ")" ? 1 : 0);

  const result = funcStr.substring(start, end).split(", ");

  let params = [];
  result.forEach((element) => {
    // Removing any default value
    element = element.replace(/=[\s\S]*/g, "").trim();
    if (element.length > 0) params.push(element);
  });
  return params;
}

function digCache(cache, keyList) {
  const nextLevelCache = cache[keyList.shift()];
  if (!nextLevelCache) return null;
  if (keyList.length === 0) return nextLevelCache;
  return digCache(nextLevelCache, keyList);
}

function memoize(cache, keyList, data) {
  const key = keyList.shift();
  cache[key] = {};
  keyList.length === 0
    ? (cache[key] = data)
    : memoize(cache[key], keyList, data);
}

function memoizeFunction(func) {
  let cache = {};
  return new Proxy(func, {
    apply(target, thisArg, args) {
      const argsForDiggingCache = deepCopy(args);
      const cacheData = digCache(cache, argsForDiggingCache);
      if (cacheData) {
        return cacheData;
      } else {
        const result = target.apply(thisArg, args);
        const argsForMemoizingCache = deepCopy(args);
        memoize(cache, argsForMemoizingCache, result);
        return result;
      }
    },
  });
}

export { memoizeFunction };
