var ethers = require("ethers");
var crypto = require("crypto");
var fs = require("fs");

let output = [];
var id = crypto.randomBytes(32).toString("hex");
var privateKey = "0x" + id;
console.log("🚀 | privateKey", privateKey);

var wallet = new ethers.Wallet(privateKey);
console.log("🚀 | wallet", wallet.address);
