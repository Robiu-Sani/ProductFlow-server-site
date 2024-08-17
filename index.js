const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware =======
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.541tyao.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });

    const product_collection = client.db("Product-Flow").collection("products");

    app.get("/products", async (req, res) => {
      const result = await product_collection.find().toArray();
      res.send(result);
    });

    app.get("/productslength", async (req, res) => {
      const result = await product_collection.find().toArray();
      res.send({ count: result.length });
    });

    app.get("/pasitionProducts", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      try {
        const result = await product_collection
          .find()
          .skip(page * size)
          .limit(size)
          .toArray();
        res.send(result);
      } catch (error) {
        res
          .status(500)
          .send({ error: "An error occurred while fetching products." });
      }
    });

    app.get("/pasitionProductsByFromLowPrice", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);

      try {
        const result = await product_collection
          .find()
          .sort({ price: 1 }) // Sort by price in ascending order (low to high)
          .skip(page * size)
          .limit(size)
          .toArray();

        res.send(result);
      } catch (error) {
        res
          .status(500)
          .send({ error: "An error occurred while fetching products." });
      }
    });

    app.get("/pasitionProductsByFromHighPrice", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);

      try {
        const result = await product_collection
          .find()
          .sort({ price: -1 }) // Sort by price in descending order (high to low)
          .skip(page * size)
          .limit(size)
          .toArray();

        res.send(result);
      } catch (error) {
        res
          .status(500)
          .send({ error: "An error occurred while fetching products." });
      }
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

//default route
app.get("/", (req, res) => {
  res.send("e-commers server");
});

//listing port
app.listen(port, () => {
  console.log(`server port is ${port}`);
});
