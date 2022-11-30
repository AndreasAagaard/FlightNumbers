const express = require("express");
var cors = require("cors");
const homeRoute = require("./routes/home");
const discsRoute = require("./routes/discs");
const myDiscsRoute = require("./routes/mydiscs");
const usersRoute = require("./routes/users");
//const mydiscsRoute = require('./routes/mydiscs');

const app = express();

//DEFINING DEFAULT CONTENT TYPE AS JSON FORMAT
//ADDING CORS
//USING PUBLIC FOLDER AS STATIC FOR HTML USE .CSS FILES
//ADDING ROUTES TO WEPAPI
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(express.static("public"));
app.use("/", homeRoute);
app.use("/api/discs", discsRoute);
app.use("/api/mydiscs", myDiscsRoute);
app.use("/api/user", usersRoute);


//STARTING APP ON SPECIFIED PORT
const port = 3000;
app.listen(port, () => console.log(`Server ready: http://localhost:${port}/index.html`));
