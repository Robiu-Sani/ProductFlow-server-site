const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.541tyao.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

async function createMongoClient() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  await client.connect();
  return client;
}

// Routes
app.get("/products", async (req, res) => {
  try {
    const client = await createMongoClient();
    const product_collection = client.db("Product-Flow").collection("products");
    const result = await product_collection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving products", error });
  }
});

app.get("/productslength", async (req, res) => {
  try {
    const client = await createMongoClient();
    const product_collection = client.db("Product-Flow").collection("products");
    const count = await product_collection.estimatedDocumentCount();
    res.send({ count: count });
    await client.close();
  } catch (error) {
    res.status(500).send({ message: "Error retrieving product length", error });
  }
});

app.get("/products/:productName", async (req, res) => {
  try {
    const { productName } = req.params;
    const client = await createMongoClient();
    const product_collection = client.db("Product-Flow").collection("products");
    const result = await product_collection
      .find({ productName: new RegExp(productName, "i") }) // Case-insensitive search
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving products", error });
  }
});

// Additional Routes (pasitionProducts, pasitionProductsByFromLowPrice, etc.)
app.get("/pasitionProducts", async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    const client = await createMongoClient();
    const product_collection = client.db("Product-Flow").collection("products");
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
  console.log("iam colling");
  try {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    const client = await createMongoClient();
    const product_collection = client.db("Product-Flow").collection("products");
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
  try {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    const client = await createMongoClient();
    const product_collection = client.db("Product-Flow").collection("products");
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

app.get("/pasitionProductsbynewtoOld", async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    const client = await createMongoClient();
    const product_collection = client.db("Product-Flow").collection("products");
    const result = await product_collection
      .find()
      .sort({ productCreationDateTime: -1 }) // Sort by creation date string in descending order
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

app.get("/pasitionProductsbyoldToNew", async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    const client = await createMongoClient();
    const product_collection = client.db("Product-Flow").collection("products");
    const result = await product_collection
      .find()
      .sort({ productCreationDateTime: 1 }) // Sort by creation date string in ascending order
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

app.get("/AddCard", async (req, res) => {
  const client = await createMongoClient();
  const product_collection = client.db("Product-Flow").collection("AddCard");
  const result = await product_collection.find().toArray();
  res.send(result);
});

app.get("/checkout/:id", async (req, res) => {
  const client = await createMongoClient();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  const product_collection = client.db("Product-Flow").collection("products");
  const AddCard_collection = client.db("Product-Flow").collection("AddCard");

  try {
    // Check in product_collection
    let result = await product_collection.findOne(query);

    // If not found in product_collection, check in AddCard_collection
    if (!result) {
      result = await AddCard_collection.findOne(query);
    }

    // If found in either collection, return the result
    if (result) {
      res.send(result);
    } else {
      // If not found in both collections, return a 404 Not Found response
      res.status(404).send({ message: "Product not found." });
    }
  } catch (error) {
    // Handle any errors that occur
    console.error("Error fetching product:", error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    // Close the database connection
    await client.close();
  }
});

app.get("/AddCard/:email", async (req, res) => {
  const client = await createMongoClient();
  const email = req.params.email; // Correctly accessing the email from the URL
  const query = { email: email };
  const product_collection = client.db("Product-Flow").collection("AddCard");
  const result = await product_collection.find(query).toArray();
  res.send(result);
});

app.get("/ProductsDetails/:id", async (req, res) => {
  const client = await createMongoClient();
  const id = req.params.id; // Correctly accessing the product ID from the URL
  const query = { _id: new ObjectId(id) }; // Correctly querying by _id
  const product_collection = client.db("Product-Flow").collection("products");
  const result = await product_collection.findOne(query); // Use findOne for a single product
  res.send(result);
});

app.post("/AddCard", async (req, res) => {
  const client = await createMongoClient();
  const query = req.body;

  const product_collection = client.db("Product-Flow").collection("AddCard");

  try {
    // Check if the product with the same productSign and email already exists
    const existingProduct = await product_collection.findOne({
      productSign: query.productSign,
      email: query.email,
    });

    if (existingProduct) {
      // If the product exists, return a 400 status with a message indicating so
      res.status(400).send({ message: "Product is already in the cart." });
    } else {
      // If the product does not exist, insert the new product
      const result = await product_collection.insertOne(query);
      res.status(201).send({
        message: "Product added to cart successfully.",
        result,
      });
    }
  } catch (error) {
    // Handle any errors that occur
    console.error("Error adding product to cart:", error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    // Close the database connection
    await client.close();
  }
});

// Default route
app.get("/", (req, res) => {
  res.send("e-commers server");
});

app.get("/test", (req, res) => {
  res.send("e-commers server testing perfectly");
});

// Exporting the app module
module.exports = app;

//listing port
// app.listen(port, () => {
//   console.log(`server port is ${port}`);
// });
