var Sequence = require('../models/sequence');

var maxDocumentId;
var maxMessageId;
var maxContactId;
var maxVictoryId; // Victory Planner Code 
var sequenceId = null;

function SequenceGenerator() {
  // Convert to Promise-based (no .exec(callback) in Mongoose 8+)
  Sequence.findOne()
    .then(function(sequence) {
      sequenceId = sequence._id;
      maxDocumentId = sequence.maxDocumentId;
      maxMessageId = sequence.maxMessageId;
      maxContactId = sequence.maxContactId;
      maxVictoryId = sequence.maxVictoryId; // Victory Planner Code 
    })
    .catch(function(err) {
      if (err) {
        console.error("SequenceGenerator initialization error:", err);
        return;
      }      
    });
}

SequenceGenerator.prototype.nextId = function(collectionType) {

  var updateObject = {};
  var nextId;

  switch (collectionType) {
    case 'documents':
      maxDocumentId++;
      updateObject = {maxDocumentId: maxDocumentId};
      nextId = maxDocumentId;
      break;
    case 'messages':
      maxMessageId++;
      updateObject = {maxMessageId: maxMessageId};
      nextId = maxMessageId;
      break;
    case 'contacts':
      maxContactId++;
      updateObject = {maxContactId: maxContactId};
      nextId = maxContactId;
      break;
      case 'victories':
      maxVictoryId++;
      updateObject = {maxVictoryId: maxVictoryId};
      nextId = maxVictoryId;
      break;
    default:
      return -1;
  }

  // Convert update to Promise-based (avoid callback deprecation error)
  Sequence.updateOne({_id: sequenceId}, {$set: updateObject})
    .then(function() {
// Success - no callback needed
    })
    .catch(function(err) {
      if (err) {
        console.log("nextId error = " + err);
        return null
      }
    })

  return nextId;
}

module.exports = new SequenceGenerator();
