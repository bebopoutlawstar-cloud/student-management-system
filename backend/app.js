require("dotenv").config({ quiet: true });
const express = require("express");
const path = require("path");
const studentService = require("./studentService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

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
  try {
    const student = await studentService.getStudentById(req.params.id);
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
  try {
    const { name, email, age, course } = req.body;
    const student = await studentService.createStudent(name, email, age, course);
    res.status(201).json(student);
  } catch (err) {
    console.error("Create student failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update a student by id
app.put("/api/students/:id", async (req, res) => {
  try {
    const { name, email, age, course } = req.body;
    const student = await studentService.updateStudent(req.params.id, name, email, age, course);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (err) {
    console.error("Update student failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a student by id
app.delete("/api/students/:id", async (req, res) => {
  try {
    const deleted = await studentService.deleteStudent(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted" });
  } catch (err) {
    console.error("Delete student failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});