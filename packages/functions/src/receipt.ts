
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

export async function handler(event) {
  const body_detail = JSON.parse(event.Records[0].body).detail;
  console.log(color.green, `Receipt processing order ${body_detail.id} ....`);
  await sleep();

  // 1 in 5 throw error
  const random = Math.floor(Math.random() * 10);
  if (random === 0) {
     throw new Error(`Error sending receipt for ${body_detail.id}. Passing to DLQ`);
  }

  console.log(color.green, `Receipt sent for order ${body_detail.id}`);

  return {};
}
