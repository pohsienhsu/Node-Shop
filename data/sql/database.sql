/*
This section is to create the database <user> as well as the <password> for the user.
Then, grant root priviledges to the created database user. If you already have a SQL user setup with
all the permissions, you can ignore this section.
Todos:
1. Replace <user> & <password> with the username and user password of your choice
*/
DROP USER IF EXISTS '<user>'@'localhost';
CREATE USER '<user>'@'localhost' IDENTIFIED BY '<password>';
GRANT CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, SELECT, REFERENCES, RELOAD on *.* TO '<user>'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;

/*
This section is to create all the tables required for the database, including
products, cart_items.
Todos:
1. Replace the database name <database>. This should be the name of the database you're planning to store the data.
*/
DROP TABLE IF EXISTS `products`;
CREATE TABLE `<database>`.`products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `imageUrl` VARCHAR(255) NOT NULL,
  `price` DOUBLE NOT NULL,
  `description` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);

DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `<database>`.`cart_item` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `id_idx` (`product_id` ASC) VISIBLE,
  CONSTRAINT `id`
    FOREIGN KEY (`product_id`)
    REFERENCES `node_shop`.`products` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

/*
This section is to make sure that deleting an object in products table would also delete the associated cart items
in the cart_items table
Todos:
1. Replace <user> with the username
*/
CREATE DEFINER=`<user>`@`localhost` TRIGGER `products_AFTER_DELETE` AFTER DELETE ON `products` FOR EACH ROW BEGIN
	DELETE FROM cart_items WHERE old.id = cart_items.product_id;
END



