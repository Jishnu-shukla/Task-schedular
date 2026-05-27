const express = require('express');
const cors = require('cors');
const { translate } = require('@vitalets/google-translate-api'); // <-- Import the translator

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Our old "tasks" array is now our live global chat database!
let messages = [];

// Endpoint 1: Fetch all past translated messages
app.get('/api/messages', (req, res) => {
    res.status(200).json(messages);
});

// Endpoint 2: Intercept a message, translate it, and save it
app.post('/api/messages', async (req, res) => {
    const { username, originalText, targetLanguage } = req.body;

    // Simple validation
    if (!username || !originalText || !targetLanguage) {
        return res.status(400).json({ error: "Missing username, text, or target language!" });
    }

    try {
        console.log(`[TRANSLATOR] Translating "${originalText}" to code: [${targetLanguage}]`);

        // Force translate the incoming message before it hits our database array
        const translation = await translate(originalText, { to: targetLanguage });

        const newMessage = {
            id: Date.now().toString(),
            username: username,
            originalText: originalText,
            translatedText: translation.text, // The new converted string!
            targetLanguage: targetLanguage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        messages.push(newMessage);

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Translation error:", error);
        res.status(500).json({ error: "The translation engine hit a snag." });
    }
});

// Endpoint 3: Clear Chat (Optional utility button)
app.delete('/api/messages', (req, res) => {
    messages = [];
    res.status(200).json({ message: "Chat history cleared!" });
});

app.listen(PORT, () => {
    console.log("🌍 Global Translation Chat Server running on port 5000");
});