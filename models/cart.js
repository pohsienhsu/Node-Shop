const fs = require("fs");
const path = require("path");

const rootDir = require("../util/path");
const filePath = path.join(rootDir, "data", "cart.json");

module.exports = class Cart {
  constructor() {
    this.products = [];
    this.totalPrice = 0.00;
  }

  static getCart(cb) {
    fs.readFile(filePath, (err, fileContent) => {
      if (err) {
        console.log(err);
        cb(null);
      } else {
        const cart = JSON.parse(fileContent);
        cb(cart)
      }
    })
  } 

  static addProduct(id, price) {
    // Fetch the previous cart
    fs.readFile(filePath, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      // Analyze the cart => Find existing product
      const existingProductIdx = cart.products.findIndex((p) => p.id === id);
      const existingProduct =
        existingProductIdx !== -1 ? cart.products[existingProductIdx] : null;
      let updatedProduct;
      // Add new product or increase quantity
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.quantity = existingProduct.quantity + 1;
        updatedProduct.price = price
        cart.products = [...cart.products];
        cart.products[existingProductIdx] = updatedProduct;
      } else {
        updatedProduct = { id: id, quantity: 1, price: price };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + +price;
      fs.writeFile(filePath, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }

  static editProduct(id, updatedPrice) {
    fs.readFile(filePath, (err, fileContent) => {
      if (err) {
        return;
      }
      const cart = JSON.parse(fileContent);
      const updatedCart = {...cart}
      // Check if product exist
      const productIdx = updatedCart.products.findIndex(p => p.id === id);
      if (productIdx === -1) {
        return;
      } else {
        const { quantity, price } = updatedCart.products[productIdx]
        updatedCart.totalPrice = updatedCart.totalPrice - (quantity * price) + (quantity * updatedPrice);
        updatedCart.products[productIdx].price = updatedPrice;
      }
      // Write with updated cart
      fs.writeFile(filePath, JSON.stringify(updatedCart), (err) => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id, price, cb) {
    fs.readFile(filePath, (err, fileContent) => {
      if (err) {
        return;
      }
      const cart = JSON.parse(fileContent);
      const updatedCart = {...cart}
      // Find the product
      const product = updatedCart.products.find(p => p.id === id);
      if (!product) {
        console.log("Product not in cart");
        return;
      }
      const quantity = product.quantity;
      // Remove product
      updatedCart.products = updatedCart.products.filter(p => p.id !== id);
      // Subtract by price
      updatedCart.totalPrice = updatedCart.totalPrice - (price * quantity);
      // Write with updated cart
      fs.writeFile(filePath, JSON.stringify(updatedCart), err => {
        console.log(err);
      })
      cb();
    });
  }
};
