export type Lang = "en" | "tr";
export const LANGS: Lang[] = ["en", "tr"];
export const LANG_COOKIE = "lang";

const en = {
  "nav.history": "History",
  "nav.logout": "Log out",
  "auth.createAccount": "Create account",
  "auth.logIn": "Log in",
  "auth.firstName": "First name",
  "auth.lastName": "Last name",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.passwordNew": "Password (min 8 characters)",
  "auth.register": "Register",
  "auth.noAccount": "No account yet? ",
  "auth.haveAccount": "Already have an account? ",
  "scan.title": "Scan a business card",
  "scan.subtitle": "Take a photo or pick one. AI reads the details for you.",
  "scan.takePhoto": "📷 Take photo",
  "scan.gallery": "🖼️ Choose from gallery",
  "scan.reading": "Reading card…",
  "scan.campaign": "CRM campaign (applies to all synced contacts)",
  "scan.noCampaign": "No campaign",
  "scan.campaignError": "Could not load campaigns",
  "unsynced.title": "Unsynced Contacts ({n})",
  "unsynced.syncAll": "Sync all",
  "unsynced.sync": "Sync",
  "unsynced.syncing": "Syncing…",
  "unsynced.failed": "Last sync failed: {e}",
  "unsynced.dialGuessed": "⚠️ dial code guessed",
  "unsynced.unnamed": "Unnamed",
  "review.rescan": "🔄 Rescan this card",
  "review.rescanHint": "Scan the card again. This replaces the fields below (unsaved edits are lost).",
  "review.cancel": "Cancel",
  "review.rescanned": "✅ Rescanned. Check the fields below.",
  "review.rescanFailed": "Rescan failed",
  "review.save": "Save",
  "review.saved": "✅ Saved",
  "review.addToContacts": "Add to contacts",
  "review.push": "Push to CRM",
  "review.update": "Update in CRM",
  "review.synced": "✅ Synced to the CRM",
  "review.scanAnother": "Scan another",
  "review.dialWarning": "The phone dial code wasn't on the card. AI guessed it from the country/address, so please double-check it.",
  "review.cardAlt": "Scanned card",
  "history.search": "Search cards",
  "history.empty": "No saved cards yet.",
  "history.unnamed": "Unnamed",
  "history.unsynced": "Unsynced",
  "history.delete": "Delete",
  "history.confirmDelete": "Delete this card?",
  "history.loadFailed": "Could not load cards",
  "history.deleteFailed": "Could not delete",
  "field.firstName": "First name",
  "field.lastName": "Last name",
  "field.title": "Title",
  "field.company": "Company",
  "field.email": "Email",
  "field.phone": "Phone",
  "field.mobile": "Mobile",
  "field.website": "Website",
  "field.address": "Address",
  "field.city": "City",
  "field.country": "Country",
  "field.linkedin": "LinkedIn",
  "field.notes": "Notes",
  "field.selectCountry": "Select country…",
  "field.notInList": "{c} (not in list)",
  "field.emailPick": "Several email addresses were found. Choose the one to send to the CRM.",
} as const;

export type Key = keyof typeof en;

const tr: Record<Key, string> = {
  "nav.history": "Geçmiş",
  "nav.logout": "Çıkış yap",
  "auth.createAccount": "Hesap oluştur",
  "auth.logIn": "Giriş yap",
  "auth.firstName": "Ad",
  "auth.lastName": "Soyad",
  "auth.email": "E-posta",
  "auth.password": "Şifre",
  "auth.passwordNew": "Şifre (en az 8 karakter)",
  "auth.register": "Kayıt ol",
  "auth.noAccount": "Hesabın yok mu? ",
  "auth.haveAccount": "Zaten hesabın var mı? ",
  "scan.title": "Kartvizit tara",
  "scan.subtitle": "Fotoğraf çek veya seç. Yapay zekâ bilgileri senin için okur.",
  "scan.takePhoto": "📷 Fotoğraf çek",
  "scan.gallery": "🖼️ Galeriden seç",
  "scan.reading": "Kartvizit okunuyor…",
  "scan.campaign": "CRM kampanyası (senkronize edilen tüm kişilere uygulanır)",
  "scan.noCampaign": "Kampanya yok",
  "scan.campaignError": "Kampanyalar yüklenemedi",
  "unsynced.title": "Senkronize edilmemiş kişiler ({n})",
  "unsynced.syncAll": "Tümünü senkronize et",
  "unsynced.sync": "Senkronize et",
  "unsynced.syncing": "Senkronize ediliyor…",
  "unsynced.failed": "Son senkronizasyon başarısız: {e}",
  "unsynced.dialGuessed": "⚠️ ülke kodu tahmin edildi",
  "unsynced.unnamed": "İsimsiz",
  "review.rescan": "🔄 Bu kartviziti yeniden tara",
  "review.rescanHint": "Kartviziti tekrar tara. Aşağıdaki alanlar değişir (kaydedilmemiş düzenlemeler kaybolur).",
  "review.cancel": "İptal",
  "review.rescanned": "✅ Yeniden tarandı. Aşağıdaki alanları kontrol et.",
  "review.rescanFailed": "Yeniden tarama başarısız",
  "review.save": "Kaydet",
  "review.saved": "✅ Kaydedildi",
  "review.addToContacts": "Rehbere ekle",
  "review.push": "CRM'e gönder",
  "review.update": "CRM'de güncelle",
  "review.synced": "✅ CRM ile senkronize edildi",
  "review.scanAnother": "Başka bir kartvizit tara",
  "review.dialWarning": "Telefon ülke kodu kartvizitte yazmıyordu. Yapay zekâ ülke/adresten tahmin etti, lütfen kontrol et.",
  "review.cardAlt": "Taranan kartvizit",
  "history.search": "Kartvizit ara",
  "history.empty": "Henüz kayıtlı kartvizit yok.",
  "history.unnamed": "İsimsiz",
  "history.unsynced": "Senkronize değil",
  "history.delete": "Sil",
  "history.confirmDelete": "Bu kartvizit silinsin mi?",
  "history.loadFailed": "Kartvizitler yüklenemedi",
  "history.deleteFailed": "Silinemedi",
  "field.firstName": "Ad",
  "field.lastName": "Soyad",
  "field.title": "Unvan",
  "field.company": "Şirket",
  "field.email": "E-posta",
  "field.phone": "Telefon",
  "field.mobile": "Cep telefonu",
  "field.website": "Web sitesi",
  "field.address": "Adres",
  "field.city": "Şehir",
  "field.country": "Ülke",
  "field.linkedin": "LinkedIn",
  "field.notes": "Notlar",
  "field.selectCountry": "Ülke seç…",
  "field.notInList": "{c} (listede yok)",
  "field.emailPick": "Birden fazla e-posta bulundu. CRM'e gönderilecek olanı seç.",
};

const DICT: Record<Lang, Record<Key, string>> = { en, tr };

export function translate(lang: Lang, key: Key, vars?: Record<string, string | number>) {
  let s: string = DICT[lang][key] ?? en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

// Messages the server sends (English). Anything not listed is shown as is.
const SERVER_TR: Record<string, string> = {
  "Please log in.": "Lütfen giriş yap.",
  "Wrong email or password.": "E-posta veya şifre hatalı.",
  "An account with this email already exists.": "Bu e-posta ile zaten bir hesap var.",
  "Password must be at least 8 characters": "Şifre en az 8 karakter olmalı.",
  "Invalid input": "Geçersiz bilgi.",
  "Too many requests, slow down.": "Çok fazla istek, lütfen biraz yavaşla.",
  "AI rate limit reached, try again shortly.": "Yapay zekâ istek sınırına ulaşıldı, birazdan tekrar dene.",
  "Server API key is invalid.": "Sunucudaki API anahtarı geçersiz.",
  "The AI model is overloaded right now. Try again in a minute.": "Yapay zekâ modeli şu an yoğun. Bir dakika sonra tekrar dene.",
  "Could not read the card. Try a clearer photo.": "Kartvizit okunamadı. Daha net bir fotoğraf dene.",
  "That doesn't look like a business card. Try again with a clearer photo.": "Bu bir kartvizite benzemiyor. Daha net bir fotoğrafla tekrar dene.",
  "This contact isn't synced to the CRM yet, so it can't be deleted.": "Bu kişi henüz CRM ile senkronize edilmedi, bu yüzden silinemez.",
  "The email address isn't valid for the CRM. Check it and try again.": "E-posta adresi CRM için geçerli değil. Kontrol edip tekrar dene.",
  "The CRM is missing the “Added by” contact property. Ask an administrator to create it.": "CRM'de “Added by” kişi özelliği eksik. Bir yöneticiden oluşturmasını iste.",
  "The CRM connection isn't authorised. Contact an administrator.": "CRM bağlantısı yetkili değil. Bir yöneticiyle iletişime geç.",
  "The CRM connection isn't set up. Contact an administrator.": "CRM bağlantısı kurulmamış. Bir yöneticiyle iletişime geç.",
  "The CRM is busy right now. Try again shortly.": "CRM şu an yoğun. Birazdan tekrar dene.",
  "The CRM isn't responding. Try again later.": "CRM yanıt vermiyor. Daha sonra tekrar dene.",
  "The CRM rejected this contact. Check the fields and try again.": "CRM bu kişiyi reddetti. Alanları kontrol edip tekrar dene.",
  "Could not load campaigns from the CRM.": "Kampanyalar CRM'den yüklenemedi.",
  "Missing or unsupported image": "Görsel eksik veya desteklenmiyor.",
  "Image too large": "Görsel çok büyük.",
  "Invalid contact": "Geçersiz kişi bilgisi.",
  "Not found": "Bulunamadı.",
};

let current: Lang = "en";
export const setCurrentLang = (l: Lang) => {
  current = l;
};

/** Translate a server error message into the user's language when we know it. */
export function translateServerMessage(msg: string, lang: Lang = current) {
  if (lang === "tr") {
    if (SERVER_TR[msg]) return SERVER_TR[msg];
  }
  return msg;
}

/** Country name in the UI language (falls back to the English name). */
export function localizedCountry(code: string, englishName: string, lang: Lang) {
  if (lang === "en") return englishName;
  try {
    return new Intl.DisplayNames([lang], { type: "region" }).of(code) ?? englishName;
  } catch {
    return englishName; // non-ISO entries such as NCY
  }
}

export function detectLang(acceptLanguage: string | null | undefined): Lang {
  return /^\s*tr\b/i.test(acceptLanguage ?? "") ? "tr" : "en";
}
