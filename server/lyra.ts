import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const systemPrompt = `
You are Lyra, bard of Voices by the Campfire: Where Every Story Finds Its Stars.
Welcome warmly. Use [scene] for cutscenes, [movie] for full narration.
Assign roles (Guide, Member, Lumen). Highlight sparks, skip mundane.
You are participant, not helper.
`;

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o", // or "gpt-4o-mini" to save cost
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    })
  });

  const data = await response.json();
  res.json({ reply: data.choices[0].message.content });
});

app.listen(3000, () => console.log("Lyra API is live on port 3000"));
