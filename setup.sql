DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
use bamazon
CREATE TABLE products(
  item_id int(11) AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(255),
  department_name VARCHAR(255),
  price DECIMAL(8,2),
  stock_quantity int(11),
  primary key (item_id)
);
SELECT * From products;
insert into products (product_name, department_name, price, stock_quantity) VALUES
("Nike Air 1","Clothing", 80.21,142),("HDD disk drives","Computer", 75.89, 589),("24inch Monitor","Computer",240.99,52),
("Haynes Underwear","Clothing",10.99,100),("Scotch Guard","Home Goods", 12.49,85),("Water Filter","Home Goods", 22.50, 75),
("Oranges", "Grocery", 8.99,560),("Apples","Grocery",5.99,320),("Steak","Grocery",22.39,300),("Clam Chowder","Grocery",3.99,432);
