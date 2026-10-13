-- PrimeCuts OS Operations draft. DO NOT APPLY until the single approved release window.
-- Uses existing pc_projects + pc_client_accounts + pc_project_members from v0.4.
CREATE TABLE IF NOT EXISTS public.pc_ops_staff (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE,
 name text NOT NULL, password_hash text NOT NULL, role text NOT NULL
 CHECK(role IN ('manager','secretary','producer','editor','crew','accountant','casting')),
 all_projects boolean NOT NULL DEFAULT false, disabled boolean NOT NULL DEFAULT false,
 session_version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(email=lower(btrim(email)) AND length(email) BETWEEN 5 AND 254), CHECK(length(name) BETWEEN 2 AND 120)
);
CREATE TABLE IF NOT EXISTS public.pc_ops_staff_invites (
 token_hash text PRIMARY KEY CHECK (length(token_hash)=64), email text NOT NULL,
 name text NOT NULL, role text NOT NULL CHECK(role IN ('manager','secretary','producer','editor','crew','accountant','casting')),
 all_projects boolean NOT NULL DEFAULT false, expires_at timestamptz NOT NULL,
 redeemed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.pc_ops_staff_projects (
 staff_id uuid NOT NULL REFERENCES public.pc_ops_staff(id) ON DELETE CASCADE,
 project_id uuid NOT NULL REFERENCES public.pc_projects(id) ON DELETE CASCADE,
 PRIMARY KEY(staff_id,project_id)
);
CREATE INDEX IF NOT EXISTS pc_ops_staff_projects_project_idx ON public.pc_ops_staff_projects(project_id);
CREATE TABLE IF NOT EXISTS public.pc_ops_talents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, email text NOT NULL UNIQUE,
 phone text, location text, portfolio_url text, password_hash text NOT NULL,
 disabled boolean NOT NULL DEFAULT false, session_version integer NOT NULL DEFAULT 1,
 email_verified boolean NOT NULL DEFAULT false, consent_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now(), CHECK(email=lower(btrim(email)))
);
CREATE TABLE IF NOT EXISTS public.pc_ops_castings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid REFERENCES public.pc_projects(id) ON DELETE SET NULL,
 slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]{6,100}$'),
 title text NOT NULL, description text NOT NULL DEFAULT '', requirements text NOT NULL DEFAULT '',
 location text NOT NULL DEFAULT '', compensation text NOT NULL DEFAULT '',
 closes_at timestamptz, status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','open','closed')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.pc_ops_applications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), casting_id uuid NOT NULL REFERENCES public.pc_ops_castings(id) ON DELETE CASCADE,
 talent_id uuid NOT NULL REFERENCES public.pc_ops_talents(id) ON DELETE CASCADE,
 intro text NOT NULL DEFAULT '', audition_url text,
 status text NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','shortlisted','audition','selected','declined')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(casting_id,talent_id)
);
CREATE INDEX IF NOT EXISTS pc_ops_apps_casting_idx ON public.pc_ops_applications(casting_id,created_at DESC);
CREATE TABLE IF NOT EXISTS public.pc_ops_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.pc_projects(id) ON DELETE CASCADE,
 category text NOT NULL CHECK(category IN ('task','schedule','location','lookbook','crew','media','budget','document','contract','approval','message')),
 title text NOT NULL, detail text NOT NULL DEFAULT '', reference_url text,
 amount_cents bigint CHECK(amount_cents BETWEEN 0 AND 1000000000), due_at timestamptz,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','review','approved','changes','completed','cancelled')),
 visible_client boolean NOT NULL DEFAULT false, visible_team boolean NOT NULL DEFAULT true,
 assigned_staff_id uuid REFERENCES public.pc_ops_staff(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pc_ops_items_project_idx ON public.pc_ops_items(project_id,category,created_at DESC);
CREATE TABLE IF NOT EXISTS public.pc_ops_comments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_id uuid NOT NULL REFERENCES public.pc_ops_items(id) ON DELETE CASCADE,
 author_type text NOT NULL CHECK(author_type IN ('owner','staff','client')),
 author_id uuid, message text NOT NULL CHECK(length(message) BETWEEN 1 AND 3000),
 visible_client boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pc_ops_comments_item_idx ON public.pc_ops_comments(item_id,created_at);
CREATE TABLE IF NOT EXISTS public.pc_ops_responses (
 item_id uuid NOT NULL REFERENCES public.pc_ops_items(id) ON DELETE CASCADE,
 account_id uuid NOT NULL REFERENCES public.pc_client_accounts(id) ON DELETE CASCADE,
 response text NOT NULL CHECK(response IN ('approved','changes_requested')),
 note text NOT NULL DEFAULT '', responded_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(item_id,account_id)
);
CREATE TABLE IF NOT EXISTS public.pc_ops_signatures (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_id uuid NOT NULL REFERENCES public.pc_ops_items(id) ON DELETE CASCADE,
 account_id uuid NOT NULL REFERENCES public.pc_client_accounts(id) ON DELETE CASCADE,
 document_sha256 text NOT NULL CHECK(length(document_sha256)=64), typed_name text NOT NULL,
 consent_text text NOT NULL, signer_ip_hash text NOT NULL, signed_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(item_id,account_id)
);
CREATE TABLE IF NOT EXISTS public.pc_ops_audit (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor_type text NOT NULL,
 actor_id uuid, action text NOT NULL, entity text NOT NULL, entity_id uuid,
 metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pc_ops_audit_created_idx ON public.pc_ops_audit(created_at DESC);
CREATE TABLE IF NOT EXISTS public.pc_ops_login_attempts (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, ip_hash text NOT NULL,
 area text NOT NULL, occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pc_ops_attempts_idx ON public.pc_ops_login_attempts(ip_hash,area,occurred_at DESC);
DO $$ DECLARE n text; BEGIN
 FOREACH n IN ARRAY ARRAY['pc_ops_staff','pc_ops_staff_invites','pc_ops_staff_projects','pc_ops_talents','pc_ops_castings','pc_ops_applications','pc_ops_items','pc_ops_comments','pc_ops_responses','pc_ops_signatures','pc_ops_audit','pc_ops_login_attempts'] LOOP
 EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',n);
 EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated',n);
 EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON public.%I TO service_role',n);
 END LOOP;
END $$;
REVOKE ALL ON SEQUENCE public.pc_ops_audit_id_seq,public.pc_ops_login_attempts_id_seq FROM PUBLIC,anon,authenticated;
GRANT USAGE,SELECT ON SEQUENCE public.pc_ops_audit_id_seq,public.pc_ops_login_attempts_id_seq TO service_role;
-- Redeem staff invite transactionally; only privileged server role can call it.
CREATE OR REPLACE FUNCTION public.pc_ops_redeem_staff_invite(p_token_hash text,p_password_hash text)
 RETURNS TABLE(staff_id uuid) LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE i public.pc_ops_staff_invites%ROWTYPE; ident uuid;
BEGIN
 SELECT * INTO i FROM public.pc_ops_staff_invites WHERE token_hash=p_token_hash AND redeemed_at IS NULL AND expires_at>now() FOR UPDATE;
 IF NOT FOUND OR p_password_hash IS NULL OR length(p_password_hash)<100 THEN RETURN; END IF;
 INSERT INTO public.pc_ops_staff(email,name,role,password_hash,all_projects)
 VALUES(i.email,i.name,i.role,p_password_hash,i.all_projects)
 ON CONFLICT(email) DO NOTHING RETURNING id INTO ident;
 IF ident IS NULL THEN RETURN; END IF;
 UPDATE public.pc_ops_staff_invites SET redeemed_at=now() WHERE token_hash=p_token_hash;
 staff_id:=ident; RETURN NEXT;
END $$;
REVOKE ALL ON FUNCTION public.pc_ops_redeem_staff_invite(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.pc_ops_redeem_staff_invite(text,text) TO service_role;
