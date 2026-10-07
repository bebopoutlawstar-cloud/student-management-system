const db = require("./db");

// Get every student
async function getStudents() {
  const [rows] = await db.execute("SELECT * FROM students ORDER BY id");
  return rows;
}

// Get one student by id
async function getStudentById(id) {
  const [rows] = await db.execute("SELECT * FROM students WHERE id = ?", [id]);
  return rows[0];
}

// Add a new student, then return it (with its new id)
async function createStudent(name, email, age, course) {
  const [result] = await db.execute(
    "INSERT INTO students (name, email, age, course) VALUES (?, ?, ?, ?)",
    [name, email, age, course]
  );
  return getStudentById(result.insertId);
}

// Change a student's info. Returns undefined if that id doesn't exist.
async function updateStudent(id, name, email, age, course) {
  const [result] = await db.execute(
    "UPDATE students SET name = ?, email = ?, age = ?, course = ? WHERE id = ?",
    [name, email, age, course, id]
  );
  if (result.affectedRows === 0) return undefined;
  return getStudentById(id);
}

// Delete a student. Returns true if deleted, false if the id didn't exist.
async function deleteStudent(id) {
  const [result] = await db.execute("DELETE FROM students WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// Find students whose name contains the search text
async function searchStudents(name) {
  const [rows] = await db.execute(
    "SELECT * FROM students WHERE name LIKE ? ORDER BY id",
    [`%${name}%`]
  );
  return rows;
}

// Get students in one exact course
async function filterStudentsByCourse(course) {
  const [rows] = await db.execute(
    "SELECT * FROM students WHERE course = ? ORDER BY id",
    [course]
  );
  return rows;
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  filterStudentsByCourse,
};
