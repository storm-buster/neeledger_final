INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read evidence" ON storage.objects
    FOR SELECT USING (bucket_id = 'evidence');

CREATE POLICY "Allow authenticated upload evidence" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'evidence' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public read documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated upload documents" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
