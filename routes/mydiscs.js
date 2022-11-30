const express = require("express");
const ObjectId = require('mongodb').ObjectId;
const mongo = require("mongodb").MongoClient;
require('dotenv/config');

let collection = "mydiscs";
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
      return
    };
    db = client.db(database);
    discs = db.collection(collection);
  }
);
const router = express.Router();


//Get disc by find query
router.get("/look/", (req, res) => {
  
  discs.aggregate([
    { $addFields: { "refer_id": { $toObjectId: "$bag.Ref_id" }}},
    {
      $lookup: {
        from: "discs",
        localField: "refer_id",
        foreignField: "_id",
        as: "orders_info",
      },
    },
    {
      $unwind: "$orders_info",
    },
    {
      $sort: {"orders_info.Speed": 1, "orders_info.Manufacturer": 1, "orders_info.Glide": 1, "orders_info.Turn": 1, "orders_info.Fade": 1}
    }
  ]).toArray((err, items) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
      return
    };
    res.status(200).send(items);
  });
});

//Get disc by find query
router.get("/", (req, res) => {
  var urlQuery = require('url').parse(req.url,true).query;
  var findQuery = convertIntObj(urlQuery);

  discs.find(findQuery)
          .sort({ Manufacturer: 1, Speed: 1, Glide: 1, Turn: 1, Fade: 1})
          .toArray((err, items) => {
            if (err) {
              console.error(err);
              res.status(500).send(err);
              return
            };
            res.status(200).send(items);
          });
});


//Get disc by id
router.get("/:id", (req, res) => {
  discs.find({ _id: new ObjectId(req.params.id) }).toArray((err, items) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
      return
    };
    res.status(200).send(items[0]);
  });
});


//Post to mydiscs
router.post("/", (req, res) => {
  
  const body = req.body
  discs.insertOne(
      { 
          Description: body.Description,
          Ref_id: body.Ref_id
      }, 
      (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send(err);
          return
      };
      console.log(result);
      res.status(200).json({ 
          ok: true,
          object: result
        });
  });
});

router.post("/", (req, res) => {
  const body = req.body
  discs.insertOne()
})


//Delete disc by id
router.delete("/:id", (req, res) => {
  const result = discs.deleteOne({ _id: new ObjectId(req.params.id) });
  if (result) res.status(204).send("Succesfully deleted");
  else res.status(500).send("Disc not found");
});

module.exports = router;


//Helping functions
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

function isEmpty(obj) {
  for(var prop in obj) {
    if(Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}

function convertIntObj(obj) {
  const res = {}
  for (const key in obj) {
      var keyInt = isNaN(parseInt(obj[key])) ? obj[key] : parseInt(obj[key]);
      res[key] = keyInt;
  }
  return res;
}