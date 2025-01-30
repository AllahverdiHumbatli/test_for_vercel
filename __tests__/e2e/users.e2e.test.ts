import request from 'supertest';
import { initApp } from '../../src/initApp';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { routersPaths } from '../../src/common/path/paths';
import { createUser } from './utils/createUsers';
import { db } from '../../src/db';
import { testingDtosCreator } from './utils/testingDtosCreator';
import { ADMIN_LOGIN, ADMIN_PASS } from '../../src/auth/api/guards/base.auth.guard';

describe('USERS_TESTS', () => {
  const app = initApp();

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await db.run(mongoServer.getUri());
  });

  beforeEach(async () => {
    await db.drop();
  });

  afterAll(async () => {
    await db.stop();
  });

  afterAll((done) => {
    done();
  });

  let userDto: any;

  it('shouldn`t create user without authorization: STATUS 401', async () => {
    await request(app)
      .post(routersPaths.users)
      .send({
        login: '',
      })
      .expect(401);
  });
  it('should create user with correct data by sa and return it: STATUS 201', async () => {
    userDto = testingDtosCreator.createUserDto({});

    const newUser = await request(app)
      .post(routersPaths.users)
      .auth(ADMIN_LOGIN, ADMIN_PASS)
      .send({ login: userDto.login, email: userDto.email, password: userDto.pass })
      .expect(201);

    expect(newUser.body).toEqual({
      id: expect.any(String),
      login: userDto.login,
      email: userDto.email,
      createdAt: expect.any(String),
    });
  });
  it('shouldn`t create user twice with correct data by sa: STATUS 400', async () => {
    userDto = testingDtosCreator.createUserDto({});
    const user = await createUser(app, userDto);
    await request(app)
      .post(routersPaths.users)
      .auth(ADMIN_LOGIN, ADMIN_PASS)
      .send(user)
      .expect(400);
  });
  it('shouldn`t create user with incorrect login: STATUS 400', async () => {
    userDto = testingDtosCreator.createUserDto({ login: '' });
    await request(app)
      .post(routersPaths.users)
      .auth(ADMIN_LOGIN, ADMIN_PASS)
      .send({ login: userDto.login, email: userDto.email, password: userDto.pass })
      .expect(400);
  });
  it('shouldn`t create user with incorrect email: STATUS 400', async () => {
    userDto = testingDtosCreator.createUserDto({ email: 'hhh' });
    await request(app)
      .post(routersPaths.users)
      .auth(ADMIN_LOGIN, ADMIN_PASS)
      .send({ login: userDto.login, email: userDto.email, password: userDto.pass })
      .expect(400);
  });
  it('shouldn`t create user with incorrect password: STATUS 400', async () => {
    userDto = testingDtosCreator.createUserDto({ pass: 'hh' });
    await request(app)
      .post(routersPaths.users)
      .auth(ADMIN_LOGIN, ADMIN_PASS)
      .send({ login: userDto.login, email: userDto.email, password: userDto.pass })
      .expect(400);
  });
  it('shouldn`t delete user by id without authorization: STATUS 401', async () => {
    const user = await createUser(app);

    await request(app)
      .delete(`${routersPaths.users + '/' + user.id}`)
      .expect(401);
  });

  it('should delete user by id: STATUS 204', async () => {
    const user = await createUser(app);

    await request(app)
      .delete(`${routersPaths.users + '/' + user.id}`)
      .auth(ADMIN_LOGIN, ADMIN_PASS)
      .expect(204);
  });

  it('shouldn`t delete user by id if specified user is not exists: STATUS 404', async () => {
    await request(app)
      .delete(`${routersPaths.users + '/555'}`)
      .auth(ADMIN_LOGIN, ADMIN_PASS)
      .expect(404);
  });
});
