const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIdx = this.cart.items.findIndex((item) => {
    return item.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];
  if (cartProductIdx >= 0) {
    newQuantity = this.cart.items[cartProductIdx].quantity + 1;
    updatedCartItems[cartProductIdx].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;
  this.save();
};

userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart.items = [];
  return this.save();
}

module.exports = mongoose.model("User", userSchema);

// const { ObjectId } = require("mongodb");

// const getDb = require("../util/database").getDb;

// class User {
//   constructor(username, email, password, role, cart, id) {
//     this.username = username;
//     this.email = email;
//     this.password = password;
//     this.role = role;
//     this.cart = cart;
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     return db
//       .collection("users")
//       .insertOne(this)
//       .then((result) => console.log(result))
//       .catch((err) => console.log(result));
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db
//       .collection("users")
//       .find({ _id: new ObjectId(userId) })
//       .next()
//       .then((user) => {
//         console.log(user);
//         return user;
//       })
//       .catch((err) => console.log(err));
//   }

//   getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map((item) => item.productId);
//     return db
//       .collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then((products) => {
//         return products.map((p) => {
//           return {
//             ...p,
//             quantity: this.cart.items.find(
//               (i) => i.productId.toString() === p._id.toString()
//             ).quantity,
//           };
//         });
//       })
//       .catch((err) => console.log(err));
//   }

//   addToCart(product) {
//     const cartProductIdx = this.cart.items.findIndex((item) => {
//       return item.productId.toString() === product._id.toString();
//     });
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];

//     if (cartProductIdx >= 0) {
//       newQuantity = this.cart.items[cartProductIdx].quantity + 1;
//       updatedCartItems[cartProductIdx].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }
//     const updatedCart = { items: updatedCartItems };
//     const db = getDb();
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   removeFromCart(productId) {
//     const db = getDb();
//     let updatedCartItems = [...this.cart.items];
//     updatedCartItems = updatedCartItems.filter(
//       (item) => item.productId.toString() !== productId
//     );
//     const updatedCart = { items: updatedCartItems };
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then((products) => {
//         const order = {
//           items: products,
//           user: {
//             _id: new ObjectId(this._id),
//             username: this.username,
//             email: this.email,
//           },
//         };
//         return db.collection("orders").insertOne(order);
//       })
//       .then((result) => {
//         this.cart = { items: [] };
//         return db
//           .collection("users")
//           .updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       });
//   }

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection("orders")
//       .find({ "user._id": new ObjectId(this._id) })
//       .toArray();
//   }
// }
// module.exports = User;
