const mongoose = require("mongoose");

// create a function to connect to the database
const dbConnect = async (databaseURL) => {
  const connection = await mongoose.connect(databaseURL);
  return connection;
};

// create a function to close the database connection
const dbClose = async () => {
  const disconnect = await mongoose.connection.close();
  return disconnect;
};

module.exports = { dbConnect, dbClose };
