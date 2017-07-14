const assert = require('chai').assert
const request = require('request-promise-native')
const createApp = require('../src/app')
const http = require('http')
const express = require('express')

describe('Verify Service Provider User Research Application', function () {

  let server
  const client = request.defaults({ jar: true, simple: false, followAllRedirects: true })
  const users = { 'username': {
    firstName: 'some-user',
    password: 'password'
  } }

  beforeEach((done) => {
    server = createApp(users).listen(3201, done)
  })

  afterEach((done) => {
    server.close(done)
  })

  it('should show a login form', function () {
    return client('http://localhost:3201')
      .then(body => {
        assert.include(body, '<form', body)
        assert.include(body, 'name="username"', body)
        assert.include(body, 'name="password"', body)
      })
  })

  it('should authenticate a known user', function () {
    return client({
        uri: 'http://localhost:3201/authenticate',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'username=username&password=password'
      })
      .then(body => {
        assert.include(body, 'You have successfully logged in', body)
        assert.include(body, users.username.firstName, body)
      })
  })

  it('should not authenticate an unknown user', function () {
    return client({
      uri: 'http://localhost:3201/authenticate',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'username=bad-username&password=bad-password'
    })
    .then(body => {
      assert.include(body, 'Authentication failed!', body)
    })
  })

})
