// Default config that reads values from environment variables

export default {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3001,
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: ['yes', 'true', '1'].includes(process.env.SMTP_SECURE || 'true'),
    auth: {
        user:  process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    ignoreTLS: false,
    debug: false
  },
  mail: {
    sender: process.env.MAIL_SENDER,
  }
}
