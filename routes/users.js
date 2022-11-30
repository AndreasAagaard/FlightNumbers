const express = require("express");
const ObjectId = require("mongodb").ObjectId;
const mongo = require("mongodb").MongoClient;
require("dotenv/config");

//PREDEFINING COLLECTION AND DATABASE WE CANT TO ACCESS
// + EMPTY VARIABLES FOR SAVING COLLECTION AND DATABASE AS GLOBALS
let collection = "users";
let database = "alldiscsdb";
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const auth = require("../middleware/auth.js");
const verifyToken = require("../middleware/auth.js");
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
        first_name: first_name,
        last_name: last_name,
        email: email.toLowerCase(),
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
        // res.status(200).json({
        //   ok: true,
        //   object: result,
        // });
      }
    );

    const user = await discs.findOne({email:email});

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
    localStorage.setItem("token", user.token)

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

router.post("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await discs.findOne({email:email});

    if (user && (await bcrypt.compare(password, user.password))) {
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
      if (typeof window !== 'undefined') {
        localStorage.setItem("token", user.token)
      }

      // user
      res.status(200).json(user.token);
      return user;
    }
      res.status(400).json();
  } catch (err) {
    console.log(err);
  }

})

router.post("/welcome", auth, async (req, res) => {
  try {
    const { token } = req.body;
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      email = decoded.email;
      const user = await discs.findOne({email: email });

      res.status(200);
  }
  catch (err){
      console.log(err);
  }
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
