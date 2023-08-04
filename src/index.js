const { app, PORT, HOST } = require("./server");

// start the server
app.listen(PORT, HOST, () => {
  console.log(`Server is running on port ${PORT}`);
});
