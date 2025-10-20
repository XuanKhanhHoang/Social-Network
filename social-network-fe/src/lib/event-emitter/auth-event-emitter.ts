/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
class AuthEventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, listener: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  emit(event: string, ...args: any[]) {
    this.listeners[event]?.forEach((listener) => listener(...args));
  }

  off(event: string, listener: Function) {
    this.listeners[event] = this.listeners[event]?.filter(
      (l) => l !== listener
    );
  }
}

export const authEvents = new AuthEventEmitter();
