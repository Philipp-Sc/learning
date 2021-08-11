const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); 
var fs = require('fs')
var https = require('https')
const app = express();
var cors = require('cors')
 
app.options('/', cors()) // enable pre-flight request for DELETE request

app.use(function(req, res, next) {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(path.join(__dirname, 'public'))); 

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app)
.listen(process.env.PORT || 8080, function () {
  console.log('Example app listening on port 8080!')
})