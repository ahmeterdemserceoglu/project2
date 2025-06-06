-- Kullanıcının email doğrulamasını yapan SQL fonksiyonu
CREATE OR REPLACE FUNCTION public.admin_confirm_user_email(input_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Bu fonksiyon çağıran kişinin haklarıyla değil oluşturan kişinin (sistem) haklarıyla çalışır
SET search_path = public
AS $$
BEGIN
  -- auth.users tablosunda email_confirmed_at alanını güncelle
  UPDATE auth.users
  SET 
    email_confirmed_at = NOW(),
    confirmation_token = '',
    confirmation_sent_at = NULL,
    updated_at = NOW()
  WHERE id = input_user_id;
  
  RETURN FOUND; -- Güncelleme başarılı olursa TRUE döner
END;
$$; 