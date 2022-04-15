"use strict";

import { memoizeFunction } from "../mem-cacher.js";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

const waitMillisecconds = 1000;

/**
 * Synchronous function tests
 */

const add = (x, y) => {
  jest.advanceTimersByTime(waitMillisecconds);
  return x + y;
};

const testRapperSync =
  (func) => (params) => (toBeValue) => (timeTakenMillisecond) => {
    const startTime = performance.now();
    expect(func(...Object.values(params))).toBe(toBeValue);
    const elapsedTime = performance.now() - startTime;
    expect(elapsedTime).toBe(timeTakenMillisecond);
  };

it("Sync function: memoize and use function cache with no options", () => {
  expect.assertions(6);

  const curriedTestRapperSync = testRapperSync(memoizeFunction(add));

  curriedTestRapperSync({
    x: 1,
    y: 2,
  })(3)(1000);

  curriedTestRapperSync({
    x: 1,
    y: 2,
  })(3)(0);

  curriedTestRapperSync({
    x: 3,
    y: 4,
  })(7)(1000);
});

it("Sync function: memoize and use function cache using maxAge", () => {
  expect.assertions(8);

  const option = {
    maxAge: 1000,
  };
  const curriedTestRapperSync = testRapperSync(memoizeFunction(add, option))({
    x: 1,
    y: 2,
  })(3);

  // Not using cache
  curriedTestRapperSync(1000);

  // Using cache
  curriedTestRapperSync(0);

  // Using the cache because it exists
  jest.advanceTimersByTime(500);
  curriedTestRapperSync(0);

  // Not using the cache because it does not exist
  jest.advanceTimersByTime(500);
  curriedTestRapperSync(1000);
});

it("Sync function: memoize and use function cache using expirationDate", () => {
  expect.assertions(8);

  jest.setSystemTime(new Date("2022-04-12T23:59:00.000+09:00"));

  const option = {
    expirationDate: new Date("2022-04-13T00:00:00.000+09:00"),
  };
  const curriedTestRapperSync = testRapperSync(memoizeFunction(add, option))({
    x: 1,
    y: 2,
  })(3);

  // Not using cache
  curriedTestRapperSync(1000);

  // Using cache
  curriedTestRapperSync(0);

  // Using the cache because the expiration date time has not come
  jest.advanceTimersByTime(58 * 1000); // Advance to "2022-04-12T23:59:59.000+09:00"
  curriedTestRapperSync(0);

  // Not using the cache because the cache expired
  jest.advanceTimersByTime(1 * 1000); // Advance to "2022-04-13T00:00:00.000+09:00"
  curriedTestRapperSync(1000);
});

it("Sync function: option.maxAge is not an integer", () => {
  expect.assertions(1);

  expect(() => {
    const option = {
      maxAge: "1000",
    };
    const memoizedAdd = memoizeFunction(add, option);
  }).toThrowError(new TypeError("option.maxAge is not an integer"));
});

it("Sync function: option.expirationDate is not a date", () => {
  expect.assertions(1);

  expect(() => {
    const option = {
      expirationDate: "abcde",
    };
    const memoizedAdd = memoizeFunction(add, option);
  }).toThrowError(new TypeError("option.expirationDate is not a date"));
});

it("Sync function: set option.maxAge and option.expirationDate at the same time error", () => {
  expect.assertions(1);

  expect(() => {
    const option = {
      maxAge: 1000,
      expirationDate: "2022-04-13T00:00:00.000+09:00",
    };
    const memoizedAdd = memoizeFunction(add, option);
  }).toThrowError(
    new Error(
      "Cannot use option.maxAge and option.expirationDate at the same time"
    )
  );
});

/**
 * Asynchronous function tests
 */

const asyncAdd = async (x, y) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(x + y);
    }, waitMillisecconds);
  });
};

const testRapperAsync =
  (func) => (params) => (toBeValue) => async (timeTakenMillisecond) => {
    const startTime = performance.now();
    const funcPromise = func(...Object.values(params));

    jest.advanceTimersByTime(timeTakenMillisecond);

    const result = await funcPromise;
    expect(result).toBe(toBeValue);

    const elapsedTime = performance.now() - startTime;
    expect(elapsedTime).toBe(timeTakenMillisecond);
  };

it("Async function: memoize and use function cache with no options", async () => {
  expect.assertions(6);

  const curriedTestRapperAsync = testRapperAsync(memoizeFunction(asyncAdd));

  await curriedTestRapperAsync({
    x: 1,
    y: 2,
  })(3)(1000);

  await curriedTestRapperAsync({
    x: 1,
    y: 2,
  })(3)(0);

  await curriedTestRapperAsync({
    x: 3,
    y: 4,
  })(7)(1000);
});

it("Async function: memoize and use function cache using maxAge", async () => {
  expect.assertions(8);

  const option = {
    maxAge: 5000,
  };
  const curriedTestRapperAsync = testRapperAsync(
    memoizeFunction(asyncAdd, option)
  )({
    x: 1,
    y: 2,
  })(3);

  // Not using cache
  await curriedTestRapperAsync(1000);

  // Using cache
  await curriedTestRapperAsync(0);

  // Using the cache because it exists
  // Why subtract 1000 milliseconds?
  // Because the time is counted starting before the Promise process is executed, not after the Promise process is executed.
  jest.advanceTimersByTime(4900 - 1000);
  await curriedTestRapperAsync(0);

  // Not using the cache because it does not exist
  jest.advanceTimersByTime(100);
  await curriedTestRapperAsync(1000);
});

it("Async function: memoize and use function cache using expirationDate", async () => {
  expect.assertions(8);

  jest.setSystemTime(new Date("2022-04-12T23:59:00.000+09:00"));

  const option = {
    expirationDate: new Date("2022-04-13T00:00:00.000+09:00"),
  };
  const curriedTestRapperAsync = testRapperAsync(
    memoizeFunction(asyncAdd, option)
  )({
    x: 1,
    y: 2,
  })(3);

  // Not using cache
  await curriedTestRapperAsync(1000);

  // Using cache
  await curriedTestRapperAsync(0);

  // Using the cache because the expiration date time has not come
  jest.advanceTimersByTime(58 * 1000); // Advance to "2022-04-12T23:59:59.000+09:00"
  await curriedTestRapperAsync(0);

  // Not using the cache because the cache expired
  jest.advanceTimersByTime(1 * 1000); // Advance to "2022-04-13T00:00:00.000+09:00"
  await curriedTestRapperAsync(1000);
});

it("Async function: option.maxAge is not an integer", () => {
  expect.assertions(1);

  expect(() => {
    const option = {
      maxAge: "1000",
    };
    const memoizedAsyncAdd = memoizeFunction(asyncAdd, option);
  }).toThrowError(new TypeError("option.maxAge is not an integer"));
});

it("Async function: option.expirationDate is not a date", () => {
  expect.assertions(1);

  expect(() => {
    const option = {
      expirationDate: "abcde",
    };
    const memoizedAsyncAdd = memoizeFunction(asyncAdd, option);
  }).toThrowError(new TypeError("option.expirationDate is not a date"));
});

it("Async function: set option.maxAge and option.expirationDate at the same time error", () => {
  expect.assertions(1);

  expect(() => {
    const option = {
      maxAge: 1000,
      expirationDate: "2022-04-13T00:00:00.000+09:00",
    };
    const memoizedAsyncAdd = memoizeFunction(asyncAdd, option);
  }).toThrowError(
    new Error(
      "Cannot use option.maxAge and option.expirationDate at the same time"
    )
  );
});
