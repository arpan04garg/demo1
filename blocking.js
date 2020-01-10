/*var fs = require("fs");
var data= fs.readFileSync("text.txt")
console.log(data.toString());
console.log("END HERE");
const crypto = require('crypto');
const uniqueVal = new Date().getTime() + (Math.floor(Math.pow(10, 12 - 1) + Math.random() * (Math.pow(10, 12) - Math.pow(10, 12 - 1) - 1))).toString();
console.log(uniqueVal)
let id = crypto.createHash('sha256').update(uniqueVal).digest("hex");
    id = crypto.createHash('sha256').update(id).digest("hex");
    console.log("abc---->",id);*/

    var momsPromise = new Promise(function(resolve, reject) {
        momsSavings = 20000;
        priceOfPhone = 60000;
        if (momsSavings > priceOfPhone) {
          resolve({
            brand: "iphone",
            model: "6s"
          });
        } else {
          reject("We do not have enough savings. Let us save some more money.");
        }
      });momsPromise.then(function(value) {
        console.log("Hurray I got this phone as a gift ", JSON.stringify(value));
      });momsPromise.catch(function(reason) {
        console.log("Mom coudn't buy me the phone because ", reason);
      });momsPromise.finally(function() {
        console.log(
          "Irrespecitve of whether my mom can buy me a phone or not, I still love her"
        );
      });

//The output for this will be.
//Mom coudn't buy me the phone because We do not have enough savings. Let us save some more money.
//Irrespecitve of whether my mom can buy me a phone or not, I still love her
//moms failed promise.

//If we change the value of momsSavings to 200000 then mom will be able to gift the son.
// In such case the output will be

//Hurray I got this phone as a gift {brand: "iphone", model: "6s"}
//Irrespecitve of whether my mom can buy me a phone or not, I still love her