
export function sleep() {
    // random sleep between 0.5s and 5s
    const ms = Math.floor(Math.random() * 4500) + 500;
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  export const color = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
  };