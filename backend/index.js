import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:8080"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));



const faqSchema = new mongoose.Schema({
  question: String,
  answer: String,
  uploadedAt: { type: Date, default: Date.now },
});
const FAQ = mongoose.model("FAQ", faqSchema);

const conversationSchema = new mongoose.Schema({
  userId: String,
  messages: [{ user: String, message: String, response: String, timestamp: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now },
});
const Conversation = mongoose.model("Conversation", conversationSchema);


app.post("/api/conversations", async (req, res) => {
  const { userId, message, response } = req.body;
  let conversation = await Conversation.findOne({ userId });
  if (!conversation) {
    conversation = new Conversation({ userId, messages: [] });
  }
  conversation.messages.push({ user: "user", message, response });
  await conversation.save();
  res.status(201).json(conversation);
});

app.get("/api/conversations/:userId", async (req, res) => {
  const conversation = await Conversation.findOne({ userId: req.params.userId });
  res.json(conversation || { messages: [] });
});

app.post("/api/faq", async (req, res) => {
  const { question, answer } = req.body;
  const faq = new FAQ({ question, answer });
  await faq.save();
  res.status(201).json(faq);
});

app.get("/api/faq", async (req, res) => {
  const faqs = await FAQ.find().sort({ uploadedAt: -1 });
  res.json(faqs);
});



mongoose.connect("mongodb+srv://cherry:cherry@cluster0.nauaz.mongodb.net/?retryWrites=true&w=majority").then(() => {
    console.log("Connected to MongoDB");
  }).catch((err) => {
    console.log(err);
  });


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});