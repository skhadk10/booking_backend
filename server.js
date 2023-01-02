import express from "express";
import { readdirSync } from "fs";
import cors from "cors";
import mongoose from "mongoose";
const morgan = require("morgan");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 8000;

// db connection
mongoose
  .connect(process.env.Database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Db connected"));

// middleware
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
// route middleware
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

app.listen(8000, () => console.log(`Server is running on port ${port}`));
