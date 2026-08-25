/// <reference types="node" />

const {
  TextDecoder: NodeTextDecoder,
  TextEncoder: NodeTextEncoder,
} = require("node:util");
const {
  ReadableStream: NodeReadableStream,
  WritableStream: NodeWritableStream,
  TransformStream: NodeTransformStream,
} = require("node:stream/web");
const {
  BroadcastChannel: NodeBroadcastChannel,
  MessageChannel: NodeMessageChannel,
  MessagePort: NodeMessagePort,
} = require("node:worker_threads");
Object.defineProperties(globalThis, {
  TextDecoder: { value: NodeTextDecoder, configurable: true, writable: true },
  TextEncoder: { value: NodeTextEncoder, configurable: true, writable: true },
  ReadableStream: {
    value: NodeReadableStream,
    configurable: true,
    writable: true,
  },
  WritableStream: {
    value: NodeWritableStream,
    configurable: true,
    writable: true,
  },
  TransformStream: {
    value: NodeTransformStream,
    configurable: true,
    writable: true,
  },
  BroadcastChannel: {
    value: NodeBroadcastChannel,
    configurable: true,
    writable: true,
  },
  MessageChannel: {
    value: NodeMessageChannel,
    configurable: true,
    writable: true,
  },
  MessagePort: { value: NodeMessagePort, configurable: true, writable: true },
});

// 2. Require undici AFTER globals exist
const { Blob: NodeBlob, File: NodeFile } = require("node:buffer");
const {
  fetch: nodeFetch,
  Headers: NodeHeaders,
  FormData: NodeFormData,
  Request: NodeRequest,
  Response: NodeResponse,
} = require("undici");

Object.defineProperties(globalThis, {
  fetch: { value: nodeFetch, configurable: true, writable: true },
  Blob: { value: NodeBlob, configurable: true, writable: true },
  File: { value: NodeFile, configurable: true, writable: true },
  Headers: { value: NodeHeaders, configurable: true, writable: true },
  FormData: { value: NodeFormData, configurable: true, writable: true },
  Request: { value: NodeRequest, configurable: true, writable: true },
  Response: { value: NodeResponse, configurable: true, writable: true },
});

// Forces TypeScript to treat this as an isolated module
export {};
