// import libraries and middleware
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

// mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ufgx0zu.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const allAssignmentCollection = client
      .db("letsStudyDB")
      .collection("all-assignments");

    // get all assignments
    app.get("/api/v1/all-assignments", async (req, res) => {
      const cursor = allAssignmentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/api/v1/create-assignment", async (req, res) => {
      const createdAssignment = req.body;
      console.log(createdAssignment);
      const result = await allAssignmentCollection.insertOne(createdAssignment);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("LET'S STUDY WEBSITE IS RUNNING...");
});

app.listen(port, () => {
  console.log(`Lets study website is running on port: ${port}`);
});
