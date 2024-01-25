import { color, sleep } from "./helper";
export async function handler(event) {
  const body_detail = JSON.parse(event.Records[0].body).detail;
  console.log(color.yellow, `[Receipt DLQ] processing order ${body_detail.id}...`);
  await sleep();
  console.log(color.yellow, `[Receipt DLQ] sent for order ${body_detail.id}`);

  return {};
}
