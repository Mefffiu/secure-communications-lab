const fs = require('fs');
const https = require('https');
const express = require('express');

const opts = {
  key: fs.readFileSync('server_key.pem'),
  cert: fs.readFileSync('server_cert.pem'),
  requestCert: true,
  rejectUnauthorized: false,
  ca: [ fs.readFileSync('server_cert.pem') ]
};

const app = express();

app.get('/', (req, res) => {
  res.send(`<a href="authenticate">Log in using certificate</a>`);
});

app.get('/authenticate', (req, res) => {
  const cert = req.connection.getPeerCertificate();
  if (req.client.authorized) {
    res.status(200)
      .send(`<div>
              <a>Authentication successful, your certificate:</a>
              <a>Common Name: ${cert.subject.CN}</a>
              <a>issued by ${cert.issuer.CN}</a>
            </div>`);
  }

  if (cert.subject) {
    res.status(403)
      .send(`<div>
              <a>Authentication failed, your certificate:</a>
              <a>Common Name: ${cert.subject.CN}</a>
              <a>issued by ${cert.issuer.CN}</a>
          </div>`);
  }
  
  res.status(401)
    .send(`<div>Authentication failed, no certificate found.</div>`);
});

const port = 9443;
https.createServer(opts, app).listen(port)
  .then(console.log(`Server listening on port: ${port}`))
  .catch(err => {
    console.log(err);
  });