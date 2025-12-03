import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bd from "./src/models/index.js";
import { connectRedis } from "./src/config/redis.js";
import redisClient from "./src/config/redis.js";
import supabase from "./src/config/supabase.js";
import multer from "multer";

dotenv.config();

const { Task } = bd;

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
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

// Cache Miss e Hit na rota de listagem de tasks
app.get("/tasks", async (req, res) => {
  try {
    const cachedTasks = await redisClient.get("tasks");
    if (cachedTasks) {
      console.log("Cache Hit");
      return res.json(JSON.parse(cachedTasks));
    }

    console.log("Cache Miss");
    const tasks = await Task.findAll();
    await redisClient.set("tasks", JSON.stringify(tasks), {
      EX: 3600, // Expira em 1 hora
    });
    res.json(tasks);
  } catch (error) {
    console.error("Erro ao buscar tasks:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/tasks", async (req, res) => {
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: "Descrição obrigatória" });

  try {
    const task = await Task.create({ description, completed: false });
    // Invalidação do cache
    await redisClient.del("tasks");
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar tarefa" });
  }
});

app.get("/tasks/:id", async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).json({ error: "Tarefa não encontrada" });
  res.json(task);
});

app.put("/tasks/:id", async (req, res) => {
  const { description, completed } = req.body;
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: "Tarefa não encontrada" });
    await task.update({ description, completed });
    // Invalidação do cache
    await redisClient.del("tasks");
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar tarefa" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const deleted = await Task.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Tarefa não encontrada" });
    // Invalidação do cache
    await redisClient.del("tasks");
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
      .from("avatars") // Certifique-se de criar este bucket no Supabase
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
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