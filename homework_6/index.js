import express from "express";
import dotenv from "dotenv";
import pool, { checkConnection } from "./db.js";

dotenv.config({ override: true });

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware для обработки JSON-данных
app.use(express.json());

// Middleware для обработки URL-кодированных данных
app.use(express.urlencoded({ extended: true }));

// GET-запрос на главную страницу
app.get("/", (req, res) => {
  try {
    res.status(200).send("Hello, World!");
  } catch (error) {
    console.error("GET / error:", error.message);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// POST-запрос на главную страницу
app.post("/", (req, res) => {
  try {
    // Проверяем, были ли переданы данные
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: "Request body is required",
      });
    }

    res.status(200).json({
      message: "Data received successfully",
      data: req.body,
    });
  } catch (error) {
    console.error("POST / error:", error.message);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// GET-запрос для получения всех продуктов
app.get("/products", async (req, res) => {
  try {
    const sql = "SELECT * FROM products";

    const [products] = await pool.query(sql);

    res.status(200).json(products);
  } catch (error) {
    console.error("GET /products error:", error.message);

    res.status(500).json({
      error: "Failed to get products",
    });
  }
});

// POST-запрос для добавления нового продукта
app.post("/products", async (req, res) => {
  try {
    const { name, price } = req.body;

    // Проверяем название продукта
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        error: "Product name is required",
      });
    }

    // Проверяем цену продукта
    if (price === undefined || price === null || price === "") {
      return res.status(400).json({
        error: "Product price is required",
      });
    }

    const numericPrice = Number(price);

    // Проверяем, является ли цена корректным числом
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        error: "Product price must be a valid number",
      });
    }

    const sql = `
            INSERT INTO products (name, price)
            VALUES (?, ?)
        `;

    const params = [name.trim(), numericPrice];

    const [result] = await pool.execute(sql, params);

    res.status(201).json({
      message: "Product added successfully",
      product: {
        id: result.insertId,
        name: name.trim(),
        price: numericPrice,
      },
    });
  } catch (error) {
    console.error("POST /products error:", error.message);

    res.status(500).json({
      error: "Failed to add product",
    });
  }
});

// Обработка неправильного маршрута
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Запуск сервера
async function startServer() {
  try {
    // Проверяем подключение к MySQL
    await checkConnection();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
}

startServer();
