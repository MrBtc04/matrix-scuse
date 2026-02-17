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
    // fallback "ricco": così l'app resta utile anche senza poter leggere scuse.txt
    1: [
      "Non sto bene (raffreddore/mal di testa). Oggi resto a riposo.",
      "Ho febbricola e brividi: oggi mi fermo per non peggiorare.",
      "Ho un’emicrania forte e faccio fatica anche solo a stare in piedi.",
      "Ho nausea e mal di stomaco: oggi devo restare a casa.",
      "Ho mal di gola molto forte e la voce è quasi andata.",
      "Ho tosse e mi sento spossato: oggi non sono lucido.",
      "Ho dolori muscolari e stanchezza: oggi non riesco a rendere.",
      "Ho la schiena bloccata e mi muovo male: oggi devo riposare.",
      "Ho un torcicollo forte e non riesco a guidare serenamente.",
      "Ho giramenti di testa e non me la sento di uscire.",
      "Ho pressione bassa e mi sento debole.",
      "Ho un’infiammazione ai seni nasali e un forte mal di testa.",
      "Ho una reazione allergica importante e oggi devo gestirla.",
      "Ho occhi irritati e fastidio forte: devo farmi controllare.",
      "Ho un dolore ai denti che mi sta dando parecchio fastidio.",
      "Ho avuto una notte quasi in bianco e oggi non sono operativo.",
      "Ho dormito pochissimo per un imprevisto notturno e sono distrutto.",
      "Non sto bene mentalmente oggi: ho bisogno di staccare e recuperare.",
      "Ho un forte stato d’ansia stamattina e non riesco a gestire la giornata.",
      "Oggi non riesco a concentrarmi: preferisco recuperare e ripartire bene.",
      "Ho un imprevisto familiare e devo occuparmene stamattina.",
      "Devo assistere un parente che non sta bene e non posso lasciarlo solo.",
      "Il bimbo non sta bene e oggi devo restare con lui.",
      "Ho un’urgenza domestica e devo risolverla oggi.",
      "Ho un problema in casa (acqua/luce) e devo essere presente.",
      "Mi sono accorto ora di una perdita in bagno e devo intervenire.",
      "Ho perso le chiavi e devo gestire la situazione.",
      "Ho smarrito dei documenti e devo occuparmene subito.",
      "Ho un problema con l’auto e oggi non riesco a muovermi.",
      "Ho una gomma a terra e sto cercando di risolvere.",
      "La macchina non parte e devo capire cosa fare.",
      "Ho avuto un piccolo incidente domestico e oggi devo riposare.",
      "Mi sono fatto male a una caviglia e faccio fatica a camminare.",
      "Mi sento male all’improvviso: preferisco non rischiare.",
      "Devo sentire il medico oggi perché non sto bene.",
      "Devo passare in farmacia per una cosa urgente.",
      "Ho un appuntamento personale che non posso spostare.",
      "Ho una commissione urgente che devo chiudere stamattina.",
      "Devo accompagnare qualcuno per una cosa importante.",
      "Ho un problema con Internet e oggi non riesco a lavorare bene.",
      "Ho un blackout/guasto in zona e sto aspettando che rientri.",
      "Ho un problema con la consegna a casa e devo essere presente.",
      "Il corriere passa solo oggi e devo firmare.",
      "Ho perso il portafoglio e devo bloccare tutto e fare denuncia.",
      "Ho un forte mal di schiena e oggi devo stare fermo.",
      "Ho una ricaduta influenzale e devo restare a casa.",
      "Ho un malessere generale e oggi non riesco a venire.",
      "Ho bisogno di un giorno di recupero: domani conto di essere ok.",
      "Oggi non sono in condizioni di lavorare: mi rimetto e ci sentiamo domani.",
      "Ho un forte mal di testa e sensibilità alla luce: oggi devo riposare.",
    ],
    2: [
      "Ho una visita medica fissata questa mattina e non riesco a spostarla.",
      "Ho una visita dal medico e mi ha dato la prima disponibilità oggi.",
      "Ho un appuntamento dal dentista preso da tempo e devo andarci.",
      "Devo fare degli esami/analisi questa mattina e ho l’orario già prenotato.",
      "Ho una terapia/controllo programmato oggi e non posso saltarlo.",
      "Devo ritirare dei referti oggi e gli orari sono solo al mattino.",
      "Devo aspettare il tecnico a casa (fascia oraria stretta) e devo essere presente.",
      "Ho l’intervento del tecnico per Internet/telefono e devo essere in casa.",
      "Ho il controllo della caldaia/manutenzione condominiale e devo esserci.",
      "Ho un guasto domestico e oggi viene l’idraulico/elettricista.",
      "C’è una perdita d’acqua in casa e devo gestire l’intervento oggi.",
      "Ho un guasto all’auto e sto aspettando l’assistenza/carrozziere.",
      "Ho avuto una gomma bucata e sto risolvendo con il gommista.",
      "Ho la batteria dell’auto a terra e devo sistemarla prima di muovermi.",
      "Sono rimasto bloccato nel traffico per un incidente e non riesco ad arrivare.",
      "Il treno è stato soppresso/ha accumulato un ritardo importante e non riesco ad arrivare in tempo.",
      "Ci sono disservizi sulla linea e non riesco a raggiungere l’ufficio stamattina.",
      "Ho un imprevisto con scuola/asilo e devo intervenire subito.",
      "Mi hanno chiamato da scuola/asilo: devo andare a prendere il bimbo.",
      "Ho un familiare che oggi ha bisogno di assistenza e devo accompagnarlo.",
      "Devo accompagnare un parente a una visita e non ho alternative oggi.",
      "Ho un’urgenza burocratica con scadenza oggi e devo andare allo sportello.",
      "Devo fare denuncia per documenti smarriti e gli orari sono solo al mattino.",
      "Ho un appuntamento urgente in banca/ufficio (pratica non rimandabile) e devo andarci di persona.",
      "Devo firmare dei documenti oggi e posso farlo solo in fascia mattutina.",
      "Ho un colloquio/appuntamento fissato da tempo e non posso spostarlo.",
      "Devo ritirare un pacco in giacenza entro oggi o torna indietro.",
      "Ho una consegna importante e devo essere in casa per il ritiro.",
      "Sto aspettando una consegna con firma e la fascia oraria è vincolata.",
      "Ho un problema con il condominio (perdita/guasto) e devo essere presente all’intervento.",
      "Ho un problema con il contatore/utenze e devo ricevere il tecnico.",
      "Non ho corrente in casa e sto aspettando l’assistenza/il ripristino.",
      "La linea Internet è giù e il gestore ha fissato l’intervento oggi.",
      "Ho avuto una notte con febbre e il medico mi ha consigliato riposo oggi.",
      "Ho sintomi influenzali e preferisco restare a casa per evitare contagi.",
      "Ho mal di schiena forte: oggi faccio riposo e terapia.",
      "Ho un problema al ginocchio e devo fare accertamenti/visita.",
      "Ho un’infiammazione e il medico mi ha dato appuntamento oggi.",
      "Ho bisogno di passare in farmacia e dal medico: oggi è l’unico slot.",
      "Ho un guasto alla porta/serratura e devo aspettare il fabbro.",
      "Sono rimasto chiuso fuori casa e sto risolvendo con il fabbro/amministratore.",
      "Ho un problema urgente con l’assicurazione/auto e devo chiudere oggi.",
      "Ho un problema con il pagamento/bancomat e devo sistemare di persona.",
      "Ho un imprevisto con un animale domestico (veterinario) e devo andarci.",
      "Devo accompagnare qualcuno a fare una visita/controllo urgente.",
      "Ho un controllo programmato e devo rispettare l’orario.",
      "Ho una convocazione a un appuntamento in ufficio pubblico e non posso mancare.",
      "Ho un problema con i documenti dell’auto e devo andare a sistemare oggi.",
      "Ho un imprevisto logistico stamattina e non riesco a essere presente.",
      "Ho una seduta/controllo dal fisioterapista programmato oggi e non riesco a spostarlo.",
    ],
    3: [
      "Sono in guardia medica/ambulatorio questa mattina: ti aggiorno appena esco.",
      "Ho una visita medica con certificazione: se serve posso inviare il giustificativo.",
      "Ho analisi del sangue prenotate con appuntamento questa mattina: rientro appena finisco.",
      "Ho una visita specialistica prenotata da tempo e non mi hanno dato alternative: appena finisco mi collego/rientro.",
      "Ho un controllo in ospedale già calendarizzato oggi: appena chiudo ti aggiorno sugli orari.",
      "Sto aspettando l’esito/il referto di un controllo e oggi devo ritirarlo di persona.",
      "Ho un appuntamento ASL/ambulatorio con orario fissato: non riesco a spostarlo.",
      "Mi hanno anticipato una visita/controllo e mi hanno messo oggi come prima data utile.",
      "Devo accompagnare un familiare a una visita ospedaliera già fissata: ti tengo aggiornato.",
      "Ho un familiare con visita/terapia oggi e devo essere io ad accompagnarlo.",
      "Ho un problema con la scuola/asilo che richiede la mia presenza oggi (comunicazione ricevuta stamattina).",
      "Mi hanno chiamato da scuola/asilo per un imprevisto: sto andando a gestire ora.",
      "Sono bloccato con l’assistenza stradale (pratica aperta): appena riparto ti scrivo.",
      "Ho il carro attrezzi/assistenza in arrivo: finché non chiudono la pratica non riesco a muovermi.",
      "Ho avuto un guasto all’auto e sono dal meccanico: appena ho la macchina ti aggiorno.",
      "Sono rimasto fermo per un incidente/ingorgo importante: non riesco a rientrare in tempi utili.",
      "Il treno è cancellato e la prossima corsa utile mi farebbe arrivare troppo tardi: oggi non riesco.",
      "Ho il tecnico (utenze/caldaia) in arrivo nella fascia 8–12: appena finisce mi collego.",
      "Ho il tecnico della fibra in casa con intervento programmato: appena chiudono l’ordine mi collego.",
      "Ho un intervento idraulico urgente in corso: devo restare presente finché non chiudono il lavoro.",
      "C’è una perdita condominiale e oggi c’è l’intervento: devo essere presente per l’accesso.",
      "Ho l’elettricista in casa per un guasto: finché non ripristina non posso allontanarmi.",
      "Ho un guasto alla serratura e sto aspettando il fabbro: appena chiudo rientro.",
      "Sono rimasto chiuso fuori casa e sto aspettando il fabbro/amministratore per l’accesso.",
      "Ho una convocazione/urgenza documentale con scadenza oggi (sportello su appuntamento): rientro appena chiudo.",
      "Ho un appuntamento in Questura/ufficio pubblico (su prenotazione) e non posso riprogrammarlo oggi.",
      "Devo fare denuncia per smarrimento documenti e ho appuntamento allo sportello questa mattina.",
      "Ho un appuntamento in banca per una pratica vincolata (firma/identificazione): appena esco ti aggiorno.",
      "Ho una pratica notarile/firmataria fissata oggi: non riesco a spostarla.",
      "Ho un appuntamento per rinnovo/ritiro documenti con orario fissato: rientro appena finisco.",
      "Ho una consegna con firma e devo essere presente in fascia oraria vincolata: appena passa mi collego.",
      "Sto aspettando un ritiro/consegna con firma in una finestra oraria vincolata: appena passa riparto.",
      "Ho la corrente saltata e l’assistenza è programmata oggi: finché non ripristinano non riesco.",
      "La linea Internet è fuori servizio e il gestore ha fissato l’intervento oggi: appena torna su mi collego.",
      "Ho un guasto al contatore/utenze e oggi passa il tecnico: devo essere presente.",
      "Ho un’urgenza veterinaria e devo portare l’animale in ambulatorio ora.",
      "Sono dal veterinario per un’urgenza: appena finisco ti aggiorno sugli orari.",
      "Ho un appuntamento per esami/visita con tempi di attesa: oggi rischio di slittare e non riesco a rientrare.",
      "Ho un certificato/giustificativo in arrivo oggi dal medico: appena lo ho, ti aggiorno.",
      "Mi hanno prescritto riposo oggi dopo visita: rientro appena sto meglio.",
      "Ho una terapia programmata con orario fisso: oggi non riesco a essere presente.",
      "Devo accompagnare un familiare a un controllo già fissato e non ho alternative: ti aggiorno a fine visita.",
      "Ho un imprevisto familiare serio da gestire oggi: appena posso ti scrivo con un update.",
      "Ho un’urgenza amministrativa con scadenza oggi e appuntamento fissato: appena chiudo rientro.",
      "Sto gestendo un intervento urgente in casa con tecnico sul posto: appena termina mi collego.",
      "Ho un disservizio importante che mi impedisce di muovermi/collegarmi: ti aggiorno appena risolto.",
      "Ho un controllo post-visita già fissato oggi e non riesco a spostarlo: appena finisco ti aggiorno.",
      "Ho un sopralluogo/intervento condominiale urgente (perdita): devo dare accesso e firmare il verbale.",
      "Ho un appuntamento allo sportello su prenotazione per una pratica documentale: rientro appena chiudo.",
      "Sto aspettando un intervento tecnico del gestore per un guasto: finché non ripristinano non riesco a collegarmi.",
    ],
  };

  let excusesByLevel = {
    1: [...fallbackByLevel[1]],
    2: [...fallbackByLevel[2]],
    3: [...fallbackByLevel[3]],
  };
  let currentLevel = 2;

  function getActiveList() {
    return (excusesByLevel[currentLevel] || []).filter(Boolean);
  }

  function setMeta(extra) {
    const list = getActiveList();
    const levelLabel = levelNames[currentLevel] || `Livello ${currentLevel}`;
    metaEl.textContent = `${levelLabel} • ${list.length} scuse`;
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
    animateResult(excuse || 'Non ho scuse disponibili per questo livello.');
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
      }
    } catch {
      // keep fallback
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
