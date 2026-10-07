// The API is on the same server as this page, so a short path works
const API_URL = "/api/students";

// ---------- Grab the elements we need from the HTML ----------
const tableBody = document.getElementById("studentTableBody");
const messageEl = document.getElementById("message");
const form = document.getElementById("studentForm");
const formTitle = document.getElementById("formTitle");
const studentIdInput = document.getElementById("studentId");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const ageInput = document.getElementById("age");
const courseInput = document.getElementById("course");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");

// ---------- Helpers ----------

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

    // textContent (not innerHTML) so student data can't run as code
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
    editBtn.addEventListener("click", () => editStudent(student.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn btn-small btn-delete";
    deleteBtn.addEventListener("click", () => deleteStudent(student.id));

    actionsCell.append(editBtn, deleteBtn);
    row.appendChild(actionsCell);
    tableBody.appendChild(row);
  });
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

// Put the form back into "Add" mode
function resetForm() {
  form.reset();
  studentIdInput.value = "";
  formTitle.textContent = "Add Student";
  submitBtn.textContent = "Add Student";
  cancelBtn.classList.add("hidden");
}

// ---------- READ ----------
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

// ---------- CREATE ----------
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

// ---------- UPDATE step 1: load a student into the form ----------
async function editStudent(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const student = await response.json();
    if (!response.ok) throw new Error(student.message);

    studentIdInput.value = student.id;
    nameInput.value = student.name;
    emailInput.value = student.email;
    ageInput.value = student.age;
    courseInput.value = student.course;

    formTitle.textContent = `Edit Student #${student.id}`;
    submitBtn.textContent = "Update Student";
    cancelBtn.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// ---------- UPDATE step 2: send the changes ----------
async function updateStudent(id, student) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
}

// ---------- DELETE ----------
async function deleteStudent(id) {
  // confirm() shows OK / Cancel. Stop if the user clicks Cancel.
  if (!confirm("Are you sure you want to delete this student?")) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    showMessage("Student deleted", "success");
    if (studentIdInput.value === String(id)) resetForm();
    refreshList();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// ---------- SEARCH ----------
async function searchStudents(name) {
  try {
    const response = await fetch(`${API_URL}/search?name=${encodeURIComponent(name)}`);
    const students = await response.json();
    if (!response.ok) throw new Error(students.message);
    renderStudents(students);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// ---------- FILTER ----------
async function filterStudents(course) {
  try {
    const response = await fetch(`${API_URL}/filter?course=${encodeURIComponent(course)}`);
    const students = await response.json();
    if (!response.ok) throw new Error(students.message);
    renderStudents(students);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// Reload the table, keeping whatever search or filter is active
function refreshList() {
  const name = searchInput.value.trim();
  const course = courseFilter.value;
  if (name) searchStudents(name);
  else if (course) filterStudents(course);
  else loadStudents();
}

// ---------- Event listeners ----------

// Submit = Add OR Update, depending on the hidden id
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
    const id = studentIdInput.value;
    if (id) {
      await updateStudent(id, student);
      showMessage("Student updated!", "success");
    } else {
      await addStudent(student);
      showMessage("Student added!", "success");
    }
    resetForm();
    refreshList();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

cancelBtn.addEventListener("click", resetForm);

// Search as you type (waits 300ms after you stop typing)
let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (searchInput.value.trim()) courseFilter.value = "";
    refreshList();
  }, 300);
});

// Picking a course clears the search box
courseFilter.addEventListener("change", () => {
  searchInput.value = "";
  refreshList();
});

// Load the table when the page opens
loadStudents();