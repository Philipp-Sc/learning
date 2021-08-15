const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); 
var fs = require('fs')
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

app.listen(8080, () => {
  console.log(`App listening at http://localhost:8080`)
})
