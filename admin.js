(() => {
  const loadBtn = document.getElementById('load');
  const saveBtn = document.getElementById('save');
  const editor = document.getElementById('editor');
  const countsEl = document.getElementById('counts');
  const statusEl = document.getElementById('status');
  
  // Rileva se siamo su Netlify o GitHub Pages
  const isStaticHosting = window.location.hostname.includes('netlify.app') || 
                          window.location.hostname.includes('github.io');
  
  const API_BASE = window.location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
  const apiUrl = (path) => `${API_BASE}${path}`;

  function setStatus(text, isError = false) {
    statusEl.textContent = text || '';
    statusEl.style.color = isError ? '#ff4444' : 'rgba(185, 255, 185, 0.7)';
  }

  function countLevels(text) {
    const counts = { 1: 0, 2: 0, 3: 0 };
    const errors = [];
    const lines = (text || '').split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i].trim();
      if (!raw || raw.startsWith('#')) continue;
      const m = raw.match(/^\[(1|2|3)\]\s+(.+)$/);
      if (!m) {
        errors.push(`Linea ${i + 1}: formato non valido`);
        continue;
      }
      const lvl = Number(m[1]);
      counts[lvl] += 1;
    }
    return { counts, errors };
  }

  function renderCounts() {
    const { counts, errors } = countLevels(editor.value);
    countsEl.textContent = `[1]=${counts[1]} • [2]=${counts[2]} • [3]=${counts[3]}${errors.length ? ` • errori: ${errors.length}` : ''}`;
  }

  async function load() {
    if (isStaticHosting) {
      setStatus('Nota: Su Netlify il salvataggio è disabilitato. Modifica scuse.txt su GitHub.');
      // Proviamo comunque a leggere il file scuse.txt attuale
      try {
        const res = await fetch('./scuse.txt');
        const text = await res.text();
        editor.value = text;
        renderCounts();
      } catch (e) {}
      return;
    }

    setStatus('Caricamento…');
    try {
      const res = await fetch(apiUrl('/api/scuse'), { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      editor.value = data.content || '';
      renderCounts();
      setStatus('Caricato dal server locale.');
    } catch (e) {
      setStatus('Backend non disponibile. Funzione Admin attiva solo in locale (python3 server.py).', true);
    }
  }

  async function save() {
    if (isStaticHosting) {
      alert("Su Netlify non puoi salvare direttamente. Devi modificare il file scuse.txt su GitHub e fare il commit.");
      return;
    }

    const { errors } = countLevels(editor.value);
    if (errors.length) {
      setStatus('Errore: ' + errors[0], true);
      return;
    }

    setStatus('Salvataggio…');
    try {
      const res = await fetch(apiUrl('/api/scuse'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editor.value }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('Salvato con successo!');
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      setStatus('Errore nel salvataggio: ' + e.message, true);
    }
  }

  editor.addEventListener('input', renderCounts);
  loadBtn.addEventListener('click', load);
  saveBtn.addEventListener('click', save);

  load();
})();