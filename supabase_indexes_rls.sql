CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_evidence_user_id ON public.evidence(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_project_id ON public.evidence(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_project_id ON public.submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow insert for authenticated" ON public.users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Projects readable by authenticated" ON public.projects
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Projects insertable by authenticated" ON public.projects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Projects updatable by owner" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Evidence readable by authenticated" ON public.evidence
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Evidence insertable by authenticated" ON public.evidence
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Submissions readable by authenticated" ON public.submissions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Submissions insertable by authenticated" ON public.submissions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Notifications readable by owner" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Transactions readable by owner" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Transactions insertable by authenticated" ON public.transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
