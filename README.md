# POC: Status Page Login and Permission Model

This project contains two simple services:
1. The "status page API" itself
2. A component that distributes tokens via mail

## Basic workflow
1. A users sends his mail address to the status-page-api (which is globally available)
2. The status-page-api generates a new token
3. The status-page-api sends this token and the mail address to "every" configured auth-webhook (in this case the token-mail-distributor)
4. The token-mail-distributor send this token via mail to the user
5. The user receives the mail and adds the token to the http header of his requests to the status-page-api
6. The status-page-api is able to validate the token and connect with the related user information (e.g. the mail address)

## Demo

Requirements: Install docker and docker-compose.

Export your smtp settings:
```bash
export SMTP_HOST="<your smtp host>"
export SMTP_PORT=<your smtp port>
export SMTP_SECURE="<false | true>"
export SMTP_USER="<your smtp user>"
export MAIL_SENDER="<your mail sender>"
export SMTP_PASSWORD="<your smtp user>"
```

Run the setup:
```bash
docker-compose up --build
```

Check if the service is up:
```bash
curl http://127.0.0.1:3000/
```

Check your login state (without being logged in):
```bash
curl http://127.0.0.1:3000/myself | jq
```

Check the list of components (without being logged in):
```bash
curl http://127.0.0.1:3000/components/status/ | jq
```

Request a token:
```bash
curl -X POST http://127.0.0.1:3000/token/  -H "Content-Type: application/json"  -d '{ "mail": "your@mail.tld" }'
```

Your should have received a mail with the token. Export the token as a environment variable:
```bash
export ACCESS_TOKEN=...
```

Check your login state (being logged in):

```bash
curl http://127.0.0.1:3000/myself -H "Authorization: $ACCESS_TOKEN" | jq
```

```bash
curl http://127.0.0.1:3000/components/status/ -H "Authorization: $ACCESS_TOKEN" | jq
```

## Development

### Setup

Install nodejs (v16.17.1).

Terminal 1:
```bash
cd status-page-api

export AUTH_WEBHOOK_MAIL=http://127.0.0.1:3001
npm i
nodemon main.js
```

Terminal 2:
```bash
cd token-mail-distributor
export SMTP_HOST="<your smtp host>"
export SMTP_PORT=<your smtp port>
export SMTP_SECURE="<false | true>"
export SMTP_USER="<your smtp user>"
export MAIL_SENDER="<your mail sender>"
export SMTP_PASSWORD="<your smtp user>"
npm i
nodemon main.js
```

### Lint the code
```bash
cd status-page-api
./node_modules/eslint/bin/eslint.js ./*js

or

cd token-sender-mail
./node_modules/eslint/bin/eslint.js ./*js
```
