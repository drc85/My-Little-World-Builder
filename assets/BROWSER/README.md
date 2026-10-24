# Modelle für My Little World Builder

## Schnellwahl: Welchen Namen brauche ich?

| Gewünschter Effekt | Empfohlener Name | Beispiel |
|---|---|---|
| Nur leuchtende Fläche und weicher Glow, ohne Strahl (Gebäude) | `LIGHT_` | `LIGHT_sign` |
| Fenster / Scheinwerfer mit Schein nach außen | `LIGHT_H` | `LIGHT_H_window_front` |
| Lampe mit Kegel nach unten | `LIGHT_V` | `LIGHT_V_streetlamp` |  auch `LAMP_`
| Licht mit Kegel nach oben | `LIGHT_V_UP` | `LIGHT_V_UP_roof_H` |
| Im Spiel umfärbbare Fläche | `COLOR_` | `COLOR_wall` |
| Rauch-Auslass | `SMOKE_` | `SMOKE_chimney` |
| Bodenplatte für Platzierung / Fußabdruck | `PLACEMENT_PLATE` | `PLACEMENT_PLATE_ground` |
| Teil soll Figuren nicht blockieren | `NOCONTACT_` | `NOCONTACT_fence_foot` |

## So werden die Namen verwendet

- Die Namen gehören an den **Mesh / Modellteil oder die Komponente im 3D-Modell**, nicht an die GLB-Datei. Am besten jeden Leuchtkörper einzeln benennen.
- Groß-/Kleinschreibung ist egal: `LIGHT_V_UP` und `light_v_up` funktionieren gleich.
- Zusätze mit Unterstrich anhängen: `LIGHT_H_window_left`, `COLOR_wall`, `SMOKE_exhaust`. Der Marker muss am Anfang stehen. `house_LIGHT_H` wird nicht als LIGHT_H erkannt.
- Auch ohne Zusatz funktionieren `LIGHT`, `COLOR`, `SMOKE` und `NOCONTACT`. Ein abschließender Unterstrich ist erlaubt.
- Gruppenmarker wirken auf untergeordnete Teile. Deshalb **nicht das ganze Haus LIGHT oder COLOR nennen**, wenn nur einzelne Fenster oder Wände gemeint sind.
- Nicht beliebig mehrere Marker in einen Namen mischen: `COLOR_LIGHT_H` kombiniert die Effekte nicht automatisch. `LIGHT_V_UP` und `LIGHT_LAMP` sind ausdrücklich unterstützte Kombinationen.
- Für neue Modelle die Namen aus der Schnellwahl verwenden. Die älteren Namen unten bleiben unterstützt.

## Licht: alle Namen und ihre Unterschiede

Die folgende Tabelle beschreibt Gebäude und sonstige Nicht-Fahrzeuge. Die besondere Fahrzeugregel steht darunter.

| Name / Alias | Wirkung |
|---|---|
| `LIGHT`, `LIGHT_`, `LIGHTS`, `LIGHTS_` | Fläche leuchtet in ihrer Modellfarbe und erhält weichen Glow. **Kein extrudierter Strahl und kein Kegel.** Für Leuchtschilder oder reine Leuchtflächen. |
| `LIGHT_H`, `LIGHT_H_...`, `LIGHT_HORIZONTAL` | Glow plus horizontaler, flächenförmiger Schein nach außen. Für Fenster. Die Außenkontur der Lichtfläche wird verlängert, sofern eine passende Fläche erkannt wird; sonst wird eine rechteckige Ersatzform verwendet. |
| `LIGHT_V`, `LIGHT_V_...`, `LIGHT_VERTICAL` | Glow plus runder Kegel **nach unten**. Er wird nach unten breiter und läuft weich aus. V bedeutet hier nicht automatisch „zur Oberseite des Modells“. |
| `LIGHT_V_UP`, `LIGHT_V_UP_...`, `LIGHT_VERTICAL_UP` | Glow plus runder Kegel **nach oben**. Für Dachzeichen, Bodenstrahler oder nach oben gerichtete Lampen. |
| `WINDOW`, `WINDOW_...`, `WINDOWS`, `WINDOWS_...` | Entspricht bei Mesh-/Komponentennamen dem horizontalen Fensterschein, nicht einem reinen Glow. Für neue Modelle vorzugsweise `LIGHT_H` verwenden. |
| `LAMP`, `LAMP_...`, `LAMPS`, `LAMPS_...` | Älterer Name für den nach unten gerichteten Lampenkegel mit Glow, wie `LIGHT_V`. |
| `LIGHT_LAMP`, `LIGHT_LAMP_...` | Älterer kombinierter Name: leuchtender Körper mit Glow und Kegel nach unten, wie `LIGHT_V`. |
| `fenster light`, `fenster_light` | Alte Fensterbezeichnung, weiterhin als leuchtendes Fenster mit horizontalem Schein unterstützt. Nummerierte Varianten wie `fenster light 2` werden ebenfalls erkannt. |

Die Lichtpräfixe unterstützen auch die Mehrzahl, z. B. `LIGHTS_H`, `LIGHTS_V`, `LIGHTS_V_UP`, `LIGHTS_HORIZONTAL`, `LIGHTS_VERTICAL_UP`, `LIGHTS_LAMP`, `LIGHT_LAMPS` und `LIGHTS_LAMPS`. Zusätze jeweils mit `_` anhängen.

### Farbe, Richtung und Stärke

- Die **Farbe des Leuchtkörpers** bestimmt den Effekt: blaues Fenster → blauer Schein; gelbe Lampe → gelber Kegel. Vorhandene Emissionsfarbe hat Vorrang; ohne Emissionsfarbe wird die Materialfarbe verwendet. Vertex-Farben werden berücksichtigt. Bei gemischten Vertex-Farben verwendet der umgebende Schein eine gemittelte Farbe.
- Licht wird zum Abend / zur Nacht eingeblendet und tagsüber zurückgenommen.
- Bei `LIGHT_H` wird die horizontale Flächenrichtung ermittelt und geprüft, welche Seite nach außen frei ist. Beim Drehen des Objekts dreht sich der Schein mit.
- Aktueller Fensterschein: **35 % Deckkraft / 65 % Transparenz am Anfang**. Auf den ersten 35 % seiner Länge bleibt diese Stärke erhalten, danach wird er weich bis ganz unsichtbar ausgeblendet. Länge etwa 42–60 mm, abhängig von der Fläche.
- Vertikale Kegel beginnen mit 30 % Deckkraft / 70 % Transparenz und werden zum Ende unsichtbar. Abwärtskegel reichen abhängig von der Höhe bis zu 60 mm; Aufwärtskegel etwa 25–60 mm.
- Nur den tatsächlich leuchtenden Teil markieren. Stange, Fassung und Gehäuse getrennt lassen. Eine komplette `LAMP`-Gruppe kann sonst einen unerwünschten gemeinsamen Effekt ergeben. Bei mehreren Lampen jede Leuchtfläche einzeln benennen.
- Für zuverlässige Richtungseffekte **Mesh-/Komponentennamen** verwenden. Lichtnamen auf Materialien werden teilweise ebenfalls erkannt, aber nicht alle Aliase verhalten sich dort gleich. `COLOR_` auf Materialien ist ausdrücklich unterstützt.

### Besonderheit bei Autos / Fahrzeugen

Fahrzeuge verwenden eine eigene Scheinwerferlogik. Erkannte Lichtteile erzeugen dort Glow **und einen horizontalen Strahl**, auch wenn sie nur `LIGHT` heißen. `LIGHT_V` / `LIGHT_V_UP` schalten diese Fahrzeugregel derzeit nicht auf vertikale Kegel um.

Die Fahrtrichtung wird aus der Lage heller Frontlichter beziehungsweise roter Rücklichter abgeleitet; ohne passende Lichtteile gilt die Modellrichtung +X. Rote Lichter strahlen nach hinten, andere erkannte Lichtquellen nach vorne. Daher Front- und Rücklichter getrennt modellieren und passend färben. Ein eigener Marker für „nur Glow bei Fahrzeugen“ ist derzeit nicht vorhanden.

## Farbe, Rauch und Platzierung im Detail

| Marker | Genaues Verhalten | Worauf achten? |
|---|---|---|
| `COLOR`, `COLOR_...` | Zeigt den Farbwähler im Objekt-Label an und färbt die markierten Flächen um. Erkannt an Meshes, Komponenten und Materialien. | Alle COLOR-Flächen eines platzierten Objekts teilen sich die gewählte Farbe. Ohne COLOR-Teil kein Farbwähler. Die Auswahl wird gespeichert und kopiert. |
| `SMOKE`, `SMOKE_...` | Kleine weiße Rauchwolken steigen vom oberen Bereich des markierten Auslasses auf, tagsüber und nachts. | Nur Auslass / Schornstein markieren. Keine separate Sound- oder Wetter-Einstellung nötig. Weitere Hinweise unten unter „Rauch vorbereiten“. |
| `PLACEMENT_PLATE`, `PLACEMENT_PLATE_...` | Die markierte Bodenplatte bestimmt bei GLB/GLTF die Grundfläche, den Platzierungsmittelpunkt und die Unterkante. Überstehende Dächer oder Lampen bestimmen diese Grundfläche nicht. | Nur die echte Bodenplatte markieren. Ihre Geometrie muss eine Breite und Tiefe haben. Das markierte GLB wird nicht automatisch umgeformt oder neu zentriert. |
| `PLACEMENT_BASE`, `PLACEMENT_BASE_...` | Gleichwertiger Alias zu `PLACEMENT_PLATE`. | Bestehende Modelle dürfen diesen Namen behalten. Sonderregeln für Brücken bleiben eigenständig. |
| `NOCONTACT`, `NOCONTACT_...` | Der markierte Teil wird bei den entsprechenden Figuren-Hindernisprüfungen ignoriert, z. B. bei Hausbauteilen und Zaunfüßen. | Keine allgemeine Abschaltung sämtlicher Platzierungs- oder Fahrzeugkollisionen. Nur den überstehenden Fuß markieren, nicht den ganzen Zaun oder eine massive Wand. |

### Beispiel für ein Haus

```text
Haus
├── PLACEMENT_PLATE
├── COLOR_wall
├── LIGHT_H_window_front
├── LIGHT_H_window_side
├── LIGHT_sign
├── Lampenstange              ← gewöhnlicher Name, kein Lichteffekt
├── LIGHT_V_bulb
├── LIGHT_V_UP_roof_H
└── SMOKE_chimney
```

Für einen Zaun: sichtbares Zaunteil normal benennen, auskragenden Sockel `NOCONTACT_foot` nennen. Es gibt keine zusätzlichen Marker wie `SOUND_`, `SHADOW_` oder `GLOW_`: Sounds werden im Asset Manager eingestellt, Schatten vom Builder berechnet, reiner Gebäude-Glow heißt `LIGHT_`.

## Dateiformate und Maßstab

- GLB empfohlen: Geometrie und Farben in einer Datei. In Millimetern exportieren; Y zeigt nach oben.
- OBJ: passende MTL-Datei und alle referenzierten Texturen gemeinsam mit ablegen. Pfade und Groß-/Kleinschreibung müssen stimmen.
- PLY: eingebettete Vertex-Farben werden unterstützt.
- Dateiname möglichst `10x10 House.glb`, `5x5 Vehicle.obj` usw.; die Zahlen im Dateinamen sind Zentimeter. 10×10 bedeutet 100×100 mm.
- Die besondere unveränderte Geometrieübernahme anhand einer PLACEMENT-Platte gilt für GLB/GLTF ohne Brücken-Sonderrolle. Andere Modelle verwenden die bisherige Anpassung an die Kataloggröße.
- Nach Modelländerungen den Asset Manager aktualisieren/scannen und Änderungen speichern. Vor jedem GitHub-Upload wird der Asset-Scan ausgeführt und der aktuelle Katalog mit den lokalen Modellen übernommen.

## Kategorien und Bewegung
- `Figures` / `Characters`: Figuren; `Animals`: Tiere, etwas langsamer. Normale begehbare Flächen, freie Haus-Bodenplatten und Fußgängerbrücken.
- `Vehicles`: Autos auf Two Lane sowie Straßenbrücken. `Vehicles/Trains` (oder `Trains`): nur auf Rails. `Vehicles/Ships`, `Vehicles/Boats` (oder `Ships`/`Boats`): nur auf reinen Water-Tiles.
- Für Züge/Schiffe einfache angrenzende Strecken-/Wasser-Tiles verwenden. Ihre Grundbewegung verbindet Tile-Mittelpunkte; komplexe Gleisweichen und Hafenmanöver sind kein detailgetreuer Simulator.
- `Fences`: logischer Fußabdruck 50×10 mm. Auf Kanten von Bodenplatten; kleine Bordsteine dürfen den Sockel überdecken. Den hervorstehenden Fuß `NOCONTACT_...` nennen. Der Zaun selbst bleibt ein Hindernis.
- `Bridges/...Streets...`: Autos; `Bridges/...Tiles...`: Figuren/Tiere; `Bridges/...Rails...`: Züge; `Bridges/...Pavement...`: Autos und Figuren.
- Bestehende Brücken-Raster, Rampenanschlüsse und Trägerregeln bleiben eigenständig. Nicht durch eine neue PLACEMENT-Platte ersetzen.
- Eine neue niedrigere Pavement-Brücke muss im Katalog die tatsächlich gemessene Fahrbahnhöhe erhalten. Keine pauschale Sonderhöhe für anders gebaute Modelle verwenden.

## Gruppen
Gruppen haben immer eine kräftige Hot-Pink-Auswahlkontur. Der Farbwähler verändert keine Gruppenkonturen mehr, sondern ausschließlich vorhandene COLOR_-Flächen.

## Lokale Dateien und Geräusche
Bilder, Schrift, Hintergrundmusik und Three.js liegen unter `assets/`. Three.js 0.180.0 samt MIT-Lizenz liegt unter `assets/vendor/three/`.
Im Asset Manager hat jedes Modell „Interaction sound“: Datei wählen, Lautstärke einstellen, vorhören oder eigene Audiodatei hochladen, dann Save changes. Die bisherigen Interaktionssounds sind als WAV unter assets/MUSIC/Effects gespeichert. Eigene Uploads liegen in assets/MUSIC. Auswählen und Platzieren nutzen diesen Sound; Ohne Zuweisung gilt automatisch Placement pop. No sound schaltet ihn ausdrücklich für dieses Asset aus. Bereits ausgewählte Objekte geben beim anschließenden Versetzen keinen zweiten Ton ab. Hintergrundgeräusche und UI-Klicks werden weiterhin lokal per Web Audio erzeugt. Mute gilt für alle Geräusche. Beim GitHub-Upload werden die Audiodateien mitgenommen.
Nur Live-Wetter/Ortssuche benötigen Open-Meteo im Internet. Ausgehende MakerWorld-, Snapmaker- und Instagram-Links führen ebenfalls ins Internet. Der Builder wird weiterhin über seinen lokalen Server gestartet, nicht durch Doppelklick auf index.html.

## Rauch vorbereiten
Nur den gewünschten Rauch-Auslass `SMOKE_...` nennen, nicht das gesamte Haus oder Fahrzeug. Mehrere Auslässe sind möglich. Gruppen und GLB-Meshnamen werden erkannt; markierte Unterobjekte einer bereits markierten Gruppe erzeugen keine doppelten Quellen. Der Ursprung bewegt sich mit dem Modell; ausgestoßener Rauch steigt unabhängig davon weiter nach oben. Der Effekt wird auch nach Laden und Kopieren erkannt und benötigt keine externen Dateien. Insgesamt maximal 96 Rauchwolken, gemeinsam gezeichnet, unabhängig von den Wetter-Wolkenreglern.
