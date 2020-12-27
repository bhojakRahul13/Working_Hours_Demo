const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const auth = require("./middleware/auth");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const db = require("./config/db");
db();

//app.get("/", auth, (req, res) => res.send("API is running"));

app.use("/user", require("./routes/userRoute")); //register Route
app.use("/api", require("./routes/auth")); //Login route
app.use("/profile", require("./routes/profile")); //Profile route

app.listen(3000, () => console.log("Example app listening on port 3000"));
