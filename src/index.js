const createApp = require('./app')
const users = require('./fakeUserDatabase.js')

createApp(users).listen(process.env.PORT || 3220, function () {
  console.log('VSP User Research app listening on port 3220!')
})
