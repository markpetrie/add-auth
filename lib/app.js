const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('./error-handler')();
const createAuth = require('./auth/ensure-auth');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static('./public'));
const ensureAuth = createAuth();

const auth = require('./routes/auth');
const actors = require('./routes/actors');
const films = require('./routes/films');
const studios = require('./routes/studios');
const reviewers = require('./routes/reviewers');
const reviews = require('./routes/reviews');


app.use('/auth', auth);
app.use('/actors', actors);
app.use('/films', films);
app.use('/studios', studios);
app.use('/reviewers', reviewers);
app.use('/reviews', ensureAuth, reviews);

app.use(errorHandler);

module.exports = app;