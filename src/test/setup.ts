import "reflect-metadata";

process.env.NODE_ENV = "test";

jest.mock("axios");
jest.mock("redis");
