require("dotenv").config({ quiet: true });
const express = require("express");
const path = require("path");
const studentService = require("./studentService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

// ---------- Helpers ----------

// Check the student data. Returns an error message, or null if it's all good.
function validateStudent(body) {
  const { name, email, age, course } = body || {};
  if (!name || String(name).trim() === "") return "Name is required";
  if (!email || String(email).trim() === "") return "Email is required";
  if (!/^\S+@\S+\.\S+$/.test(email)) return "Email is not valid";
  if (age === undefined || age === null || age === "") return "Age is required";
  if (!Number.isInteger(Number(age)) || Number(age) < 1) return "Age must be a whole number";
  if (!course || String(course).trim() === "") return "Course is required";
  return null;
}

// Check that an id is a positive whole number
function isValidId(id) {
  return /^\d+$/.test(id) && Number(id) > 0;
}

// ---------- Routes ----------
// Search and filter MUST come before /:id,
// or Express would think "search" is an id.

// GET search by name  /api/students/search?name=jo
app.get("/api/students/search", async (req, res) => {
  const name = (req.query.name || "").trim();
  if (!name) {
    return res.status(400).json({ message: "Please provide a name to search" });
  }
  try {
    const students = await studentService.searchStudents(name);
    res.status(200).json(students);
  } catch (err) {
    console.error("Search failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET filter by course  /api/students/filter?course=React
app.get("/api/students/filter", async (req, res) => {
  const course = (req.query.course || "").trim();
  if (!course) {
    return res.status(400).json({ message: "Please provide a course" });
  }
  try {
    const students = await studentService.filterStudentsByCourse(course);
    res.status(200).json(students);
  } catch (err) {
    console.error("Filter failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all students
app.get("/api/students", async (req, res) => {
  try {
    const students = await studentService.getStudents();
    res.status(200).json(students);
  } catch (err) {
    console.error("Get students failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET one student by id
app.get("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid student id" });
  }
  try {
    const student = await studentService.getStudentById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (err) {
    console.error("Get student failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create a new student
app.post("/api/students", async (req, res) => {
  // 1. Validate FIRST
  const error = validateStudent(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  // 2. Only now pull the values out
  const { name, email, age, course } = req.body;

  try {
    const student = await studentService.createStudent(
      name.trim(), email.trim(), Number(age), course.trim()
    );
    res.status(201).json(student);
  } catch (err) {
    // 3. Duplicate email = the user's mistake (400), not a server error
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "A student with that email already exists" });
    }
    console.error("Create student failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update a student by id
app.put("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid student id" });
  }

  const error = validateStudent(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { name, email, age, course } = req.body;

  try {
    const student = await studentService.updateStudent(
      id, name.trim(), email.trim(), Number(age), course.trim()
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "A student with that email already exists" });
    }
    console.error("Update student failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a student by id
app.delete("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ message: "Invalid student id" });
  }
  try {
    const deleted = await studentService.deleteStudent(id);
    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("Delete student failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// If someone sends broken JSON, reply 400 instead of crashing
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});