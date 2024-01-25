import { color, sleep } from "./helper";

export async function handler(event) {
  const body_detail =event.detail;
  console.log(color.cyan, `[Shipping] Item shipping order ${body_detail.id}...`);
  sleep();
  console.log(color.cyan, `[Shipping] Item shipped for order ${body_detail.id}`);
  return {};
}
