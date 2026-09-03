import {
  vi,
  describe,
  it,
  test,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";

export const jest = {
  ...vi,
  fn: vi.fn.bind(vi),
  spyOn: vi.spyOn.bind(vi),
  mock: vi.mock.bind(vi),
  unmock: vi.unmock.bind(vi),
  doMock: vi.doMock.bind(vi),
  dontMock: vi.doUnmock.bind(vi),
  resetModules: vi.resetModules.bind(vi),
  restoreAllMocks: vi.restoreAllMocks.bind(vi),
  clearAllMocks: vi.clearAllMocks.bind(vi),
  resetAllMocks: vi.resetAllMocks.bind(vi),
  unstable_mockModule: (modulePath: string, factory: () => any) => vi.doMock(modulePath, factory),
  advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
  useFakeTimers: vi.useFakeTimers.bind(vi),
  useRealTimers: vi.useRealTimers.bind(vi),
};

export { describe, it, test, expect, beforeEach, afterEach, beforeAll, afterAll };
export default { jest, describe, it, test, expect, beforeEach, afterEach, beforeAll, afterAll };
