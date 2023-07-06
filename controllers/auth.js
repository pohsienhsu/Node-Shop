const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

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
      prevInput: {
        email: "",
      },
      validationErrors: []
    });
  }
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array().map((err) => err.msg)[0],
      prevInput: {
        email: email === '@' ? '' : email,
      },
      validationErrors: errors.array(),
    });
  }

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
              return res.status(422).render("auth/login", {
                path: "/login",
                pageTitle: "Login",
                errorMessage: "Invalid email or password",
                prevInput: {
                  email: email === "@" ? "" : email,
                },
                validationErrors: [],
              });
            }
          })
          .catch((err) => console.log(err));
      } else {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "Invalid email or password",
          prevInput: {
            email: email === "@" ? "" : email,
          },
          validationErrors: [],
        });
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
    prevInput: { email: "" },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const { email, name, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array().map((err) => err.msg)[0],
      prevInput: { email: email === "@" ? "" : email },
      validationErrors: errors.array(),
    });
  }
  bcrypt
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
    errorMessage: errorMessage,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        return transporter.sendMail(
          {
            to: req.body.email,
            from: "nodeshop@email.com",
            subject: "NodeShop password reset!",
            html: `
              <p>You requested a password reset</p>
              <p>Click this <a href="http://localhost:3000/new-password/${token}">link</a> to set a new password. </p>
            `,
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
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  }).then((user) => {
    if (!user) {
      req.flash("error", "Reset token has expired!");
      return res.redirect(`/reset`);
    }
    let errorMessage = req.flash("error");
    if (errorMessage.length > 0) {
      errorMessage = errorMessage[0];
    } else {
      errorMessage = null;
    }
    return res.render("auth/new-password", {
      pageTitle: "Update Password",
      path: "/new-password",
      errorMessage: errorMessage,
      userId: user._id.toString(),
      resetToken: token,
    });
  });
};

exports.postNewPassword = (req, res, next) => {
  const { oldPassword, newPassword, userId, resetToken } = req.body;
  User.findOne({
    _id: userId,
    resetToken: resetToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "User doesn't exist or the token is expired.");
        return res.redirect("/reset");
      }
      return bcrypt
        .hash(newPassword, 12)
        .then((hash) => {
          user.password = hash;
          user.resetToken = undefined;
          user.resetTokenExpiration = undefined;
          return user.save();
        })
        .then((result) => {
          console.log("Password Updated!");
          return res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};
