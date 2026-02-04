var createError = require('http-errors');
var express = require('express');
const cors = require('cors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { initDb } = require('./db/tables');
const Response = require('./helper/Response');
initDb();

var app = express();
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', require('./routes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  new Response(res).setStatus(false).setStatusCode(err.status || 500).setMessage('Error occurred').setError(err.message).send();
});

module.exports = app;
