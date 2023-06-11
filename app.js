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
        return user.createCart();
      })
      .catch(err => console.log(err))
    }
    return user.getCart();
  })
  .then(() => {
    app.listen(3000);
  }) 
  .catch((err) => console.log(err));
