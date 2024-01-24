import AWS from "aws-sdk";
import { EventBus } from "sst/node/event-bus";

const client = new AWS.EventBridge();

export async function handler(event) {

  const orderId = [1];
  if(event.queryStringParameters && event.queryStringParameters.hard){
    // add 50 order to the orderId array
    for(let i = 0; i < 50; i++){
      orderId.push(i);
    }
  }
  const eventEntries = [];
  for(let i = 0; i < orderId.length; i++){


    eventEntries.push(client
    .putEvents({
      Entries: [
        {
          EventBusName: EventBus.Ordered.eventBusName,
          Source: "order",
          DetailType: "order.placed",
          Detail: JSON.stringify({
            id: orderId[i],
            name: "order " + orderId[i],
            items: [
              {
                id: "1",
                name: "My item",
                price: 10,
              },
            ],
          }),
        },
      ],
    })
    .promise()
    .catch((e) => {
      console.log(e);
    }));
    console.log('\x1b[38;5;214m%s\x1b[0m', `Order id: ${i} placed!`);
  }

  await Promise.all(eventEntries);



  return {
    statusCode: 200,
    body: JSON.stringify({ status: "successful" }),
  };
}
