// The API is on the same server as this page, so a short path works
const API_URL = "/api/students";

// Grab the elements we need from the HTML
const tableBody = document.getElementById("studentTableBody");
const messageEl = document.getElementById("message");

const form = document.getElementById("studentForm");
const studentIdInput = document.getElementById("studentId");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const ageInput = document.getElementById("age");
const courseInput = document.getElementById("course");

// Show a green (success) or red (error) message under the form
function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  setTimeout(() => {
    messageEl.textContent = "";
    messageEl.className = "message";
  }, 3000);
}

// Draw the table rows from an array of students
function renderStudents(students) {
  tableBody.innerHTML = "";

  if (students.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="empty">No students found.</td></tr>`;
    return;
  }

  students.forEach((student) => {
    const row = document.createElement("tr");

    [student.id, student.name, student.email, student.age, student.course].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const actionsCell = document.createElement("td");
    actionsCell.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn btn-small btn-edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn btn-small btn-delete";

    actionsCell.append(editBtn, deleteBtn);
    row.appendChild(actionsCell);
    tableBody.appendChild(row);
  });
}

// GET all students from the API and show them
async function loadStudents() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Could not load students");
    const students = await response.json();
    renderStudents(students);
  } catch (error) {
    console.error(error);
    tableBody.innerHTML = `<tr><td colspan="6" class="empty">Could not connect to the server.</td></tr>`;
  }
}

// Frontend validation - returns an error message, or null if OK
function validateForm(student) {
  if (!student.name) return "Name is required";
  if (!student.email) return "Email is required";
  if (!/^\S+@\S+\.\S+$/.test(student.email)) return "Please enter a valid email";
  if (!student.age) return "Age is required";
  if (!Number.isInteger(Number(student.age)) || Number(student.age) < 1) return "Age must be a whole number";
  if (!student.course) return "Course is required";
  return null;
}

// POST a new student to the API
async function addStudent(student) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
}

// When the form is submitted
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const student = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    age: ageInput.value,
    course: courseInput.value,
  };

  const error = validateForm(student);
  if (error) {
    showMessage(error, "error");
    return;
  }
  student.age = Number(student.age);

  try {
    await addStudent(student);
    showMessage("Student added!", "success");
    form.reset();
    loadStudents();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

loadStudents();
