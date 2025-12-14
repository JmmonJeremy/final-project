var express = require('express');
var router = express.Router();

const sequenceGenerator = require('./sequenceGenerator');
const Victory = require('../models/victory');

router.get('/', (req, res, next) => {
  Victory.find()    
    .then(victories => {
      res.status(200).json({
        message: 'Victories fetched successfully',
        victories: victories
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'An error occurred',
        error: error
      });
    });
});

router.post('/', (req, res, next) => {
  const maxVictoryId = sequenceGenerator.nextId("victories");
  const victory = new Victory({
    id: maxVictoryId,
    day: req.body.day,
    number: req.body.number,
    victory: req.body.victory,    
  });
  victory.save()
    .then(createdVictory => {
      res.status(201).json({
        message: 'Victory added successfully',
        victory: createdVictory
      });
    })
    .catch(error => {
       res.status(500).json({
          message: 'An error occurred',
          error: error
        });
    });
});

router.put('/:id', (req, res, next) => {
  Victory.findOne({ id: req.params.id })
    .then(victory => {
      victory.day = req.body.day;
      victory.number = req.body.number;
      victory.victory = req.body.victory;     
      Victory.updateOne({ id: req.params.id }, victory)
        .then(result => {
          res.status(204).json({
            message: 'Victory updated successfully'
          })
        })
        .catch(error => {
           res.status(500).json({
           message: 'An error occurred',
           error: error
         });
        });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Victory not found.',
        error: { victory: 'Victory not found'}
      });
    });
});

router.delete("/:id", (req, res, next) => {
  Victory.findOne({ id: req.params.id })
    .then(victory => {
      Victory.deleteOne({ id: req.params.id })
        .then(result => {
          res.status(204).json({
            message: "Victory deleted successfully"
          });
        })
        .catch(error => {
           res.status(500).json({
           message: 'An error occurred',
           error: error
         });
        })
    })
    .catch(error => {
      res.status(500).json({
        message: 'Victory not found.',
        error: { victory: 'Victory not found'}
      });
    });
});


module.exports = router; 

