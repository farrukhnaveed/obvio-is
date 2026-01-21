var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
  res.send({ title: 'Obvio Assignment' });
});

router.use('/api', require('./api'));

module.exports = router;
