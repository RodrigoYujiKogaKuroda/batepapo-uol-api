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
    name: joi.string().required()
});

const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.any().valid('message', 'private_message').required()
});

/* Participants Routes */
app.post("/participants", async (req, res) => {
    try {
        const participant = req.body;
        const validation = participantSchema.validate(participant, { abortEarly: true });
        if (validation.error) {
            res.sendStatus(422);
            return;
        }
        
        const participants = await db.collection("participants").find().toArray();
        if (participants.some(e => e.name === participant.name)) {
            res.sendStatus(409);
        } else {
            const participantData = {
                name: participant.name,
                lastStatus: Date.now()
            }
            const message = {
                from: participant.name,
                to: "Todos",
                text: "entra na sala...",
                type: "status",
                time: dayjs().format("HH:mm:ss")
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
    try {
        const user = req.headers.user;
        const messageBody = req.body;
        const validation = messageSchema.validate(messageBody, { abortEarly: true });
        const username = await db.collection("participants").findOne({ name: user });
        if (validation.error || !username) {
            res.sendStatus(422);
            return;
        }

        const messageToSend = {
            from: user,
            to: messageBody.to,
            text: messageBody.text,
            type: messageBody.type,
            time: dayjs().format("HH:mm:ss")
        }
        await db.collection("messages").insertOne(messageToSend);
        res.sendStatus(201);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.get("/messages", async (req, res) => {
    try {
        const user = req.headers.user;
        if (!user) {
            res.sendStatus(401);
            return;
        }

        const messages = await db.collection("messages").find().toArray();
        let messagesList = [];
        let limit = parseInt(req.query.limit);
        if (limit) {
            if (limit > messages.length) {
                limit = messages.length;
            }
        } else {
            limit = messages.length;
        }
        for (let i = 0; i < limit; i++) {
            if (messages.from === user.name ||
                messages.to === "Todos" ||
                messages.to === user.name) {
                    messagesList.push(messages[i]);
                }
        }
        res.send(messagesList);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/* Status Routes */
app.post("/status", async (req, res) => {
    try {
        const user = req.headers.user;
        const participantCollection = db.collection("participants");
        const username = await participantCollection.findOne({ name: user });
        if (!username) {
            res.sendStatus(404);
            return;
        }

        await participantCollection.updateOne({
            name: user
        }, {$set:{"lastStatus": Date.now()}});
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.listen(5000, () => {
    console.log("Server is listening on port 5000.");
});