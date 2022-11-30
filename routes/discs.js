const express = require("express");
const ObjectId = require("mongodb").ObjectId;
const mongo = require("mongodb").MongoClient;
require("dotenv/config");

//PREDEFINING COLLECTION AND DATABASE WE CANT TO ACCESS
// + EMPTY VARIABLES FOR SAVING COLLECTION AND DATABASE AS GLOBALS
let collection = "discs";
let database = "alldiscsdb";
let db, discs;

mongo.connect(
  process.env.DB_CONNECTION,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, client) => {
    if (err) {
      console.error(err);
      return;
    }
    db = client.db(database);
    discs = db.collection(collection);
  }
);
const router = express.Router();

//GET ALL DISCS FROM QUERY
router.get("/", (req, res) => {
  //DEFINING QUERY FROM THE URL
  var urlQuery = require("url").parse(req.url, true).query;
  var findQuery = convertIntObj(urlQuery);

  //RETURN ALL DISCS WITH SPECIFIED SORTINGS
  discs
    .find(findQuery)
    .sort({ manufacturer: 1, speed: 1, glide: 1, turn: 1, fade: 1 })
    // .sort({ speed: 1, glide: 1, turn: 1, fade: 1 })
    .toArray((err, items) => {
      if (err) {
        console.error(err);
        //IF ERROR: SENDING INTERNAL SERVER ERROR
        res.status(500).send(err);
        return;
      }
      //SENDING SUCCESS AND ALL FOUND ITEMS
      res.status(200).send(items);
    });
});

//RETURN DISC BY ID
router.get("/:id", (req, res) => {
  discs.find({ _id: new ObjectId(req.params.id) }).toArray((err, items) => {
    if (err) {
      console.error(err);
      //IF ERROR: SENDING INTERNAL SERVER ERROR
      res.status(500).send(err);
      return;
    }
    //SENDING SUCCESS AND ALL FOUND ITEM
    res.status(200).send(items[0]);
  });
});

//POSTING SINGLE DISCS
router.post("/", (req, res) => {
  const body = req.body;
  discs.insertOne(
    {
      manufacturer: body.manufacturer,
      disc_name: body.disc_name,
      type: body.type,
      speed: parseFloat(body.speed),
      glide: parseFloat(body.glide),
      turn: parseFloat(body.turn),
      fade: parseFloat(body.fade),
    },
    (err, result) => {
      if (err) {
        //IF ERROR: SENDING INTERNAL SERVER ERROR
        console.error(err);
        res.status(500).send(err);
        return;
      }
      console.log(result);
      //SENDING SUCCESS AND RETURNS ITEM CREATED
      res.status(200).json({
        ok: true,
        object: result,
      });
    }
  );
});

//Delete disc by id
router.delete("/:id", (req, res) => {
  const result = discs.deleteOne({ _id: new ObjectId(req.params.id) });
  //SENDING SUCCESS WITH NO CONTENT
  if (result) res.status(204).send("Succesfully deleted");
  //IF ERROR: SENDING INTERNAL SERVER ERROR
  else res.status(500).send("Disc not found");
});

module.exports = router;

//EXPORTING ROUTER TO MODULE FOR USE IN SERVER.JS
function convertIntObj(obj) {
  const res = {};
  for (const key in obj) {
    var keyInt = isNaN(parseInt(obj[key])) ? obj[key] : parseInt(obj[key]);
    res[key] = keyInt;
  }
  return res;
}
