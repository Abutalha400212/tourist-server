const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const app = express();
// .......Middle War...........//
require("dotenv").config();
app.use(cors());
app.use(express.json());
//........ MongoDb Id and Password...........//
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wdoppqt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }, { connectTimeoutMS: 30000 }, { keepAlive: 1 });
//............... middle war of jwt token...................//
function jwtVerifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.send({ message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    req.decoded = decoded;
    next();
  });
}
//.............. Db Connected............//
async function dbClient() {
  try {
    await client.connect();
    console.log("Db connected");
  } catch (error) {
    console.log(error);
  }
}
dbClient();
//............Folder Creation of Db..............//
const visitingPlace = client.db("tourist").collection("visiting");
const reviews = client.db("tourist").collection("review");
//............Jwt..................//
app.post("/jwt", (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_TOKEN, { expiresIn: "1d" });
  res.send({ token });
});
//......................Service Data Load................//
app.get("/service", async (req, res) => {
  const limit = parseInt(req.query.limit);
  const find = visitingPlace.find({});
  try {
    const result = await find.limit(limit).toArray();
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});
//...........Load Detais Service Data by Own id.............//
app.get("/details/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await visitingPlace.findOne({ _id: ObjectId(id) });
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
//.................Service Add..................//
app.post("/addservice", async (req, res) => {
  const query = req.body;
  console.log(query);
  try {
    const result = await visitingPlace.insertOne(query);
    if (result.insertedId) {
      res.send({
        success: true,
        message: `review accepted from authority on ${result.insertedId}`,
      });
    }
  } catch (error) {
    console.log(error);
  }
});
//......................User review Update Method...............//
app.patch("/update/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await reviews.updateOne(
      { _id: ObjectId(id) },
      { $set: req.body }
    );
    if (result.matchedCount) {
      res.send({
        success: true,
        message: "Your Data updated",
      });
    }
  } catch (error) {
    console.log(err);
  }
});
//......................User Review Data load by own id............//
app.get("/update/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await reviews.findOne({ _id: ObjectId(id) });
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
//...................User Review add....................//
app.post("/review", async (req, res) => {
  const query = req.body;
  try {
    const result = await reviews.insertOne(query);
    if (result.insertedId) {
      res.send({
        success: true,
        message: `review accepted from authority on ${result.insertedId}`,
      });
    }
  } catch (error) {
    console.log(error);
  }
});
//.....................Get user Review Data....................//
app.get("/review", jwtVerifyToken, async (req, res) => {
  const query = { email: req.query.email };
  const find = reviews.find(query);
  try {
    const decoded = req.decoded;
    if (decoded.email !== req.query.email) {
      res.status(403).send({ message: "Forbidden Access" });
    }
    const result = await find.sort({date: -1}).toArray();
    res.send({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
});
app.get('/reviews',async (req,res)=>{
  try {
    const result = await reviews.find({}).sort({date: -1}).toArray()
    res.send(result)
  } catch (error) {
    console.log(error);
  }
})
//.................User Review Delete Method................//
app.delete("/review/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await reviews.deleteOne({ _id: ObjectId(id) });
    if (result.deletedCount) {
      res.send({
        success: true
      });
    }
  } catch (error) {
    console.log(error);
  }
});
app.get("/", (req, res) => {
  res.send("Api is running now");
});
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
