const mongoose = require('mongoose');

const victorySchema = mongoose.Schema({
   id: { type: String, required: true },
   day: { type: String },
   number: { type: Number, required: true },
   victory: { type: String }
});

module.exports = mongoose.model('Victory', victorySchema);
