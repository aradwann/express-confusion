require('dotenv').config()
module.exports = {
  secretKey: process.env.SECRET_KEY,
  mongoUrl: process.env.MONGO_URL,
  mongoTestUrl: process.env.MONGO_TEST_URL,
  NODE_ENV: process.env.NODE_ENV

}
