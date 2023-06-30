const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.redirect("/");
  } else {
    return res.render("auth/login", {
      pageTitle: "Login",
      path: "/login",
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
              return res.redirect("/login");
            }
          })
          .catch((err) => console.log(err));
      } else {
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
  return res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
  });
};

exports.postSignup = (req, res, next) => {
  const { email, name, password, confirmPassword } = req.body;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
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
            return res.redirect("/login");
          });
      }
    })
    .catch((err) => console.log(err));
};
