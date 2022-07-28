
const supertest = require('supertest')
const app = require('../../app')
const mongoose = require('mongoose')

// beforeEach((done) => {
//   mongoose.connect(mongoTestUrl,
//     { useNewUrlParser: true, useUnifiedTopology: true },
//     () => done())
// })

afterAll((done) => {
  mongoose.connection.db.dropDatabase().then(() => {
    console.log('test db is dropped successfully')
    mongoose.disconnect()
      .then(() => {
        console.log('connections are closed successfully')
        done()
      })
      .catch((err) => {
        console.log(err)
      })
  }).catch((err) => {
    console.log(err)
  })
})

test('POST /users/signup', async () => {
  const res = await supertest(app)
    .post('/users/signup')
    .send({ username: 'testusername', password: 'testpassword' })
    .set('Accept', 'application/json')

  expect(res.status).toEqual(201)
  expect(res.body.success).toEqual(true)
  expect(res.body.status).toEqual('Registration Successful!')
})

test('POST /users/signup with already exsiting user', async () => {
  const res = await supertest(app)
    .post('/users/signup')
    .send({ username: 'testusername', password: 'testpassword' })
    .set('Accept', 'application/json')

  expect(res.status).toEqual(500)
  expect(res.body.err.name).toEqual('UserExistsError')
  expect(res.body.err.message).toEqual('A user with the given username is already registered')
})

test('POST /users/login with registered user', async () => {
  const res = await supertest(app)
    .post('/users/login')
    .send({ username: 'testusername', password: 'testpassword' })
    .set('Accept', 'application/json')

  expect(res.status).toEqual(200)
  expect(res.body.token).toBeTruthy()
  expect(res.body.status).toEqual('You are successfully logged in!')
})

test('POST /users/login with wrong credentials', async () => {
  const res = await supertest(app)
    .post('/users/login')
    .send({ username: 'testusername', password: 'wrongtestpassword' })
    .set('Accept', 'application/json')

  expect(res.status).toEqual(401)
})

// test('GET /users/logout with loggedin user', async () => {
//   const res = await supertest(app)
//     .get('/users/logout')
//     .set('Accept', 'application/json')

//   expect(res.body.success).toEqual(true)
//   expect(res.body.message).toEqual('loggedout successfully')
// })
