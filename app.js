const express = require('express'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      session = require('express-session'),
      mongoose = require('mongoose'),
      MongoStore = require('connect-mongo')(session),
      passport = require('passport');

// init app
const app = express();
// define port
const port = process.env.PORT || 3000;
// db
const {MONGO_URL} = require('./libs/db-connection');
// confs
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('_method'));

app.use(session({
  secret: 'abc123',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    url: MONGO_URL,
    autoReconnect: true
  })
}));
// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// local vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.errors = [];
  next();
})

app.set('view engine', 'ejs');

const ideasRoute = require('./routes/ideas');
const usersRoute = require('./routes/users');

// routes
app.use('/ideas', ideasRoute);
app.use('/users', usersRoute);

// passport config
require('./config/passport')(passport);

// main routes process
const indexRoutes = require('./routes/')(app);

app.listen(port, err => {
  console.log(err ? `Error on port ${port}` : `App running on port ${port}`);
});
