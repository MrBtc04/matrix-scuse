(() => {
  const canvas = document.getElementById('matrix');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  const btn = document.getElementById('btn');
  const copyBtn = document.getElementById('copy');
  const resultEl = document.getElementById('result');
  const metaEl = document.getElementById('meta');
  const credRadios = Array.from(document.querySelectorAll('input[name="cred"]'));
  const hasGeneratorUI = !!(btn && copyBtn && resultEl && metaEl && credRadios.length);

  const levelNames = {
    1: 'Plausibile',
    2: 'Molto plausibile',
    3: 'Quasi inattaccabile',
  };

  const fallbackByLevel = {
    1: [
      "Buongiorno capo, purtroppo mi sono svegliato con febbre e dolori. Oggi non riesco a venire in ufficio, resto a riposo.",
      "Buongiorno capo, stanotte ho avuto un forte malessere e non sono in condizioni di lavorare oggi. Mi scuso per il preavviso.",
      "Buongiorno capo, ho un’emicrania molto forte e faccio fatica a stare in piedi. Oggi devo fermarmi.",
      "Buongiorno capo, ho un’influenza improvvisa con brividi e febbre. Oggi resto a casa per riprendermi.",
      "Buongiorno capo, ho nausea e problemi gastrointestinali. Oggi purtroppo non riesco a essere presente.",
      "Buongiorno capo, mi sono svegliato con la voce completamente KO e forte mal di gola. Oggi devo restare a riposo.",
      "Buongiorno capo, ho tosse e spossatezza e non sono lucido. Oggi non riesco a venire.",
      "Buongiorno capo, mi sono alzato con giramenti di testa e pressione bassa. Preferisco non rischiare e restare a casa.",
      "Buongiorno capo, ho un dolore alla schiena improvviso e mi muovo male. Oggi devo riposare.",
      "Buongiorno capo, ho un torcicollo molto forte e guidare in sicurezza è complicato. Oggi resto a casa.",
      "Buongiorno capo, ho avuto una notte in bianco e stamattina sto male. Oggi non riesco a lavorare.",
      "Buongiorno capo, non sto bene e devo sentire il medico oggi. Mi scuso, oggi non riesco a venire.",
      "Buongiorno capo, ho una reazione allergica importante e devo gestirla. Oggi resto a casa.",
      "Buongiorno capo, ho un forte mal di testa con sensibilità alla luce. Oggi devo riposare.",
      "Buongiorno capo, ho un dolore ai denti che non mi lascia tregua. Oggi devo fermarmi e sistemare la cosa.",
      "Buongiorno capo, mi sono svegliato febbricitante e molto spossato. Oggi non riesco a essere operativo.",
      "Buongiorno capo, ho dolori muscolari e stanchezza forte. Oggi resto a riposo e riprendo domani.",
      "Buongiorno capo, ho avuto un calo di pressione e mi sento debole. Oggi devo restare a casa.",
      "Buongiorno capo, stamattina non sto bene e preferisco non peggiorare. Oggi non riesco a venire.",
      "Buongiorno capo, ho un malessere generale e febbricola. Oggi resto a casa per recuperare.",
      "Buongiorno capo, mi sento improvvisamente molto male e non riesco a muovermi da casa. Oggi non riesco a esserci.",
      "Buongiorno capo, ho un problema di stomaco e devo restare vicino a casa. Mi scuso, oggi non vengo.",
      "Buongiorno capo, ho la schiena bloccata e faccio fatica a camminare. Oggi devo stare a riposo.",
      "Buongiorno capo, ho avuto un blocco alla schiena durante la notte e oggi mi muovo male. Oggi non riesco a venire.",
      "Buongiorno capo, ho un forte mal di gola e febbricola. Oggi resto a casa.",
      "Buongiorno capo, ho un’infiammazione ai seni nasali e forte mal di testa. Oggi devo fermarmi.",
      "Buongiorno capo, ho un imprevisto familiare urgente e devo occuparmene stamattina. Mi scuso, oggi non riesco a esserci.",
      "Buongiorno capo, devo assistere un familiare che non sta bene e non posso lasciarlo solo. Oggi devo assentarmi.",
      "Buongiorno capo, mio figlio non sta bene e devo restare con lui oggi. Mi scuso per il disagio.",
      "Buongiorno capo, ho un imprevisto con un familiare che richiede la mia presenza immediata. Oggi non riesco a venire.",
      "Buongiorno capo, ho un’urgenza domestica e devo risolverla stamattina. Oggi non potrò esserci.",
      "Buongiorno capo, ho un problema in casa e devo essere presente per sistemarlo. Oggi non riesco a venire.",
      "Buongiorno capo, mi sono accorto di una perdita d’acqua e devo intervenire subito. Oggi non potrò esserci.",
      "Buongiorno capo, ho perso le chiavi e sto gestendo la situazione. Oggi rischio di non riuscire a venire.",
      "Buongiorno capo, ho smarrito dei documenti e devo occuparmene con urgenza. Oggi devo assentarmi.",
      "Buongiorno capo, la mia auto non parte e non ho modo di raggiungere l’ufficio. Oggi non riesco a venire.",
      "Buongiorno capo, ho una gomma a terra e sto risolvendo, ma non credo di riuscire a venire oggi. Mi scuso.",
      "Buongiorno capo, ho un problema con l’auto e devo sistemarlo oggi. Oggi non potrò esserci.",
      "Buongiorno capo, c’è un blackout/guasto in zona e sto aspettando che rientri. Oggi potrei non riuscire a lavorare regolarmente.",
      "Buongiorno capo, ho un problema con la connessione e oggi non riesco a essere operativo. Mi scuso.",
      "Buongiorno capo, devo aspettare una consegna con firma e non posso allontanarmi. Oggi non riesco a venire.",
      "Buongiorno capo, il corriere passa solo oggi e devo essere presente per firmare. Oggi devo assentarmi.",
      "Buongiorno capo, ho perso il portafoglio e devo bloccare carte e fare denuncia. Oggi non riesco a venire.",
      "Buongiorno capo, devo passare dal medico/farmacia per una cosa urgente. Oggi non riesco a essere presente.",
      "Buongiorno capo, ho una commissione urgente che devo chiudere stamattina. Oggi non riesco a venire.",
      "Buongiorno capo, mi scuso per il preavviso, ma oggi non sono in condizioni di lavorare. Recupero e riparto domani.",
      "Buongiorno capo, ho bisogno di un giorno di recupero perché non sto bene. Domani conto di essere operativo.",
      "Buongiorno capo, oggi devo restare a casa per riprendermi: non riesco a essere presente in ufficio.",
      "Buongiorno capo, purtroppo oggi non riesco a venire per malessere improvviso. Mi scuso e vi aggiorno per domani.",
      "Buongiorno capo, non sto bene e preferisco fermarmi oggi per rientrare in forma domani. Grazie.",
    ],
    2: [
      "Buongiorno capo, purtroppo mi sono svegliato con un forte stato influenzale/febbre. Oggi non potrò venire al lavoro; se necessario invierò il certificato medico.",
      "Buongiorno capo, mi scuso per il preavviso, ma ho un’emergenza in casa (allagamento/idraulico) e devo restare per risolvere. Oggi non potrò esserci.",
      "Buongiorno capo, ho un’urgenza medica non rimandabile questa mattina. Oggi non riuscirò a venire a lavorare; vi terrò aggiornati per domani.",
      "Buongiorno capo, devo assentarmi per un imprevisto con mio figlio/familiare che richiede la mia presenza urgente. Mi scuso per il disagio.",
      "Buongiorno capo, la mia auto non parte e non ho modo di raggiungere l’ufficio. Sto cercando una soluzione, ma non credo di riuscire a venire oggi.",
      "Buongiorno capo, ho avuto un blocco alla schiena questa notte e non riesco a muovermi bene. Oggi devo restare a riposo.",
      "Buongiorno capo, ho un virus gastrointestinale che mi impedisce di muovermi da casa. Oggi purtroppo non riuscirò a lavorare.",
      "Buongiorno capo, ho una visita medica già fissata questa mattina e non riesco a spostarla. Oggi non potrò essere presente.",
      "Buongiorno capo, ho un appuntamento dal dentista preso da tempo e oggi devo andarci. Mi scuso, oggi non riesco a venire.",
      "Buongiorno capo, devo fare degli esami/analisi questa mattina e ho l’orario già prenotato. Oggi non riuscirò a essere presente.",
      "Buongiorno capo, ho una terapia/controllo programmato oggi e non posso saltarlo. Oggi devo assentarmi.",
      "Buongiorno capo, devo ritirare dei referti oggi e gli orari sono solo al mattino. Oggi non riesco a essere presente.",
      "Buongiorno capo, devo aspettare il tecnico a casa (fascia oraria stretta) e devo essere presente. Oggi non potrò venire.",
      "Buongiorno capo, ho l’intervento del tecnico per Internet/telefono e devo restare in casa. Oggi non riesco a venire.",
      "Buongiorno capo, ho un guasto domestico e oggi viene l’idraulico/elettricista. Oggi non potrò essere in ufficio.",
      "Buongiorno capo, c’è una perdita d’acqua in casa e devo gestire l’intervento oggi. Mi scuso, oggi non riesco a venire.",
      "Buongiorno capo, ho un guasto all’auto e sto aspettando assistenza/meccanico. Oggi non riesco a venire.",
      "Buongiorno capo, ho avuto una gomma bucata e sto risolvendo con il gommista. Oggi non credo di riuscire a essere presente.",
      "Buongiorno capo, la batteria dell’auto è a terra e devo sistemarla prima di muovermi. Oggi non riesco a venire.",
      "Buongiorno capo, sono rimasto bloccato nel traffico per un incidente e non riesco ad arrivare. Oggi non riesco a essere presente.",
      "Buongiorno capo, il treno è stato soppresso/ha accumulato un ritardo importante e non riesco ad arrivare in tempo. Oggi non potrò venire.",
      "Buongiorno capo, ci sono disservizi sulla linea e non riesco a raggiungere l’ufficio stamattina. Oggi non riesco a essere presente.",
      "Buongiorno capo, ho un imprevisto con scuola/asilo e devo intervenire subito. Oggi non potrò esserci.",
      "Buongiorno capo, mi hanno chiamato da scuola/asilo: devo andare a prendere mio figlio. Mi scuso, oggi devo assentarmi.",
      "Buongiorno capo, devo accompagnare un familiare a una visita e non ho alternative oggi. Oggi non potrò venire.",
      "Buongiorno capo, ho un’urgenza burocratica con scadenza oggi e devo andare allo sportello. Oggi non riesco a venire.",
      "Buongiorno capo, devo fare denuncia per documenti smarriti e gli orari sono solo al mattino. Oggi devo assentarmi.",
      "Buongiorno capo, ho un appuntamento urgente in banca/ufficio per una pratica non rimandabile. Oggi non riesco a essere presente.",
      "Buongiorno capo, devo firmare dei documenti oggi e posso farlo solo in fascia mattutina. Oggi devo assentarmi.",
      "Buongiorno capo, ho un colloquio/appuntamento fissato da tempo e non posso spostarlo. Oggi non potrò esserci.",
      "Buongiorno capo, devo ritirare un pacco in giacenza entro oggi o torna indietro. Oggi non riesco a venire.",
      "Buongiorno capo, ho una consegna importante e devo essere in casa per il ritiro. Oggi non potrò venire.",
      "Buongiorno capo, sto aspettando una consegna con firma e la fascia oraria è vincolata. Oggi devo assentarmi.",
      "Buongiorno capo, ho un problema con il condominio (perdita/guasto) e devo essere presente all’intervento. Oggi non riuscirò a venire.",
      "Buongiorno capo, ho un problema con il contatore/utenze e oggi devo ricevere il tecnico. Oggi non potrò essere presente.",
      "Buongiorno capo, ho sintomi influenzali e preferisco restare a casa per evitare contagi. Oggi non potrò venire.",
      "Buongiorno capo, ho mal di schiena forte e oggi devo fare riposo/terapia. Oggi non riesco a essere presente.",
      "Buongiorno capo, ho un problema al ginocchio e devo fare accertamenti/visita. Oggi non potrò venire.",
      "Buongiorno capo, ho un’infiammazione e il medico mi ha dato appuntamento oggi. Oggi devo assentarmi.",
      "Buongiorno capo, ho bisogno di passare in farmacia e dal medico: oggi è l’unico slot disponibile. Oggi non riesco a venire.",
      "Buongiorno capo, ho un guasto alla porta/serratura e devo aspettare il fabbro. Oggi non potrò esserci.",
      "Buongiorno capo, sono rimasto chiuso fuori casa e sto risolvendo con fabbro/amministratore. Oggi non riesco a venire.",
      "Buongiorno capo, ho un problema urgente con l’assicurazione/auto e devo chiudere oggi di persona. Oggi non potrò venire.",
      "Buongiorno capo, ho un problema con il pagamento/bancomat e devo sistemare di persona. Oggi devo assentarmi.",
      "Buongiorno capo, ho un imprevisto con un animale domestico e devo portarlo dal veterinario. Oggi non riesco a venire.",
      "Buongiorno capo, devo accompagnare qualcuno a fare una visita/controllo urgente. Oggi non potrò esserci.",
      "Buongiorno capo, ho un controllo programmato e devo rispettare l’orario. Oggi non riesco a venire.",
      "Buongiorno capo, ho una convocazione in un ufficio pubblico e non posso mancare. Oggi devo assentarmi.",
      "Buongiorno capo, ho un problema con i documenti dell’auto e devo andare a sistemare oggi. Oggi non potrò venire.",
      "Buongiorno capo, ho una seduta/controllo dal fisioterapista programmato oggi e non riesco a spostarlo. Oggi devo assentarmi.",
    ],
    3: [
      "Buongiorno capo, mi hanno dato un appuntamento in ambulatorio/guardia medica questa mattina. Oggi non riuscirò a venire; appena esco vi aggiorno.",
      "Buongiorno capo, ho una visita medica con certificazione e oggi devo necessariamente presentarmi. Se serve posso inviare il giustificativo.",
      "Buongiorno capo, ho analisi del sangue prenotate con appuntamento questa mattina e devo rispettare l’orario. Oggi non riesco a venire.",
      "Buongiorno capo, ho una visita specialistica prenotata da tempo e non mi hanno dato alternative. Oggi devo assentarmi; appena finisco vi aggiorno.",
      "Buongiorno capo, ho un controllo in ospedale già calendarizzato oggi e non posso spostarlo. Oggi non potrò essere presente.",
      "Buongiorno capo, sto attendendo un referto/esito di un controllo e oggi devo ritirarlo di persona. Oggi devo assentarmi.",
      "Buongiorno capo, ho un appuntamento ASL/ambulatorio con orario fissato e non riesco a spostarlo. Oggi non potrò venire.",
      "Buongiorno capo, mi hanno anticipato una visita/controllo e mi hanno inserito oggi come prima data utile. Oggi devo assentarmi.",
      "Buongiorno capo, devo accompagnare un familiare a una visita ospedaliera già fissata e devo essere presente. Oggi non riuscirò a venire.",
      "Buongiorno capo, ho un familiare con terapia/visita oggi e devo accompagnarlo io. Oggi devo assentarmi.",
      "Buongiorno capo, ho un imprevisto con la scuola/asilo che richiede la mia presenza oggi (mi hanno chiamato stamattina). Oggi non potrò venire.",
      "Buongiorno capo, mi hanno chiamato da scuola/asilo per un imprevisto e sto andando a gestire ora. Oggi devo assentarmi.",
      "Buongiorno capo, sono bloccato con l’assistenza stradale (pratica aperta) e finché non chiudono non riesco a muovermi. Oggi non riesco a venire.",
      "Buongiorno capo, ho il carro attrezzi/assistenza in arrivo e sono in attesa sul posto. Oggi non riesco a essere presente.",
      "Buongiorno capo, ho avuto un guasto all’auto e sono dal meccanico con tempi incerti. Oggi non credo di riuscire a venire.",
      "Buongiorno capo, sono rimasto fermo per un ingorgo/incidente importante e non riesco ad arrivare in tempi utili. Oggi non potrò esserci.",
      "Buongiorno capo, il treno è stato cancellato e la prossima corsa utile mi farebbe arrivare troppo tardi. Oggi non riesco a venire.",
      "Buongiorno capo, ho il tecnico (utenze/caldaia) in arrivo in fascia 8–12 e devo essere presente per l’intervento. Oggi non potrò essere in ufficio.",
      "Buongiorno capo, ho il tecnico della fibra in casa con intervento programmato e devo restare presente fino a chiusura lavoro. Oggi devo assentarmi.",
      "Buongiorno capo, ho un intervento idraulico urgente in corso e devo restare presente finché non chiudono il lavoro. Oggi non riuscirò a venire.",
      "Buongiorno capo, c’è una perdita condominiale e oggi c’è l’intervento: devo dare accesso e firmare il verbale. Oggi devo assentarmi.",
      "Buongiorno capo, ho l’elettricista in casa per un guasto e devo restare finché non ripristina. Oggi non potrò venire.",
      "Buongiorno capo, ho un guasto alla serratura e sto aspettando il fabbro: finché non risolve non posso muovermi. Oggi non riesco a venire.",
      "Buongiorno capo, sono rimasto chiuso fuori casa e sto aspettando fabbro/amministratore per l’accesso. Oggi non potrò essere presente.",
      "Buongiorno capo, ho un’urgenza documentale con scadenza oggi e appuntamento allo sportello su prenotazione. Oggi devo assentarmi.",
      "Buongiorno capo, ho un appuntamento in Questura/ufficio pubblico su prenotazione e non posso riprogrammarlo. Oggi non riesco a venire.",
      "Buongiorno capo, devo fare denuncia per smarrimento documenti e ho appuntamento allo sportello questa mattina. Oggi devo assentarmi.",
      "Buongiorno capo, ho un appuntamento in banca per una pratica vincolata (identificazione/firma) e devo presentarmi di persona. Oggi non potrò esserci.",
      "Buongiorno capo, ho una pratica notarile/firmataria fissata oggi e non riesco a spostarla. Oggi devo assentarmi.",
      "Buongiorno capo, ho un appuntamento per rinnovo/ritiro documenti con orario fissato. Oggi non riesco a essere presente.",
      "Buongiorno capo, ho una consegna con firma in fascia oraria vincolata e devo essere presente. Oggi non potrò venire.",
      "Buongiorno capo, sto aspettando un ritiro/consegna con firma in una finestra oraria vincolata. Oggi devo assentarmi.",
      "Buongiorno capo, ho la corrente saltata e l’assistenza è programmata oggi: finché non ripristinano non riesco a essere operativo. Oggi devo assentarmi.",
      "Buongiorno capo, la linea Internet è fuori servizio e il gestore ha fissato l’intervento oggi: senza ripristino non riesco a lavorare. Vi aggiorno appena torna.",
      "Buongiorno capo, ho un guasto al contatore/utenze e oggi passa il tecnico: devo essere presente per l’intervento. Oggi non riuscirò a venire.",
      "Buongiorno capo, ho un’urgenza veterinaria e devo portare l’animale in ambulatorio ora. Oggi devo assentarmi.",
      "Buongiorno capo, sono dal veterinario per un’urgenza e i tempi sono incerti. Oggi non riesco a essere presente.",
      "Buongiorno capo, ho un appuntamento per esami/visita con possibili tempi di attesa lunghi. Oggi non credo di riuscire a rientrare in tempi utili.",
      "Buongiorno capo, oggi devo ritirare un certificato/giustificativo dal medico e chiudere la pratica. Oggi non potrò essere presente.",
      "Buongiorno capo, dopo visita mi hanno prescritto riposo per oggi. Oggi devo assentarmi.",
      "Buongiorno capo, ho una terapia programmata con orario fisso oggi e non posso mancare. Oggi non riesco a venire.",
      "Buongiorno capo, devo accompagnare un familiare a un controllo già fissato e non ho alternative. Oggi devo assentarmi.",
      "Buongiorno capo, ho un imprevisto familiare serio da gestire oggi e non riesco a essere presente. Vi aggiorno appena possibile.",
      "Buongiorno capo, ho un’urgenza amministrativa con scadenza oggi e appuntamento fissato. Oggi non potrò venire.",
      "Buongiorno capo, sto gestendo un intervento urgente in casa con tecnico sul posto e devo restare presente fino a chiusura. Oggi devo assentarmi.",
      "Buongiorno capo, ho un controllo post-visita già fissato oggi e non riesco a spostarlo. Oggi non potrò venire.",
      "Buongiorno capo, devo partecipare a un sopralluogo/intervento condominiale urgente per una perdita e serve la mia presenza. Oggi non riesco a venire.",
      "Buongiorno capo, ho un appuntamento allo sportello su prenotazione per una pratica documentale e non posso spostarlo. Oggi devo assentarmi.",
      "Buongiorno capo, sto aspettando un intervento tecnico del gestore per un guasto: finché non ripristinano non riesco a collegarmi. Vi aggiorno appena risolto.",
      "Buongiorno capo, ho una visita di controllo urgente fissata stamattina e devo presentarmi di persona. Oggi non riuscirò a venire.",
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
    if (!hasGeneratorUI) return;
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
    if (!hasGeneratorUI) return;
    const list = getActiveList();
    const excuse = pickOne(list);
    animateResult(excuse || 'Non ho scuse disponibili per questo livello.');
    copyBtn.disabled = !excuse;
  }

  async function loadExcusesTxt() {
    if (!hasGeneratorUI) return;
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
    if (!hasGeneratorUI) return;
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

    if (hasGeneratorUI) {
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
    }

    // first draw
    ctx.fillStyle = 'rgba(5, 6, 7, 1)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    drawMatrix();
    if (hasGeneratorUI) loadExcusesTxt();
  }

  init();
})();
