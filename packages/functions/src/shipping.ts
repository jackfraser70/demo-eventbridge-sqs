export async function handler(event) {
  const body_detail =event.detail;
  console.log('\x1b[38;5;213m%s\x1b[0m', `Item shipping order ${body_detail.id} ....`);
  console.log('\x1b[38;5;213m%s\x1b[0m', `Item shipped for order ${body_detail.id}`);
  return {};
}
