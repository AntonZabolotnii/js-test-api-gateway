const app = require('express')();
const fs = require('fs');
const gateway = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const { port } = require('../config');
const testRoutes = require('./dummy/routes');

chai.should();
chai.use(chaiHttp);

describe('API Gateway Test Suite', function() {

  const path = '/api/resources';
  let requester;

  before(function() {
    app.use(testRoutes);
    app.use(gateway);
    app.listen(port);
    requester = chai.request(app).keepOpen();
  });

  it('Should return status code 200 for /api/resources', function(done) {
    requester.get(path).end((err, res) => {
      if (err) done(err);
      expect(res).to.have.status(200);
      done();
    });
  });

  it('Should have property users and customers', function(done) {

    const tmp = fs.createWriteStream('./test/test.json');
    const req = requester.get(path).query({users: '/api/users', customers: '/api/customers'});

    req.pipe(tmp);

    req.on('end', () => {
      fs.readFile('./test/test.json', 'utf8', (err, data) => {
        if (err) done(err);

        data = JSON.parse(data);
        data.should.be.a('object');
        data.should.have.property('users').with.lengthOf(2);
        data.should.have.property('customers').with.lengthOf(3);

        done();

      });
    });

  });

  it('Should return json with error description for unknown path', function(done) {

    const tmp = fs.createWriteStream('./test/test.json');
    const req = requester.get(path).query({unknown: '/api/unknown'});

    req.pipe(tmp);

    req.on('end', () => {
      fs.readFile('./test/test.json', 'utf8', (err, data) => {
        if (err) done(err);

        data = JSON.parse(data);
        data.should.be.a('object');
        data.should.have.property('unknown');
        data.unknown.should.have.property('error');

        done();

      });
    });

  });

  after(function() {
    requester.close();
    fs.unlink('./test/test.json', (err) => {
      if (err) throw err;
    });
  });

});
