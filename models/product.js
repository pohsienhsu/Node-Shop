const fs = require("fs");
const path = require("path");

const Cart = require('./cart');

const getShopProductsFromFile = (cb) => {
  fs.readFile(filePath, (err, fileContent) => {
    if (err || !fileContent) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

const rootDir = require("../util/path");
const filePath = path.join(rootDir, "data", "products.json");

module.exports = class Product {
  constructor(id, title, imageUrl, price, description) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  save() {
    if (this.id) {
      getShopProductsFromFile((products) => {
        const existingProductIndex = products.findIndex(
          (p) => p.id === this.id
        );
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        Cart.editProduct(this.id, this.price);
        fs.writeFile(filePath, JSON.stringify(updatedProducts), (err) => {
          console.log(err);
        });
      });
    } else {
      this.id = Math.random().toString();
      getShopProductsFromFile((products) => {
        products.push(this);
        fs.writeFile(filePath, JSON.stringify(products), (err) => {
          console.log(err);
        });
      });
    }
  }

  static deleteById(id) {
    getShopProductsFromFile((products) => {
      const existingProductIndex = products.findIndex((p) => p.id === id);
      const price = products[existingProductIndex].price;
      if (existingProductIndex === -1) {
        console.log("Delete Failed. This product doesn't exist: " + id);
        return;
      }
      const updatedProducts = products.filter((p) => p.id !== id);
      fs.writeFile(filePath, JSON.stringify(updatedProducts), (err) => {
        if (!err) {
          Cart.deleteProduct(id, price);
        }
      });
    });
  }

  static fetchAll(cb) {
    getShopProductsFromFile(cb);
  }

  static findById(id, cb) {
    getShopProductsFromFile((products) => {
      const product = products.find((p) => p.id === id);
      cb(product);
    });
  }
};
