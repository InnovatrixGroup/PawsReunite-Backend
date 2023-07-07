const mongoose = require("mongoose");

const dbConnect = async (databaseURL) => {
  const connection = await mongoose.connect(databaseURL);
  return connection
}

const dbClose = async () => {
  const disconnect = await mongoose.connection.close();
  return disconnect;
}

module.exports = { dbConnect, dbClose };