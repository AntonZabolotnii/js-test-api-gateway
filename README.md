# API Gateway

Assume that your server has few endpoints and instead of making a separate request for each of them
you want to make only single request and get all data at once. This module intended to make it possible.

## Usage
> npm i --save api-gateway-test

> const app = require('express')();

> const gateway = require('api-gateway-test');

> app.use(...);

> app.use(gateway);

## Example

Assuming that the server has routes `/api/users`, `/api/countries` and so on, making a request to
`/api/resources` with specified parameters should return joint data for each of underlying resources.

http://localhost:3000/api/resources?users=/api/users&countries=/api/countries&user=/api/users/user1&customers=/api/customers

http://localhost:3000/api/resources?user=/api/users/1&countries=/api/countries

http://localhost:3000/api/resources?unknown=/api/unknown

http://localhost:3000/api/resources?timeout=/api/unresponsible
