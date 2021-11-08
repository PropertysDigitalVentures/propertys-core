const data = require("../data/postalCodes.json");
const fs = require("fs");
const { ethers, getNamedAccounts, deployments } = require("hardhat");

async function main() {
  await deployments.fixture(["PropertyNFT"]);
  [owner, treasury, alice, bob] = await ethers.getSigners();
  let propertyNFT = await ethers.getContract("PropertyNFT", owner);

  longToByteArray = function (x) {
    return [x, x << 8, x << 16, x << 24].map((z) => z >>> 24);
  };

  let out = ["tokenId,postalCode,CityId,DistrictId,StreetId,HouseId"];

  for (x of data) {
    tokenId = x;
    postalCode = await propertyNFT.getPostalCode(x);
    console.log("🚀 | main | postalCode", postalCode);
    parsed = longToByteArray(x);
    cityId = parsed[0];
    districtId = parsed[1];
    streetId = parsed[2];
    houseId = parsed[3];
    temp =
      tokenId.toString() +
      "," +
      postalCode.toString() +
      "," +
      cityId.toString() +
      "," +
      districtId.toString() +
      "," +
      streetId.toString() +
      "," +
      houseId.toString();

    out.push(temp);
  }

  fs.writeFileSync("./data/masterList.csv", JSON.stringify(out, null, 2), {
    flag: "w+",
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
