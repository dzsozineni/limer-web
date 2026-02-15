# 🛴 Limer - Android/iOS Compatible Web App

Modern Progressive Web Application (PWA) elektromos rollerek vezérlésére Bluetooth Low Energy (BLE) technológián keresztül - **iOS TÁMOGATÁSSAL!**

## 🍎 iOS Támogatás

### Bluefy Böngésző (Ajánlott iOS-en)

Ez a verzió **teljes mértékben támogatja az iOS-t** a **Bluefy** böngésző segítségével!

#### iOS Setup (3 lépés):

1️⃣ **Telepítsd a Bluefy böngészőt**
   - App Store: [Bluefy - Web BLE Browser](https://apps.apple.com/app/bluefy/id1492822055)
   - Vagy keress rá: "Bluefy"

2️⃣ **Nyisd meg az appot Bluefy-ban**
   ```
   https://dzsozineni.github.io/limer-web/
   ```

3️⃣ **Első használatkor:**
   - Kattints "Rollerek Keresése"
   - **iOS felugró ablak jelenik meg** - "Bluetooth párosítás"
   - **Válaszd ki a rollered** a listából
   - Engedélyezd a párosítást
   - Kész! 🎉

### iOS Párosítás - Hogyan működik?

A `navigator.bluetooth.requestDevice()` hívás során iOS automatikusan mutat egy natív párosítási dialogot. Ez a kulcs az iOS támogatáshoz!

```javascript
// Ez az iOS párosítási dialogot triggeli
const device = await navigator.bluetooth.requestDevice({
  filters: [{ services: [SERVICE_UUID] }],
  optionalServices: [SERVICE_UUID]
});
// iOS-en itt történik a párosítás!
```

A párosítás után minden működik, mint Android-on! 📱✅

---

## ✨ Funkciók

- 🔓 **Roller feloldás/zárolás** - egyszerű érintéssel
- 💡 **Lámpa vezérlés** - LED be/kikapcsolás
- 🔔 **Riasztó** - távolról
- 📊 **Valós idejű telemetria**:
  - Sebesség (km/h)
  - Akkumulátor töltöttség
  - Hatótáv becslés
- 📱 **PWA támogatás** - telepíthető
- 🌙 **Dark mode** - automatikus
- 🍎 **iOS kompatibilis** - Bluefy-val

---

## 📋 Platform Támogatás

### ✅ Működik:
- **iOS 13.0+** (Bluefy böngésző) 📱 **ÚJ!**
- **Android 6.0+** (Chrome/Edge/Opera) 📱 **AJÁNLOTT**

### ❌ Nem működik:
- iOS Safari (nem támogatja Web Bluetooth API-t)
- Firefox (még nincs Web Bluetooth)
- Régi böngészők

---

## 📱 iOS Használati Útmutató

### Első csatlakozás iOS-en:

1. **Nyisd meg Bluefy-ban** az app URL-jét
2. **Kattints: "Rollerek Keresése"**
3. **iOS dialog megjelenik:**
   ```
   "limer-web-ios" Would Like to
   Connect to Bluetooth Devices
   
   [Roller neve]
   [Másik eszköz]
   
   [Cancel] [Pair]
   ```
4. **Válaszd ki a rollered**
5. **Tap "Pair"**
6. **Csatlakozz** az appban
7. **Használd!** 🎉

### Gyakori iOS problémák:

#### "Bluetooth párosítás ablak nem jelenik meg"
→ Ellenőrizd: Settings → Privacy → Bluetooth → Bluefy (engedélyezve)

#### "Pairing failed"
→ Próbálkozz újra, esetleg törölj minden korábbi párosítást:
   Settings → Bluetooth → [Roller] → Forget Device

#### "Connection timeout"
→ Reload az oldal + Roller restart

---

## 📄 Licenc

MIT License - Használd szabadon!

---

## 🎊 Összefoglaló

### Android:
✅ Chrome/Edge/Opera → **Működik out-of-the-box**

### iOS:
✅ Bluefy böngésző → **Működik párosítás után!**

### Desktop:
✅ Chrome/Edge → **Működik Bluetooth adapter-rel**

---

**Made with 💚 for iOS and Android**

```
 _      _____ __  __ ______ _____  
| |    |_   _|  \/  |  ____|  __ \ 
| |      | | | \  / | |__  | |__) |
| |      | | | |\/| |  __| |  _  / 
| |____ _| |_| |  | | |____| | \ \ 
|______|_____|_|  |_|______|_|  \_\
                                    
  iOS Compatible - Bluefy Ready! 🍎
```
