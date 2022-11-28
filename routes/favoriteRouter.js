const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Favorite = require("../models/favorite");
var authenticate = require("../authenticate");
const cors = require("./cors");

const { MongoNotConnectedError } = require("mongodb");

const favoriteRouter = express.Router();

favoriteRouter.use(express.static(__dirname + "/public"));

favoriteRouter
  .route("/")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({})
      .then(
        (favorites) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.create(req.body)
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
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported in /favorites");
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.remove({})
      .then(
        (response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

favoriteRouter
  .route("/:dishId")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end("GET operation not supported in /favorites");
    // Favorite.findById(req.params.dishId)
    //   .then(
    //     (leader) => {
    //       res.statusCode = 200;
    //       res.setHeader("Content-Type", "application/json");
    //       res.json(leader);
    //     },
    //     (err) => next(err)
    //   )
    //   .catch((err) => next(err));
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    /**
     * find Favorite document by user
     *
     */
    console.log("Entering Post Favorite");
    console.log("req.user._id: " + req.user._id);

    // Favorite.updateOne(
    //   { userId: req.user._id },
    //   { $push: { dishes: req.params.dishId } }
    // )

    // Favorite.findByIdAndUpdate(
    //   req.user._id,
    //   { $set: req.body },
    //   { new: true }
    // )

    Favorite.find({ userId: req.user._id })
      .then(
        (fav) => {
          if (fav.length === 1) {
            console.log("Fav was found: ", fav);

            Favorite.updateOne(
              { userId: req.user._id },
              { $push: { dishes: req.params.dishId } }
            )
              .then(
                (resp) => {
                  console.log("Fav updated");

                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(resp);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else if (fav.length === 0) {
            console.log("updateOne could not find referred favorite");

            Favorite.create({
              userId: req.user._id,
              dishes: [req.params.dishId],
            })
              .then(
                (fav) => {
                  console.log("Favorite created: ", fav);

                  res.statusCode = 201;
                  res.setHeader("Content-Type", "application/json");
                  res.json(fav);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else {
            return next(err);
          }
        },
        (err) => {
          console.log("Favorite Post Error: ", err);
        }
      )
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported in /favorites/" + req.params.dishId);
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findByIdAndDelete(req.params.dishId)
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
