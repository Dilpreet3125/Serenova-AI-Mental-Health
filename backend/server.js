const fs = require('fs'); 
const bcrypt = require('bcryptjs');
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const Sentiment = require('sentiment');
const nlp = require('compromise');
require('dotenv').config();
const nodemailer = require("nodemailer");
const app = express();
const sentiment = new Sentiment();

app.use(cors()); 
app.use(express.json()); 

const PORT = process.env.PORT || 5000;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "mk07jaspreetsingh@gmail.com",
    pass: "fryksuqhyzfjkjtm"
  }
});
// --- INITIALIZE DATABASE FILES ---
const initFile = (path, defaultValue = []) => {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify(defaultValue, null, 2));
  }
};
initFile('./users.json');
initFile('./journals.json');
initFile('./assessment_history.json'); 

// --- DYNAMIC AI ADVICE ENGINE (Original) ---
const generateVariedFeedback = (text) => {
  const analysis = sentiment.analyze(text);
  const doc = nlp(text);
  const topics = doc.topics().out('array');
  const mainTopic = topics.length > 0 ? topics[0] : "your feelings";

  const positivePool = [
    `It's heartening to see your positive outlook on ${mainTopic}! Gratitude is a powerful tool for wellness.`,
    `I love the energy in your reflection about ${mainTopic}. Keeping this perspective builds great resilience.`,
    `It sounds like ${mainTopic} really brightened your day! Savor these moments—they are the anchors of happiness.`,
    `Your awareness of the good things around ${mainTopic} is inspiring. Keep nurturing this positive momentum.`
  ];

  const negativePool = [
    `I can feel the weight of what you're saying about ${mainTopic}. It takes courage to put these feelings into words.`,
    `It sounds like ${mainTopic} is weighing heavily on you. Please be gentle with yourself; you don't have to carry it all today.`,
    `I hear the struggle regarding ${mainTopic}. Remember that processing these thoughts is a brave step toward healing.`,
    `Difficult days with ${mainTopic} happen. Give yourself the grace to rest and recharge. You are doing your best.`
  ];

  const neutralPool = [
    `Thank you for sharing your reflection on ${mainTopic}. Taking this time to look inward is a powerful act of self-care.`,
    `Checking in with yourself about ${mainTopic} is a great habit. It helps keep you grounded in the present.`,
    `I appreciate you documenting your thoughts on ${mainTopic}. Self-awareness is the true foundation of growth.`,
    `Your quiet reflection on ${mainTopic} shows a deep level of mindfulness. Stay curious about your journey.`
  ];

  const getRandom = (pool) => pool[Math.floor(Math.random() * pool.length)];

  if (analysis.score < 0) return getRandom(negativePool);
  if (analysis.score > 2) return getRandom(positivePool);
  return getRandom(neutralPool);
};

// --- AUTH ROUTES---
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const users = JSON.parse(fs.readFileSync('users.json'));
    if (users.find(u => u.email === email)) return res.status(400).json({ message: "User already exists!" });
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword, name, isNew: true });
    fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));
    /*SEND EMAIL */
    try {
      await transporter.sendMail({
        from: '"Serenova" <mk07jaspreetsingh@gmail.com>',
        to: email,
        subject: "Welcome to Serenova",
        html: `<h2>Hello ${name}</h2><p>Welcome to Serenova. We hope you will have a great experience.</p>`
      });
    } catch (err) {
      console.log("Email error:", err.message);
    }
    res.status(201).json({ 
  message: "User registered successfully!",
  name,
  isNew: true
});
  } catch{ res.status(500).json({ message: "Server error" }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = JSON.parse(fs.readFileSync('users.json'));
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ message: "User does not exist. Please sign up." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }
    res.status(200).json({
      message: "Login successful!",
      name: user.name,
      isNew: user.isNew === true
    });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// --- AI ASSESSMENT LOGIC (Updated for History) ---
app.post('/api/assessment', (req, res) => {
  try {
    const assessmentData = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      data: req.body
    };

    fs.writeFileSync('./latest_assessment.json', JSON.stringify(req.body, null, 2));

    const history = JSON.parse(fs.readFileSync('./assessment_history.json'));
    history.push(assessmentData);
    fs.writeFileSync('./assessment_history.json', JSON.stringify(history, null, 2));

    if (fs.existsSync('./ai_output.json')) fs.unlinkSync('./ai_output.json');
    const pythonProcess = spawn('python', ['./ml_model/predict.py']);
    let scriptOutput = "";
    pythonProcess.stdout.on('data', (data) => { scriptOutput += data.toString(); });
    pythonProcess.on('close', (code) => {
      try {
        const resultObj = JSON.parse(scriptOutput.trim());
        fs.writeFileSync('./ai_output.json', JSON.stringify({ status: "complete", prediction: resultObj.result }));
      } catch (err) { console.error("AI parse error"); }
    });
    res.status(200).json({ message: "Assessment saved to history!" });
  } catch (error) { res.status(500).json({ message: "Error" }); }
});

app.get('/api/check-status', (req, res) => {
  if (fs.existsSync('./ai_output.json')) res.json(JSON.parse(fs.readFileSync('./ai_output.json')));
  else res.json({ status: "processing" });
});

// NEW: Get assessment history for Progress Page
app.get('/api/assessment-history', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync('./assessment_history.json'));
    res.json(data);
  } catch (error) { res.status(500).json({ message: "History fetch error" }); }
});

// --- NEW: AGGREGATED STATS FOR PROGRESS PAGE ---
app.get('/api/progress-stats', (req, res) => {
  try {
    const journals = JSON.parse(fs.readFileSync('./journals.json'));
    const assessments = JSON.parse(fs.readFileSync('./assessment_history.json'));

    // Calculate Streak
    let streak = 0;
    if (journals.length > 0) {
      const dates = journals.map(j => new Date(j.date).setHours(0,0,0,0)).sort((a,b) => b-a);
      const uniqueDates = [...new Set(dates)];
      let today = new Date().setHours(0,0,0,0);
      
      if (uniqueDates[0] === today || uniqueDates[0] === today - 86400000) {
        streak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
          if (uniqueDates[i] - uniqueDates[i+1] === 86400000) streak++;
          else break;
        }
      }
    }

    res.json({
      totalJournals: journals.length,
      totalAssessments: assessments.length,
      streak: streak,
      latestAssessment: assessments[assessments.length - 1] || null
    });
  } catch (error) { res.status(500).json({ message: "Stats fetch error" }); }
});

// --- JOURNAL ROUTES (Original) ---
app.get('/api/journals', (req, res) => {
  const { email } = req.query;

  const data = JSON.parse(fs.readFileSync('./journals.json'));

  // 🔥 FILTER ONLY THIS USER DATA
  const userData = data.filter(j => j.email === email);

  res.json(userData.reverse());
});

app.post('/api/journals', (req, res) => {
  const { text, email } = req.body;
  const analysis = sentiment.analyze(text);
  const newEntry = {
    id: Date.now(),
    email,
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    text,
    advice: generateVariedFeedback(text),
    positivity: Math.round(Math.min(Math.max(50 + (analysis.score * 5), 10), 95))
  };
  const journals = JSON.parse(fs.readFileSync('./journals.json'));
  journals.push(newEntry);
  fs.writeFileSync('./journals.json', JSON.stringify(journals, null, 2));
  res.json(newEntry);
});

app.delete('/api/journals/:id', (req, res) => {
  let journals = JSON.parse(fs.readFileSync('./journals.json'));
  journals = journals.filter(j => j.id !== parseInt(req.params.id));
  fs.writeFileSync('./journals.json', JSON.stringify(journals, null, 2));
  res.json({ success: true });
});
app.post('/api/complete-assessment', (req, res) => {
  try {
    const { email } = req.body;

    const users = JSON.parse(fs.readFileSync('./users.json'));
    const user = users.find(u => u.email === email);

    if (user) {
      user.isNew = false;
      fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: "Error updating user" });
  }
});
app.listen(PORT, () => console.log(`Server breathing at http://localhost:${PORT}`));