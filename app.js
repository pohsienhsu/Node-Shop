const path = require("path");
require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
// const csrf = require("csurf");
const {csrfSync} = require('csrf-sync');
const flash = require('connect-flash');

const errorController = require("./controllers/error");
// const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");

const MONGODB_URI = `mongodb+srv://${process.env["MONGO_USER"]}:${process.env["MONGO_PASSWORD"]}@${process.env["MONGO_CLUSTER"]}/${process.env["MONGO_DATABASE"]}`;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const { csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => {
    return req.body["CSRFToken"];
  }, // Used to retrieve the token submitted by the user in a form
});

app.use(flash());

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfSynchronisedProtection);

app.use((req, res, next) => {
  if (req.session.user) {
    User.findById(req.session.user._id)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => console.log(err));
  } else {
    next();
  }
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn ? true : false;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
