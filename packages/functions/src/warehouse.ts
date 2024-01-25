import { PutEventsCommand, EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { EventBus } from "sst/node/event-bus";
import { color, sleep } from "./helper";

const client = new EventBridgeClient({});

export async function handler(event: any) {
  const body_detail = JSON.parse(event.Records[0].body).detail;
  body_detail.inWarehouse = true;

  console.log(color.brightYellow, `[Warehouse] processing order ${body_detail.id}...`);
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
    console.log(color.brightYellow, `[Warehouse] confirmed order ${body_detail.id}`);
  } catch (e) {
    console.error(e);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "successful" }),
  };
}
