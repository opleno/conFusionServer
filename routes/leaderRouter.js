const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Leaders = require("../models/leaders");
var authenticate = require("../authenticate");
const { MongoNotConnectedError } = require("mongodb");

const leaderRouter = express.Router();

leaderRouter.use(express.static(__dirname + "/public"));

leaderRouter
  .route("/")

  .get((req, res, next) => {
    Leaders.find({})
      .then(
        (leaders) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(leaders);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .post(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.create(req.body)
        .then(
          (leader) => {
            console.log("leader created: ", leader);

            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.json(leader);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )

  .put(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end("PUT operation not supported in /leaders");
    }
  )

  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.remove({})
        .then(
          (response) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(response);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

leaderRouter
  .route("/:leaderId")

  .get((req, res, next) => {
    Leaders.findById(req.params.leaderId)
      .then(
        (leader) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(leader);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .post(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end(
        "POST operation not supported in /leaders/" + req.params.leaderId
      );
    }
  )

  .put(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.findByIdAndUpdate(
        req.params.leaderId,
        { $set: req.body },
        { new: true }
      )
        .then(
          (leader) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(leader);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )

  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.findByIdAndDelete(req.params.leaderId)
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

module.exports = leaderRouter;
