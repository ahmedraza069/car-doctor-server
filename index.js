const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(
  cors({
    origin: ["https://car-doctor-auth-2fa4d.web.app", "https://car-doctor-auth-2fa4d.firebaseapp.com"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ppdfwyq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token
  if(!token){
    return res.status(401).send({message : 'unauthoraized access'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
     return res.status(401).send({message: 'unauthorized access'})

    }
    req.user = decoded
    next()
  })
}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const carDocCollection = client.db("carDoctorDB").collection("services");
    const checkOutCollection = client.db("carDoctorDB").collection("checkout");
    // auth related api jwt
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log("user in the server", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    app.post("/logout", async (req, res) => {
      const user = req.body;
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    // server related api
    app.get("/services", async (req, res) => {
      const cursor = carDocCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carDocCollection.findOne(query);
      res.send(result);
    });

    // check out
    app.get("/checkout", verifyToken, async (req, res) => {
      let query = {};
      console.log('user owner info', req.user)
      if (req.user.email !== req.query.email) {
        return res.status(403).send({message: 'Forbbiden Access'})
      }
      if (req.query?.email) {
        query = {
          email: req.query.email,
        };
      }
      const result = await checkOutCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/checkout", async (req, res) => {
      const checkoutInfo = req.body;
      console.log(checkoutInfo);
      const result = await checkOutCollection.insertOne(checkoutInfo);
      res.send(result);
    });

    app.patch("/checkout/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBooking = req.body;
      console.log(updatedBooking);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: updatedBooking.status,
        },
      };
      const result = await checkOutCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/checkout/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await checkOutCollection.deleteOne(query);
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
  res.send("CAR DOCTOR IS RUNNING");
});

app.listen(port, () => {
  console.log(`SERVER IS RUNNING PORT ON ${port}`);
});
