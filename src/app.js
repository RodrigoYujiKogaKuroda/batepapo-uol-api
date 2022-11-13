import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
    db = mongoClient.db("uol_api");
});

const app = express();
app.use(express.json());

/* Participants Routes */
app.post("/participants", async (req, res) => {

});

app.get("participants", async (req, res) => {
    try {
        const participants = await db.collection("participants").find().toArray();
        res.send(participants);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/* Messages Routes */
app.post("/messages", async (req, res) => {

});

app.get("messages", async (req, res) => {

});

/* Status Routes */
app.post("/status", async (req, res) => {

});

app.listen(5000, () => {
    console.log("Server is listening on port 5000.");
});