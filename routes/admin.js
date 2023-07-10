const path = require("path");

const express = require("express");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const isValid = require("../middleware/is-valid");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post(
  "/add-product",
  isAuth,
  isValid.addProductValidation,
  adminController.postAddProduct
);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/edit-product/:productId => GET
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post(
  "/edit-product",
  isAuth,
  isValid.editProductValidation,
  adminController.postEditProduct
);

// /admin/delete-product => POST
router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
