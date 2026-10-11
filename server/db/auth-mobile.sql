-- Apply in your EXISTING Supabase project. No existing grades are deleted.
-- Old courses remain unassigned until you explicitly give them an owner.
BEGIN;
ALTER TABLE public.category_weights ADD COLUMN IF NOT EXISTS is_complete BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses(user_id);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_scores ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.courses, public.category_weights, public.assessment_scores FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses, public.category_weights, public.assessment_scores TO authenticated;

-- Both a permissive owner policy and a restrictive owner guard are added.
-- The restrictive guard prevents older broad policies from exposing others' rows.
DO $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='courses' AND policyname='gradepulse_owner_access') THEN
  CREATE POLICY gradepulse_owner_access ON public.courses FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='courses' AND policyname='gradepulse_owner_guard') THEN
  CREATE POLICY gradepulse_owner_guard ON public.courses AS RESTRICTIVE FOR ALL TO public USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='category_weights' AND policyname='gradepulse_category_access') THEN
  CREATE POLICY gradepulse_category_access ON public.category_weights FOR ALL TO authenticated USING(EXISTS(SELECT 1 FROM public.courses c WHERE c.id=course_id AND c.user_id=auth.uid())) WITH CHECK(EXISTS(SELECT 1 FROM public.courses c WHERE c.id=course_id AND c.user_id=auth.uid()));
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='category_weights' AND policyname='gradepulse_category_guard') THEN
  CREATE POLICY gradepulse_category_guard ON public.category_weights AS RESTRICTIVE FOR ALL TO public USING(EXISTS(SELECT 1 FROM public.courses c WHERE c.id=course_id AND c.user_id=auth.uid())) WITH CHECK(EXISTS(SELECT 1 FROM public.courses c WHERE c.id=course_id AND c.user_id=auth.uid()));
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='assessment_scores' AND policyname='gradepulse_assessment_access') THEN
  CREATE POLICY gradepulse_assessment_access ON public.assessment_scores FOR ALL TO authenticated USING(EXISTS(SELECT 1 FROM public.category_weights cw JOIN public.courses c ON c.id=cw.course_id WHERE cw.id=category_id AND c.user_id=auth.uid())) WITH CHECK(EXISTS(SELECT 1 FROM public.category_weights cw JOIN public.courses c ON c.id=cw.course_id WHERE cw.id=category_id AND c.user_id=auth.uid()));
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='assessment_scores' AND policyname='gradepulse_assessment_guard') THEN
  CREATE POLICY gradepulse_assessment_guard ON public.assessment_scores AS RESTRICTIVE FOR ALL TO public USING(EXISTS(SELECT 1 FROM public.category_weights cw JOIN public.courses c ON c.id=cw.course_id WHERE cw.id=category_id AND c.user_id=auth.uid())) WITH CHECK(EXISTS(SELECT 1 FROM public.category_weights cw JOIN public.courses c ON c.id=cw.course_id WHERE cw.id=category_id AND c.user_id=auth.uid()));
 END IF;
END $$;
COMMIT;
