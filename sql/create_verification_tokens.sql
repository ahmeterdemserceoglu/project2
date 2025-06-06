-- E-posta doğrulama tokenları tablosu
CREATE TABLE IF NOT EXISTS verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  CONSTRAINT token_email_unique UNIQUE (email, token)
);

-- RLS Politikaları
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- Admin tüm tokenları görebilir
CREATE POLICY admin_all_tokens ON verification_tokens
  USING (is_admin());

-- Kullanıcılar kendi tokenlarını görebilir
CREATE POLICY user_read_own_tokens ON verification_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Token ile doğrulama yaparken kullanılacak fonksiyon
CREATE OR REPLACE FUNCTION get_token_by_email_and_token(email_param TEXT, token_param TEXT)
RETURNS SETOF verification_tokens
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM verification_tokens
  WHERE email = email_param AND token = token_param AND expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- Index'ler ekleme
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_email ON verification_tokens(email);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON verification_tokens(expires_at); 