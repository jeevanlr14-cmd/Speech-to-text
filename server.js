import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const transcriptSchema = new mongoose.Schema({
    text: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Transcript = mongoose.model(
    "Transcript",
    transcriptSchema
);

app.post("/save", async (req, res) => {
    try {
        const { text } = req.body;

        const transcript = new Transcript({
            text
        });

        await transcript.save();

        res.status(201).json({
            message: "Transcript saved successfully",
            data: transcript
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

app.get("/transcripts", async (req, res) => {
    try {
        const data = await Transcript.find()
        .sort({ createdAt: -1 });

        res.json(data);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});