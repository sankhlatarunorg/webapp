// const request = ('supertest');
// const app = require('../app');
import supertest from "supertest";
const api = supertest("http://localhost:3000");
import { faker } from "@faker-js/faker";
// const faker = require('faker');

describe('Healthz check endpoint', () => {
    test('should return 200 Status when database is connected', async() => {
        try {
            const response = await api.get('/healthz');
            expect(response.statusCode).toBe(200);
            expect(response.headers['cache-control']).toBe('no-cache');

        } catch (error) {
            console.log(error);
        }
    });

    // test('should return 400 Status code when request body is not empty', async() => {
    //     const request_body = {
    //         Status: "Body is not empty",
    //     };
    //     try {
    //         const response = await request(app).get('/healthz').send(request_body);
    //         expect(response.statusCode).toBe(400);
    //         expect(response.headers['cache-control']).toBe('no-cache');
    //     } catch (error) {
    //         console.log(error);
    //     }
    // });

    // test('should return 400 Status code when request param is not empty', async() => {
    //     try {
    //         const response = await request(app).get('/healthz?param=notempty');
    //         expect(response.statusCode).toBe(400);
    //         expect(response.headers['cache-control']).toBe('no-cache');
    //     } catch (error) {
    //         console.log(error);
    //     }
    // });

    // test('should return 404 Status when request path is invalid', async() => {
    //     try {
    //         const response = await request(app).get('/invalid');
    //         expect(response.statusCode).toBe(404);
    //         expect(response.headers['cache-control']).toBe('no-cache');
    //     } catch (error) {
    //         console.log(error);
    //     }
    // });
});


describe('User endpoint', () => {
    const first_name = faker.name.firstName();
    const last_name = faker.name.lastName();
    const username = faker.internet.email();
    const password = "test@12345";
    const first_name_update = faker.name.firstName();
    const last_name_update = faker.name.lastName();
    test('should return 201 Status when user is created', async() => {
        const request_body = {
            first_name: first_name,
            last_name: last_name,
            username: username,
            password: password
        };
        try {
            response = await api.post('/v1/user').send(request_body);
            expect(response.statusCode).toBe(201);
            expect(response.headers['cache-control']).toBe('no-cache');
        } catch (err) {
            console.log(err);
        }
    });

    test('should return 200 Status code and User', async() => {
        const basic_auth = {
            username: username,
            password: password
        };
        try {
            const response = await api.get('/v1/user/self').auth(basic_auth.username, basic_auth.password);
            expect(response.statusCode).toBe(200);
            expect(response.body.first_name).toBe(first_name);
            expect(response.body.last_name).toBe(last_name);
            expect(response.headers['cache-control']).toBe('no-cache');
        } catch (err) {
            console.log(err);
        }
    });

    test('should return 204 Status code when user is updated', async() => {
        const basic_auth = {
            username: username,
            password: password
        };
        const request_body = {
            first_name: first_name_update,
            last_name: last_name_update
        };
        try {
            const response = await api.put('/v1/user/self').send(request_body).auth(basic_auth.username, basic_auth.password);
            expect(response.statusCode).toBe(204);
            expect(response.headers['cache-control']).toBe('no-cache');
        } catch (err) {
            console.log(err);
        }
    });

    test('should return 200 Status code and User after Update', async() => {
        const basic_auth = {
            username: username,
            password: password
        };
        try {
            const response = await api.get('/v1/user/self').auth(basic_auth.username, basic_auth.password);
            expect(response.statusCode).toBe(200);
            expect(response.body.first_name).toBe(first_name_update);
            expect(response.body.last_name).toBe(last_name_update);
            expect(response.headers['cache-control']).toBe('no-cache');
        } catch (err) {
            console.log(err);
        }
    });
});

// const chai = await import("chai");
// const expect = chai.expect;
// import supertest from "supertest";
// import { faker } from "@faker-js/faker";
// import database from "./../Model/index.js";
// import model from "./../Model/userModel.js";
// const api = supertest("http://localhost:3000");

// describe(" Api Integration Test", function() {
//   let userCredsData = {
//     username: "",
//     password: "",
//     first_name: "",
//     last_name: "",
//     id: "",
//     account_created: "",
//     account_updated: "",
//   };

//   // it("test sequilize", async function() {
//   //   database.users = model(
//   //     database.sequelize,
//   //     database.DataTypes,
//   //     database.Sequelize
//   //   );
//   //   // const User = database.users;
//   //   // (async () => {
//   //   //   await User.sync({ force: true });
//   //   //   // Table created
//   //   //   const users = await User.findAll();
//   //   //   console.log("Users:");
//   //   //   console.log(users);
//   //   // })();
//   //   // console.log("ending the sync");
//   // });
//   it("Create User Test", async function() {
//     const userData = {
//       username: faker.internet.email(),
//       password: faker.internet.password(),
//       first_name: "Tarun",
//       last_name: "Sankhla",
//     };
//     console.log(userData);
//     console.log("starting the sync");
//     // const User = database.users;
//     // (async () => {
//     //   await User.sync({ force: true });
//     //   // Table created
//     //   const users = await User.findAll();
//     //   console.log("Users:")
//     //   console.log(users);

//     // })();
//     console.log("ending the sync");
//     // try {
//     //   console.log('Checking database connection...');
//     //   const sequelize= database.sequelize;
//     //   const User = database.users;
//     //   await sequelize.authenticate();
//     //   const userTableExists = await sequelize.queryInterface.hasTable('User');

//     //   if (!userTableExists) {
//     //     console.error('User table does not exist. Running migrations...');
//     //     await User.init(sequelize.options);
//     //   }

//     // } catch (error) {
//     //   console.error('Unable to connect to the database:', error);
//     // }

//     // const healthz = await api.get('/healthz');
//     console.log("successfully ran health check");
//     // console.log(healthz.status);
//     // console.log(healthz.body);

//     // expect(healthz.status).to.equal(200);
//     let response = await api.post("/v1/user/self").send(userData);
//     console.log(response.status);
//     console.log(response.body);

//     expect(response.status).to.equal(201);
//     expect(response.body).to.have.property("username");
//     expect(response.body).to.have.property("first_name");
//     expect(response.body).to.have.property("last_name");
//     expect(response.body).to.have.property("id");
//     expect(response.body).to.have.property("account_created");
//     expect(response.body).to.have.property("account_updated");
//     userCredsData.username = userData.username;
//     userCredsData.password = userData.password;
//     userCredsData.first_name = userData.first_name;
//     userCredsData.last_name = userData.last_name;
//     userCredsData.id = response.body.id;
//     userCredsData.account_created = response.body.account_created;
//     userCredsData.account_updated = response.body.account_updated;

//     response = await api
//       .get("/v1/user/self")
//       .auth(userCredsData.username, userCredsData.password);
//     console.log(response.status);
//     console.log(response.body);
//     expect(response.status).to.equal(200);
//     expect(response.body).to.have.property("username");
//     expect(response.body).to.have.property("first_name");
//     expect(response.body).to.have.property("last_name");
//     expect(response.body).to.have.property("id");
//     expect(response.body).to.have.property("account_created");
//     expect(response.body).to.have.property("account_updated");
//     expect(response.body.username).to.equal(userCredsData.username);
//     expect(response.body.first_name).to.equal(userCredsData.first_name);
//     expect(response.body.last_name).to.equal(userCredsData.last_name);
//     expect(response.body.id).to.equal(userCredsData.id);
//     expect(response.body.account_created).to.equal(
//       userCredsData.account_created
//     );
//     expect(response.body.account_updated).to.equal(
//       userCredsData.account_updated
//     );
//   });

//   it("Update the User Test", async function() {
//     userCredsData.first_name += "Updated";
//     let response = await api
//       .put("/v1/user/self")
//       .auth(userCredsData.username, userCredsData.password)
//       .send({
//         first_name: userCredsData.first_name,
//         last_name: userCredsData.last_name,
//         password: userCredsData.password,
//         username: userCredsData.username,
//       });
//     console.log(response.status);
//     console.log(response.body);
//     expect(response.status).to.equal(204);

//     response = await api
//       .get("/v1/user/self")
//       .auth(userCredsData.username, userCredsData.password);
//     console.log(response.status);
//     console.log(response.body);
//     expect(response.status).to.equal(200);
//     expect(response.body).to.have.property("username");
//     expect(response.body).to.have.property("first_name");
//     expect(response.body).to.have.property("last_name");
//     expect(response.body).to.have.property("id");
//     expect(response.body).to.have.property("account_created");
//     expect(response.body).to.have.property("account_updated");
//     expect(response.body.username).to.equal(userCredsData.username);
//     expect(response.body.first_name).to.equal(userCredsData.first_name);
//     expect(response.body.last_name).to.equal(userCredsData.last_name);
//     expect(response.body.id).to.equal(userCredsData.id);
//   });
// });
