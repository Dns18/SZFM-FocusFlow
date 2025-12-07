# Projekt neve: FocusFlow  
# Tesztelő: Petric Edmond  

| Test Case ID | Teszt neve | Előfeltétel | Lépések | Elvárt eredmény | Valós eredmény | Státusz |
|--------------|------------|-------------|---------|------------------|----------------|---------|
| TC01 | Tanulási idő módosítása | App megnyitva | Tanulási idő mező → érték átírása → „Mentés” | Tanulási idő frissül és azonnal alkalmazódik | Tanulási idő frissül és azonnal alkalmazódik | Pass |
| TC02 | Rövid szünet módosítása | App megnyitva | Rövid szünet mező → érték átírása → „Mentés” | Új rövid szünet idő aktív állapotba kerül | Új rövid szünet idő aktív állapotba kerül | Pass |
| TC03 | Hosszú szünet módosítása | App megnyitva | Hosszú szünet mező → érték módosítása → „Mentés” | Hosszú szünet idő sikeresen frissül | Hosszú szünet idő sikeresen frissül | Pass |
| TC04 | Custom timer mentés és visszatöltés | Módosított időzítők | Oldal frissítés | A beállított idők újra megjelennek | A beállított idők újra megjelennek | Pass |
| TC05 | OpenAI/Groq modell kiválasztása | App megnyitva | Modell legördülő lista → modell kiválasztása | Kiválasztott modell megjelenik aktívként és elmentődik | Kiválasztott modell megjelenik aktívként és elmentődik | Pass |
| TC06 | Pomodoro indítása | Téma kiválasztva | Start | Számláló elindul | Elindult | Pass |
| TC07 | Pomodoro megállítása | Időzítő fut | Stop | Számláló megáll | Megállt | Pass |
| TC08 | Pomodoro reset | Időzítő elindítva | Reset | Idő visszaáll alaphelyzetre | Visszaállt | Pass |
| TC09 | Session mentése idő lejártakor | Timer elindítva | Várd meg, míg lejár | Session rögzül a tárhelyre | Rögzült | Pass |
| TC10 | Session nem mentődik téma nélkül | Téma: „–” | Pomodoro → lejár | Session nem kerül mentésre | Nem mentődik | Pass |
| TC11 | Tippek modál megnyitása | App megnyitva | „Tippek” gombra kattintás | Tippek modál megjelenik | Megjelent | Pass |
| TC12 | Működési leírás modál megnyitása | Navbar látható | Kérdőjel ikon → kattintás | Leírás modál megjelenik | Megjelent | Pass |
| TC13 | Modál bezárása X-re | Modál nyitva | X gombra kattintás | Modál bezáródik | Bezárult | Pass |
| TC14 | Modál bezárása overlay-re | Modál nyitva | Háttérre kattintás | Modál bezáródik | Bezárult | Pass |
| TC15 | Sikeres bejelentkezés | Regisztrált user | Email + jelszó → Login | Betölt a profil oldal | Betöltött | Pass |
| TC16 | Sikertelen bejelentkezés | Regisztrált email | Rossz jelszó → Login | Hibaüzenet jelenik meg | Megjelent | Pass |
| TC17 | Sikeres regisztráció | Email nincs regisztrálva | Adatok megadása → Regisztráció | Profil oldal betöltődik | Betöltődött | Pass |
| TC18 | Sikertelen regisztráció | Email már regisztrálva | Regisztráció | Hibaüzenet: email foglalt | Hibaüzenet megjelent | Pass |
| TC19 | Kijelentkezés | User bejelentkezve | Kijelentkezés gomb | Login oldal jelenik meg | Megjelent | Pass |
| TC20 | Heti subject session grafikon | Van legalább 1 session | Statisztikák megnyitása | Oszlopdiagram megjelenik | Megjelent | Pass |
| TC21 | Üres grafikon session nélkül | Nincs session | Statisztikák megnyitása | „Nincs adat” vagy üres grafikon | Üres | Pass |
| TC22 | Napi idő grafikon | Több nap sessionjei | Statisztikák → heti idő grafikon | Line chart mutatja napi perceket | Mutatja | Pass |
| TC23 | User saját sessionjeit látja | Több user létezik | Bejelentkezés → Statisztikák | Csak az adott user sessionjei láthatók | LocalStorage látszott | Fail |
| TC24 | Kijelentkezés utáni local sessionök | User kilép | Statisztikák megnyitása | LocalStorage sessionök jelennek meg | LocalStorage jelenik meg | Pass |
| TC25 | Session mentése bejelentkezve | User bejelentkezve | Pomodoro → lejár | Session a user saját tárolójába kerül | Saját tárolóban jelenik meg | Pass |