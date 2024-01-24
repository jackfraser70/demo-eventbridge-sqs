import { PutEventsCommand, EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { EventBus } from "sst/node/event-bus";
import { color } from "./receipt";

const client = new EventBridgeClient({});

function getOrders(event){
  const orderId = [];
  let qty = 1;
  if (event.queryStringParameters && event.queryStringParameters.qty) {
    qty = parseInt(event.queryStringParameters.qty)
  }
    if(qty>1000){
      return {
        statusCode: 400,
        body: JSON.stringify({ status: `max qty is 1000`}),
      };
    }
    for (let i = 0; i < qty; i++) {
      orderId.push(i+1);
    }

  return orderId;
}

export async function handler(event) {
  const orderId = getOrders(event);
  const eventEntries = orderId.map((id) => {
    const eventDetail = {
      id,
      name: `My order ${id}`,
      items: [
        {
          id: "1",
          name: "My item",
          price: 10,
        },
      ],
    };

    const putEventsCommand = new PutEventsCommand({
      Entries: [
        {
          EventBusName: EventBus.Ordered.eventBusName,
          Source: "order",
          DetailType: "order.placed",
          Detail: JSON.stringify(eventDetail),
        },
      ],
    });

    return client.send(putEventsCommand)
      .then(() => {
        console.log(color.magenta, `Order id: ${id} placed!`);
      })
      .catch((e) => {
        console.log(e);
      });
  });

  await Promise.all(eventEntries);

  return {
    statusCode: 200,
    body: JSON.stringify({ status: `successful received ${orderId.length} orders`}),
  };
}
