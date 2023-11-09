// import libraries and middleware
const express = require("express");
const cors = require("cors");

// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());
// app.use(cookieParser());

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

// middlewares
// const logger = (req, res, next) => {
//   // console.log("logger Info", req.method, req.url);
//   next();
// };
// const verifyToken = (req, res, next) => {
//   const token = req?.cookies?.token;
//   if (!token) {
//     return res.status(401).send({ message: "Unauthorized" });
//   }
//   jwt.verify(token, process.env.SECRET, (error, decoded) => {
//     if (error) {
//       return res.status(401).send({ message: "Unauthorized" });
//     }
//     req.user = decoded;
//     next();
//   });
// };

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const allAssignmentCollection = client
      .db("letsStudyDB")
      .collection("all-assignments");
    const submittedAssignmentCollection = client
      .db("letsStudyDB")
      .collection("submitted-assignments");
    const featuresCollection = client.db("letsStudyDB").collection("features");
    const fqasCollection = client.db("letsStudyDB").collection("fqas");

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
        query.email = email;
      }

      // pagination
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const skip = (page - 1) * limit;

      const cursor = allAssignmentCollection
        .find(query)
        .skip(skip)
        .limit(limit);
      const countAssignment =
        await allAssignmentCollection.estimatedDocumentCount();
      const result = await cursor.toArray();
      res.send({ result, countAssignment });
    });

    // jwt-token
    app.post("/api/v1/auth/jwt-token", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET, { expiresIn: "1h" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          maxAge: 3600000,
          sameSite: "none",
        })
        .send({ success: true });
    });

    app.post("/api/v1/user/logout", async (req, res) => {
      const user = req.body;
      console.log(user);
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    // get all submitted assignment
    app.get("/api/v1/user/all-submitted-assignment", async (req, res) => {
      const status = req.query.status;
      const email = req.query.email;
      // const tokenEmail = req.user.email;
      // console.log(tokenEmail);
      // console.log("eeeeeeeeeemail", tokenEmail);

      // // check if user email and token email does not match
      // if (email !== tokenEmail) {
      //   return res.status(403).send({ message: "Forbidden access" });
      // }

      let query = {};
      // console.log(email);
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

    // get a submitted assignment
    app.get("/api/v1/user/all-submitted-assignment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await submittedAssignmentCollection.findOne(query);
      res.send(result);
    });

    // get all features
    app.get("/api/v1/features", async (req, res) => {
      const cursor = featuresCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // get all fqas
    app.get("/api/v1/fqas", async (req, res) => {
      const cursor = fqasCollection.find();
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
