import pool from "./db.js";

// Функция для создания таблицы products
async function setupDatabase() {
  try {
    const sql = `
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL
            )
        `;

    await pool.query(sql);

    console.log('Table "products" created successfully');
  } catch (error) {
    console.error("Error creating table:", error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();
