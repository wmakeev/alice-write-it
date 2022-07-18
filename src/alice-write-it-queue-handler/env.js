const { cleanEnv, str } = require('envalid')

exports.env = cleanEnv(process.env, {
  SCRIPT_URL: str()
})
