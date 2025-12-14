const mongoose = require('mongoose');

const sequenceSchema = new mongoose.Schema({
  maxDocumentId: { type: Number, required: true },
  maxMessageId: { type: Number, required: true },
  maxContactId: { type: Number, required: true },
  maxVictoryId: { type: Number, required: true },
});

module.exports = mongoose.model('Sequence', sequenceSchema);