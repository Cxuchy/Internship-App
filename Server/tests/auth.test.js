const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // your Express app
const mongoose = require('mongoose');
const User = require('../models/user.model');

const { expect } = chai;
chai.use(chaiHttp);

describe('Auth API', () => {
  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/test-auth');
  });

  after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  describe('POST /api/signup', () => {
    it('should register a new user', done => {
      chai.request(app)
        .post('/api/signup')
        .send({ email: 'test@example.com', password: '123456' })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('token');
          done();
        });
    });

    it('should not register with existing email', done => {
      chai.request(app)
        .post('/api/signup')
        .send({ email: 'test@example.com', password: '123456' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('User already exists');
          done();
        });
    });
  });

  describe('POST /api/signin', () => {
    it('should sign in an existing user', done => {
      chai.request(app)
        .post('/api/signin')
        .send({ email: 'test@example.com', password: '123456' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          done();
        });
    });

    it('should fail with wrong password', done => {
      chai.request(app)
        .post('/api/signin')
        .send({ email: 'test@example.com', password: 'wrong' })
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });
});
