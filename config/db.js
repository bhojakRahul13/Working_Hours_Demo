const mongoose = require("mongoose");

const db = () => {
  mongoose.connect(
    '"mongodb://localhost:27017/time_demo',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
    (err) => {
      if (!err) {
        console.log("mongo connect successfully.");
      } else {
        console.log("ERROr in db:" + err);
        //process.exit(1);
      }
    }
  );
}; //db name time_demo

module.exports = db;
