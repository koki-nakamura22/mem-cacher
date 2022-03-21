"use strict";

import { memoizeFunction } from "../mem-cacher.js";

const wait = (millisecond) => {
  // Dirty code...
  const start = new Date().getTime();
  let end = 0;
  while (end - start < millisecond) end = new Date().getTime();
};

it("memoize and use function cache", () => {
  const waitMillisecconds = 3000;

  function add(x, y) {
    wait(waitMillisecconds);
    return x + y;
  }

  const memoizedAdd = memoizeFunction(add);

  const notUsingCacheStartTime = performance.now();
  expect(memoizedAdd(1, 2)).toEqual(3);
  const notUsingCacheEndTime = performance.now();
  expect(notUsingCacheEndTime - notUsingCacheStartTime).toBeGreaterThanOrEqual(
    waitMillisecconds
  );

  const usingCacheStartTime = performance.now();
  expect(memoizedAdd(1, 2)).toEqual(3);
  const usingCacheEndime = performance.now();
  expect(usingCacheEndime - usingCacheStartTime).toBeLessThanOrEqual(100);

  const notUsingCacheStartTime2 = performance.now();
  expect(memoizedAdd(3, 4)).toEqual(7);
  const notUsingCacheEndTime2 = performance.now();
  expect(
    notUsingCacheEndTime2 - notUsingCacheStartTime2
  ).toBeGreaterThanOrEqual(waitMillisecconds);
});
