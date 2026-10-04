import mysql from "mysql2/promise"; // promise нужен, чтобы писать запросы через async/await
import dotenv from "dotenv";

dotenv.config({ override: true });

export const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true, // Если все соединения заняты, запрос ждет в очереди и не падает
  connectionLimit: 10, // Максимум 10 соединений
  queueLimit: 0, // Очередь ожидания без ограничения
});

// Функция для проверки подключения при старте сервера
export async function checkConnection() {
  const connection = await pool.getConnection(); // Берем соединение из пула

  console.log(`Connected to MySQL database "${dbConfig.database}"`);

  connection.release(); // Обязательно возвращаем соединение обратно в пул
}

export default pool;
