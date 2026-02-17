## Generatore di scuse (Matrix)

Pagina HTML statica in stile Matrix con un pulsante che genera una scusa casuale.
Le scuse sono in `scuse.txt` (una per riga) e ora supportano **3 livelli di credibilità**.

### Livelli di credibilità

Formato consigliato per ogni riga:

- `[1] ...` → Plausibile
- `[2] ...` → Molto plausibile
- `[3] ...` → Quasi inattaccabile

Le righe senza tag vengono trattate come livello `[2]` (compatibilità).

### Avvio (consigliato)

Per permettere al browser di leggere `scuse.txt`, avvia un mini server locale nella cartella:

```bash
cd /Users/mariopaaris/matrix-scuse
python3 -m http.server 8080
```

Poi apri `http://localhost:8080`.

### Nota

Se apri `index.html` direttamente con `file://`, alcuni browser bloccano `fetch('./scuse.txt')` per motivi di sicurezza.
In quel caso la pagina funziona comunque usando un piccolo set di scuse “fallback”.
