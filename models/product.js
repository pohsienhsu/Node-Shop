const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

module.exports = mongoose.model('Product', productSchema);


// const getDb = require("../util/database").getDb;
// const { ObjectId } = require("mongodb");

// class Product {
//   constructor(title, imageUrl, price, description, id, userId) {
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.price = price;
//     this.description = description;
//     this._id = id ? new ObjectId(id): null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     console.log(this);
//     if (this._id) {
//       dbOp = db
//         .collection("products")
//         .updateOne({ _id: new ObjectId(this._id) }, { $set: this });
//     } else {
//       this._id = new ObjectId();
//       dbOp = db.collection("products").insertOne(this);
//     }
//     return dbOp
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((err) => console.log(err));
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         return products;
//       })
//       .catch((err) => console.log(err));
//   }

//   static findById(id) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find({ _id: new ObjectId(id) })
//       .next()
//       .then((product) => {
//         console.log(product);
//         return product;
//       })
//       .catch((err) => console.log(err));
//   }

//   static deleteById(id) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .deleteOne({ _id: new ObjectId(id) })
//       .then((result) => console.log(result))
//       .catch((err) => console.log(err));
//   }
// }

// module.exports = Product;
