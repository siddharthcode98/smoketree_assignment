import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pathToDB = path.join(__dirname, "userAddressDetails.db");

let db = null;

const startServerAndConnectDB = async () => {
  try {
    db = await open({ filename: pathToDB, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("server is listening at https://localhost:3000/...");
    });
  } catch (error) {
    console.log(`DB Error:${error.message}`);
  }
};

startServerAndConnectDB();

//Register

app.post("/register", async (req, res) => {
  try {
    const { name, address } = req.body;
    const getUser = `SELECT id from User WHERE name=?;`;
    const user = await db.get(getUser, [name]);
    if (user !== undefined) {
      const updateAddress = `INSERT INTO Address(address,user_id) VALUES(?,?);`;
      const data = await db.run(updateAddress, [address, user.id]);
      res.send("User Address created Successfully");
      res.status(200);
    } else {
      const insertNameIntoNameTable = `INSERT INTO User(name) VALUES(?);`;
      await db.run(insertNameIntoNameTable, [name]);
      const getUser = `SELECT id from User WHERE name=?;`;
      const user = await db.get(getUser, [name]);
      const createNewAddress = `INSERT INTO Address(user_id,address) VALUES(?,?);`;
      const data = await db.run(createNewAddress, [user.id, address]);
      res.send("New User with Address is created successfully");
      res.status(200);
    }
  } catch (error) {
    res.send("error occurred");
  }
});
