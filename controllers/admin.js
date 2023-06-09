const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  const product = new Product(null, title, imageUrl, price, description);
  Product.create({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
  })
    .then((result) => {
      console.log("Added a product...");
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(([rows]) => {
      res.render("admin/products", {
        prods: rows,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit === "true";
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId).then(([rows]) => {
    const product = rows[0];
    res.render("admin/edit-product", {
      pageTitle: `Edit ${product.title}`,
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const { id, title, imageUrl, price, description } = req.body;
  const updatedProduct = new Product(id, title, imageUrl, price, description);
  updatedProduct
    .save()
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const { id } = req.body;
  Product.deleteById(id)
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
