const db = require("../util/database");

module.exports = class Cart {
  constructor() {
    this.products = [];
    this.totalPrice = 0.0;
  }

  static getCart() {
    return db.execute(
      "SELECT products.id, products.title, products.price, cart.quantity FROM products " +
        "INNER JOIN " +
        "(SELECT product_id, COUNT(cart_items.id) AS quantity FROM cart_items GROUP BY cart_items.product_id) AS cart " +
        "ON cart.product_id = products.id;"
    );
  }

  static addProduct(id) {
    return db.execute("INSERT INTO cart_items (product_id) VALUES (?);", [id]);
  }

  static deleteProduct(id) {
    return db.execute('DELETE FROM cart_items WHERE product_id=?', [id]);
  }
};
