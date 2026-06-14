require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

console.log("🚀 Iniciando conexão com Mongo...");

if (!process.env.MONGO_URL) {
  console.log("❌ MONGO_URL não encontrada no .env");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.log("❌ JWT_SECRET não encontrada no .env");
  process.exit(1);
}

console.log("MONGO_URL starts with:", process.env.MONGO_URL.slice(0, 10));

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Mongo conectado"))
  .catch((err) => console.log("❌ Erro Mongo:", err.message));

const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  userId: String,
});

const Contact = mongoose.model("Contact", ContactSchema);

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.post("/contacts", auth, async (req, res) => {
  try {
    const contact = await Contact.create({
      ...req.body,
      userId: req.userId,
    });

    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contact),
        });

        console.log("✅ send to n8n");
      } catch (n8nError) {
        console.log("⚠️ n8n erro:", n8nError.message);
      }
    }

    res.json(contact);
  } catch (err) {
    console.log("❌ Erro:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/contacts", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({
      userId: req.userId,
    }).sort({ _id: -1 });

    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/contacts/:id", auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      req.body,
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/contacts/:id", auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
    });

    res.json({
      message: "User registered successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});