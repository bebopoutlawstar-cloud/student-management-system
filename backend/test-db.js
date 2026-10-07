const db = require("./db");

async function test() {
  const [rows] = await db.execute("SELECT COUNT(*) AS total FROM students");
  console.log("Connected! Students in DB:", rows[0].total);
  process.exit();
}

test();