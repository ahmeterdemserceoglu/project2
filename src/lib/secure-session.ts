import CryptoJS from 'crypto-js';

// Güvenli session yönetimi için utility
class SecureSessionManager {
  private readonly SECRET_KEY = process.env.NEXT_PUBLIC_SESSION_SECRET || 'hdticaret-default-key-2024';
  private readonly STORAGE_KEY = 'hdticaret_secure_session';
  private readonly EXPIRY_KEY = 'hdticaret_session_expiry';

  // Session'ı şifreyerek localStorage'ye kaydet
  setSecureSession(sessionData: any): void {
    try {
      const dataString = JSON.stringify(sessionData);
      const encrypted = CryptoJS.AES.encrypt(dataString, this.SECRET_KEY).toString();
      
      // Expiry time (24 saat)
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      
      localStorage.setItem(this.STORAGE_KEY, encrypted);
      localStorage.setItem(this.EXPIRY_KEY, expiryTime.toString());
      
    } catch (error) {
    }
  }

  // Şifrelenmiş session'ı localStorage'den oku
  getSecureSession(): any | null {
    try {
      const encrypted = localStorage.getItem(this.STORAGE_KEY);
      const expiryTime = localStorage.getItem(this.EXPIRY_KEY);
      
      if (!encrypted || !expiryTime) {
        return null;
      }

      // Expiry kontrolü
      if (Date.now() > parseInt(expiryTime)) {
        this.clearSecureSession();
        return null;
      }

      const decrypted = CryptoJS.AES.decrypt(encrypted, this.SECRET_KEY);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) {
        return null;
      }

      return JSON.parse(decryptedString);
    } catch (error) {
      this.clearSecureSession();
      return null;
    }
  }

  // Session'ı temizle
  clearSecureSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
  }

  // Session'ın geçerli olup olmadığını kontrol et
  isSessionValid(): boolean {
    const session = this.getSecureSession();
    return session !== null;
  }

  // Session'ı yenile (expiry time'ı güncelle)
  refreshSession(): void {
    const session = this.getSecureSession();
    if (session) {
      this.setSecureSession(session);
    }
  }
}

export const secureSessionManager = new SecureSessionManager();

// Cross-domain session sync için event listener
export const setupCrossDomainSync = () => {
  if (typeof window === 'undefined') return;

  // Ana domain'den session güncellemelerini dinle
  window.addEventListener('storage', (event) => {
    if (event.key === 'hdticaret_secure_session') {
      // Session güncellendiğinde sayfayı yenile veya state'i güncelle
      window.location.reload();
    }
  });

  // Subdomain ile ana domain arasında session sync
  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    
    if (event.data.type === 'SESSION_UPDATE') {
      secureSessionManager.setSecureSession(event.data.session);
    } else if (event.data.type === 'SESSION_CLEAR') {
      secureSessionManager.clearSecureSession();
    }
  });
};
