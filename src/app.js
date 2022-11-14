import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from 'joi';
import dayjs from 'dayjs';
dotenv.config();
dayjs().format();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
    db = mongoClient.db("uol_api");
});

const app = express();
app.use(express.json());

const participantSchema = joi.object({
    name: joi.string().min(1).required()
});

/* Participants Routes */
app.post("/participants", async (req, res) => {
    const participant = req.body.name;

    const validation = participantSchema.validate(participant, { abortEarly: true });

    if (validation.error) {
        res.sendStatus(422);
        return;
    }

    try {
        if (db.collection("participants").some(e => e.name === participant)) {
            res.sendStatus(409);
        } else {
            const participantData = {
                name: participant,
                lastStatus: Date.now()
            }
            const message = {
                from: participant,
                to: "Todos",
                text: "entra na sala...",
                type: "status",
                time: "HH:MM:SS"
            }
            await db.collection("participants").insertOne(participantData);
            await db.collection("messages").insertOne(message);
            res.sendStatus(201);
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.get("/participants", async (req, res) => {
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

app.get("/messages", async (req, res) => {

});

/* Status Routes */
app.post("/status", async (req, res) => {

});

app.listen(5000, () => {
    console.log("Server is listening on port 5000.");
});