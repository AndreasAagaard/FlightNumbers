const express = require("express");
const ObjectId = require('mongodb').ObjectId;
const mongo = require("mongodb").MongoClient;
require('dotenv/config');

let collection = "users";
let database = "alldiscsdb";
let db, discs;

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
// const auth = require("./middleware/auth");

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


//Register Post
router.post("/register", async (req, res) => {

    // Our register logic starts here
    try {
      // Get user input
      const { first_name, last_name, email, password } = req.body;
  
      // Validate user input
      if (!(email && password && first_name && last_name)) {
        res.status(400).send("All input is required");
      }
  
      // check if user already exist
      // Validate if user exist in our database
      const query = { email: email };
      const oldUser = await discs.findOne(query);
  
      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }
  
      //Encrypt user password
      encryptedPassword = await bcrypt.hash(password, 10);
  
      // Create user in our database
      discs.insertOne(
        {
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email.toLowerCase(),
          password: encryptedPassword
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

      const user = await discs.findOne(email);
  
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;
  
      // return new user
      res.status(201).json(user);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });



//Post to login
router.post("/", (req, res) => {
  
  const body = req.body
 
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