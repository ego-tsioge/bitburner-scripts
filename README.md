# Bitburner Hacking System

Willkommen auf meiner Spielwiese mit Bitburner-Skripten. Die Skripte sind in der spielinternen Sprache Netscript geschrieben, was quasi JavaScript entspricht. Dieses Repo dient hauptsächlich dazu, meine Fortschritte festzuhalten und beim nächsten Neustart die Skripte automatisch parat zu haben.

Wenn du das Spiel selbst mal ausprobieren möchtest, klicke bitte auf einen der folgenden Links:
[Bitburner (GitHub)](https://danielyxie.github.io/bitburner/) 
[Bitburner (Steam)](https://store.steampowered.com/app/1812820/Bitburner/)

Wichtige Anmerkung: Was du hier siehst, ist größtenteils von anderen kopiert. 
Inspirationen gab es bei:
- https://github.com/jenheilemann/bitburner-scripts/blob/main/README.md
- https://www.youtube.com/watch?v=85-A4rOJr5A&list=PLbUKWaoZ7R0gWs0RBUUAzpXH_D8QKT1Fs&index=9
- https://www.reddit.com/r/Bitburner/
- https://quacksouls.github.io/lyf/hello_README/

## Anforderungen

Mein Lösungsansatz soll mit den 8 GB (spielinternes) RAM auskommen, die man beim Spielstart hat. Dazu werden die Aufgaben auf einzelne Module verteilt, von denen immer nur eines läuft. Der State wird im localStorage gemerkt. 

## Installation und Start

1. Lade das Skript namens `git-init.js` von GitHub, indem du die folgende Zeile im Bitburner Terminal ausführst:
    ```bash
    wget https://raw.githubusercontent.com/ego-tsioge/bitburner-scripts/main/bitburner-home/git-init.js git-init.js
    ```

2. Starte danach das Skript mit `run git-init.js`. 
   Dieses Skript lädt automatisch dieses Repo auf den Home Server (im Spiel).

3. Mit `run main.js` wird das Hauptmodul gestartet.

## Projektstruktur

```
bitburner-home/           # Spiegelt das Home-Verzeichnis im Spiel
├── main.js              # Hauptmodul/Einstiegspunkt
├── git-init.js          # Script zum Kopieren der Repository-Dateien
└── scripts/             # Alle weiteren Skripte
    ├── mod.*.js         # Hauptmodule
    ├── lib.*.js         # Wiederverwendbare Bibliotheken
    ├── bin.*.js         # Ausführbare Hack-Skripte
    └── cfg.*.js         # Konfigurationsdateien
```

