# Projekt neve: FocusFlow  
# Tesztelő: Kiss Péter  

| Test Case ID | Teszt neve | Előfeltétel | Lépések | Elvárt eredmény | Valós eredmény | Státusz |
|--------------|------------|-------------|---------|----------------|----------------|--------|
| TC01 | Új tanulási téma hozzáadása | Alkalmazás megnyitva | Új téma beírása → „Hozzáad” | Téma megjelenik és kiválasztódik | Téma megjelenik a listában | Pass |
| TC02 | Meglévő téma kiválasztása | 2+ téma létezik | Téma választása | Kiválasztott téma aktív lesz | Téma helyesen kiválasztódik | Pass |
| TC03 | Timer indítása | Téma kiválasztva | „Start” | Timer visszaszámol | Idő csökken | Pass |
| TC04 | Timer szüneteltetése | Timer fut | „Pause” | Számláló megáll | Idő megáll | Pass |
| TC05 | Timer leállítása | Timer fut/szünetel | „End” | Idő visszaáll 25:00-ra | Idő visszaállt 25:00-ra | Pass |
| TC06 | Session mentése vendégként | Timer futtatva | Start → pár mp → End | Session eltárolódik guest alatt | Mentés megtörtént | Pass |
| TC07 | Tantárgy hozzáadása | Tantárgyaim oldal | Név → Hozzáadás | Új kurzus megjelenik | Megjelent | Pass |
| TC08 | Tantárgy törlése | Létezik kurzus | Törlés gomb | Kurzus eltűnik | Törlődött | Pass |
| TC09 | Tananyag modal megnyitása | Kurzussal rendelkezik | „Tananyag” | Modal megjelenik | Megjelent | Pass |
| TC10 | Statisztika megjelenítése | Sessionök tárolva | Dashboard nyitás | Session szám és percek helyesen | Helyesen megjelent | Pass |
| TC11 | Chat figyelmeztetés téma nélkül | Timer téma nélkül | Üzenet küldése | Hibaüzenet jelenik meg | Hibaüzenet megjelent | Pass |
| TC12 | Chat üzenet küldése témával | Téma van választva | Üzenet küldése | Chat buborék + AI válasz | Rendben működött | Pass |
| TC13 | Navbar – Statisztikák | App fut | Statisztikák gomb | Dashboard vált | Megjelent | Pass |
| TC14 | Navbar – Tantárgyaim | App fut | Tantárgyaim gomb | Tantárgy oldal megjelenik | Megjelent | Pass |
| TC15 | Dark/Light mód váltás | Navbar téma ikon | Kattintás | Színséma vált | Színséma vált | Pass |
| TC16 | Vendég mód Profil oldalon | Nincs user | Profil megnyitása | Bejelentkezés / Regisztráció nézet | Vendég nézet megjelent | Pass |
| TC17 | Bejelentkezett mód Profil oldalon | User bejelentkezve | Profil megnyitása | XP és user adatok látszanak | Helyesen megjelennek | Pass |
| TC18 | Szint jelvény színváltás (theme sync) | Profil oldal | Téma váltás | Level badge színe követi témát | Színváltás működik | Pass |
| TC19 | Regisztráció hibás email | Profil → Regisztráció | Hibás email + Submit | Email hibaüzenet | Hibaüzenet megjelent | Pass |
| TC20 | Belépés hibás jelszóval | Létező user | Rossz jelszó → Login | Sikertelen + hibaüzenet | Megjelent | Pass |
| TC21 | Session mentése user alatt | User bejelentkezve | Start → End | Session user kulcsa alá kerül | Mentés megtörtént | Pass |
| TC22 | Tantárgyankénti összesítés | Sessionök több tantárgyhoz | Dashboard | Adatok tantárgyanként helyesek | Helyesen listáz | Pass |
| TC23 | Kurzusok megtartása frissítés után | Kurzussal rendelkezik | F5 | Kurzuslista megmarad | Megmaradt | Pass |
| TC24 | Timer formátum | Timer fut | Idő megfigyelése | MM:SS formátum | Formátum helyes | Pass |
