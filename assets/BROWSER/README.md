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
| `LIGHT`, `LIGHTS`, `LIGHT_window`, `LIGHTS_front` | Nachtleuchten plus leichter Lichtschein. Material-/Vertexfarben bleiben maßgeblich. Fahrzeuge haben vordere/rote hintere Lichtstrahlen. |
| `LAMP`, `LAMPS`, `LAMP_street` | Nachtleuchten plus nach unten gerichteter Lichtkegel. Nur das Leuchtmittel so nennen, nicht Rahmen oder ganzen Pfosten. |
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
Klicks, Hover-Ticks, Hupen, Klingeln, Fantasie-Gemurmel, Katzen- und Zugtöne werden lokal per Web Audio im JavaScript erzeugt. Dafür gibt es keine herunterzuladende Audiodatei und keinen externen Sounddienst. Mute schaltet sie stumm.
Nur Live-Wetter/Ortssuche benötigen Open-Meteo im Internet. Ausgehende MakerWorld-, Snapmaker-, Instagram- und DRC-Links führen ebenfalls ins Internet. Der Builder wird weiterhin über seinen lokalen Server gestartet, nicht durch Doppelklick auf index.html.
