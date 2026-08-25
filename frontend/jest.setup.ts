/// <reference types="@types/jest" />
import "@testing-library/jest-dom";
import { server } from "./src/mocks/server";

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Reset handlers after each test so tests don't leak state
afterEach(() => server.resetHandlers());

// Clean up after all tests finish
afterAll(() => server.close());
