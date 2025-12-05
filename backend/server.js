import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bd from "./src/models/index.js";
import { connectRedis } from "./src/config/redis.js";
import redisClient from "./src/config/redis.js";
import supabase from "./src/config/supabase.js";
import multer from "multer";
import env from "./src/config/env.js";
import { registerUser, loginUser, generateToken } from "./src/services/auth.js";
import authMiddleware from "./src/middleware/auth.js";

dotenv.config();

const { Task, User } = bd;
const CACHE_KEY_TASKS = `${env.cache.namespace}:tasks`;
const { supabaseBucket } = env.storage;

// Configuração do Multer
const upload = multer({ storage: multer.memoryStorage() });

// Testa a conexão com o banco de dados e Redis
try {
  await bd.sequelize.authenticate();
  console.log("Conexão com o banco de dados estabelecida com sucesso.");
  await connectRedis();
} catch (error) {
  console.error("Erro ao conectar ao banco de dados ou Redis:", error);
  process.exit(1);
}

const app = express();
const port = env.app.port;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

// Auth routes
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
  }
  try {
    const user = await registerUser({ name, email, password });
    const token = generateToken(user);
    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email },
      accessToken: token,
    });
  } catch (error) {
    if (error.code === "EMAIL_IN_USE") {
      return res.status(409).json({ error: "Email já cadastrado" });
    }
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }
  try {
    const { user, token } = await loginUser({ email, password });
    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      accessToken: token,
    });
  } catch (error) {
    if (error.code === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro ao autenticar" });
  }
});

app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email"],
    });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    res.status(500).json({ error: "Erro ao carregar perfil" });
  }
});

// Cache Miss e Hit na rota de listagem de tasks
app.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const cachedTasks = await redisClient.get(CACHE_KEY_TASKS);
    if (cachedTasks) {
      console.log("Cache Hit");
      return res.json(JSON.parse(cachedTasks));
    }

    console.log("Cache Miss");
    const tasks = await Task.findAll();
    await redisClient.set(CACHE_KEY_TASKS, JSON.stringify(tasks), {
      EX: env.cache.ttlSeconds,
    });
    res.json(tasks);
  } catch (error) {
    console.error("Erro ao buscar tasks:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/tasks", authMiddleware, async (req, res) => {
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: "Descrição obrigatória" });

  try {
    const task = await Task.create({ description, completed: false });
    // Invalidação do cache
    await redisClient.del(CACHE_KEY_TASKS);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar tarefa" });
  }
});

app.get("/tasks/:id", authMiddleware, async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).json({ error: "Tarefa não encontrada" });
  res.json(task);
});

app.put("/tasks/:id", authMiddleware, async (req, res) => {
  const { description, completed } = req.body;
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: "Tarefa não encontrada" });
    await task.update({ description, completed });
    // Invalidação do cache
    await redisClient.del(CACHE_KEY_TASKS);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar tarefa" });
  }
});

app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Task.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Tarefa não encontrada" });
    // Invalidação do cache
    await redisClient.del(CACHE_KEY_TASKS);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar tarefa" });
  }
});

// Rota de upload de foto de perfil
app.post("/profile/photo", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  try {
    const file = req.file;
    const fileName = `profile_${Date.now()}_${file.originalname}`;

    const { data, error } = await supabase.storage
      .from(supabaseBucket) // Certifique-se de criar este bucket no Supabase
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(supabaseBucket)
      .getPublicUrl(fileName);

    res.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    res.status(500).json({ error: "Erro ao fazer upload da imagem" });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Database is running on port ${process.env.DB_PORT}`);
});
