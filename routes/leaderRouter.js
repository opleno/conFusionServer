const express = require("express");
const bodyParser = require("body-parser");

const leaderRouter = express.Router();

leaderRouter.use(express.static(__dirname + "/public"));

leaderRouter
  .route("/")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .get((req, res, next) => {
    res.end("Will send leaders to you");
  })
  .post((req, res, next) => {
    res.end(
      "Will add the leader: " +
        req.body.name +
        " with details " +
        req.body.description
    );
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported in /leaders");
  })

  .delete((req, res, next) => {
    res.end("Deleting all leaders");
  });

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

leaderRouter
  .route("/:leaderId")
  .get((req, res, next) => {
    res.end("Will send this leader to you: id=" + req.params.leaderId);
  })

  .post((req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported in /leaders/" + req.params.leaderId);
  })

  .put((req, res, next) => {
    res.write("Updating the leader: " + req.params.leaderId);
    res.end(
      "\nWill update the leader: " +
        req.body.name +
        " with details " +
        req.body.description
    );
  })

  .delete((req, res, next) => {
    res.end("Deleting leader: " + req.params.leaderId);
  });

module.exports = leaderRouter;
