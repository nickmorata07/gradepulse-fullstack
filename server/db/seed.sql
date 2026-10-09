TRUNCATE TABLE assessment_scores, category_weights, courses RESTART IDENTITY CASCADE;

INSERT INTO courses (course_code, course_name, target_grade) VALUES
  ('CS-401', 'Application and Systems Integration', 92.00),
  ('CS-302', 'Data Structures and Algorithms', 88.00),
  ('IT-305', 'Database Management Systems', 90.00);

INSERT INTO category_weights (course_id, category_name, weight_percentage) VALUES
  (1, 'Quizzes', 20.00), (1, 'Laboratory Exercises', 30.00), (1, 'Exams', 50.00),
  (2, 'Quizzes', 25.00), (2, 'Projects', 35.00), (2, 'Exams', 40.00);

INSERT INTO assessment_scores (category_id, item_name, score, max_score) VALUES
  (1, 'Quiz 1', 18, 20), (1, 'Quiz 2', 17, 20),
  (2, 'Lab Activity 1', 46, 50), (3, 'Midterm Exam', 42, 50),
  (4, 'Quiz 1', 16, 20), (5, 'Mini Project', 88, 100);
