const chai = await import('chai');
const expect = chai.expect;
import supertest from 'supertest';
import { faker } from '@faker-js/faker';

const api = supertest('http://localhost:3000');

describe(' Api Integration Test', function () {
  let userCredsData = {
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    id: '',
    account_created: '',
    account_updated: ''
  };
  it('Create User using Post API', async function () {
    const userData = {
      username: faker.internet.email(),
      password: faker.internet.password(),
      first_name: 'Tarun',
      last_name: 'Sankhla'
    }
    console.log(userData);
    const response = await api.post('/v1/user/self').send(userData);
    console.log(response.status);
    console.log(response.body);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('username');
    expect(response.body).to.have.property('first_name');
    expect(response.body).to.have.property('last_name');
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('account_created');
    expect(response.body).to.have.property('account_updated');
    userCredsData.username = userData.username;
    userCredsData.password = userData.password;
    userCredsData.first_name = userData.first_name;
    userCredsData.last_name = userData.last_name;
    userCredsData.id = response.body.id;
    userCredsData.account_created = response.body.account_created;
    userCredsData.account_updated = response.body.account_updated;
  });

  it('Get User using Api', async function () {
    const response = await api.get('/v1/user/self').auth(userCredsData.username, userCredsData.password);
    console.log(response.status);
    console.log(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('username');
    expect(response.body).to.have.property('first_name');
    expect(response.body).to.have.property('last_name');
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('account_created');
    expect(response.body).to.have.property('account_updated');
    expect(response.body.username).to.equal(userCredsData.username);
    expect(response.body.first_name).to.equal(userCredsData.first_name);
    expect(response.body.last_name).to.equal(userCredsData.last_name);
    expect(response.body.id).to.equal(userCredsData.id);  
    expect(response.body.account_created).to.equal(userCredsData.account_created);
    expect(response.body.account_updated).to.equal(userCredsData.account_updated);
  });


  it('Update the User', async function () {
    userCredsData.first_name += 'Updated';
    const response = await api.put('/v1/user/self')
      .auth(userCredsData.username, userCredsData.password)
      .send({ 
        first_name: userCredsData.first_name, 
        last_name: userCredsData.last_name, 
        password: userCredsData.password, 
        username: userCredsData.username });
    console.log(response.status); 
    console.log(response.body); 
    expect(response.status).to.equal(204);
  });

  it('Get User using Api', async function () {
    const response = await api.get('/v1/user/self').auth(userCredsData.username, userCredsData.password);
    console.log(response.status);
    console.log(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('username');
    expect(response.body).to.have.property('first_name');
    expect(response.body).to.have.property('last_name');
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('account_created');
    expect(response.body).to.have.property('account_updated');
    expect(response.body.username).to.equal(userCredsData.username);
    expect(response.body.first_name).to.equal(userCredsData.first_name);
    expect(response.body.last_name).to.equal(userCredsData.last_name);
    expect(response.body.id).to.equal(userCredsData.id); 
  });
});
