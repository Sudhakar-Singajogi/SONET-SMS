const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");

require("dotenv");
const { connectRouters } = require("../initializer/framework");
const sequelize = require("../dbconn/connection"); 
const { iteratee } = require("lodash");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors()); // Use this after the variable declaration
connectRouters(app);
const supertest = require('supertest');

app.get("/api", (req, res) => {
    return res.status(200).json({
      result: "OK",
      resultCode: 200,
      message: 'Hurry able to access the api base url',
      ValidationErrors: "",
      data: [],
      totalRows: 0,
    });
  });
  
  
describe('checking the base url', () => {
  it('return 200 OK when calls the base url', (done) => {
    supertest(app).get('/api').then((response) => {
        expect(response.status).toBe(200);
        done();
      })
  })

})  

  
  
describe('Roles Module', () => {
  it('return 200 OK when calls to the get roles', (done) => {
    supertest(app).get('/api/roles').then((response) => {
        expect(response.status).toBe(200);
        done();
      })
  })

})  
