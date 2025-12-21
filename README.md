---

## 1. Bevezetés

### Feladat leírása
A pénzügyi térben mozogni kívánóknak elengedhetetlen az előzetes ismeret, így a gyakorlás számára fontos egy kockázatmentes, valósághű környezet, ahol a felhasználók megismerhetik a piaci mechanizmusokat, gyakorolhatják a kereskedést, és visszajelzést kaphatnak a döntéseikre.

A valós platformok használata anyagi kockázatot rejt, míg a teljesen szintetikus tesztkörnyezet a valós adatok dinamikus viselkedésével modellezi az éles szituációkat. A javasolt megoldás olyan hibrid szimulátor létrehozása, amely hasonlóan viselkedik a valós piacokhoz, mégis megőrzi a kockázatmentességet.

A feladatot két fő részre bontjuk:
1. **Webes felület:** A felhasználók élvezhetik az applikáció nyújtotta lehetőségeket.
2. **Asztali alkalmazás:** Admin szintű hozzáférést biztosít a projekt hátterének kezeléséhez.

### A projekt célja
A projekt több, egymáshoz kapcsolódó célt szolgál. Az alkalmazások lehetőséget adnak a felhasználóknak arra, hogy tanulási vagy oktatási célból megismerjék a tőzsde és a kereskedés alapelveit, mindezt biztonságos, kockázatmentes környezetben. Emellett lehetőséget biztosítanak arra is, hogy a felhasználók kipróbálhassák meglévő tudásukat és különböző kereskedési stratégiáikat, valós árfolyamadatok alapján, valódi pénzügyi kockázat nélkül.

---

## 2. Rendszeráttekintés

### Rendszerarchitektúra és komponensek
A rendszer három rétegből épül fel:
* **Front-end:** Webes React alkalmazás.
* **Back-end:** Node.js REST API.
* **Adatbázis:** PostgreSQL.
* **Adminisztráció:** WPF asztali alkalmazás, amely ugyanahhoz a REST API-hoz kapcsolódik.

**Külső API-k:**
* CoinMarketCap (piaci adatok)
* Stripe teszt API (pénzügyi szimulációk)
* OAuth szolgáltatók (Google, GitHub - opcionális)

### Felhasznált technológiák
* React
* WPF .NET Framework
* Node.js
* REST API
* Git

### Szerepkörök és jogosultságok

| Szerepkör | Funkciók |
| :--- | :--- |
| **Admin** | Asztali alkalmazás funkcióinak kezelése, Weben elérhető funkciók kezelése |
| **Végfelhasználó** | Weben elérhető funkciók kezelése |

---

## 3. Funkciók listája

### Webes alkalmazás (Csomagok)

| FUNKCIÓK | INGYENES | STANDARD | PRO |
| :--- | :---: | :---: | :---: |
| Chart nézet (gyertya/vonal) | ✔ | ✔ | ✔ |
| Wallet (Stripe teszt API) | ✔ | ✔ | ✔ |
| Egyenleg + tranzakciók megjelenítése | ✔ | ✔ | ✔ |
| Eszközök (coinok) listázása | ✔ | ✔ | ✔ |
| Átváltás crypto ↔ crypto | ✔ | ✔ | ✔ |
| Felhasználói adatok szerkesztése | ✔ | ✔ | ✔ |
| Adás/Vétel (Spot) | ✔ | ✔ | ✔ |
| Margin kereskedés | ✔ | ✔ | ✔ |
| Limit kereskedés | ✔ | ✔ | ✔ |
| AI (szimulált) kereskedés | ✔ | ✔ | ✔ |
| **AI chatbot kreditek** | **5 kredit** | **30 kredit** | **100 kredit** |
| Beutalás/kiutalás (fiat + crypto) | ✔ | ✔ | ✔ |
| 2FA + profil + közösségi fiókok + fizetés + OAuth | ✖ | ✔ | ✔ |
| Valósidejű kereskedés | ✖ | ✔ | ✔ |
| Korlátlan portfólió méret | ✖ | ✖ | ✔ |
| Stop‑loss | ✖ | ✖ | ✔ |
| TradingView chart | ✖ | ✖ | ✔ |
| **Előfizetési díj** | **INGYENES** | **$35** | **$49** |

### Asztali alkalmazás (Admin)

| FUNKCIÓK | ADMIN |
| :--- | :---: |
| Felhasználói adatok megjelenítése, szerkesztése | ✔ |
| Büntetés szabályszegés esetén (Wash trading, spoofing) | ✔ |
| Tranzakciók részleteinek megjelenítése | ✔ |
| Teljes jogú felhasználói fiók kezelése | ✔ |
| Fiók létrehozása (web + desktop jogokkal) | ✔ |

---

## 4. Funkcionális követelmények (Részletes lista)

### Webes alkalmazás
| ID | Funkció neve | Leírás | Bemenet | Kimenet / eredmény |
| :--- | :--- | :--- | :--- | :--- |
| F-01 | Chart nézet | A felhasználó grafikonon tekintheti meg a kriptovaluták árfolyamát. | Kiválasztott eszköz (coin), nézet típusa | Megjelenített TradingView chart |
| F-02 | AI / Real time adatválasztás | A felhasználó választhat AI-szimulált adatok és valós idejű adatok között. | Mód kiválasztása | A kiválasztott adatforrás megjelenítése |
| F-03 | Fiókkezelés | Felhasználói fiók létrehozása és kezelése (GitHub-layout szerint). | Név, email, jelszó, profilkép | Aktív felhasználói profil |
| F-04 | Wallet integráció | A felhasználó Stripe API segítségével kezelheti a pénztárcáját. | Be- és kiutalási adatok | Egyenleg frissítése a tranzakció alapján |
| F-05 | Egyenleg megjelenítés | A rendszer megjeleníti a felhasználó egyenlegét. | Felhasználói azonosító | Valuta, összeg |
| F-06 | Be- és kiutalás | Fiat és kripto eszközök be- és kiutalása. | Összeg, típus, célpont | Tranzakció létrejön és naplózódik |
| F-07 | Eszközlista | A rendszer megjeleníti a felhasználó birtokában lévő coinokat. | Felhasználói azonosító | Saját coinlista |
| F-08 | Swapping | Két eszköz közti átváltás megadott árfolyamon. | Forrás coin, cél coin, mennyiség | Swap utáni egyenleg, csere végrehajtva |
| F-09 | Előfizetés kezelése | A felhasználó „Free”, „Standard” vagy „Pro” előfizetést választhat havi/éves díjjal. | Csomag kiválasztása | Előfizetés aktiválása, kreditek kiosztása |
| F-10 | AI chatbot használata | A felhasználó krediteket használhat AI-alapú elemzésekre. | Lekérdezés, kredit mennyiség | Elemzés válasza, kredit levonása |
| F-11 | Kereskedési funkciók | Adás-vétel lehetősége árfolyam alapján, több üzemmódban. | Eszköz, mennyiség, típus (spot/limit/margin) | Tranzakció végrehajtva |
| F-12 | Stop-loss beállítás | Prémium funkció: árfolyam-alapú automatikus eladás beállítása. | Eszköz, árfolyam | Automatikus eladás adott feltételnél |
| F-13 | Felhasználói profil testreszabása | Profilkép, közösségi fiókok, fizetési módok, OAuth beállítása. | Feltöltött adatok | Frissített profilinformációk |
| F-14 | Felhasználói portfólió | Pro felhasználóknál korlátlan mennyiségű coin kezelése. Kisebb csomagokban korlátozás. | Felhasználói azonosító | Portfólió adatainak tárolása |
| F-15 | Tranzakciós napló | A rendszer naplózza a kereskedési eseményeket és tranzakciókat. | Tranzakció adatai | Naplóbejegyzés az adatbázisban |

### Asztali alkalmazás
| ID | Funkció neve | Leírás | Bemenet | Kimenet / eredmény |
| :--- | :--- | :--- | :--- | :--- |
| F-16 | Felhasználók megjelenítése | Az admin láthatja a rendszer összes felhasználóját. | - | Felhasználói lista |
| F-17 | Felhasználói adatok szerkesztése | Az admin módosíthatja a felhasználók adatait. | Kiválasztott felhasználó, új adatok | Frissített adatok mentve |
| F-18 | Szabálysértések kezelése | Az admin büntetést szabhat ki szabályszegés esetén (zárolás, levonás). | Wash trading, spoofing | Fiók zárolva, egyenleg csökkentve |
| F-19 | Tranzakciók részletei | Tranzakciós adatok megtekintése. | Tranzakció azonosító | Részletes adatnézet |
| F-20 | Fiók létrehozása adminból | Az admin új fiókot hozhat létre, teljes jogosultsággal. | Felhasználói adatok | Új aktív fiók |
| F-21 | Teljes hozzáférés biztosítása | Az admin minden webes funkcióhoz hozzáfér. | - | Admin funkciók elérhetőek |

---

## 5. Nem funkcionális követelmények

* **Biztonság:** Jelszavak titkosítása (bcrypt), token-alapú hitelesítés (JWT), HTTPS minden kommunikációnál, adatbázis titkosítás.
* **Teljesítmény:** Chart frissítése és adathívások 1–3 másodperces késleltetésen belül legyenek real-time módban.
* **Skálázhatóság:** A backend konténerizálható legyen (Docker), horizontálisan skálázható API réteg.
* **Megbízhatóság:** Konzisztens naplózási rendszer, adatbázis azonnali frissítése módosulások esetén.
* **Használhatóság:** Mind a webes, mind pedig az asztali alkalmazás UI reszponzív, akadálymentes.

---

## 6. Felhasználói felület és Adatforrások (Web és Asztali)

A felhasználói felület mind a webes, mind az asztali alkalmazásban letisztult megjelenést mutat. A navigáció egyszerű a bal oldali menüszalaggal, ahol láthatjuk az adott pozíciónkat és almenüket.

### Webes felület - Grafikon és Piac

![Grafikon nézet](grafikon_kep_helye)

A weboldal a grafikon (chart) nézettel nyílik. Itt lehetőségünk van választani a valós vagy szimulált adatok használata között. Chart nézetben lehetőség az AI (kredit alapú tanácsadás) és a real-time (CoinMarketCap) adatok közti váltásra. Ingyenes csomagban korlátozott chart nézet (gyertya és vonal, maximum havi nézet), míg a pro előfizetés teljes funkcionalitást biztosít.

**Szükséges adatforrások:**
* **Adatbázis kapcsolat:** Piaci adatok és Felhasználói adatbázis
* **Adattáblák:** `price_history` (vagy külső API), `users`, `subscriptions`
* **Adatmezők:**
    * `price_history`: *symbol, open, high, low, close, volume, timestamp*
    * `users`: *id, ai_credits, subscription_level*
* **Műveletek:**
    * **SELECT:** Chart adatok lekérése (szűrés dátumra és felbontásra a `subscription_level` alapján).
    * **SELECT:** Felhasználó AI kreditjeinek és előfizetésének ellenőrzése.
    * **UPDATE:** AI használat esetén `ai_credits` csökkentése.

---

### Webes felület - Profil

![Profil nézet](profil_kep_helye)

A bal oldali menüsávban kiválaszthatjuk a „Profil” lehetőséget, ahol a saját profilunkat tudjuk megtekinteni és szerkeszteni. Lehetőségünk van az alapcsomagon felüli funkciók kiaknázására is.

**Szükséges adatforrások:**
* **Adatbázis kapcsolat:** Felhasználói adatbázis
* **Adattáblák:** `users`, `subscriptions`
* **Adatmezők:**
    * `users`: *id, username, email, password_hash, profile_image, created_at*
    * `subscriptions`: *user_id, plan_type, expiry_date, credits*
* **Műveletek:**
    * **SELECT:** Profil adatok és előfizetési státusz betöltése.
    * **UPDATE:** Profil adatok (pl. jelszó, kép) módosítása.
    * **UPDATE:** Előfizetés váltása (upgrade) esetén `plan_type` módosítása.

---

### Webes felület - Tárca

![Tárca nézet](tarca_kep_helye)

A profil alá tartozik a „Tárca” is, amely az adott eszközeinket mutatja. Eszközeink alatt megtekinthetjük a tranzakciós előzményeinket.

**Szükséges adatforrások:**
* **Adatbázis kapcsolat:** Tranzakciós adatbázis
* **Adattáblák:** `wallets`, `assets`, `transactions`, `currencies`
* **Adatmezők:**
    * `assets`: *wallet_id, currency_id, amount*
    * `transactions`: *id, sender_wallet_id, receiver_wallet_id, amount, currency, timestamp, status*
    * `wallets`: *user_id, total_estimated_value*
* **Műveletek:**
    * **SELECT:** Aktuális egyenleg (`assets`) lekérdezése `user_id` alapján.
    * **SELECT:** Tranzakciós lista lekérdezése az adott felhasználóhoz kapcsolódóan (`WHERE sender OR receiver = user`).

---

### Webes felület - Kereskedés

![Kereskedési felület](kereskedes_kep_helye)

A kereskedési felületen kiválaszthatjuk a kereskedés módját és az egyéb, a kereskedéshez nélkülözhetetlen beállításokat, mint valuta, összeg.

**Szükséges adatforrások:**
* **Adatbázis kapcsolat:** Kereskedési motor (Trading Engine)
* **Adattáblák:** `orders`, `assets`, `market_prices`
* **Adatmezők:**
    * `orders`: *id, user_id, pair (pl. BTC/USD), type (limit/market), amount, price, status*
    * `assets`: *amount* (fedezet ellenőrzéshez)
* **Műveletek:**
    * **SELECT:** Rendelkezésre álló egyenleg ellenőrzése.
    * **INSERT:** Új megbízás (`order`) létrehozása.
    * **UPDATE:** Felhasználó szabad egyenlegének zárolása/csökkentése (`assets`).

---

### Webes felület - Swap (Átváltás)

![Swap felület](swap_kep_helye)

A kereskedési felülethez hasonló módon válthatjuk át valutáinkat egy másikra.

**Szükséges adatforrások:**
* **Adatbázis kapcsolat:** Tranzakciós adatbázis
* **Adattáblák:** `assets`, `exchange_rates`, `transactions`
* **Adatmezők:**
    * `assets`: *currency_id, amount*
    * `exchange_rates`: *pair, rate*
* **Műveletek:**
    * **SELECT:** Árfolyam lekérése.
    * **UPDATE:** Forrás valuta egyenlegének csökkentése (`assets`).
    * **UPDATE:** Cél valuta egyenlegének növelése (`assets`).
    * **INSERT:** Swap tranzakció naplózása a `transactions` táblába.

---

### Asztali alkalmazás - Felhasználók

![Admin felhasználók lista](admin_users_kep_helye)

Az asztali alkalmazás megnyitása után a profilok nézetben találjuk magunkat. A baloldali menüsávból szintén kiválaszthatjuk a lehetőséget.

**Szükséges adatforrások:**
* **Adatbázis kapcsolat:** Adminisztrációs adatbázis
* **Adattáblák:** `users`
* **Adatmezők:**
    * `users`: *id, username, full_name, status (active/banned)*
* **Műveletek:**
    * **SELECT:** Az összes regisztrált felhasználó listázása (`SELECT * FROM users`).

---

### Asztali alkalmazás - Profil szerkesztése

![Admin profil szerkesztés](admin_edit_kep_helye)

A profil címkén a „Módosítás” gombra kattintva szerkeszthetjük az egyes profilokat.

**Szükséges adatforrások:**
* **Adatbázis kapcsolat:** Adminisztrációs adatbázis
* **Adattáblák:** `users`
* **Adatmezők:**
    * `users`: *id, email, password, card_info*
* **Műveletek:**
    * **SELECT:** Kiválasztott felhasználó adatainak betöltése űrlapra.
    * **UPDATE:** Admin általi adatmódosítás mentése a `users` táblába.

---

### Asztali alkalmazás - Profil részletek

![Admin profil részletek](admin_details_kep_helye)

A „Részletek” alatt a profil részleteit láthatjuk. Az egyes tranzakciókat, egyenleget és előzményeket.

**Szükséges adatforrások:**
* **Adatbázis kapcsolat:** Tranzakciós adatbázis
* **Adattáblák:** `users`, `assets`, `transactions`
* **Adatmezők:**
    * `users`: *username*
    * `assets`: *currency, amount*
    * `transactions`: *timestamp, type, amount, status*
* **Műveletek:**
    * **SELECT:** Konkrét felhasználó (`WHERE user_id = ...`) egyenlegének és tranzakciós történetének lekérése admin nézetben.

---

### Asztali alkalmazás - Büntetések

![Admin büntetés](admin_punish_kep_helye)

A „Büntetés” gomb az egyes szankciók kiszabására szolgál. A kereskedések közben van néhány illegális módszer (pl. Wash trading, Spoofing), amellyel befolyásolják a piac működését. Ha ezeket a mintázatokat észrevettük, kiszabhatjuk a büntetést.

**Szükséges adatforrások:**
* **Adatbázis kapcsolat:** Adminisztrációs adatbázis
* **Adattáblák:** `punishments` (vagy `sanctions`), `users`
* **Adatmezők:**
    * `punishments`: *id, user_id, reason, punishment_type, created_at, admin_id*
    * `users`: *status*
* **Műveletek:**
    * **INSERT:** Új büntetés bejegyzése a `punishments` táblába.
    * **UPDATE:** Felhasználó státuszának módosítása (pl. *suspended* vagy *banned*) a `users` táblában.

---

### Asztali alkalmazás - Tranzakciók

![Admin tranzakciók](admin_transactions_kep_helye)

A menüsávban megtalálható a „Tranzakciók” menüpont, ahol az összes pénzmozgást monitorozni tudjuk az ábra szerinti módon.

**Szükséges adatforrások:**
* **Adatbázis kapcsolat:** Tranzakciós adatbázis (Audit log)
* **Adattáblák:** `transactions`, `users`
* **Adatmezők:**
    * `transactions`: *id, sender_id, receiver_id, amount, currency, timestamp*
    * `users`: *username* (a küldő és fogadó ID-k feloldásához)
* **Műveletek:**
    * **SELECT:** Rendszerszintű tranzakciólista lekérése (`SELECT * FROM transactions JOIN users...`) időrendi sorrendben.

---

## 7. Adatkezelés és API

### Adatbázis diagram (ERD)
![Adatbázis ER Diagram](erd_kep_helye)

### Végpontok (API Endpoints)

**1. Autentikáció és Felhasználókezelés**
| Metódus | Végpont | Leírás | Jogosultság |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Új felhasználói fiók létrehozása. | Publikus |
| POST | `/api/auth/login` | Bejelentkezés, JWT token kérése. | Publikus |
| GET | `/api/user/profile` | A bejelentkezett felhasználó adatainak lekérdezése. | User |
| PUT | `/api/user/profile` | Profil adatok (kép, bio) frissítése. | User |
| GET | `/api/admin/users` | Összes felhasználó listázása (Asztali alk.). | Admin |
| PUT | `/api/admin/users/{id}` | Felhasználói adatok szerkesztése, büntetés/tiltás. | Admin |

**2. Pénztárca és Tranzakciók**
| Metódus | Végpont | Leírás | Jogosultság |
| :--- | :--- | :--- | :--- |
| GET | `/api/wallet/balance` | Aktuális egyenleg lekérdezése. | User |
| POST | `/api/wallet/deposit` | Egyenleg feltöltése (Stripe API). | User |
| POST | `/api/wallet/withdraw` | Kiutalás kezdeményezése. | User |
| GET | `/api/wallet/transactions`| Tranzakciós napló lekérdezése. | User/Admin |
| POST | `/api/wallet/swap` | Kripto-kripto átváltás. | User |

**3. Kereskedés és Piac**
| Metódus | Végpont | Leírás | Jogosultság |
| :--- | :--- | :--- | :--- |
| GET | `/api/market/assets` | Elérhető kriptovaluták és árfolyamuk. | User |
| GET | `/api/market/chart/{symbol}`| Chart adatok lekérése TradingView-hoz. | User |
| POST | `/api/trade/order` | Új megbízás létrehozása (Spot, Limit, Margin). | User |
| DELETE | `/api/trade/order/{id}` | Nyitott megbízás visszavonása. | User |
| GET | `/api/trade/history` | Saját kereskedési előzmények. | User |

**4. AI és Előfizetés**
| Metódus | Végpont | Leírás | Jogosultság |
| :--- | :--- | :--- | :--- |
| GET | `/api/ai/analyze` | Piaci elemzés kérése az AI-tól (kredit levonással). | User (Standard/Pro) |
| POST | `/api/subscription/upgrade`| Előfizetési csomag váltása. | User |

---

## 8. Rendszerkövetelmények

**Fejlesztői környezet:**
* Microsoft Visual Studio Code, Visual Studio, JetBrains Rider, DBeaver.

**Általános elvárások (Szoftver):**
* **Web:** Bármely modern böngésző.
* **Asztali:** Windows 10 vagy újabb.

**Hardver:**
* Intel Core i3-540 vagy újabb.
* Legalább 4 GB RAM.

---

## 9. Szómagyarázat

* **Spot:** Aktuális árfolyamon való azonnali kereskedés.
* **Limit:** A tranzakció csak akkor történik meg, amikor az árfolyam eléri az általunk kijelölt célértéket.
* **Margin:** Tőkeáttételes kereskedés.
* **Stop-loss:** Eladási megbízás teljesítése az általunk beállított árfolyamon (veszteségminimalizálás).
* **Wash trading:** A befektető saját magával kereskedik, ezzel növelve az árfolyamot/forgalmat.
* **Spoofing:** Megbízások létrehozása teljesítési szándék nélkül.
