const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Favorite = require("../models/favorite");
var authenticate = require("../authenticate");
const cors = require("./cors");

const { MongoNotConnectedError, ObjectId } = require("mongodb");

const favoriteRouter = express.Router();

favoriteRouter.use(express.static(__dirname + "/public"));

////////////////////
// auxiliar functions
//////////////////////

// cannot use indexOf so I'll use this:
function arrayObjectIndexOf(myArray, property, searchTerm) {
  for (var i = 0, len = myArray.length; i < len; i++) {
    if (myArray[i][property].equals(new ObjectId(searchTerm))) return i;
  }
  return -1;
}

// Javascript program to check if all array elements are distinct
function areDistinct(arr) {
  console.log("Array distinct: ", arr)
  let n = arr.length;
  // Put all array elements in a map
  let s = new Set();
  for (let i = 0; i < n; i++) {
    s.add(arr[i]);
  } // If all elements are distinct, size of set should be same array.
  return s.size == arr.length;
}

favoriteRouter
  .route("/")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ userId: req.user._id })
      .populate("userId")
      .populate("dishes._id")
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
    // Find the Favorite document associated to the userId
    Favorite.find({ userId: req.user._id })
      .then(
        (fav) => {
          if (fav.length === 1) {
            req.body.forEach((dishTuple) => {
              // Find if the dishId is already in the dishes array of the Favorite document
              if (
                arrayObjectIndexOf(fav[0].dishes, "_id", dishTuple._id) !== -1
              ) {
                console.log(
                  "Dish " + dishTuple._id + " already present in this favorite"
                );
              }
              // dishTuple._id is not there yet, proceed to add it to the dishes array
              else {
                Favorite.updateOne(
                  { userId: req.user._id },
                  { $push: { dishes: { _id: dishTuple._id } } }
                )
                  .then(
                    (resp) => {
                      console.log("Fav doc updated");
                      console.log("Resp", resp);
                    },
                    (err) => next(err)
                  )
                  .catch((err) => next(err));
              }
            });
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({
              msg: "Favorites (the ones which were not present yet) added succesfully",
            });
          } else if (fav.length === 0) {
            console.log("updateOne could not find referred favorite");

            // Checking there are no repeated ids in the body of the request
            if (areDistinct(req.body.map(e => e._id))) {
              Favorite.create({
                userId: req.user._id,
                dishes: req.body,
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
              var err = new Error("Some elements of the body are repeated");
              err.status = 400;
              return next(err);
            }
          } else {
            return next(err);
          }
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => {
        next(err);
      });
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported in /favorites");
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.remove({ userId: req.user._id })
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
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log("Entering Post /favorite/:dishId");

    // Find the Favorite document associated to the userId
    Favorite.find({ userId: req.user._id })
      .then(
        (fav) => {
          if (fav.length === 1) {
            console.log("Fav doc was found: ", fav);

            // Find if the dishId is already in the dishes array of the Favorite document
            if (
              arrayObjectIndexOf(fav[0].dishes, "_id", req.params.dishId) !== -1
            ) {
              console.log("Fav repeated error");

              var err = new Error(
                "Dish " +
                  req.params.dishId +
                  " already present in this favorite"
              );
              err.status = 400;
              return next(err);
            }

            // req.params.dishId is not there yet, should be added to the dishes array
            else {
              console.log("dish not found in Fav doc, proceed to add it");

              Favorite.updateOne(
                { userId: req.user._id },
                { $push: { dishes: { _id: req.params.dishId } } }
              )
                .then(
                  (resp) => {
                    console.log("Fav doc updated");

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(resp);
                  },
                  (err) => next(err)
                )
                .catch((err) => next(err));
            }
          } else if (fav.length === 0) {
            console.log("updateOne could not find referred favorite");

            Favorite.create({
              userId: req.user._id,
              dishes: [{ _id: req.params.dishId }],
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
          next(err);
        }
      )
      .catch((err) => {
        next(err);
      });
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported in /favorites/" + req.params.dishId);
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ userId: req.user._id })
      .then(
        (fav) => {
          if (fav.length === 1) {
            console.log("Fav doc was found: ", fav);

            // Find if the dishId is already in the dishes array of the Favorite document
            var dishIndex = arrayObjectIndexOf(
              fav[0].dishes,
              "_id",
              req.params.dishId
            );

            if (dishIndex !== -1) {
              console.log("Fav repeated error");

              Favorite.updateOne(
                { userId: req.user._id },
                { $pull: { dishes: { _id: req.params.dishId } } }
              )
                .then(
                  (resp) => {
                    console.log("Fav doc updated");

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(resp);
                  },
                  (err) => next(err)
                )
                .catch((err) => next(err));
            }

            // req.params.dishId is not there yet, should be added to the dishes array
            else {
              console.log("dish not found in Fav doc");

              var err = new Error(
                "Dish " +
                  req.params.dishId +
                  " not present in this favorite document"
              );
              err.status = 400;
              return next(err);
            }
          } else if (fav.length === 0) {
            console.log("updateOne could not find referred favorite");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ msg: "Logged user has no favorites" });
          } else {
            return next(err);
          }
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => {
        next(err);
      });
  });

module.exports = favoriteRouter;
