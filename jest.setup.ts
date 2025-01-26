import "./src/ServicesRegistry";

jest.mock("winston-cloudwatch", () => {
  return jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }));
});

jest.mock("winston", () => {
  return {
    createLogger: () => ({
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    }),
  };
});
