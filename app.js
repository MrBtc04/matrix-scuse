(() => {
  const canvas = document.getElementById('matrix');
  const ctx = canvas.getContext('2d', { alpha: true });

  const btn = document.getElementById('btn');
  const copyBtn = document.getElementById('copy');
  const resultEl = document.getElementById('result');
  const metaEl = document.getElementById('meta');
  const credRadios = Array.from(document.querySelectorAll('input[name="cred"]'));

  const levelNames = {
    1: 'Plausibile',
    2: 'Molto plausibile',
    3: 'Quasi inattaccabile',
  };

  const fallbackByLevel = {
    1: [
      'Non sto bene (mal di testa/raffreddore). Oggi resto a riposo.',
      'Ho avuto una notte pesante e sto poco bene: oggi non riesco a essere operativo.',
      'Ho un imprevisto familiare urgente e devo occuparmene stamattina.',
      'Ho una forte emicrania: oggi devo fermarmi.',
      'Ho un problema di stomaco e devo restare a casa.',
    ],
    2: [
      'Ho una visita medica già fissata questa mattina e non riesco a spostarla.',
      'Devo aspettare il tecnico a casa (fascia oraria stretta) e devo essere presente.',
      'Ho un guasto all’auto e sto aspettando l’assistenza/il carro attrezzi.',
      'C’è una perdita d’acqua/guasto domestico e devo gestire l’intervento oggi.',
      'Ho un imprevisto con scuola/asilo e devo intervenire subito.',
    ],
    3: [
      'Mi hanno dato un appuntamento in ambulatorio/guardia medica stamattina: ti aggiorno appena ho l’esito.',
      'Sono bloccato con l’assistenza stradale (pratica aperta): appena riparto ti scrivo.',
      'Ho il tecnico (utenze/caldaia) in arrivo nella fascia 8–12: appena finisce mi collego.',
      'Ho una visita medica con certificazione: se serve posso inviare il giustificativo.',
      'Ho un’urgenza documentale con scadenza oggi (sportello su appuntamento): rientro appena chiudo.',
    ],
  };

  let excusesByLevel = {
    1: [...fallbackByLevel[1]],
    2: [...fallbackByLevel[2]],
    3: [...fallbackByLevel[3]],
  };
  let sourceLabel = 'Fallback (browser in modalità offline/file://)';
  let currentLevel = 2;

  function getActiveList() {
    return (excusesByLevel[currentLevel] || []).filter(Boolean);
  }

  function setMeta(extra) {
    const list = getActiveList();
    const levelLabel = levelNames[currentLevel] || `Livello ${currentLevel}`;
    metaEl.textContent = `${sourceLabel} • ${levelLabel} • ${list.length} scuse`;
    if (extra) metaEl.textContent = `${metaEl.textContent} • ${extra}`;
  }

  function setLevel(nextLevel) {
    const lvl = Number(nextLevel);
    if (![1, 2, 3].includes(lvl)) return;
    currentLevel = lvl;
    try {
      localStorage.setItem('credibilityLevel', String(lvl));
    } catch {
      // ignore
    }
    setMeta();
  }

  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const alphabet =
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
    '0123456789' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz' +
    '@#$%&*+=-<>/\\|{}[]()';

  let fontSize = 16;
  let columns = 0;
  let drops = [];

  function resetMatrix() {
    fontSize = Math.max(14, Math.min(20, Math.floor(window.innerWidth / 60)));
    columns = Math.floor(window.innerWidth / fontSize);
    drops = Array.from({ length: columns }, () => Math.floor(Math.random() * 60));
  }

  function drawMatrix() {
    // fade
    ctx.fillStyle = 'rgba(5, 6, 7, 0.08)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < drops.length; i++) {
      const text = alphabet[Math.floor(Math.random() * alphabet.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // head is brighter
      ctx.fillStyle = 'rgba(0, 255, 65, 0.9)';
      ctx.fillText(text, x, y);

      // reset
      if (y > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }

    requestAnimationFrame(drawMatrix);
  }

  function pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function animateResult(text) {
    // small "typing" effect
    const full = text;
    let i = 0;
    resultEl.textContent = '';
    const tick = () => {
      i += Math.max(1, Math.floor(full.length / 40));
      resultEl.textContent = full.slice(0, i);
      if (i < full.length) {
        window.setTimeout(tick, 12);
      }
    };
    tick();
  }

  function generate() {
    const list = getActiveList();
    const excuse = pickOne(list);
    animateResult(excuse || 'Non ho scuse disponibili per questo livello. Controlla scuse.txt.');
    copyBtn.disabled = !excuse;
  }

  async function loadExcusesTxt() {
    try {
      const res = await fetch('./scuse.txt', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .filter((l) => !l.startsWith('#'));

      const parsed = { 1: [], 2: [], 3: [] };
      for (const line of lines) {
        const m = line.match(/^\[(1|2|3)\]\s*(.+)$/);
        if (m) {
          parsed[Number(m[1])].push(m[2].trim());
        } else {
          // Back-compat: se non c'è tag, trattalo come livello 2 (medio)
          parsed[2].push(line);
        }
      }

      const any = parsed[1].length + parsed[2].length + parsed[3].length;
      if (any > 0) {
        excusesByLevel = parsed;
        sourceLabel = 'Caricate da scuse.txt';
      } else {
        sourceLabel = 'scuse.txt vuoto → uso fallback';
      }
    } catch {
      // keep fallback
      sourceLabel = 'Impossibile leggere scuse.txt → uso fallback';
    } finally {
      setMeta();
    }
  }

  async function copyToClipboard() {
    const text = resultEl.textContent?.trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setMeta('copiato negli appunti');
      window.setTimeout(() => {
        setMeta();
      }, 1200);
    } catch {
      setMeta('copia non disponibile');
      window.setTimeout(() => {
        setMeta();
      }, 1400);
    }
  }

  function init() {
    resize();
    resetMatrix();
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`;

    window.addEventListener('resize', () => {
      resize();
      resetMatrix();
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`;
    });

    btn.addEventListener('click', generate);
    copyBtn.addEventListener('click', copyToClipboard);
    for (const r of credRadios) {
      r.addEventListener('change', (e) => {
        const v = e.target?.value;
        setLevel(v);
      });
    }

    // restore persisted level (default 2)
    try {
      const saved = Number(localStorage.getItem('credibilityLevel'));
      if ([1, 2, 3].includes(saved)) {
        currentLevel = saved;
      }
    } catch {
      // ignore
    }
    for (const r of credRadios) {
      if (Number(r.value) === currentLevel) r.checked = true;
    }

    // first draw
    ctx.fillStyle = 'rgba(5, 6, 7, 1)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    drawMatrix();
    loadExcusesTxt();
  }

  init();
})();
