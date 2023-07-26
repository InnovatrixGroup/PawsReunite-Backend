const fetch = require("node-fetch");
const express = require("express");
const router = express.Router();
const AUSPOST_API_KEY = process.env.AUSPOST_API_KEY;

router.get("/search", async (request, response) => {
  try {
    const postcode = request.query.postcode;
    // getting suburbs from auspost api
    const resp = await fetch(
      `https://digitalapi.auspost.com.au/postcode/search.json?q=${postcode}`,
      {
        method: "GET",
        headers: {
          "AUTH-KEY": AUSPOST_API_KEY
        }
      }
    );

    const data = await resp.json();
    const localities = data.localities.locality;

    if (!localities) {
      return response.send([]);
    } else {
      //   if there is only one suburb, it will be an object, not an array
      if (!Array.isArray(localities)) {
        let suburb = `${localities.location} ${localities.postcode}`;
        return response.send([{ value: suburb, label: suburb }]);
      } else {
        let deliveryAreas = localities.filter((locality) => {
          return locality.category === "Delivery Area";
        });

        let suburbs = deliveryAreas.map((locality) => {
          return {
            value: `${locality.location} ${locality.postcode}`,
            label: `${locality.location} ${locality.postcode}`
          };
        });
        return response.send(suburbs);
      }
    }
  } catch (error) {
    response.send([{}]);
  }
});

module.exports = router;
