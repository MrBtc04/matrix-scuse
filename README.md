## Generatore di scuse (Matrix)

Pagina HTML statica in stile Matrix con un pulsante che genera una scusa casuale.
Le scuse sono in `scuse.txt` (una per riga) e ora supportano **3 livelli di credibilità**.

### Livelli di credibilità

Formato consigliato per ogni riga:

- `[1] ...` → Plausibile
- `[2] ...` → Molto plausibile
- `[3] ...` → Quasi inattaccabile

Ogni scusa è già pronta da inviare: **inizia con “Buongiorno capo,”**.

Le righe senza tag vengono trattate come livello `[2]` (compatibilità), ma nel pannello admin è consigliato usare sempre i tag.

### Avvio (consigliato)

Per permettere al browser di leggere `scuse.txt` e per avere una pagina di gestione, avvia il backend nella cartella:

```bash
cd /Users/mariopaaris/matrix-scuse
python3 server.py
```

Poi apri:

- Sito: `http://127.0.0.1:8080`
- Admin (modifica `scuse.txt`): `http://127.0.0.1:8080/admin`

### Nota

Se apri `index.html` direttamente con `file://`, alcuni browser bloccano `fetch('./scuse.txt')` per motivi di sicurezza.
In quel caso la pagina funziona comunque usando un piccolo set di scuse “fallback”.
