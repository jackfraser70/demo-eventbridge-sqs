import { Api, EventBus, StackContext, Queue, Topic } from "sst/constructs";
import { Duration } from 'aws-cdk-lib/core';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as chatbot from 'aws-cdk-lib/aws-chatbot';
export function ExampleStack({ stack }: StackContext) {

  // create a queue for the warehouse (with a batch size of 5)
  const warehouseQueue = new Queue(stack, 'QueueWarehouse', {
    consumer: {
      function: {
        currentVersionOptions: {
          provisionedConcurrentExecutions: 5, // max Lambda that can run concurrently
        },
        handler:
          "packages/functions/src/warehouse.handler",
      },
      cdk: {
        eventSource: {
          batchSize: 1, // limit lambda get only 1 record at a time from the queue
          maxConcurrency: 5, // limit the number of concurrent lambda executions
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
      cdk: {
        eventSource: {
          batchSize: 3, // limit lambda get only 3 record at a time from the queue
          maxConcurrency: 5, // limit the number of concurrent lambda executions
        },
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

  const metricReceiptQueue = new cloudwatch.Metric({
    metricName: 'ApproximateAgeOfOldestMessage',
    namespace: 'AWS/SQS',
    period: Duration.seconds(5 * 60),
    statistic: 'Maximum',
    dimensionsMap: {
      QueueName: receiptQueue.queueName,
    },
  });
  const metricReceiptQueueAlarm = new cloudwatch.Alarm(stack, `MetricReceiptQueueDelayAlarm`, {
    alarmName: `MetricReceiptQueueDelayAlarm`.toLowerCase(),
    comparisonOperator:
      cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    evaluationPeriods: 1,
    metric: metricReceiptQueue,
    threshold: 60 * 60,
    alarmDescription: 'Long delay with receipt queue',
    actionsEnabled: true,
  });


  const dashboard = new cloudwatch.Dashboard(stack, 'QueueDashboard', {
    dashboardName: `${stack.stage}-QueueDashboard`,
  });

  // Add widgets to the dashboard
  dashboard.addWidgets(
    new cloudwatch.GraphWidget({
      title: 'Approximate Age of Oldest Message in Receipt Queue',
      left: [metricReceiptQueue],
    }),
    new cloudwatch.AlarmWidget({
      title: 'Queue Delay Alarm for Reciepts',
      alarm: metricReceiptQueueAlarm,
    })
  );


  // Create an SNS Topic using SST
  const alarmTopic = new Topic(stack, 'AlarmTopic');

  // Subscribe the SNS topic to the alarm
  metricReceiptQueueAlarm.addAlarmAction({
    bind() {
      return { alarmActionArn: alarmTopic.cdk.topic.topicArn };
    }
  });
  // Create a Slack Channel Configuration
  const slackChannel = new chatbot.SlackChannelConfiguration(stack, 'SlackChannel', {
    slackChannelConfigurationName: 'MetricAlarmsSlackChannelConfig',
    slackWorkspaceId: 'TRUR6J7S4', // suverateam
    slackChannelId: 'C07FME8QFFT',  // #queue-alerts-dev
    notificationTopics: [alarmTopic.cdk.topic],
    loggingLevel: chatbot.LoggingLevel.ERROR,
  });



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
      "POST /order": {
        function: {
          handler: "packages/functions/src/order.handler",
        }
      }
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
