const { cleanEnv, str } = require('envalid')

exports.env = cleanEnv(process.env, {
  QUEUE_URL: str()
})
