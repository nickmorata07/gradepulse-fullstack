CREATE ROLE anon; CREATE ROLE authenticated;
CREATE SCHEMA auth;
CREATE TABLE auth.users(id UUID PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS UUID LANGUAGE SQL AS $$ SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
INSERT INTO auth.users VALUES ('USER_ALICE'),('USER_BOB');
CREATE TABLE courses(id BIGSERIAL PRIMARY KEY,course_code VARCHAR(30) NOT NULL,course_name VARCHAR(120) NOT NULL,target_grade NUMERIC(5,2) NOT NULL,created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE category_weights(id BIGSERIAL PRIMARY KEY,course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,category_name VARCHAR(80),weight_percentage NUMERIC(5,2),created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE assessment_scores(id BIGSERIAL PRIMARY KEY,category_id BIGINT REFERENCES category_weights(id) ON DELETE CASCADE,item_name VARCHAR(100),score NUMERIC(8,2),max_score NUMERIC(8,2),created_at TIMESTAMPTZ DEFAULT NOW());
INSERT INTO courses(course_code,course_name,target_grade) VALUES('LEGACY','Existing preserved course',90);
