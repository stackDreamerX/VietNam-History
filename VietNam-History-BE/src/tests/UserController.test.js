const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Import controller và mock service
const UserController = require('../controllers/UserController');
const UserServices = require('../services/UserServices');
const JwtService = require('../services/JwtService');

// Mock các service methods
jest.mock('../services/UserServices');
jest.mock('../services/JwtService');

const app = express();
app.use(bodyParser.json());

// Setup route cho test
app.post('/users', UserController.createUser);
app.post('/users/login', UserController.loginUser);
describe('POST /users - createUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error when missing fields', async () => {
    const res = await request(app).post('/users').send({ name: 'John' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ERR');
    expect(res.body.message).toBe('The input is required');
  });

  it('should return error for invalid email', async () => {
    const res = await request(app).post('/users').send({
      name: 'John',
      email: 'invalidemail',
      password: '123456',
      confirmPassword: '123456',
      phone: '0123456789',
      birthday: '1990-01-01'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ERR');
    expect(res.body.message).toBe('The input is not email');
  });

  it('should return error when password and confirmPassword do not match', async () => {
    const res = await request(app).post('/users').send({
      name: 'John',
      email: 'john@example.com',
      password: '123456',
      confirmPassword: '654321',
      phone: '0123456789',
      birthday: '1990-01-01'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ERR');
    expect(res.body.message).toBe('The password is not equal confirmPassword');
  });

  it('should create user successfully', async () => {
    // Mock UserServices.createUser trả về thành công
    UserServices.createUser.mockResolvedValue({
      status: "OK",
      message: "User created successfully",
      data: { id: 'user1', name: 'John' }
    });

    const res = await request(app).post('/users').send({
      name: 'John',
      email: 'john@example.com',
      password: '123456',
      confirmPassword: '123456',
      phone: '0123456789',
      birthday: '1990-01-01'
    });

    expect(UserServices.createUser).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.data.name).toBe('John');
  });
});
describe('POST /users/login - loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error if email or password missing', async () => {
    const res = await request(app).post('/users/login').send({ email: 'john@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ERR');
    expect(res.body.message).toBe('The input is required');
  });

  it('should return error if email invalid', async () => {
    const res = await request(app).post('/users/login').send({ email: 'bademail', password: '123456' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ERR');
    expect(res.body.message).toBe('The input is not email');
  });

  it('should login successfully and set cookie', async () => {
    UserServices.loginUser.mockResolvedValue({
      status: "OK",
      access_token: "token123",
      refresh_token: "refreshtoken123",
      user: { id: 'user1', email: 'john@example.com' }
    });

    const res = await request(app).post('/users/login').send({
      email: 'john@example.com',
      password: '123456'
    });

    expect(UserServices.loginUser).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.access_token).toBe('token123');
    // Kiểm tra cookie set
    expect(res.headers['set-cookie'][0]).toMatch(/refresh_token=refreshtoken123/);
  });
});
