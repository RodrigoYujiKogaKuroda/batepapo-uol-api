import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

await mongoClient.connect();
db = mongoClient.db("uol_api");

const app = express();
app.use(express.json());

/* Participants Routes */

/* Messages Routes */

/* Messages Routes */

app.listen(5000, () => {
    console.log("Server is listening on port 5000.");
});