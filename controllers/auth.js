

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login"
  })
}

exports.postLogin = (req, res, nex) => {
  console.log(req.body.username);
  console.log(req.body.password);
  res.redirect("/");
}