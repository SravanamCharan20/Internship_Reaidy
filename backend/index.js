import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://internship-reaidy-2.vercel.app",  // Frontend deployed URL
  "https://internship-reaidy-bay6.vercel.app" // Backend deployed URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS policy does not allow this origin"), false);
  },
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
  name: { type: String, default: "Default Chat" },
  messages: [{ user: String, message: String, response: String, timestamp: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});
const Conversation = mongoose.model("Conversation", conversationSchema);


app.post("/api/conversations", async (req, res) => {
  const { userId, message, response, name, endSession } = req.body;
  
  // If ending a session
  if (endSession) {
    const currentActive = await Conversation.findOne({ 
      userId, 
      isActive: true 
    });
    
    if (currentActive) {
      currentActive.isActive = false;
      await currentActive.save();
    }
    return res.status(200).json({ message: "Session ended successfully" });
  }
  
  // If creating a new chat session
  if (!message && !response && name) {
    // Find current active conversation
    const currentActive = await Conversation.findOne({ 
      userId, 
      isActive: true 
    });

    // If there's an active conversation, deactivate it
    if (currentActive) {
      currentActive.isActive = false;
      await currentActive.save();
    }
    
    // Create new active conversation
    const conversation = new Conversation({ 
      userId, 
      name: name || "Default Chat",
      messages: [],
      isActive: true,
      createdAt: new Date()
    });
    await conversation.save();
    return res.status(201).json(conversation);
  }
  
  // If adding messages to existing conversation
  let conversation = await Conversation.findOne({ 
    userId, 
    isActive: true 
  });
  
  if (!conversation) {
    conversation = new Conversation({ 
      userId, 
      name: "Default Chat",
      messages: [],
      isActive: true,
      createdAt: new Date()
    });
  }
  
  if (message && response) {
    conversation.messages.push({ 
      user: "user", 
      message, 
      response,
      timestamp: new Date()
    });
  }
  
  await conversation.save();
  res.status(201).json(conversation);
});

app.get("/api/conversations/:userId", async (req, res) => {
  const { history } = req.query;
  
  if (history === "true") {
    // Get all conversations for history, excluding the active one
    const conversations = await Conversation.find({ 
      userId: req.params.userId,
      isActive: false 
    }).sort({ createdAt: -1 });
    return res.json(conversations);
  }
  
  // Get active conversation for current chat
  const conversation = await Conversation.findOne({ 
    userId: req.params.userId,
    isActive: true
  });
  res.json(conversation || { messages: [] });
});

app.delete("/api/conversations/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ userId: req.params.userId });
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    conversation.messages = [];
    await conversation.save();
    res.json({ message: "Conversation cleared successfully" });
  } catch (error) {
    console.error("Error clearing conversation:", error);
    res.status(500).json({ error: "Failed to clear conversation" });
  }
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

// Add endpoint to get a specific conversation
app.get("/api/conversations/:userId/:conversationId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      userId: req.params.userId
    });
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

// Update MongoDB connection to use environment variable
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://cherry:cherry@cluster0.nauaz.mongodb.net/?retryWrites=true&w=majority")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Only start the server if not in production (Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;