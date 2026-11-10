import { LEVELS } from "../data/levels.js";
import { TRIVIA, getTrivia } from "../data/trivia.js";

const LETTERS = ["A", "B", "C", "D"];

const NUTRI_POSITIONS = [
  { name: "Chef Brocco", aspect: "Nutrisi & Pola Makan", icon: "🥦", color: "#a3e635", greeting: "Piring seimbang membuat ksatria kuat!", question: "Manakah kebiasaan makan yang paling seimbang?", options: ["Makan satu jenis makanan saja", "Mengisi piring dengan beragam makanan bergizi", "Minum soda setiap makan", "Melewatkan sarapan setiap hari"], correct: 1 },
  { name: "Sparky Zinc & Vita-B", aspect: "Zat Gizi Mikro", icon: "✨", color: "#fbbf24", greeting: "Vitamin dan mineral memang kecil, tapi kekuatannya besar!", question: "Zat besi dalam makanan membantu tubuh untuk...", options: ["Membentuk hemoglobin", "Membuat tulang menjadi lunak", "Menggantikan air minum", "Menghilangkan kebutuhan tidur"], correct: 0 },
  { name: "Dumbbell-Saurus", aspect: "Aktivitas Fisik", icon: "🦕", color: "#34d399", greeting: "Ayo bergerak! Tubuh aktif adalah tubuh yang bahagia!", question: "Contoh aktivitas fisik yang baik untuk remaja adalah...", options: ["Duduk sepanjang hari", "Bermain gawai tanpa jeda", "Berjalan, bersepeda, atau berolahraga", "Tidur sambil menonton"], correct: 2 },
  { name: "Owl-Cium", aspect: "Literasi Gizi", icon: "🦉", color: "#c4b5fd", greeting: "Baca labelnya, jadilah pembeli yang cerdas!", question: "Saat membaca label makanan, hal penting yang perlu diperhatikan adalah...", options: ["Warna kemasan saja", "Tanggal kedaluwarsa dan informasi gizi", "Ukuran gambar maskot", "Jumlah stiker hiasan"], correct: 1 },
  { name: "Iron-Boy", aspect: "Pencegahan Anemia", icon: "🛡️", color: "#fb7185", greeting: "Perisai besi siap melindungi tubuhmu!", question: "Salah satu cara membantu mencegah anemia adalah...", options: ["Menghindari semua sayuran", "Makan sumber zat besi dan minum TTD sesuai anjuran", "Tidak pernah sarapan", "Minum teh manis setiap jam"], correct: 1 },
  { name: "Mirror-Meow", aspect: "Body Image & Pola Makan", icon: "🐱", color: "#f9a8d4", greeting: "Kamu berharga dalam setiap bentuk tubuhmu!", question: "Sikap sehat terhadap tubuh sendiri adalah...", options: ["Membandingkan diri terus-menerus", "Menghargai tubuh dan merawatnya dengan baik", "Mengikuti diet ekstrem", "Melewatkan makan agar cepat kurus"], correct: 1 },
  { name: "Mama & Papa Bear", aspect: "Lingkungan & Keluarga", icon: "🐻", color: "#fb923c", greeting: "Kebiasaan sehat tumbuh dari rumah yang penuh kasih!", question: "Kebiasaan keluarga yang mendukung gizi sehat adalah...", options: ["Makan bersama dan memilih bekal beragam", "Menyimpan semua sayur di luar rumah", "Makan tanpa jadwal", "Melarang minum air putih"], correct: 0 }
];

function formatTime(seconds) {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export class UI {
  constructor({ audio, profile, saveProfile }) {
    this.audio = audio;
    this.profile = profile;
    this.saveProfile = saveProfile;
    this.game = null;
    this.toastTimer = null;
    this.crowdBumpTimer = null;

    this.hud = document.getElementById("hud");
    this.overlays = Array.from(document.querySelectorAll(".overlay"));
    this.modal = document.getElementById("modal-detail");
    this.modalCard = document.getElementById("modal-card");

    this.crowdCount = document.getElementById("hud-crowd-count");
    this.progressFill = document.getElementById("hud-progress-fill");
    this.bossPanel = document.getElementById("boss-panel");
    this.bossName = document.getElementById("boss-name");
    this.bossHpText = document.getElementById("boss-hp-text");
    this.bossHpFill = document.getElementById("boss-hp-fill");
    this.toastEl = document.getElementById("toast");
    this.muteBtn = document.getElementById("mute-btn");

    this.quizTitle = document.getElementById("quiz-title");
    this.quizQuestion = document.getElementById("quiz-question");
    this.quizOptions = document.getElementById("quiz-options");
    this.quizFeedback = document.getElementById("quiz-feedback");
    this.quizVerdict = document.getElementById("quiz-verdict");
    this.quizExplanation = document.getElementById("quiz-explanation");

    this._quizTrivia = null;
    this._quizResolve = null;
    this._quizAnswered = false;
    this._quizCorrect = false;
    this.nutriIndex = 0;
    this.nutriScore = 0;
    this.nutriAnswered = false;
    this.nutriComplete = false;
    this.nutriStarted = false;

    document.addEventListener("click", (event) => this.handleClick(event));
    this.updateMuteLabel();
  }

  attach(game) {
    this.game = game;
    this.renderMenuFooter();
  }

  handleClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target) {
      if (event.target === this.modal) this.closeModal();
      return;
    }
    const action = target.dataset.action;
    this.audio.ensure();

    switch (action) {
      case "select-nutri":
        this.audio.click();
        this.renderNutriHome();
        this.showScreen("nutri");
        break;
      case "back-library":
        this.audio.click();
        this.game.showMenuScene();
        this.showScreen("library");
        break;
      case "start-nutri":
        this.audio.click();
        this.startNutri();
        break;
      case "enter-nutri":
        this.audio.click();
        this.enterNutriTower(Number(target.dataset.index));
        break;
      case "nutri-option":
        this.answerNutri(Number(target.dataset.index));
        break;
      case "nutri-next":
        this.nextNutri();
        break;
      case "nutri-home":
        this.audio.click();
        this.renderNutriHome();
        break;
      case "locked-posttest":
        this.toast("Posttest terbuka setelah semua game edukasi selesai.");
        break;
      case "select-game":
        this.audio.click();
        this.showScreen("menu");
        this.game.showMenuScene();
        break;
      case "coming-soon":
        this.audio.gateBad();
        this.toast("Game ini sedang disiapkan.");
        break;
      case "open-levels":
        this.audio.click();
        this.renderLevels();
        this.showScreen("levels");
        break;
      case "open-encyclopedia":
        this.audio.click();
        this.renderEncyclopedia();
        this.showScreen("encyclopedia");
        break;
      case "open-leaderboard":
        this.audio.click();
        this.renderLeaderboard();
        this.showScreen("leaderboard");
        break;
      case "open-help":
        this.audio.click();
        this.showScreen("help");
        break;
      case "back-menu":
        this.audio.click();
        this.game.quitToMenu();
        break;
      case "start-level":
        this.audio.click();
        this.game.startLevel(Number(target.dataset.level));
        break;
      case "pause":
        this.audio.click();
        this.game.pause();
        break;
      case "resume":
        this.audio.click();
        this.game.resume();
        break;
      case "restart-level":
        this.audio.click();
        this.game.restartLevel();
        break;
      case "quit-level":
        this.audio.click();
        this.game.quitToMenu();
        break;
      case "mute":
        this.toggleMute();
        break;
      case "quiz-option":
        this.answerQuiz(Number(target.dataset.index));
        break;
      case "quiz-continue":
        this.continueQuiz();
        break;
      case "result-retry":
        this.audio.click();
        this.game.restartLevel();
        break;
      case "result-next":
        this.audio.click();
        this.game.nextLevel();
        break;
      case "gameover-retry":
        this.audio.click();
        this.game.restartLevel();
        break;
      case "open-card":
        this.audio.click();
        this.openCard(target.dataset.card);
        break;
      case "close-modal":
        this.audio.click();
        this.closeModal();
        break;
      default:
        break;
    }
  }

  renderNutriHome() {
    const progress = this.nutriComplete ? 7 : this.nutriIndex;
    document.getElementById("nutri-home").classList.remove("hidden");
    document.getElementById("nutri-quiz").classList.add("hidden");
    document.getElementById("nutri-result").classList.add("hidden");
    document.getElementById("nutri-progress-text").textContent = `${progress} / 7 menara`;
    document.getElementById("nutri-progress-fill").style.width = `${(progress / 7) * 100}%`;
    document.getElementById("nutri-session-label").textContent = this.nutriComplete ? "SELESAI" : "PRETEST";
    document.getElementById("nutri-start-btn").innerHTML = this.nutriComplete ? "Ulangi Pretest <b>→</b>" : "Mulai Pretest <b>→</b>";
    const map = document.getElementById("tower-map");
    map.innerHTML = NUTRI_POSITIONS.map((pos, index) => `<button class="tower-stop ${index < progress ? "tower-done" : ""} ${index === progress && !this.nutriComplete ? "tower-next" : ""}" data-action="${index === progress && !this.nutriComplete ? "enter-nutri" : ""}" data-index="${index}" style="--tower-color:${pos.color}"><span class="tower-icon">${index < progress ? "✓" : pos.icon}</span><small>POS ${index + 1}</small><strong>${pos.name}</strong><em>${index === progress && !this.nutriComplete ? "KLIK UNTUK MASUK" : pos.aspect}</em></button>`).join("");
  }

  startNutri() {
    this.nutriIndex = 0;
    this.nutriScore = 0;
    this.nutriComplete = false;
    this.nutriStarted = true;
    this.renderNutriHome();
    this.toast("Pilih Menara 1 untuk memulai petualangan!");
  }

  enterNutriTower(index) {
    if (index !== this.nutriIndex || this.nutriComplete) return;
    this.showNutriQuestion();
  }

  showNutriQuestion() {
    const pos = NUTRI_POSITIONS[this.nutriIndex];
    this.nutriAnswered = false;
    document.getElementById("nutri-home").classList.add("hidden");
    document.getElementById("nutri-result").classList.add("hidden");
    document.getElementById("nutri-quiz").classList.remove("hidden");
    document.getElementById("nutri-quiz-label").textContent = `MENARA ${this.nutriIndex + 1} / 7`;
    document.getElementById("nutri-guard-avatar").textContent = pos.icon;
    document.getElementById("nutri-guard-name").textContent = pos.name;
    document.getElementById("nutri-guard-role").textContent = pos.aspect;
    document.getElementById("nutri-dialogue").textContent = pos.greeting;
    document.getElementById("nutri-question").textContent = pos.question;
    document.getElementById("nutri-feedback").classList.add("hidden");
    document.getElementById("nutri-options").innerHTML = pos.options.map((option, index) => `<button class="nutri-option" data-action="nutri-option" data-index="${index}"><span>${LETTERS[index]}</span>${option}</button>`).join("");
  }

  answerNutri(index) {
    if (this.nutriAnswered) return;
    this.nutriAnswered = true;
    const pos = NUTRI_POSITIONS[this.nutriIndex];
    if (index === pos.correct) this.nutriScore += 1;
    Array.from(document.querySelectorAll(".nutri-option")).forEach((button) => {
      button.disabled = true;
      if (Number(button.dataset.index) === index) button.classList.add("selected");
    });
    document.getElementById("nutri-feedback").classList.remove("hidden");
    document.getElementById("nutri-feedback-title").textContent = "Jawaban tercatat!";
    document.getElementById("nutri-feedback-text").textContent = "Terima kasih sudah menjawab. Penjaga mencatat pilihanmu secara rahasia.";
  }

  nextNutri() {
    if (!this.nutriAnswered) return;
    this.nutriIndex += 1;
    if (this.nutriIndex >= NUTRI_POSITIONS.length) {
      this.nutriComplete = true;
      document.getElementById("nutri-quiz").classList.add("hidden");
      document.getElementById("nutri-result").classList.remove("hidden");
      document.getElementById("nutri-score-value").textContent = `${this.nutriScore} / 7`;
      document.getElementById("nutri-score-detail").textContent = "Hasil pretest tersimpan di perangkat ini.";
      document.getElementById("nutri-session-label").textContent = "SELESAI";
      return;
    }
    this.renderNutriHome();
    this.toast(`Menara ${this.nutriIndex} terbuka! Pilih untuk melanjutkan.`);
  }

  showScreen(name) {
    for (const overlay of this.overlays) {
      overlay.classList.add("hidden");
    }
    if (!name) return;
    const screen = document.getElementById(`screen-${name}`);
    if (screen) {
      screen.classList.remove("hidden");
      screen.scrollTop = 0;
    }
  }

  showHud(level) {
    this.hud.classList.remove("hidden");
    document.getElementById("hud-level-kicker").textContent = level.kicker;
    document.getElementById("hud-level-name").textContent = level.name;
    this.setCrowd(level.startCrowd);
    this.setProgress(0);
  }

  hideHud() {
    this.hud.classList.add("hidden");
    this.hideBoss();
  }

  setCrowd(count) {
    this.crowdCount.textContent = String(count);
    this.crowdCount.classList.remove("bump");
    void this.crowdCount.offsetWidth;
    this.crowdCount.classList.add("bump");
    clearTimeout(this.crowdBumpTimer);
    this.crowdBumpTimer = setTimeout(() => {
      this.crowdCount.classList.remove("bump");
    }, 140);
  }

  setProgress(ratio) {
    this.progressFill.style.width = `${Math.round(ratio * 100)}%`;
  }

  showBoss(name, hp, maxHp) {
    this.bossPanel.classList.remove("hidden");
    this.bossName.textContent = name;
    this.setBoss(hp, maxHp);
  }

  setBoss(hp, maxHp) {
    const ratio = Math.max(0, Math.min(1, hp / maxHp));
    this.bossHpFill.style.width = `${(ratio * 100).toFixed(1)}%`;
    this.bossHpText.textContent = `${Math.max(0, Math.round(hp))} / ${maxHp}`;
  }

  hideBoss() {
    this.bossPanel.classList.add("hidden");
  }

  toast(text, bad = false) {
    const element = this.toastEl;
    element.textContent = text;
    element.classList.remove("show", "bad");
    void element.offsetWidth;
    if (bad) element.classList.add("bad");
    element.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      element.classList.remove("show");
    }, 1550);
  }

  updateMuteLabel() {
    if (!this.muteBtn) return;
    this.muteBtn.textContent = this.profile.muted ? "OFF" : "SFX";
    this.muteBtn.style.opacity = this.profile.muted ? "0.6" : "1";
  }

  toggleMute() {
    this.profile.muted = !this.profile.muted;
    this.audio.setMuted(this.profile.muted);
    this.saveProfile(this.profile);
    this.updateMuteLabel();
    if (!this.profile.muted) this.audio.click();
  }

  renderMenuFooter() {
    const expEl = document.getElementById("menu-exp");
    const bestEl = document.getElementById("menu-best");
    if (expEl) expEl.textContent = `EXP ZIMO: ${this.profile.exp}`;
    const bests = Object.values(this.profile.best || {});
    const best = bests.length ? Math.max(...bests) : 0;
    if (bestEl) bestEl.textContent = best > 0 ? `Rekor: ${best}` : "Rekor: -";
    this.updateMuteLabel();
  }

  renderLevels() {
    const grid = document.getElementById("level-grid");
    grid.innerHTML = "";
    for (let i = 0; i < LEVELS.length; i += 1) {
      const level = LEVELS[i];
      const best = this.profile.best[level.id] || 0;
      const done = this.profile.completed.includes(level.id);
      const card = document.createElement("button");
      card.className = "level-card";
      card.dataset.action = "start-level";
      card.dataset.level = String(i);
      card.style.setProperty("--accent", level.theme.cssAccent);
      card.innerHTML = `
        <div class="level-card-top">
          <span class="level-num">${level.kicker}</span>
          ${done ? '<span class="level-done">SELESAI</span>' : ""}
        </div>
        <span class="level-bacteria">${level.bacteria.name}</span>
        <span class="level-theme">${level.name}</span>
        <div class="level-meta">
          <span>Bos HP <strong>${level.bossHP}</strong></span>
          <span>Rekor <strong>${best > 0 ? best : "-"}</strong></span>
        </div>
      `;
      grid.appendChild(card);
    }
  }

  renderLeaderboard() {
    const summary = document.getElementById("score-summary");
    const list = document.getElementById("score-list");
    const doneCount = this.profile.completed.length;
    const bests = Object.values(this.profile.best || {});
    const best = bests.length ? Math.max(...bests) : 0;

    summary.innerHTML = `
      <div class="summary-chip"><span>TOTAL EXP</span><strong>${this.profile.exp}</strong></div>
      <div class="summary-chip"><span>REKOR SKOR</span><strong>${best}</strong></div>
      <div class="summary-chip"><span>MISI SELESAI</span><strong>${doneCount} / ${LEVELS.length}</strong></div>
    `;

    list.innerHTML = "";
    const rows = LEVELS.map((level) => ({
      level,
      score: this.profile.best[level.id] || 0
    })).sort((a, b) => b.score - a.score);

    const hasScore = rows.some((row) => row.score > 0);
    if (!hasScore) {
      list.innerHTML = '<div class="empty-note">Belum ada skor. Selesaikan misi pertama untuk mengisi papan skor.</div>';
      return;
    }

    rows.forEach((row, index) => {
      if (row.score <= 0) return;
      const item = document.createElement("div");
      item.className = "score-row";
      item.innerHTML = `
        <span class="score-rank">${index + 1}</span>
        <div class="score-name">
          <strong>${row.level.bacteria.name}</strong>
          <span>${row.level.name}</span>
        </div>
        <span class="score-points">${row.score}</span>
      `;
      list.appendChild(item);
    });
  }

  renderEncyclopedia() {
    const grid = document.getElementById("card-grid");
    grid.innerHTML = "";
    for (const trivia of TRIVIA) {
      const unlocked = this.profile.cards.includes(trivia.id);
      const level = LEVELS.find((item) => item.triviaId === trivia.id);
      const accent = level ? level.theme.cssAccent : "#22d3ee";
      const card = document.createElement("button");
      card.className = `microbe-card${unlocked ? "" : " locked"}`;
      card.style.setProperty("--accent", accent);
      if (unlocked) {
        card.dataset.action = "open-card";
        card.dataset.card = trivia.id;
        card.innerHTML = `
          <span class="card-tag">${trivia.tag}</span>
          <span class="card-name">${trivia.scientific_name}</span>
          <span class="card-sub">${trivia.category}</span>
          <span class="card-status">KARTU TERBUKA</span>
        `;
      } else {
        card.innerHTML = `
          <span class="card-tag">??</span>
          <span class="card-name">Data Terkunci</span>
          <span class="card-sub">Selesaikan misi terkait untuk membuka kartu ini.</span>
          <span class="card-lock">TERKUNCI</span>
        `;
      }
      grid.appendChild(card);
    }
  }

  openCard(id) {
    if (!this.profile.cards.includes(id)) return;
    const trivia = getTrivia(id);
    this.modalCard.innerHTML = `
      <p class="kicker">${trivia.tag}</p>
      <h2>${trivia.scientific_name}</h2>
      <p class="modal-sub">${trivia.common_name} &middot; ${trivia.category}</p>
      <div class="detail-list">
        <div class="detail-row"><span>HABITAT</span><p>${trivia.habitat}</p></div>
        <div class="detail-row"><span>TINGKAT BAHAYA</span><p>${trivia.danger_level}</p></div>
        <div class="detail-row"><span>GEJALA</span><p>${trivia.symptom}</p></div>
        <div class="detail-row"><span>PENCEGAHAN</span><p>${trivia.prevention}</p></div>
        <div class="detail-row"><span>NUTRISI PENDUKUNG</span><p>${trivia.nutrients.join(", ")}</p></div>
      </div>
      <div class="detail-quiz">FAKTA: ${trivia.fun_fact}</div>
      <div class="modal-actions">
        <button class="btn btn-small" data-action="close-modal">Tutup</button>
      </div>
    `;
    this.modal.classList.remove("hidden");
  }

  closeModal() {
    this.modal.classList.add("hidden");
  }

  showQuiz(trivia, resolve) {
    this._quizTrivia = trivia;
    this._quizResolve = resolve;
    this._quizAnswered = false;
    this._quizCorrect = false;

    this.quizTitle.textContent = `Kuis: ${trivia.common_name}`;
    this.quizQuestion.textContent = trivia.quiz.question;
    this.quizFeedback.classList.add("hidden");
    this.quizOptions.innerHTML = "";

    trivia.quiz.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.className = "quiz-option";
      button.dataset.action = "quiz-option";
      button.dataset.index = String(index);
      button.innerHTML = `
        <span class="opt-letter">${LETTERS[index]}</span>
        <span>${option}</span>
      `;
      this.quizOptions.appendChild(button);
    });

    this.showScreen("quiz");
    document.getElementById("screen-quiz").scrollTop = 0;
  }

  answerQuiz(index) {
    if (!this._quizTrivia || this._quizAnswered) return;
    this._quizAnswered = true;
    const quiz = this._quizTrivia.quiz;
    this._quizCorrect = index === quiz.correct_index;

    const buttons = Array.from(this.quizOptions.children);
    buttons.forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === quiz.correct_index) button.classList.add("correct");
      if (buttonIndex === index && !this._quizCorrect) button.classList.add("wrong");
    });

    this.quizVerdict.textContent = this._quizCorrect ? "Benar! Analisis imunologi tepat." : "Belum tepat.";
    this.quizVerdict.className = `quiz-verdict ${this._quizCorrect ? "good" : "bad"}`;
    this.quizExplanation.textContent = quiz.explanation;
    this.quizFeedback.classList.remove("hidden");

    if (this._quizCorrect) {
      this.audio.unlock();
    } else {
      this.audio.gateBad();
    }
  }

  continueQuiz() {
    if (!this._quizAnswered) return;
    const resolve = this._quizResolve;
    this._quizResolve = null;
    this.audio.click();
    if (resolve) resolve(this._quizCorrect);
  }

  showResult(data) {
    const kicker = document.getElementById("result-kicker");
    kicker.textContent = data.correct ? "MISI SELESAI \u2022 KUIS BENAR" : "MISI SELESAI \u2022 KUIS SALAH";
    kicker.className = "kicker";

    document.getElementById("result-title").textContent = `${data.level.bacteria.short} Terkalahkan`;

    const stats = document.getElementById("result-stats");
    stats.innerHTML = `
      <div class="stat accent"><span>SKOR</span><strong>${data.score}</strong></div>
      <div class="stat"><span>EXP DIDAPAT</span><strong>+${data.expGain}</strong></div>
      <div class="stat"><span>LEUKOSIT</span><strong>${data.remaining}</strong></div>
      <div class="stat"><span>BAKTERI</span><strong>${data.kills}</strong></div>
      <div class="stat"><span>WAKTU</span><strong>${formatTime(data.elapsed)}</strong></div>
      <div class="stat"><span>KUIS</span><strong>${data.correct ? "Benar" : "Salah"}</strong></div>
    `;

    const card = document.getElementById("result-card");
    card.innerHTML = `
      <div class="card-glyph">${data.cardNew ? "BARU" : "OK"}</div>
      <div>
        <strong>${data.trivia.scientific_name}</strong>
        <span>${data.cardNew ? "Kartu ensiklopedia baru terbuka." : "Kartu ensiklopedia sudah dimiliki."} Kategori: ${data.trivia.category}.</span>
      </div>
    `;

    const nextBtn = document.getElementById("result-next-btn");
    nextBtn.classList.toggle("hidden", !data.hasNext);

    this.showScreen("result");
    this.renderMenuFooter();
  }

  showGameOver(data) {
    document.getElementById("gameover-note").textContent =
      `${data.level.bacteria.short} berhasil menembus pertahanan. Pelajari pola gerbang dan jaga jarak dari bos.`;
    const stats = document.getElementById("gameover-stats");
    stats.innerHTML = `
      <div class="stat"><span>BAKTERI DIKALAHKAN</span><strong>${data.kills}</strong></div>
      <div class="stat"><span>BERTAHAN</span><strong>${formatTime(data.elapsed)}</strong></div>
    `;
    this.showScreen("gameover");
  }
}
