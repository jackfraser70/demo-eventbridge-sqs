import { PutEventsCommand, EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { EventBus } from "sst/node/event-bus";
import { sleep } from "./helper";

const client = new EventBridgeClient({});

export async function handler(event: any) {
  const body_detail = JSON.parse(event.Records[0].body).detail;
  body_detail.inWarehouse = true;

  console.log('\x1b[33m%s\x1b[0m', `Warehouse processing order ${body_detail.id}...`);
  await sleep();

  const putEventsCommand = new PutEventsCommand({
    Entries: [
      {
        EventBusName: EventBus.Ordered.eventBusName,
        Source: "order",
        DetailType: "order.confirmed",
        Detail: JSON.stringify(body_detail)
      },
    ],
  });

  try {
    await client.send(putEventsCommand);
    console.log('\x1b[33m%s\x1b[0m', `Warehouse confirmed order ${body_detail.id}...`);
  } catch (e) {
    console.error(e);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "successful" }),
  };
}
