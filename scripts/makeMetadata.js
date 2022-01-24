const { ethers, getNamedAccounts, deployments } = require("hardhat");
const fs = require("fs");
const Hash = require("ipfs-only-hash");
const csv = require("fast-csv");

const { chunkArray } = require("../utils/helper");

const propertysData = "./data/propertyData.csv";
const IPFS_GATEWAY_BASE = process.env.IPFS_GATEWAY_BASE;

const makeAttributes = (data) => {
  function add(traitType, displayType, value, maxValue) {
    let obj = {};

    if (traitType) obj["trait_type"] = traitType;
    if (displayType) obj["display_type"] = displayType;
    if (value) obj["value"] = value;
    if (maxValue) obj["max_value"] = maxValue;

    return obj;
  }

  let out = [];
  if (data["Special"]) {
    out.push(add("Special", null, data["Special"], null));
  } else {
    out.push(add("City Name", null, data["City Name"], null));
    out.push(add("District Name", null, data["District Name"], null));
    out.push(add("Street Name", null, data["Street Name"], null));
  }
  out.push(add("Unit", "number", data["unit"], data["max_units"]));

  return out;
};

function main() {
  // Read propertyData.csv
  let d = {};
  const longToByteArray = (x) => {
    return [x, x << 8, x << 16, x << 24].map((z) => z >>> 24);
  };

  const getPostalCode = (tokenId) => {
    return ethers.utils.hexlify(longToByteArray(tokenId));
  };
  // Add Dashes
  const formatPostalCode = (postalCode) => {
    return `${postalCode.substring(0, 2)}-${postalCode.substring(
      2,
      4
    )}-${postalCode.substring(4, 6)}-${postalCode.substring(6, 8)}`;
  };
  fs.createReadStream(propertysData)
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => {
      let tokenId = parseInt(row.tokenId);
      console.log("🚀 | .on | tokenId", tokenId);
      let postalCode = getPostalCode(tokenId).substring(2);
      console.log("🚀 | .on | postalCode", postalCode);
      // let imageHash = "QmXeNqnWrBd4vVELtBqaTi9Am3TFtoZE3seqkkSVtbrRvc";
      let imageHash = row.image_hash;
      let attributes = makeAttributes(row);

      let body = {
        name: `Property's #${formatPostalCode(postalCode)}`,
        description: `Postal Code: ${formatPostalCode(postalCode)}`,
        image: `${IPFS_GATEWAY_BASE}${imageHash}`,
        attributes: attributes,
      };

      // For each row, create a metadata file
      // Write data to metadata file
      fs.writeFileSync(
        `./generated/metadata/${row.tokenId}`,
        JSON.stringify(body, null, 2)
      );
    })
    .on("end", (rowCount) => {
      console.log(`Parsed ${rowCount} rows`);
    });
}

main();
