const express = require('express');
const http = require('http');
const router = express.Router();
const config = require('./config');

const { PROTOCOL, HOSTNAME, PORT, TIMEOUT, RESOURCES } = config;

router.get(RESOURCES, function(req, res) {
  const query = req.query;
  const queryEntries = Object.entries(query);
  const length = queryEntries.length;

  let readCount = 0;

  const handleResponse = (key, response, error) => {
    return function() {
      return new Promise(resolve => {

        const endProcessingResponse = () => {
          if ( ++readCount === length ) {
            res.status(200).end('}');
          } else {
            res.write(',');
          }
          resolve();
        };

        if (!readCount) {
          res.setHeader('Transfer-Encoding', 'chunked');
          res.setHeader('Content-Type', 'application/json; charset=UTF-8');
          res.write('{');
        }

        // timeout or error
        if (response === null) {
          res.write(`"${key}": ${JSON.stringify(error)}`);
          endProcessingResponse();
        }

        response.setEncoding('utf8');

        if (response.statusCode === 200) {
          let dataCounter = 0;
          response.on('data', (chunk) => {
            if (!dataCounter++) {
              res.write(`"${key}":`);
            }

            res.write(chunk);
          });

          response.on('end', endProcessingResponse);
        } else {
          resolve();
        }
      });
    };
  };

  const promises = queryEntries.map(queryItem => {
    return new Promise(resolve => {
      const [key, path] = queryItem;

      const request = http.get({protocol: PROTOCOL, hostname: HOSTNAME, port: PORT, path})
        .on('response', (response) => {
          resolve(handleResponse(key, response));
        })
        .setTimeout(TIMEOUT, () => {
          request.abort();
          resolve(handleResponse(key, null, {error: `Response timeout for path: ${req.path}`}));
        })
        .on('error', (error) => { // eslint-disable-line no-unused-vars
          resolve(handleResponse(key, null, {error: `Error requesting resource: ${req.path}`}));
        });

    });
  });

  /* Handles
    - request without parameters (`http://localhost:3000/api/resources`)
    - self request (`http://localhost:3000/api/resources?self=/api/resources`)
  */
  if (!promises.length) {
    res.json({});
  }

  // FIXME Should start responding immediately after getting first response
  // instead of waiting for getting all responses
  Promise.all(promises).then(funcArray => {
    funcArray.reduce((promise, func) => {
      return promise.then( () => func() ).catch(
        err => console.error(err) // eslint-disable-line no-console
      );
    }, Promise.resolve());
  });

});

router.get('*', function(req, res) {
  res.json({error: `Unknown path: ${req.path}`});
});

module.exports = router;
