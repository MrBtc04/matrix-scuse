(() => {
  const loadBtn = document.getElementById('load');
  const saveBtn = document.getElementById('save');
  const editor = document.getElementById('editor');
  const countsEl = document.getElementById('counts');
  const statusEl = document.getElementById('status');
  const API_BASE = window.location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
  const apiUrl = (path) => `${API_BASE}${path}`;

  function setStatus(text) {
    statusEl.textContent = text || '';
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
        errors.push(`Linea ${i + 1}: formato non valido (usa [1]/[2]/[3])`);
        continue;
      }
      const lvl = Number(m[1]);
      const msg = m[2].trim();
      counts[lvl] += 1;
      if (!msg.startsWith('Buongiorno capo,')) {
        errors.push(`Linea ${i + 1}: deve iniziare con "Buongiorno capo,"`);
      }
    }
    return { counts, errors };
  }

  function renderCounts() {
    const { counts, errors } = countLevels(editor.value);
    countsEl.textContent = `[1]=${counts[1]} • [2]=${counts[2]} • [3]=${counts[3]}${errors.length ? ` • errori: ${errors.length}` : ''}`;
  }

  async function load() {
    setStatus('Caricamento…');
    try {
      const res = await fetch(apiUrl('/api/scuse'), { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Backend non disponibile (HTTP ${res.status}). Apri questa pagina dal server: http://127.0.0.1:8080/admin`);
      }
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Errore');
      editor.value = data.content || '';
      renderCounts();
      setStatus('Caricato.');
    } catch (e) {
      const msg = (e && e.message) || String(e);
      if (window.location.protocol === 'file:') {
        setStatus('Errore: stai aprendo il file in file://. Apri invece http://127.0.0.1:8080/admin (avvia: python3 server.py).');
      } else if (msg.toLowerCase().includes('failed to fetch')) {
        setStatus('Errore: non riesco a contattare il backend. Avvia il server (python3 server.py) e riapri /admin.');
      } else {
        setStatus('Errore nel caricamento: ' + msg);
      }
    }
  }

  async function save() {
    const { errors } = countLevels(editor.value);
    if (errors.length) {
      setStatus('Non posso salvare: ' + errors[0]);
      return;
    }

    setStatus('Salvataggio…');
    try {
      const res = await fetch(apiUrl('/api/scuse'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editor.value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const err = (data && (data.error || (data.errors && data.errors[0]))) || `HTTP ${res.status}`;
        throw new Error(`${err}. (Se sei su GitHub Pages, lì non esiste un backend: usa il server o ospitalo.)`);
      }
      renderCounts();
      setStatus('Salvato.');
    } catch (e) {
      const msg = (e && e.message) || String(e);
      if (window.location.protocol === 'file:') {
        setStatus('Errore: stai aprendo il file in file://. Apri invece http://127.0.0.1:8080/admin (avvia: python3 server.py).');
      } else if (msg.toLowerCase().includes('failed to fetch')) {
        setStatus('Errore: non riesco a contattare il backend. Avvia il server (python3 server.py) e riprova.');
      } else {
        setStatus('Errore nel salvataggio: ' + msg);
      }
    }
  }

  editor.addEventListener('input', renderCounts);
  loadBtn.addEventListener('click', load);
  saveBtn.addEventListener('click', save);

  renderCounts();
  load();
})();

