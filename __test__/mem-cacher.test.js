"use strict";

import { memoizeFunction } from "../mem-cacher.js";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

const waitMillisecconds = 1000;
const wait = (millisecond) => jest.advanceTimersByTime(millisecond);

const add = (x, y) => {
  wait(waitMillisecconds);
  return x + y;
};

function testRapper({ func, params, toBeValue, timeTakenMillisecond }) {
  const startTime = performance.now();
  expect(func(params.x, params.y)).toBe(toBeValue);
  const elapsedTime = performance.now() - startTime;
  expect(elapsedTime).toBe(timeTakenMillisecond);
}

it("memoize and use function cache (maxAge)", () => {
  const option = {
    maxAge: 1000, // Cache's time to live (Millisecond)
  };
  const memoizedAdd = memoizeFunction(add, option);

  const params = {
    x: 1,
    y: 2,
  };
  const toBeValue = 3;

  // Not using cache
  testRapper({
    func: memoizedAdd,
    params: params,
    toBeValue: toBeValue,
    timeTakenMillisecond: 1000,
  });

  // Using cache
  testRapper({
    func: memoizedAdd,
    params: params,
    toBeValue: toBeValue,
    timeTakenMillisecond: 0,
  });

  // Using the cache because it exists
  wait(500);
  testRapper({
    func: memoizedAdd,
    params: params,
    toBeValue: toBeValue,
    timeTakenMillisecond: 0,
  });

  // Not using the cache because it does not exist
  wait(500);
  testRapper({
    func: memoizedAdd,
    params: params,
    toBeValue: toBeValue,
    timeTakenMillisecond: 1000,
  });
});

it("memoize and use function cache (expirationDate)", () => {
  jest.setSystemTime(new Date("2022-04-12T23:59:00.000+09:00"));

  const cacheexpirationDate = new Date("2022-04-13T00:00:00.000+09:00");
  const option = {
    expirationDate: cacheexpirationDate,
  };
  const memoizedAdd = memoizeFunction(add, option);

  const params = {
    x: 1,
    y: 2,
  };
  const toBeValue = 3;

  // Not using cache
  testRapper({
    func: memoizedAdd,
    params: params,
    toBeValue: toBeValue,
    timeTakenMillisecond: 1000,
  });

  // Using cache
  testRapper({
    func: memoizedAdd,
    params: params,
    toBeValue: toBeValue,
    timeTakenMillisecond: 0,
  });

  // Using the cache because the expiration date time has not come
  wait(58 * 1000); // Advance to "2022-04-12T23:59:59.000+09:00"
  testRapper({
    func: memoizedAdd,
    params: params,
    toBeValue: toBeValue,
    timeTakenMillisecond: 0,
  });

  // Not using the cache because the cache expired
  wait(1 * 1000); // Advance to "2022-04-13T00:00:00.000+09:00"
  testRapper({
    func: memoizedAdd,
    params: params,
    toBeValue: toBeValue,
    timeTakenMillisecond: 1000,
  });
});
