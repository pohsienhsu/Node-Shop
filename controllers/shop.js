const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");
const stripe = require("stripe")(process.env["STRIPE_SECRET_KEY"]);

const Product = require("../models/product");
const Order = require("../models/order");
const Pagination = require("../util/pagination");

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;

  return Pagination.productPagination(page, (products, pageData) => {
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      pageData: pageData,
    });
  }).catch((err) => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;

  return Pagination.productPagination(page, (products, pageData) => {
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
      pageData: pageData,
    });
  }).catch((err) => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail.ejs", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return {
          _id: i.productId._id,
          title: i.productId.title,
          imageUrl: i.productId.imageUrl,
          price: i.productId.price,
          description: i.productId.description,
          quantity: i.quantity,
        };
      });
      let totalPrice = 0;
      for (let product of products) {
        totalPrice = totalPrice + product.price * product.quantity;
      }
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        totalPrice: totalPrice,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const { id: prodId } = req.body;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      console.log("Cart Item Deleted");
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let totalPrice = 0;

  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items.map((i) => {
        return {
          _id: i.productId._id,
          title: i.productId.title,
          imageUrl: i.productId.imageUrl,
          price: i.productId.price,
          description: i.productId.description,
          quantity: i.quantity,
        };
      });
      for (let product of products) {
        totalPrice = (totalPrice + product.price * product.quantity).toFixed(2);
      }

      return stripe.checkout.sessions
        .create({
          payment_method_types: ["card"],
          line_items: products.map((p) => {
            return {
              price_data: {
                product_data: {
                  name: p.title,
                  description: p.description,
                },
                unit_amount: p.price * 100,
                currency: "usd",
              },
              quantity: p.quantity,
            };
          }),
          mode: 'payment',
          success_url:
            req.protocol + "://" + req.get("host") + "/checkout/success",
          cancel_url:
            req.protocol + "://" + req.get("host") + "/checkout/cancel",
        })
        .then((session) => {
          res.render("shop/checkout", {
            path: "/checkout",
            pageTitle: "Checkout",
            products: products,
            totalPrice: totalPrice,
            sessionId: session.id,
          });
        });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const order = new Order({
        user: { name: user.name, userId: user._id },
        products: user.cart.items.map((i) => {
          console.log(i.productId);
          return {
            product: { ...i.productId._doc },
            quantity: i.quantity,
          };
        }),
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const order = new Order({
        user: { name: user.name, userId: user._id },
        products: user.cart.items.map((i) => {
          console.log(i.productId);
          return {
            product: { ...i.productId._doc },
            quantity: i.quantity,
          };
        }),
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("unauthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.text("Invoice - " + order._id.toString());
      pdfDoc
        .text("==========================================================")
        .moveDown();
      pdfDoc
        .list(
          order.products.map(({ product, quantity }) => {
            return `${product.title} ($${product.price}) - x${quantity}`;
          })
        )
        .moveDown();
      pdfDoc
        .text("----------------------------------------------------------")
        .moveDown();
      pdfDoc.text(
        "Total Amount: $" +
          order.products.reduce((sum, item) => {
            return sum + +item.product.price * +item.quantity;
          }, 0).toFixed(2)
      );
      pdfDoc.end();

      const file = fs.createReadStream(invoicePath);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      file.pipe(res);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
