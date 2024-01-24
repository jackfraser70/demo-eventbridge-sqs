
export function sleep() {
  // random sleep between 0.5s and 5s
  const ms = Math.floor(Math.random() * 4500) + 500;
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function handler(event) {
  const body_detail = JSON.parse(event.Records[0].body).detail;
  console.log('\x1b[33m%s\x1b[0m', `Receipt processing order ${body_detail.id} ....`);
  await sleep();

  console.log('\x1b[33m%s\x1b[0m', `Receipt sent for order ${body_detail.id}`);

  return {};
}
