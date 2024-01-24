import { Api, EventBus, StackContext, Queue } from "sst/constructs";

export function ExampleStack({ stack }: StackContext) {

  const warehouseQueue = new Queue(stack, 'QueueWarehouse', {
    consumer: {
      function: {
        handler:
        "packages/functions/src/warehouse.handler",
      },
      cdk: {
        eventSource: {
          batchSize: 5,
        },
      },
    },
  });


  const receiptQueue = new Queue(stack, 'QueueReceipt', {
    consumer: {
      function: {
        handler:
        "packages/functions/src/receipt.handler",
      
      },
    },
  })


  const bus = new EventBus(stack, "Ordered", {
    rules: {
      orderPlaced: {
        pattern: {
          source: ["order"],
          detailType: ["order.placed"],
        },
        targets: {
          warehouse: {
            type: "queue",
            queue: warehouseQueue,
          }
        },
      },
      orderConfimed: {
        pattern: {
          source: ["order"],
          detailType: ["order.confirmed"],
        },
        targets: {
          shipping: "packages/functions/src/shipping.handler",
          receipt: {
            type:"queue",
            queue:receiptQueue
        },
      },
    },
  }
  });

  warehouseQueue.bind([bus]);

  // Create a HTTP API
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        bind: [bus],
      },
    },
    routes: {
      "POST /order": "packages/functions/src/order.handler",
    },
  });

  // Show the endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
