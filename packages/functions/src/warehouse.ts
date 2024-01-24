import AWS from "aws-sdk";
import { EventBus } from "sst/node/event-bus";
import { sleep } from "./receipt";
const client = new AWS.EventBridge();

export async function handler(event: any) {

  const body_detail = JSON.parse(event.Records[0].body).detail;
  body_detail.inWarehouse = true;

  console.log('\x1b[33m%s\x1b[0m', `Warehouse processing order ${body_detail.id}...`);
  await sleep();
  client
    .putEvents({
      Entries: [
        {
          EventBusName: EventBus.Ordered.eventBusName,
          Source: "order",
          DetailType: "order.confirmed",
          Detail: JSON.stringify(body_detail)
        },
      ],
    })
    .promise()
    .catch((e) => {
      console.log(e);
    });
    console.log('\x1b[33m%s\x1b[0m', `Warehouse confirmed order ${body_detail.id}...`);

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "successful" }),
  };
}
