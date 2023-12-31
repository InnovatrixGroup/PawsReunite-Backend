// Import the express module
const express = require("express");
// Create an instance of the express application
const app = express();

// Import the dotenv module to load environment variables
const dotenv = require("dotenv");
// Load environment variables from .env file
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT;
const HOST = process.env.HOST;

// Configure some basic Helmet settings on the server instance.
const helmet = require("helmet");
app.use(helmet());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"]
    }
  })
);

// Configure some basic CORS settings on the server instance.
// These origin values don't actually have to be anything -
// this project exists without a front-end, but any front-end
// that should interact with this API should be listed in the
// array of origins for CORS configuration.
const cors = require("cors");
var corsOptions = {
  origin: ["http://localhost:3000", "https://paws-reunite.netlify.app"],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoose = require("mongoose");
let databaseURL = "";

// Configure the database connection based on the current environment.
switch (process.env.NODE_ENV.toLowerCase()) {
  case "prod":
  case "production":
    databaseURL = process.env.DATABASE_URL;
    break;
  case "development":
  case "dev":
    databaseURL = "mongodb://127.0.0.1:27017/PawsReunite";
    break;
  case "test":
    databaseURL = "mongodb://127.0.0.1:27017/PawsReunite_Test";
    break;
  default:
    console.error("Incorrect JS environment specified, database will not be connected.");
    break;
}

const { dbConnect, dbClose } = require("./database");
// connect to the database
dbConnect(databaseURL)
  .then(() => {
    console.log("Database connected!");
  })
  .catch((error) => {
    console.log(`
    Some error occurred connecting to the database! It was: 
    ${error}
  `);
  });

// initialize request errors array for error handling
app.use((request, response, next) => {
  request.errors = [];
  next();
});

// basic route for the home page
app.get("/", (request, response) => {
  response.json({
    data: "Welcome to PawsReunite"
  });
});

// route for checking database health
app.get("/databaseHealth", (request, response) => {
  const databaseState = mongoose.connection.readyState;
  const databaseName = mongoose.connection.name;
  const databaseHost = mongoose.connection.host;
  const databaseModels = mongoose.connection.modelNames();

  response.json({
    data: {
      databaseName: databaseName,
      databaseState: databaseState,
      databaseHost: databaseHost,
      databaseModels: databaseModels
    }
  });
});

//Routes Here
const usersRoute = require("./routes/UserRoute");
app.use("/users", usersRoute);

const PostRoute = require("./routes/PostRoute");
app.use("/posts", PostRoute);

const CommentRoute = require("./routes/CommentRoute");
app.use("/comments", CommentRoute);

const SuburbsSearchRoute = require("./routes/SuburbsRoute");
app.use("/suburbs", SuburbsSearchRoute);

const NotificationRoute = require("./routes/NotificationRoute");
app.use("/notifications", NotificationRoute);

app.get("*", (request, response) => {
  response.status(404).json({
    error: "Invalid Route"
  });
});

module.exports = { app, PORT, HOST };
