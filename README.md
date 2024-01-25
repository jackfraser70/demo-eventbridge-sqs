# EventBridge and SQS Integration with SST

This demo project demonstrates using AWS EventBridge with SQS, incorporating SST's features for IoC.

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