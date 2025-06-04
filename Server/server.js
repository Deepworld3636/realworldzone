// server/server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = 3000;
const uri = process.env.MONGODB_URI;

let db, users;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Dashboard page
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

// MongoDB connection
async function connectToDatabase() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db("myappdb");
    users = db.collection("users");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

// DB Check
app.get('/add-user', async (req, res) => {
  try {
    const count = await users.countDocuments();
    res.send(`✅ MongoDB is working. Current users: ${count}`);
  } catch (error) {
    console.error("❌ DB error:", error.message);
    res.status(500).send("❌ MongoDB is not connected.");
  }
});

// Insert user
app.post('/add-user', async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await users.insertOne({ name, email });
    res.send(`✅ User inserted with ID: ${result.insertedId}`);
  } catch (error) {
    console.error("❌ Insert error:", error.message);
    res.status(500).send("❌ Failed to insert user.");
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const allUsers = await users.find().toArray();
    res.json(allUsers);
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
    res.status(500).send("❌ Failed to fetch users.");
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await users.deleteOne({ _id: new ObjectId(id) });
    res.send({ deleted: result.deletedCount > 0 });
  } catch (error) {
    console.error("❌ Delete error:", error.message);
    res.status(500).send("❌ Failed to delete user.");
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email } = req.body;
    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, email } }
    );
    res.send({ updated: result.modifiedCount > 0 });
  } catch (error) {
    console.error("❌ Update error:", error.message);
    res.status(500).send("❌ Failed to update user.");
  }
});

// Start server after DB connects
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});
