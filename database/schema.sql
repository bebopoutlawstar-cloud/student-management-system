-- 1. Create the database
CREATE DATABASE IF NOT EXISTS school_db;

-- 2. Select it
USE school_db;

-- 3. Create the students table
CREATE TABLE IF NOT EXISTS students (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    name   VARCHAR(100) NOT NULL,
    email  VARCHAR(150) NOT NULL UNIQUE,
    age    INT NOT NULL,
    course VARCHAR(50)  NOT NULL
);
-- 4. Add sample students
INSERT INTO students (name, email, age, course) VALUES
    ('John Smith',   'john@gmail.com',   22, 'React'),
    ('Ali Khan',     'ali@gmail.com',    23, 'Node.js'),
    ('Maria Garcia', 'maria@gmail.com',  21, 'Python'),
    ('Chen Wei',     'chen@gmail.com',   25, 'JavaScript'),
    ('Sara Johnson', 'sara@gmail.com',   24, 'Next.js'),
    ('Johnny Lee',   'johnny@gmail.com', 20, 'React');

-- 5. Show what we added
SELECT * FROM students;

-- 2. Select it
USE school_db;

-- Start fresh: delete the old table if there is one
DROP TABLE IF EXISTS students;

-- 3. Create the students table
CREATE TABLE IF NOT EXISTS students (