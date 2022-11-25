const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000

//midleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@cluster0.wpflsxi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
    try{
        const productsCollection = client.db("HugeResale").collection("products");
        const bookingsCollection = client.db("HugeResale").collection("bookings");

        app.get('/category/:id', async(req, res) => {
            const id = req.params.id;
            const query = {brand: id}
            const result = await productsCollection.find(query).toArray()
            res.send(result)
        })
        
        app.post('/bookings', async(req, res) => {
            const query = req.body;
            const result = await bookingsCollection.insertOne(query)
            res.send(result)
        })
    }
    catch(error) {
        console.log(error)
    }
}

run().catch(console.log);

app.get('/', (req, res) => {
    res.send('Huge Resale server is running...')
})

app.listen(port, () => {
    console.log(`Huge Resale port is: ${port}`)
})