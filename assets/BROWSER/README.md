# Modelle für My Little World Builder

## Dateiformate und Maßstab
- GLB empfohlen: Geometrie und Farben in einer Datei. In Millimetern exportieren; Y zeigt nach oben.
- OBJ: passende MTL-Datei und alle referenzierten Texturen gemeinsam mit ablegen. Pfade und Groß-/Kleinschreibung müssen stimmen.
- PLY: eingebettete Vertex-Farben werden unterstützt.
- Dateiname möglichst `10x10 House.glb`, `5x5 Vehicle.obj` usw.; die Zahlen im Dateinamen sind Zentimeter. 10×10 bedeutet 100×100 mm.
- Asset Manager nach Änderungen speichern/aktualisieren. Keine Sonderfarbe wird aus einem Modellnamen erfunden.

## Reservierte Komponenten-/Meshnamen
Groß- und Kleinschreibung ist egal. Hinter `_` darf ein beliebiger Zusatz stehen.

| Name | Wirkung |
|---|---|
| `LIGHT_H`, `light_h`, `LIGHT_H_front` | Leuchtender Körper mit Glow und horizontalem Schein. Die ausgerichtete Außenfläche wird in ihrer Form verlängert: bei Gebäudefenstern anfangs 55 % sichtbar (45 % transparent), am Ende unsichtbar. Modellfarbe bleibt erhalten. Für Fenster und Autoscheinwerfer. |
| `LIGHT_V`, `light_v`, `LIGHT_V_street` | Leuchtender Körper mit Glow und breiter werdendem, weich auslaufendem Kegel nach unten. Nur den Leuchtkörper markieren, nicht Stange oder Gehäuse. |
| `LIGHT_V_UP`, `light_v_up`, `LIGHT_V_UP_roof` | Leuchtender Körper mit Glow und einem nach oben breiter werdenden, weich auslaufenden Kegel. Für Dachzeichen und nach oben gerichtete Lampen. |
| Ältere Namen: `LIGHT`, `LIGHTS`, `WINDOW`, `LIGHT_HORIZONTAL`, `LIGHT_VERTICAL`, `LAMP`, `LIGHT_LAMP` | Weiterhin unterstützt. Neue Modelle vorzugsweise mit LIGHT_H oder LIGHT_V benennen. |
| `SMOKE`, `smoke`, `SMOKE_chimney`, `smoke_exhaust` | Kleine weiße Rauchwolken steigen von der Oberseite des markierten Meshes oder der Komponente auf, tagsüber und nachts. Für Schornsteine und Auspuffe. Groß-/Kleinschreibung egal; Zusatz nach `_` frei. Der sichtbare Modellteil bleibt unverändert. |
| `COLOR`, `COLOR_wall` | Diese Flächen dürfen über den Farbwähler im Objekt-Label umgefärbt werden. Auswahl gilt für das einzelne platzierte Objekt und wird gespeichert/kopiert. Alle markierten Flächen eines Objekts teilen sich eine gewählte Farbe. |
| `PLACEMENT_PLATE`, `placement_plate_base` | Begrenzung der Bodenplatte bestimmt Raster und Belegung. Überstehende Dächer/Lampen zählen nicht. Sichtbare GLB-Geometrie wird nicht umgeformt. |
| `PLACEMENT_BASE`, `PLACEMENT_BASE_ground` | Weiterhin unterstützter Alias für dieselbe Bodenplattenregel. |
| `NOCONTACT`, `nocontact_foot` | Dieser Meshteil blockiert Figuren nicht, z. B. ein flacher Zaunsockel. Gilt nicht als Freigabe, massive Wände zu durchlaufen. |

Ältere Namen `fenster light` werden aus Kompatibilitätsgründen weiterhin als Licht erkannt. Für neue Dateien die obigen Namen verwenden. Marker auf Komponenten gelten auch für deren untergeordnete Meshes. Bei `COLOR_` wird ein Gruppenname ebenso erkannt; Materialien können ebenfalls `COLOR_...` heißen.

## Kategorien und Bewegung
- `Figures` / `Characters`: Figuren; `Animals`: Tiere, etwas langsamer. Normale begehbare Flächen, freie Haus-Bodenplatten und Fußgängerbrücken.
- `Vehicles`: Autos auf Two Lane sowie Straßenbrücken. `Vehicles/Trains` (oder `Trains`): nur auf Rails. `Vehicles/Ships`, `Vehicles/Boats` (oder `Ships`/`Boats`): nur auf reinen Water-Tiles.
- Für Züge/Schiffe einfache angrenzende Strecken-/Wasser-Tiles verwenden. Ihre Grundbewegung verbindet Tile-Mittelpunkte; komplexe Gleisweichen und Hafenmanöver sind kein detailgetreuer Simulator.
- `Fences`: logischer Fußabdruck 50×10 mm. Auf Kanten von Bodenplatten; kleine Bordsteine dürfen den Sockel überdecken. Den hervorstehenden Fuß `NOCONTACT_...` nennen. Der Zaun selbst bleibt ein Hindernis.
- `Bridges/...Streets...`: Autos; `Bridges/...Tiles...`: Figuren/Tiere; `Bridges/...Rails...`: Züge; `Bridges/...Pavement...`: Autos und Figuren.
- Bestehende Brücken-Raster, Rampenanschlüsse und Trägerregeln bleiben eigenständig. Nicht durch eine neue PLACEMENT-Platte ersetzen.
- Eine neue niedrigere Pavement-Brücke muss im Katalog die tatsächlich gemessene Fahrbahnhöhe erhalten. Die aktuelle Bibliothek enthält dieses Modell noch nicht; keine erfundene Sonderhöhe wird verwendet.

## Gruppen
Gruppen haben immer eine kräftige Hot-Pink-Auswahlkontur. Der Farbwähler verändert keine Gruppenkonturen mehr, sondern ausschließlich vorhandene COLOR_-Flächen.

## Lokale Dateien und Geräusche
Bilder, Schrift, Hintergrundmusik und Three.js liegen unter `assets/`. Three.js 0.180.0 samt MIT-Lizenz liegt unter `assets/vendor/three/`.
Im Asset Manager hat jedes Modell „Interaction sound“: Datei wählen, Lautstärke einstellen, vorhören oder eigene Audiodatei hochladen, dann Save changes. Die bisherigen Interaktionssounds sind als WAV unter assets/MUSIC/Effects gespeichert. Eigene Uploads liegen in assets/MUSIC. Auswählen und Platzieren nutzen diesen Sound; Ohne Zuweisung gilt automatisch Placement pop. No sound schaltet ihn ausdrücklich für dieses Asset aus. Bereits ausgewählte Objekte geben beim anschließenden Versetzen keinen zweiten Ton ab. Hintergrundgeräusche und UI-Klicks werden weiterhin lokal per Web Audio erzeugt. Mute gilt für alle Geräusche. Beim GitHub-Upload werden die Audiodateien mitgenommen.
Nur Live-Wetter/Ortssuche benötigen Open-Meteo im Internet. Ausgehende MakerWorld-, Snapmaker-, Instagram- und DRC-Links führen ebenfalls ins Internet. Der Builder wird weiterhin über seinen lokalen Server gestartet, nicht durch Doppelklick auf index.html.

## Rauch vorbereiten
Nur den gewünschten Rauch-Auslass `SMOKE_...` nennen, nicht das gesamte Haus oder Fahrzeug. Mehrere Auslässe sind möglich. Gruppen und GLB-Meshnamen werden erkannt; markierte Unterobjekte einer bereits markierten Gruppe erzeugen keine doppelten Quellen. Der Ursprung bewegt sich mit dem Modell; ausgestoßener Rauch steigt unabhängig davon weiter nach oben. Der Effekt wird auch nach Laden und Kopieren erkannt und benötigt keine externen Dateien. Insgesamt maximal 96 Rauchwolken, gemeinsam gezeichnet, unabhängig von den Wetter-Wolkenreglern.

### Lichtschein und Ausrichtung
`LIGHT_H` richtet den flächenförmigen Schein nach außen aus, relativ zum Gebäudekörper auf Fensterhöhe (nicht zur Grundplatte). Der Schein bleibt von beiden Seiten sichtbar. `LIGHT_V` erzeugt einen runden, nach unten breiter werdenden Kegel mit weichem Auslauf. Beide übernehmen die Farbe des Leuchtkörpers. Fensterschein beginnt mit 45 % Transparenz, der vertikale Kegel mit 70 % Transparenz; beide werden zum Ende unsichtbar. Änderungen gelten auch für neu hinzugefügte Modelle.
