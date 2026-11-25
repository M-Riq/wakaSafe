// Timers exist in every target runtime (React Native, browsers, Node.js), but the shared
// packages compile without DOM or Node typings to stay platform-agnostic.
declare function setTimeout(callback: () => void, ms?: number): unknown;
