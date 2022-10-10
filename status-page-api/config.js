// Default config that reads values from environment variables

var authWebhookKeys = Object.keys(process.env).filter(
  key => key.startsWith('AUTH_WEBHOOK_')
)
var authWebhooks = authWebhookKeys.map(key => process.env[key])

var config = {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3000,
  authWebhooks: authWebhooks
}

export default config
