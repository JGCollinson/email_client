'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// [START setup]
// The following environment variables are set by app.yaml (app.flexible.yaml or
// app.standard.yaml) when running on Google App Engine,
// but will need to be manually set when running locally.
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_SENDER = process.env.SENDGRID_SENDER;
const Sendgrid = require('sendgrid')(SENDGRID_API_KEY);
// [END setup]

const app = express();

// Setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// [START index]
app.get('/', (req, res) => {
  res.render('index');
});
// [END index]

// [START hello]
app.post('/hello', (req, res, next) => {
  const sgReq = Sendgrid.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      personalizations: [{
        to: [{ email: req.body.email }],
        subject: 'Hello World!'
      }],
      from: { email: SENDGRID_SENDER },
      content: [{
        type: 'text/plain',
        value: 'Sendgrid on Google App Engine with Node.js.'
      }]
    }
  });

  Sendgrid.API(sgReq, (err) => {
    if (err) {
      next(err);
      return;
    }
    // Render the index route on success
    res.render('index', {
      sent: true
    });
  });
});
// [END hello]

if (module === require.main) {
  // [START server]
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
  // [END server]
}

module.exports = app;
// [END app]