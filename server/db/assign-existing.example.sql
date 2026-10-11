DO $$
DECLARE owner_id UUID; assigned INTEGER;
BEGIN
 SELECT id INTO owner_id FROM auth.users WHERE lower(email)=lower('nickmorata07@gmail.com');
 IF owner_id IS NULL THEN RAISE EXCEPTION 'Account not found. Create your account and replace YOUR_LOGIN_EMAIL first.'; END IF;
 UPDATE public.courses SET user_id=owner_id WHERE user_id IS NULL;
 GET DIAGNOSTICS assigned=ROW_COUNT;
 RAISE NOTICE 'Assigned % existing courses. Refresh GradePulse.',assigned;
END $$;
