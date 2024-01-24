import { color, sleep } from "./receipt";

export async function handler(event) {
  const body_detail =event.detail;
  console.log(color.cyan, `Item shipping order ${body_detail.id} ....`);
  sleep();
  console.log(color.cyan, `Item shipped for order ${body_detail.id}`);
  return {};
}
