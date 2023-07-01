const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const User = require("../models/user");

const transporter = nodemailer.createTransport({
  host: process.env["MAILTRAP_HOST"],
  port: process.env["MAILTRAP_PORT"],
  auth: {
    user: process.env["MAILTRAP_USER"],
    pass: process.env["MAILTRAP_PASSWORD"],
  },
});

exports.getLogin = (req, res, next) => {
  let errorMessage = req.flash("error");
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }
  if (req.session.isLoggedIn) {
    return res.redirect("/");
  } else {
    return res.render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: errorMessage,
    });
  }
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        return bcrypt
          .compare(password, user.password)
          .then((validate) => {
            if (validate) {
              req.session.user = user;
              req.session.isLoggedIn = true;
              return req.session.save((err) => {
                console.log(err);
                res.redirect("/");
              });
            } else {
              req.flash("error", "Invalid email or password.");
              return res.redirect("/login");
            }
          })
          .catch((err) => console.log(err));
      } else {
        req.flash("error", "Invalid email or password.");
        res.redirect("/login");
      }
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let errorMessage = req.flash("error");
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }
  return res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    errorMessage: errorMessage,
  });
};

exports.postSignup = (req, res, next) => {
  const { email, name, password, confirmPassword } = req.body;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "This email has already been registered.");
        return res.redirect("/signup");
      } else {
        return bcrypt
          .hash(password, 12)
          .then((hash) => {
            const user = new User({
              email: email,
              name: name,
              password: hash,
              cart: { items: [] },
            });
            return user.save();
          })
          .then((result) => {
            res.redirect("/login");
            return transporter.sendMail(
              {
                to: email,
                from: "nodeshop@email.com",
                subject: "NodeShop signup succeeded!",
                html: "<h1>You successfully signed up!</h1>",
              },
              (err, info) => {
                if (err) {
                  return console.log(err);
                }
                console.log("Message send: %s", info.messageId);
              }
            );
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => console.log(err));
};

exports.getReset = (req, res, next) => {
  let errorMessage = req.flash("error");
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }
  return res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    errorMessage: errorMessage
  })
}
