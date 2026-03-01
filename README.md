# LinkMan

Lokaler Link-Manager, der komplett im Browser laeuft.

## Features
- Links/Gruppen anlegen, bearbeiten, loeschen
- Drag-and-drop Sortierung
- Daten in lokaler JSON-Datei speichern und laden
- Optionaler Legacy-Import aus altem `localStorage` beim ersten Start

## Datenablage
- Hauptmodus: JSON-Datei (`LinkData.json`)
- Mit File System Access API (z. B. Chromium-Browser): direktes Oeffnen und Speichern in derselben Datei
- Ohne File System Access API: Import ueber Dateiauswahl und Export als Download
- Beim Start wird `public/LinkData.json` automatisch geladen (falls vorhanden)
- Falls das direkte Laden blockiert ist (z. B. `file://`), wird automatisch der letzte lokale Cache geladen

## Projektstruktur
- `public/index.html`: komplette Browser-App
- `src/server.js`: optionaler statischer Server fuer lokale Auslieferung

## Nutzung
### Ohne Server (reiner Browser-Modus)
1. `public/index.html` direkt im Browser oeffnen.
2. In der App `JSON oeffnen` oder neue Daten anlegen.
3. Mit `Speichern`/`Speichern unter` bzw. `JSON exportieren` sichern.

### Optional mit lokalem Server
1. `npm install`
2. `npm start`
3. `http://127.0.0.1:3000` im Browser oeffnen

