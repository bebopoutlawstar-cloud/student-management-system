const studentService = require("./studentService");

async function test() {
  const found = await studentService.searchStudents("jo");
  console.log("Search 'jo':", found.map((s) => s.name));

  const react = await studentService.filterStudentsByCourse("React");
  console.log("React students:", react.map((s) => s.name));

  process.exit();
}

test();