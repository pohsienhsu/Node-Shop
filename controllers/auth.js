const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.redirect("/");
  } else {
    return res.render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      isAuthenticated: false
    })
  }
}

exports.postLogin = (req, res, next) => {
  const {email} = req.body;
  User.find({email: email})
    .then(user => {
      console.log(user);
      req.session.user = user[0];
      req.session.isLoggedIn = true;
      req.session.save((err) => {
        console.log(err);
        res.redirect('/');
      });
    })
    .catch(err => console.log(err));
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
}