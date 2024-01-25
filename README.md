# EventBridge and SQS Integration with SST

This demo project demonstrates using AWS EventBridge with SQS, incorporating SST's features for IoC.

<img width="1090" alt="image" src="https://github.com/jackfraser70/demo-eventbridge-sqs/assets/1830391/cdac662b-649d-4d72-9648-d96dded0f726">

To set up the example:
### `npm install`

## Operational Commands

### `npm run start`

Initiates the local Lambda development environment.

## Demonstration

Open a new terminal window. Use the SST output URL, appending `/order` to it. 
Invoke the API with a POST request:
Simulate multiple orders by adding ?qty=10 (modifiable up to 1000).

Use this curl command:

`curl --request POST \
  --url 'https://[deployed-id].execute-api.us-east-1.amazonaws.com/order?[qty=10]'
`

<img width="920" alt="image" src="https://github.com/jackfraser70/demo-eventbridge-sqs/assets/1830391/83905f94-f4a2-4a5b-a42b-afb8eed4b2a3">
