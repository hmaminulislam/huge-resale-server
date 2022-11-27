const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

//midleware
app.use(cors());
app.use(express.json());

//verfy jwt token
function verifyJwt(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send("unauthorize access");
  }
  const accessToken = authorization.split(" ")[1];
  jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbiden access" });
    }
    req.decoded = decoded;
    next();
  });
}

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
    const wishlistsCollection = client.db("HugeResale").collection("wishlists");

    //jwt token
    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
            const query = {email: email}
            const user = await usersCollection.findOne(query)
            if(user) {
                const token = jwt.sign(
                  { email },
                  process.env.JWT_ACCESS_TOKEN,
                  {
                    expiresIn: "1d",
                  }
                );
                res.status(403).send({accessToken: token})
            }
            else{
                res.send({ accessToken: "" });
            }
    })

    app.get("/category/:id", verifyJwt, async (req, res) => {
      const id = req.params.id;
      const query = { brand: id };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/products", verifyJwt, async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/products", verifyJwt, async (req, res) => {
      const query = req.body;
      const result = await productsCollection.insertOne(query);
      res.send(result);
    });

    app.get("/bookings", verifyJwt, async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await bookingsCollection.find(query).toArray();
      if(result) {
        res.send(result);
      }
    });

    app.get("/bookings/:id", verifyJwt, async (req, res) => {
      const id = req.params.id;
      const query = { productId: id };
      const result = await bookingsCollection.findOne(query);
      if (result) {
        res.send(result);
      }
    });

    app.post("/bookings", verifyJwt, async (req, res) => {
      const query = req.body;
      const result = await bookingsCollection.insertOne(query);
      res.send(result);
    });

    //All users api
    app.get("/users/:id", async (req, res) => {
      const email = req.params.id;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });


    app.get("/sellers", verifyJwt, async (req, res) => {
      const query = { role: "seller" };
      const result = await usersCollection.find(query).toArray();
      if (result) {
        res.send(result);
      }
    });

    app.get("/buyers", verifyJwt, async (req, res) => {
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

    app.delete('/users/:email', verifyJwt, async(req, res) => {
        const email = req.params.email;
        const query = {email: email}
        const result = await usersCollection.deleteOne(query)
        res.send(result)
    })

    //wishlist
    app.get("/wishlists", verifyJwt, async(req, res) => {
      const email = req.query.email;
      const query = {email: email};
      const result = await wishlistsCollection.find(query).toArray()
      if(result) {
        res.send(result);
      }
    });


    app.delete("/wishlists/:id", verifyJwt, async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await wishlistsCollection.deleteOne(query)
      if(result) {
        res.send(result);
      }
    });

    app.post("/wishlists", verifyJwt, async(req, res) => {
      const query = req.body;
      
      const productId = query.productId;
      const email = query.email;
      const productQuery = {productId: productId, email: email}
      const productInWishlist = await wishlistsCollection.findOne(productQuery)
      if(productInWishlist) {
        return res.send({ alreadyAddWishlist: true });
      }
      const result = await wishlistsCollection.insertOne(query)
      res.send(result)
    });
    
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
