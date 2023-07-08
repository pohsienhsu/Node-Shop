const Product = require("../models/product");

const PRODUCTS_PER_PAGE = 2;

exports.productPagination = (page, cb, filter = {}) => {
  let totalItems;

  return Product.find(filter)
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * PRODUCTS_PER_PAGE)
        .limit(PRODUCTS_PER_PAGE);
    })
    .then((products) => {
      const pageData = {
        totalProducts: totalItems,
        hasNext: PRODUCTS_PER_PAGE * page < totalItems,
        hasPrevious: page > 1,
        curr: page,
        last: Math.ceil(totalItems / PRODUCTS_PER_PAGE),
      };
      cb(products, pageData);
    });
};
