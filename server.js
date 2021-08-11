const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); 
var fs = require('fs')
var https = require('https')
const app = express();
var cors = require('cors')
const rateLimit = require("express-rate-limit");

https.globalAgent.maxSockets = 100;


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
 
app.options('/', cors()) // enable pre-flight request for DELETE request


//  apply to all requests
app.use(limiter);

app.use(function(req, res, next) {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(path.join(__dirname, 'public'))); 

https.createServer({
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('cert.pem')
}, app)
.listen(process.env.PORT || 8080, function () {
  console.log('Example app listening on port 8080!')
})
