import { Api, EventBus, StackContext, Queue } from "sst/constructs";
export function ExampleStack({ stack }: StackContext) {

  // create a queue for the warehouse (with a batch size of 5)
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

  // Create a DLQ for the receipt queue
  const receiptQueueDLQ = new Queue(stack, 'QueueReceiptDLQ', {
    consumer: {
      function: {
        handler:
          "packages/functions/src/receipt-dlq.handler",
      }
    },
  })

  // create a queue for the receipt
  const receiptQueue = new Queue(stack, 'QueueReceipt', {
    consumer: {
      function: {
        handler:
          "packages/functions/src/receipt.handler",
      },
    },
    // add a DLQ to the queue
    cdk: {
      queue: {
        deadLetterQueue: {
          queue: receiptQueueDLQ.cdk.queue,
          maxReceiveCount: 1
        }
      }
    },
  })

  // create an event bus with rules
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
            type: "queue",
            queue: receiptQueue
          },
        },
      },
    }
  });

  // bind the queue to the event bus
  warehouseQueue.bind([bus]);

  // create an API to place orders
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

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
