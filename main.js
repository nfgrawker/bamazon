var mysql = require("mysql");
var inquirer = require("inquirer");
const {table} = require('table')
//variable to be used later
var currentAmount = 0;
var currentPrice = 0;
var currentItem = "";
var currentCategory = "";
var password = false;
let amount = "";
let itemID = "";
let data, output;

// to set up a connection
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : "bamazon"
});

function initialConnection(){
    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        console.log('connected as id ' + connection.threadId);
    });
}

function inititalizeInquirer(){
    inquirer.prompt([{
        name : "mode",
        type : "list",
        message : "Which mode are you trying to use?",
        choices : ["User", "Manager", "Supervisor"]
    }]).then(answers => {
        if (answers.mode === "User"){
            user()
        }
        else if(answers.mode === "Manager"){
            manager()
        }
        else if (answers.mode === "Supervisor" ){
            supervisor()
        }
    });
}
function user(){
    inquirer.prompt([{
        name : "userMenu",
        type : "list",
        message : "What do you want to do?",
        choices : ["purchase on an item", "check price/stock of an item", "quit"]
    }]).then(answers=>{
        if (answers.userMenu === "purchase on an item"){
            bid()
        }
        else if (answers.userMenu === "check price/stock of an item"){
            check()
        }
        else if(answers.userMenu === "quit"){
            connection.end()
        }
    })
}

function bid(){
    inquirer.prompt([{
        name : "itemID",
        type : "input",
        message : "What is the ID of the item you would like to purchase?"
    },{
        name : "amount",
        type : "input",
        message: "How many would you like to purchase?"
    }]).then(answers=>{
        connection.query('SELECT * FROM products WHERE item_id  =  ' + answers.itemID , function (error, results, fields) {
          if(error) {
              console.log("there was an error, it was :" + error)
          }
          else {
              currentAmount = results[0].stock_quantity;
              currentPrice = results[0].price;
              currentItem = results[0].product_name;
              if (currentAmount < answers.amount) {
                  console.log("Sorry, we only have " + currentAmount + " of item " + currentItem)
              }
              else if (currentAmount >= answers.amount) {
                  console.log("Purchase successful. Your account has been charged $" + (Math.round((currentPrice * answers.amount) * 100) / 100) +" .");
                  console.log("Your order will be shipped shortly!");
                  console.log("-------------------");
                  connection.query("update products set stock_quantity = stock_quantity - "+answers.amount+" where item_id = "+answers.itemID, function(err, results,fields){
                    if (err) console.log(err);
                  })
                  connection.query("update products set product_sales = product_sales + " +answers.amount+" where item_id = "+answers.itemID, function(err, results, fields){
                    if (err) console.log(err);
                    console.log("yep")
                  })

              }
            user()
          }
        });

    })
}
function check(){
    inquirer.prompt([{
        name : "itemID",
        type : "input",
        message : "What is the ID of the item you would like to check?"
    }]).then(answers=>{
        connection.query('SELECT * FROM products WHERE item_id  =  ' + answers.itemID , function (error, results, fields) {
            if(error) {
                console.log("there was an error, it was :" + error)
            }
            else {
                currentAmount = results[0].stock_quantity;
                currentPrice = results[0].price;
                currentItem = results[0].product_name;
                currentCategory = results[0].department_name;
                console.log("Name : " + currentItem);
                console.log("Amount in Stock : " + currentAmount);
                console.log("Department : " + currentCategory);
                console.log("Price : $" + currentPrice);
                console.log("-------------------")
            }
                user()
            })
        });
}
function manager(){
    inquirer.prompt([{
        name : "password",
        type : "password",
        message : "input manager password please"
    }]).then(password=>{
        if (password.password === "manager1"){
            inquirer.prompt([{
                name : "userMenu",
                type : "list",
                message : "What do you want to do?",
                choices : ["view all products", "check all low stock","add to inventory","add new product", "quit"]
            }]).then(answers=>{
                if (answers.userMenu === "view all products"){
                    viewAll()
                }
                else if (answers.userMenu === "check all low stock"){
                    checkLow()
                }
                else if (answers.userMenu === "add to inventory"){
                    addToInventory()
                }
                else if (answers.userMenu === "add new product"){
                    addNewProduct()
                }
                else if(answers.userMenu === "quit"){
                    connection.end()
                }
            })
        }
        else{
            console.log("Invalid password")
            connection.end()
        }
    })
}
function viewAll(){
    connection.query("select * from products",function(err, results, fields){
        if (err) console.log(error);
        else {
            for (let row in results){
                console.log("Name : " + results[row].product_name);
                console.log("Item Id : " + results[row].item_id )
                console.log("Amount in Stock : " + results[row].stock_quantity);
                console.log("Department : " + results[row].department_name);
                console.log("Price : $" + results[row].price);
                console.log("-------------------")
            }
        }
        manager()
    })
}
function checkLow(){
  connection.query("select * from products",function(err, results, fields){
      if (err) console.log(error);
      else {
          for (let row in results){
            if (results[row].stock_quantity < 100){
              console.log("Low stock alert!!!");
              console.log("Item ID : " + results[row].item_id)
              console.log("Product name : "+ results[row].product_name);
              console.log("Stock remaining : "+ results[row].stock_quantity);
              console.log("--------------------")
            }
          }
      }
      manager()
  })

}

function addToInventory(){
  inquirer.prompt([{
        name : "itemID",
        type : "input",
        message : "What is the id of the product you want to add?"
    },{
        name : "amount",
        type : "input",
        message : "How many are you adding to inventory?"
    }]).then(answers=>{
        amount = parseInt(answers.amount);
        itemID = answers.itemID;
        connection.query("update products set stock_quantity = stock_quantity + "+amount+ " where item_id = "+itemID+";", function(err, results, fields){
        if (err) console.log(err);
        manager()
    })
  });
}

function addNewProduct(){
  inquirer.prompt([{
      name : "name",
      type : "input",
      message : "What is the name of the product you want to add?"
    },{
      name : "price",
      type : "input",
      message : "What is the price of the item?"
    },{
      name : "department",
      type : "input",
      message : "What department will this product be under?"
    },{
      name : "amount",
      type : "input",
      message : "How many are you adding to inventory?"
  }]).then(answers=>{
      connection.query("insert into products (product_name, department_name, price, stock_quantity) values ('"+answers.name+"','"+answers.department+"',"+answers.price+","+answers.amount+");",function(err,results,fields){
        if(err) console.log(err);
      })
      manager()
    })
}

function supervisor(){
    inquirer.prompt([{
        name : "password",
        type : "password",
        message : "input supervisor1 password please"
    }]).then(password=>{
        if (password.password === "supervisor1"){
            inquirer.prompt([{
                name : "userMenu",
                type : "list",
                message : "What do you want to do?",
                choices : ["Add a department", "Create profit/loss table","add to inventory","quit"]
            }]).then(answers=>{
                if (answers.userMenu === "Add a department"){
                    addDepartment()
                }
                else if (answers.userMenu === "Create profit/loss table"){
                    createTable()
                }
                else if(answers.userMenu === "quit"){
                    connection.end()
                }
            })
        }
        else{
            console.log("Invalid password")
            connection.end()
        }
    })
}

function addDepartment(){
  inquirer.prompt([{
    name : "department",
    type : "input",
    message : "What is the name of the department?"
  },{
    name : "overhead",
    type : "input",
    message : "How much is the overhead for the department?"

  }]).then(answers =>{
    connection.query("insert into departments (department_name, overhead_costs) values ('"+answers.department+"', "+answers.overhead+" );", function(err, results, fields){
      if (err) console.log(err);
      supervisor()
    })
  })
}

function createTable(){
  connection.query("select departments.department_name, departments.overhead_costs, products.product_sales from bamazon.departments inner join products on  departments.department_name=products.department_name;",function(err, results, fields){
    if(err) console.log(err);
    console.log(results[0])

  })
}
initialConnection();
inititalizeInquirer();
