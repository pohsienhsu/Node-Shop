const fs = require("fs");
const path = require("path");

const rootDir = require("../util/path");
const filePath = path.join(rootDir, "data", "products.json");

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    
    fs.readFile(filePath, (err, fileContent) => {
      let products = [];
      if (!err) {
        products = JSON.parse(fileContent);
      }
      products.push(this)
      fs.writeFile(filePath, JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }

  static fetchAll(cb) {
    fs.readFile(filePath, (err, fileContent) => {
      if (err || !fileContent) {
        cb([]);
      }
      cb(JSON.parse(fileContent));
    })
  }
};
