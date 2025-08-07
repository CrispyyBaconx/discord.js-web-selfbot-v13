'use strict';

let erlpack;
// Use browser-compatible buffer if available
const { Buffer } = typeof window !== 'undefined' ? require('buffer') : require('node:buffer');

try {
  // Erlpack is Node.js specific, disable in browser
  if (typeof window === 'undefined') {
    erlpack = require('erlpack');
    if (!erlpack.pack) erlpack = null;
  } else {
    erlpack = null; // Disable erlpack in browser
  }
} catch {} // eslint-disable-line no-empty

// Use browser's native WebSocket if available, fallback to ws for Node.js
exports.WebSocket = typeof WebSocket !== 'undefined' ? WebSocket : require('ws');

const ab = new TextDecoder();

exports.encoding = erlpack ? 'etf' : 'json';

exports.pack = erlpack ? erlpack.pack : JSON.stringify;

exports.unpack = (data, type) => {
  if (exports.encoding === 'json' || type === 'json') {
    if (typeof data !== 'string') {
      data = ab.decode(data);
    }
    return JSON.parse(data);
  }
  if (!Buffer.isBuffer(data)) data = Buffer.from(new Uint8Array(data));
  return erlpack.unpack(data);
};

exports.create = (gateway, query = {}, ...args) => {
  const [g, q] = gateway.split('?');
  query.encoding = exports.encoding;
  query = new URLSearchParams(query);
  if (q) new URLSearchParams(q).forEach((v, k) => query.set(k, v));
  const ws = new exports.WebSocket(`${g}?${query}`, ...args);
  return ws;
};

for (const state of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) exports[state] = exports.WebSocket[state];
