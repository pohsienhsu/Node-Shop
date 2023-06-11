const path = require("path");
require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const Product = require("./models/product");
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const User = require("./models/user");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

// Define Sequeulize associations
User.hasMany(Product);
Product.belongsTo(User, {
  constraint: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasOne(Cart);
Cart.belongsTo(User, {constraint: true, onDelete: "CASCADE"});

Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});

User.hasMany(Order);
Order.belongsTo(User, {constraint: true, onDelete: "CASCADE"});

Order.belongsToMany(Product, {through: OrderItem});
Product.belongsToMany(Order, {through: OrderItem});


const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

sequelize
  .sync()
  .then(() => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({name: "Admin", email: "admin@gmail.com"})
      .then((user) => {
        return user.createCart()
        .then(cart => {
          const products = [
            {
              title: "Fuji Camera",
              imageUrl:
                "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600",
              price: 99.99,
              description: "The latest camera technology!",
            },
            {
              title: "Scented Candle",
              imageUrl:
                "https://images.pexels.com/photos/3270223/pexels-photo-3270223.jpeg?auto=compress&cs=tinysrgb&w=600",
              price: 15.99,
              description: "A scent of the pine forest.",
            },
          ];
          return user.createProduct(products[0]);
        })
        .then(() => {
          console.log("Create new admin user!")
        })
        .catch(err => console.log(err));
      })
      .catch(err => console.log(err))
    }
    return user.getCart();
  })
  .then(() => {
    app.listen(3000);
  }) 
  .catch((err) => console.log(err));
