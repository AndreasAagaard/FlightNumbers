const express = require("express");
const fs = require("fs");
const urlPath = fs.realpathSync("public");

const router = express.Router();

//READING HTML PAGE FROM REQUESTED URL
router.get(["/insert"], (req, res) => {
  fs.readFile(urlPath + "/insert.html", "utf8", function (err, content) {
    res.send(content);
  });
});
router.get("/list", (req, res) => {
  fs.readFile(urlPath + "/list.html", "utf8", function (err, content) {
    res.send(content);
  });
});
router.get("/search", (req, res) => {
  fs.readFile(urlPath + "/search.html", "utf8", function (err, content) {
    res.send(content);
  });
});
router.get("/taske", (req, res) => {
  fs.readFile(urlPath + "/taske.html", "utf8", function (err, content) {
    res.send(content);
  });
});
router.get("/visu", (req, res) => {
  fs.readFile(urlPath + "/visu.html", "utf8", function (err, content) {
    res.send(content);
  });
});

//EXPORTING ROUTER TO MODULE FOR USE IN SERVER.JS
module.exports = router;
