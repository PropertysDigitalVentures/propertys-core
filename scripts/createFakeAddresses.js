var ethers = require("ethers");
var crypto = require("crypto");
var fs = require("fs");

let output = [];
for (let i = 0; i < 2000; i++) {
  var id = crypto.randomBytes(32).toString("hex");
  var privateKey = "0x" + id;

  var wallet = new ethers.Wallet(privateKey);
  output.push(wallet.address);
}

fs.writeFileSync("./data/fakeAddresses.json", JSON.stringify(output, null, 2), {
  flag: "w+",
});
