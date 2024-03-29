const express = require('express');
const router = express.Router();
const fetch = require("node-fetch");
const Stock = require('../models/Stock.js')
const StockIndex = require('../models/StockIndex.js');
const UserStocks = require('../models/User')
const {API_KEY} = process.env;


const indexURL = "https://financialmodelingprep.com/api/v3/historical-price-full/spy?serietype=line&apikey=" + API_KEY;
const url = "https://financialmodelingprep.com/api/v3/quote/SPY,QQQ,DIA,AAPL,META,GOOG,AMZN,MCD,KO,VZ,MSFT,BA?apikey=" + API_KEY;
let stockData;
let stockIndexData;


const getStocks = async () => {
  const indexResponse = await fetch(indexURL)
  const response = await fetch(url);
  const data = await response.json();
  const indexData = await indexResponse.json()
  stockData = data;
  stockIndexData = indexData;
}

getStocks();

router.get('/stocks/seed', (req, res) => {
  getStocks()
  console.log(stockIndexData)
  Stock.create(stockData)
  StockIndex.create(stockIndexData)
  res.send('seeded')
});

// router.get("/", (req, res) => {
//   res.send('hello investing world');
// });

router.get("/stocks", async (req, res) => {
  console.log(req.user)
  try {
    res.status(200).json(await Stock.find({}));
  } catch (error) {
    res.status(400).json({ message: "something went wrong" });
  }
});


//create
router.post("/stocks", async (req, res) => {
  try {
    await
    res.status(200).json(await Stock.create(req.body));
  } catch (error) {
    res.status(400).json({ message: "something went wrong" });
  }
});

//delete
router.delete("/stocks/:id", async (req, res) => {
  try {
    res.status(200).json(await Stock.findByIdAndDelete(req.params.id));
  } catch (error) {
    res.status(400).json({ message: "something went wrong" });
  }
})

// Update Route

router.post('/stocks/update-prices', async (req, res) => {
  console.log(getStocks());
  console.log(stockData);
  try {
    for (const stock of stockData) {
      await Stock.findOneAndUpdate(
        { symbol: stock.symbol },
        { $set: { price: stock.price } }
      );
    }
    res.status(200).send('Prices updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating prices');
  }
});




router.put("/stocks/:id", async (req, res) => {
  try {
    res.status(200).json(
      await Stock.findByIdAndUpdate(req.params.id, {$push: {comments: req.body.comments}})
      );
  } catch (error) {
      res.status(400).json({ message: "something went wrong" });
  }
});

router.get("/stocks/:id", async (req, res) => {
  console.log('test')
  try {
    res.status(200).json(await Stock.findById(req.params.id));
  } catch (error) {
    res.status(400).json({ message: "something went wrong" });
  }
});


module.exports = router;