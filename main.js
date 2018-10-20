var mysql = require("mysql");
var inquirer = require("inquirer");

//variable to be used later
var currentAmount = 0;
var currentPrice = 0;
var currentItem = "";
var currentCategory = "";


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
                  connection.query("update products set stock_quantity ="+(currentAmount - answers.amount)+" where item_id = 1")
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






initialConnection()
inititalizeInquirer()
