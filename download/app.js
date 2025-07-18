const express = require("express");
const path = require("path");
express().use(express.static(path.join(__dirname, "/public"))).listen(80);