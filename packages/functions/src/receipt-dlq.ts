import { color, sleep } from "./receipt";
export async function handler(event) {
  const body_detail = JSON.parse(event.Records[0].body).detail;
  console.log(color.yellow, `DQL for Receipt processing order ${body_detail.id} ....`);
  await sleep();
  console.log(color.yellow, `DQL for Receipt sent for order ${body_detail.id}`);

  return {};
}
