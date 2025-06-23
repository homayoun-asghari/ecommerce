import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const db = new pg.Client({
  connectionString: process.env.PG_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

db.connect()
  .then(() => console.log("Connected to database"))
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

export default db;
