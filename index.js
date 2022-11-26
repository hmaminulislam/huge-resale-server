const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//midleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@cluster0.wpflsxi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const productsCollection = client.db("HugeResale").collection("products");
    const bookingsCollection = client.db("HugeResale").collection("bookings");
    const usersCollection = client.db("HugeResale").collection("users");

    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { brand: id };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const query = req.body;
      const result = await productsCollection.insertOne(query);
      res.send(result);
    });

    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { productId: id };
      const result = await bookingsCollection.findOne(query);
      if (result) {
        res.send(result);
      }
    });

    app.post("/bookings", async (req, res) => {
      const query = req.body;
      const result = await bookingsCollection.insertOne(query);
      res.send(result);
    });

    app.get("/users/:id", async (req, res) => {
      const email = req.params.id;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });


    app.get("/sellers", async (req, res) => {
      const query = { role: "seller" };
      const result = await usersCollection.find(query).toArray();
      if (result) {
        res.send(result);
      }
    });

    app.get("/buyers", async (req, res) => {
      const query = { role: "buyer" };
      const result = await usersCollection.find(query).toArray();
      if (result) {
        res.send(result);
      }
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const email = req.body.email;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete('/users/:email', async(req, res) => {
        const email = req.params.email;
        const query = {email: email}
        const result = await usersCollection.deleteOne(query)
        res.send(result)
    })
    
  } catch (error) {
    console.log(error);
  }
}

run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Huge Resale server is running...");
});

app.listen(port, () => {
  console.log(`Huge Resale port is: ${port}`);
});
