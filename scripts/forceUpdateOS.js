const axios = require("axios");
let available = require("../data/postalCodes.json");

async function main() {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  for (let i = 0; i < 3000; i++) {
    console.log(i);
    try {
      response = await axios.get(
        `https://api.opensea.io/asset/0x18Cb9DB75FA62a9717aA98292B939e579b7c7Ccd/${available[i]}/?force_update=true`
      );
    } catch (error) {
      console.log(error);
    }

    console.log(response.data.token_metadata);

    await sleep(500);
  }
}
main();
