const fs = require('fs');
const path = require('path');

const rootDir = require("../util/path");
const filePath = path.join(rootDir, "data", "cart.json");

module.exports = class Cart {
  constructor() {
    this.products = [];
    this.totalPrice = 0;
  }

  static addProduct(id, price) {
    // Fetch the previous cart
    fs.readFile(filePath, (err, fileContent) => {
      let cart = {products: [], totalPrice: 0};
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      // Analyze the cart => Find existing product
      const existingProductIdx = cart.products.findIndex(p => p.id === id);
      const existingProduct = existingProductIdx !== -1 ? cart.products[existingProductIdx] : null;
      let updatedProduct;
      // Add new product or increase quantity
      if (existingProduct) {
        updatedProduct = {...existingProduct};
        updatedProduct.quantity = existingProduct.quantity + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIdx] = updatedProduct;
      } else {
        updatedProduct = {id: id, quantity: 1}
        cart.products = [...cart.products, updatedProduct]
      }
      cart.totalPrice = cart.totalPrice + +price;
      fs.writeFile(filePath, JSON.stringify(cart), (err) => {
        console.log(err);
      })
    })
  }
}