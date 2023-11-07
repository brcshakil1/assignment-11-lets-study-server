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
    const submittedAssignmentCollection = client
      .db("letsStudyDB")
      .collection("submitted-assignments");

    // get all assignments
    // filter by difficulty
    app.get("/api/v1/all-assignments", async (req, res) => {
      const difficulty = req.query.difficulty;
      const email = req.query.email;
      let query = {};

      if (difficulty) {
        query.difficulty = difficulty;
      }

      if (email) {
        query.examineeEmail = email;
      }

      const cursor = allAssignmentCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get all submitted assignment
    app.get("/api/v1/user/all-submitted-assignment", async (req, res) => {
      const status = req.query.status;
      const email = req.query.email;
      let query = {};
      console.log(email);
      if (status === "pending") {
        query.status = status;
      }

      if (email) {
        query.examineeEmail = email;
      }
      const cursor = submittedAssignmentCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get an assignment
    app.get("/api/v1/all-assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allAssignmentCollection.findOne(query);
      res.send(result);
    });

    // create an assignment
    app.post("/api/v1/user/create-assignment", async (req, res) => {
      const assignment = req.body;
      const result = await allAssignmentCollection.insertOne(assignment);
      res.send(result);
    });

    // submitted a assignment
    app.post("/api/v1/user/submitted-assignment", async (req, res) => {
      const submittedAssignment = req.body;
      const result = await submittedAssignmentCollection.insertOne(
        submittedAssignment
      );
      res.send(result);
    });

    // update an assignment
    app.put("/api/v1/all-assignments/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedAssignment = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          title: updatedAssignment.title,
          image: updatedAssignment.image,
          description: updatedAssignment.description,
          marks: updatedAssignment.marks,
          difficulty: updatedAssignment.difficulty,
          date: updatedAssignment.date,
        },
      };
      const result = await allAssignmentCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    // update submitted assignment
    app.put("/api/v1/user/all-submitted-assignment/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const markingStatus = req.body;
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          obtainMarks: markingStatus.obtainMarks,
          feedback: markingStatus.feedback,
          status: markingStatus.status,
        },
      };
      const result = await submittedAssignmentCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
      console.log(markingStatus);
    });

    // delete assignment operation
    app.delete("/api/v1/all-assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allAssignmentCollection.deleteOne(query);
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
