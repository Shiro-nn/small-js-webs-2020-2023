const mongoose = require("mongoose"),
Schema = mongoose.Schema;
module.exports = mongoose.model("accounts", new Schema({
    steam: { type: String, default: '' },
    discord: { type: String, default: '' }
}));