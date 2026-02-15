# 🍎 iOS Setup Útmutató - Limer Roller Control

## Gyors Setup (3 perc)

### 1️⃣ Telepítsd a Bluefy-t

**App Store:**
```
https://apps.apple.com/app/bluefy/id1492822055
```

Vagy keress rá: **"Bluefy - Web BLE Browser"**

💰 **Ár:** $1.99 (egyszer fizetsz, örökre használhatod)

---

### 2️⃣ Deploy GitHub Pages-re

```bash
# 1. Csomagold ki a fájlokat
unzip limer-web-ios.zip
cd limer-web-ios

# 2. Git repo
git init
git add .
git commit -m "Initial commit"

# 3. Push to GitHub
git remote add origin https://github.com/USERNAME/limer-web-ios.git
git branch -M main
git push -u origin main

# 4. Enable GitHub Pages
# Settings → Pages → Source: main / root → Save
```

⏱️ **30-60 másodperc múlva kész:**
```
https://USERNAME.github.io/limer-web-ios/
```

---

### 3️⃣ Első Használat iOS-en

#### A. Nyisd meg Bluefy-ban

1. **Indítsd el Bluefy-t** iPhone-on
2. **Írd be a címet:**
   ```
   https://USERNAME.github.io/limer-web-ios/
   ```
3. **Go/Enter**

#### B. Párosítsd a rollert

1. **Tap:** "Rollerek Keresése" 
2. **iOS felugró ablak** jelenik meg:
   ```
   ┌─────────────────────────────────┐
   │ "limer-web-ios" Would Like to  │
   │ Connect to Bluetooth Devices    │
   │                                 │
   │ ○ Limer Scooter                │
   │ ○ Other Device                  │
   │                                 │
   │   [Cancel]        [Pair]        │
   └─────────────────────────────────┘
   ```
3. **Válaszd ki a rollered**
4. **Tap "Pair"** (vagy "Connect")
5. **Kész!** ✅

#### C. Csatlakozz és használd

1. **Tap "Csatlakozás"** az appban
2. Várj 2-3 másodpercet
3. **Connected** ✅
4. **Használd a gombokat!** 🎉

---

## ⚙️ iOS Beállítások

### Bluetooth Engedély

Ha nem működik, ellenőrizd:

1. **Settings** → **Privacy & Security**
2. **Bluetooth**
3. **Bluefy** → **ON** ✅

### Ha elfelejtett párosítás:

1. **Settings** → **Bluetooth**
2. **Roller neve** → **(i)** ikon
3. **Forget This Device**
4. Próbálkozz újra az app-ban!

---

## 📱 Home Screen-re Telepítés

### Add to Home Screen (PWA):

1. Nyisd meg az appot **Bluefy-ban**
2. **Share** gomb (□↑)
3. **Add to Home Screen**
4. **Add**

Most már app ikonként jelenik meg! 🎉

⚠️ **Figyelem:** PWA-ként megnyitva is **Bluefy motorját** használja, ami jó, mert így működik a Bluetooth!

---

## 🐛 iOS Hibaelhárítás

### "Bluetooth párosítás ablak nem jelenik meg"

**Megoldás 1:** Ellenőrizd az engedélyeket
- Settings → Privacy → Bluetooth → Bluefy: **ON**

**Megoldás 2:** Reload az oldal
- Bluefy-ban húzd le refresh-hez
- Vagy újra nyisd meg az URL-t

**Megoldás 3:** Restart Bluefy
- Double-tap Home button
- Swipe up Bluefy
- Indítsd újra

### "Pairing Failed"

**Megoldás:**
1. Forget device (Settings → Bluetooth)
2. Restart roller
3. Restart Bluefy
4. Próbálkozz újra

### "Connection Timeout"

**Megoldás:**
1. Reload oldal
2. Roller restart
3. iPhone Bluetooth toggle (OFF → ON)
4. Próbálkozz újra

### "GATT Error"

**Megoldás:**
- Ez ritka, de előfordul
- Airplane mode ON → OFF
- Restart mindkettő (phone + roller)

---

## 🔬 Debug iOS-en

### Safari Remote Debugging:

1. **iPhone-on:**
   - Settings → Safari → Advanced → Web Inspector: **ON**

2. **Mac-en:**
   - Safari → Preferences → Advanced → Show Develop menu: **✓**
   - Develop → [iPhone neve] → [Bluefy tab]

3. **Console:** Látod a logokat!
   ```javascript
   console.log('iOS Debug:', LimerApp.isIOS);
   console.log('Bluefy:', LimerApp.isBluefy);
   ```

### Bluefy Debug Mode:

Bluefy-ban: **Settings** → **Enable Remote Debugging**

---

## 💡 Pro Tippek iOS-re

### 1. Bookmark-ként mentés
- Gyorsabb mint mindig begépelni az URL-t
- Safari → Share → Add Bookmark
- Vagy Bluefy Bookmarks

### 2. Siri Shortcut
- Settings → Siri & Search
- "Open Limer in Bluefy"
- Most Siri-val indíthatod! 🎤

### 3. Widget (ha van)
- Bluefy widget hozzáadása home screen-re
- Gyors hozzáférés a kedvenc site-okhoz

---

## 🆚 iOS vs Android Különbségek

| Feature | iOS (Bluefy) | Android (Chrome) |
|---------|--------------|------------------|
| Párosítás | Natív dialog ✅ | Automatic ✅ |
| Notification | Működik ✅ | Működik ✅ |
| Write | Működik ✅ | Működik ✅ |
| Background | Nem támogatott ❌ | Korlátozott ⚠️ |
| PWA Install | Működik ✅ | Működik ✅ |

**Lényeg:** iOS-en ugyanúgy működik, csak Bluefy kell! 🍎✅

---

## 🔒 Privacy & Security iOS-en

### Mit lát a Bluefy?
- **Csak Bluetooth eszközöket** amikhez engedélyt adsz
- **Nem lát**: Fotók, Kontaktok, Helyszín (hacsak nem engedélyezed)

### Mit küld az app?
- **Semmit!** Nincs szerver, nincs tracking
- **Direkt BLE kapcsolat** phone ↔ roller
- **Open source** - ellenőrizhető a kód

### Engedélyek:
- ✅ **Bluetooth** - szükséges (roller kapcsolat)
- ❌ **Location** - NEM kell iOS-en (ellentétben Android-dal!)
- ❌ **Camera, Microphone** - NEM használja

**100% Privacy-friendly!** 🔒

---

## 📞 Support iOS-re

### Bluefy Support:
- **Website:** https://bluefy.app
- **GitHub:** https://github.com/pauliusuza/bluefy-ios
- **Email:** info@bluefy.app

### Limer App Support:
- **GitHub Issues:** https://github.com/USERNAME/limer-web-ios/issues
- **Email:** your@email.com

### iOS BLE Limitációk:
- **Apple Docs:** https://developer.apple.com/documentation/corebluetooth

---

## ✅ Checklist - Minden működik?

- [ ] Bluefy telepítve
- [ ] App megnyílik Bluefy-ban
- [ ] "Rollerek Keresése" megnyomható
- [ ] iOS párosítás ablak megjelenik
- [ ] Roller kiválasztható a listából
- [ ] "Pair" után csatlakozik
- [ ] Lock/Unlock gomb működik
- [ ] Lámpa gomb működik
- [ ] Sebesség kijelzés frissül
- [ ] Akkumulátor szint látszik

**Ha minden ✅ → KÉSZ!** 🎉

---

## 🎊 Gratulálunk!

Most már iOS-ről is vezérelheted a rollered! 🛴🍎

**Next steps:**
1. ⭐ Star-old a repo-t GitHub-on
2. 📤 Oszd meg iOS-es barátaiddal
3. 🐛 Report bugs ha találsz
4. 💡 Javasolj feature-öket!

---

**Jó görgetést! 🛴💨**

Made with 💚 for iOS users
