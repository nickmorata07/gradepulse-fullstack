CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  course_code VARCHAR(30) NOT NULL,
  course_name VARCHAR(120) NOT NULL,
  target_grade NUMERIC(5,2) NOT NULL DEFAULT 90.00 CHECK (target_grade >= 0 AND target_grade <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS category_weights (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  category_name VARCHAR(80) NOT NULL,
  weight_percentage NUMERIC(5,2) NOT NULL CHECK (weight_percentage > 0 AND weight_percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_scores (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES category_weights(id) ON DELETE CASCADE,
  item_name VARCHAR(100) NOT NULL,
  score NUMERIC(8,2) NOT NULL CHECK (score >= 0),
  max_score NUMERIC(8,2) NOT NULL CHECK (max_score > 0 AND score <= max_score),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_course_id ON category_weights(course_id);
CREATE INDEX IF NOT EXISTS idx_assessments_category_id ON assessment_scores(category_id);
