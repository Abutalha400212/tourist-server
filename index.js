const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wdoppqt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function dbClient() {
  try {
    await client.connect();
    console.log("Db connected");
  } catch (error) {
    console.log(error);
  }
}
dbClient();
const visitingPlace = client.db("tourist").collection("visiting");
const reviews = client.db("tourist").collection("review");
app.get("/details/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await visitingPlace.findOne({ _id: ObjectId(id) });
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
app.post('/addservice',async(req,res)=>{
  const query = req.body
  try {
    const result = await visitingPlace.insertOne(query)
    if(result.insertedId){
      res.send({
        success: true,
        message: `review accepted from authority on ${result.insertedId}`
      })
    }
  } catch (error) {
    console.log(error);
  }
});
app.patch('/update/:id',async(req,res)=>{
  const {id} = req.params
  try {
    const result = await reviews.updateOne({_id:ObjectId(id)},{$set:req.body})
    if(result.matchedCount){
      res.send({
        success:true,
        message:'Your Data updated'
      })
    }
  } catch (error) {
    console.log(err);
  }
})
app.get('/update/:id',async(req,res)=>{
  const { id } = req.params;
  try {
    const result = await reviews.findOne({ _id: ObjectId(id) });
    res.send(result);
  } catch (error) {
    console.log(error);
  }
})
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

app.get("/review", async (req, res) => {
  const query = { email: req.query.email };
  const find = reviews.find(query);
  try {
    const result = await find.toArray();
        res.send({
          success: true,
          data: result
          })
     
  } catch (error) {
    console.log(error);
  }
});
app.delete('/review/:id',async(req,res)=>{
  const {id} = req.params
  try {
    const result = await reviews.deleteOne({_id:ObjectId(id)})
  if(result.deletedCount){
    res.send({
      success:true,
      message:`Item deleted on id ${result._id}`
    })
  }
  } catch (error) {
    console.log(error);
  }
})
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
app.get("/", (req, res) => {
  res.send("Api is running now");
});
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
