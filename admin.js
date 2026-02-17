(() => {
  const loadBtn = document.getElementById('load');
  const saveBtn = document.getElementById('save');
  const editor = document.getElementById('editor');
  const countsEl = document.getElementById('counts');
  const statusEl = document.getElementById('status');

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
      const res = await fetch('/api/scuse', { cache: 'no-store' });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Errore');
      editor.value = data.content || '';
      renderCounts();
      setStatus('Caricato.');
    } catch (e) {
      setStatus('Errore nel caricamento: ' + (e?.message || e));
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
      const res = await fetch('/api/scuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editor.value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const err = (data && (data.error || (data.errors && data.errors[0]))) || `HTTP ${res.status}`;
        throw new Error(err);
      }
      renderCounts();
      setStatus('Salvato.');
    } catch (e) {
      setStatus('Errore nel salvataggio: ' + (e?.message || e));
    }
  }

  editor.addEventListener('input', renderCounts);
  loadBtn.addEventListener('click', load);
  saveBtn.addEventListener('click', save);

  renderCounts();
  load();
})();

