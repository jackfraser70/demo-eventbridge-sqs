import { color, sleep } from "./helper";

export async function handler(event:any) {
  const body_detail = JSON.parse(event.Records[0].body).detail;
  console.log(color.green, `[Receipt] processing order ${body_detail.id}...`);
  await sleep();

  // 1 in 5 throw error to simulate failure
  const random = Math.floor(Math.random() * 5);
  if (random === 0) {
     throw new Error(`Error sending receipt for ${body_detail.id}. Passing to DLQ`);
  }

  console.log(color.green, `[Receipt] sent for order ${body_detail.id}`);

  return {};
}
