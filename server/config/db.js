import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const db = new pg.Client({
    connectionString: process.env.PG_CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect();

export default db;
