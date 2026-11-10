import { useEffect, useRef } from "react";
import { Game } from "./game/game.js";
import { UI } from "./ui/ui.js";
import { AudioManager } from "./core/audio.js";
import { loadProfile, saveProfile } from "./core/storage.js";

function AppShell({ canvasRef }) {
  return (
    <>
      <canvas id="game-canvas" ref={canvasRef} />
      <div id="ui-root">
        <div id="hud" className="hud hidden">
          <div className="hud-top"><button className="icon-btn" data-action="pause">II</button><div className="hud-level"><span id="hud-level-kicker">MISI 01</span><span id="hud-level-name">Higienitas</span></div><button className="icon-btn" id="mute-btn" data-action="mute">SFX</button></div>
          <div className="hud-crowd"><span id="hud-crowd-count">0</span><span className="hud-crowd-label">LEUKOSIT</span></div>
          <div className="hud-progress"><div className="hud-progress-fill" id="hud-progress-fill" /></div>
          <div className="boss-panel hidden" id="boss-panel"><div className="boss-panel-head"><span id="boss-name">Escherichia coli</span><span id="boss-hp-text">0 / 0</span></div><div className="boss-panel-track"><div className="boss-panel-fill" id="boss-hp-fill" /></div></div>
          <div className="toast" id="toast" />
        </div>

        <div className="overlay hub-overlay" id="screen-library">
          <div className="hub-scroll">
            {/* ── Header ── */}
            <header className="hub-header">
              <img src="/logo.png" alt="Zimo" className="hub-header-logo" />
              <span className="hub-header-tag">PLAYGROUND EDUKASI</span>
            </header>

            {/* ── Hero ── */}
            <section className="hub-hero">
              <span className="hub-hero-eyebrow">BELAJAR · BERMAIN · BERTUMBUH</span>
              <img src="/logo.png" alt="Zimo" className="hub-hero-img" />
              <h1 className="hub-hero-title">Zimo <span>2.0</span></h1>
              <p className="hub-hero-sub">Ekosistem game edukasi gizi interaktif</p>
            </section>

            {/* ── Section heading ── */}
            <div className="hub-section-head">
              <div>
                <span className="hub-label">PILIH GAME</span>
                <h2 className="hub-section-title">Mulai petualanganmu</h2>
              </div>
              <span className="hub-online"><i />2 game tersedia</span>
            </div>

            {/* ── Game cards ── */}
            <div className="hub-cards">
              <button className="hub-card" data-action="select-game">
                <div className="hub-card-thumb thumb-microbe">
                  <span className="hub-card-icon">🧬</span>
                </div>
                <div className="hub-card-body">
                  <span className="hub-card-tag tag-blue">GAME 01</span>
                  <strong className="hub-card-title">Microbe Defense</strong>
                  <p className="hub-card-desc">Runner 3D. Basmi bakteri patogen dan kumpulkan leukosit.</p>
                  <span className="hub-card-btn">Main sekarang</span>
                </div>
              </button>

              <button className="hub-card" data-action="select-nutri">
                <div className="hub-card-thumb thumb-kingdom">
                  <span className="hub-card-icon">🏰</span>
                </div>
                <div className="hub-card-body">
                  <span className="hub-card-tag tag-purple">GAME 02</span>
                  <strong className="hub-card-title">Nutri Kingdom</strong>
                  <p className="hub-card-desc">Quiz Adventure. Taklukkan tujuh menara kerajaan gizi.</p>
                  <span className="hub-card-btn">Mulai petualangan</span>
                </div>
              </button>

              <button className="hub-card hub-card-locked" data-action="coming-soon">
                <div className="hub-card-thumb thumb-soon">
                  <span className="hub-card-icon">🧩</span>
                </div>
                <div className="hub-card-body">
                  <span className="hub-card-tag tag-gray">GAME 03</span>
                  <strong className="hub-card-title">Nutri Quest</strong>
                  <p className="hub-card-desc">Tantangan pengetahuan gizi harian. Segera hadir.</p>
                  <span className="hub-card-btn btn-locked">Segera hadir</span>
                </div>
              </button>
            </div>

            {/* ── Footer ── */}
            <footer className="hub-footer">
              <img src="/logo.png" alt="Zimo" className="hub-footer-logo" />
              <span>Belajar bersama, bermain bersama.</span>
            </footer>
          </div>
        </div>
        <div className="overlay hidden" id="screen-nutri"><div className="nutri-panel"><div className="nutri-topbar"><button className="back-link" data-action="back-library">← Semua game</button><span className="nutri-brand"><b>NUTRI</b> KINGDOM</span><span className="nutri-session" id="nutri-session-label">PRETEST</span></div><div id="nutri-home"><div className="nutri-hero"><div><p className="kicker">ADVENTURE OF THE SEVEN TOWERS</p><h1>Selamat datang,<br /><em>Nutri Knight!</em></h1><p>Kerajaan sedang diserang Kutukan Malnutria. Bantu tujuh penjaga mengembalikan keseimbangan gizi.</p></div><div className="nutri-mascot">♞<span>+7 XP</span></div></div><div className="nutri-progress"><div><span>PERJALANAN PRETEST</span><strong id="nutri-progress-text">0 / 7 menara</strong></div><div className="nutri-progress-track"><i id="nutri-progress-fill" /></div></div><div className="tower-map" id="tower-map" /><div className="nutri-actions"><button className="btn btn-primary" data-action="start-nutri" id="nutri-start-btn">Mulai Pretest <b>→</b></button><button className="btn nutri-posttest-btn" data-action="locked-posttest" id="nutri-posttest-btn">🔒 Posttest terkunci</button></div></div><div id="nutri-quiz" className="nutri-quiz-view hidden"><div className="quiz-map-label" id="nutri-quiz-label">MENARA 1 / 7</div><div className="nutri-guard"><div className="guard-avatar" id="nutri-guard-avatar">🥦</div><div><span id="nutri-guard-role">PENJAGA POS</span><strong id="nutri-guard-name">Chef Brocco</strong></div></div><div className="guard-bubble"><p id="nutri-dialogue">Selamat datang, ksatria!</p><h2 id="nutri-question">Pertanyaan</h2></div><div className="nutri-options" id="nutri-options" /><div className="nutri-feedback hidden" id="nutri-feedback"><strong id="nutri-feedback-title">Jawaban tercatat!</strong><span id="nutri-feedback-text">Terima kasih sudah menjawab.</span><button className="btn btn-primary" data-action="nutri-next">Lanjutkan <b>→</b></button></div></div><div id="nutri-result" className="nutri-result hidden"><div className="result-crown">♛</div><p className="kicker">PERJALANAN SELESAI</p><h1 id="nutri-result-title">Kerajaan bersinar lagi!</h1><p id="nutri-result-copy">Tujuh penjaga berterima kasih atas keberanianmu.</p><div className="nutri-score"><span>SKOR PENGETAHUAN</span><strong id="nutri-score-value">0 / 7</strong><small id="nutri-score-detail">Setiap jawabanmu sudah dicatat.</small></div><button className="btn btn-primary" data-action="nutri-home">Kembali ke peta <b>→</b></button></div></div></div>
        <div className="overlay hidden" id="screen-menu"><div className="menu-card"><div className="logo"><span className="logo-zimo">ZIMO</span><span className="logo-sub">MICROBE DEFENSE</span></div><p className="tagline">Komando leukosit. Pilih nutrisi. Basmi bakteri patogen.</p><div className="menu-buttons"><button className="btn btn-primary" data-action="open-levels">Mulai Misi</button><button className="btn" data-action="open-encyclopedia">Ensiklopedia Mikroba</button><button className="btn" data-action="open-leaderboard">Papan Skor</button><button className="btn btn-ghost" data-action="open-help">Cara Bermain</button></div><div className="menu-footer"><span id="menu-exp">EXP ZIMO: 0</span><span id="menu-best">Rekor: -</span></div></div></div>

        <div className="overlay hidden" id="screen-levels"><div className="panel"><div className="panel-head"><div><p className="kicker">PILIH MISI</p><h2>Zona Infeksi</h2></div><button className="btn btn-small" data-action="back-menu">Kembali</button></div><div className="level-grid" id="level-grid" /></div></div>
        <div className="overlay hidden" id="screen-help"><div className="panel"><div className="panel-head"><div><p className="kicker">PANDUAN</p><h2>Cara Bermain</h2></div><button className="btn btn-small" data-action="back-menu">Kembali</button></div><div className="help-grid"><div className="help-item"><span className="help-num">01</span><h3>Geser Kiri / Kanan</h3><p>Seret layar atau gunakan tombol panah untuk mengarahkan barisan leukosit.</p></div><div className="help-item"><span className="help-num">02</span><h3>Pilih Gerbang Nutrisi</h3><p>Gerbang hijau menambah pasukan (+ / x). Gerbang merah menguras pasukan (- / ÷).</p></div><div className="help-item"><span className="help-num">03</span><h3>Tembakan Otomatis</h3><p>Leukosit menembak sendiri. Fokuslah mengatur posisi dan memilih gerbang.</p></div><div className="help-item"><span className="help-num">04</span><h3>Kalahkan Bos</h3><p>Hindari proyektil ungu bos dengan berpindah sisi. Habiskan HP bos sebelum pasukanmu habis.</p></div><div className="help-item"><span className="help-num">05</span><h3>Kuis & Ensiklopedia</h3><p>Selesaikan kuis pasca-level untuk EXP ekstra dan buka kartu mikroba baru.</p></div><div className="help-item"><span className="help-num">06</span><h3>Probiotik Langka</h3><p>Bakteri baik memberi bonus multiplier sementara bila kamu melewatinya.</p></div></div></div></div>
        <div className="overlay hidden" id="screen-leaderboard"><div className="panel"><div className="panel-head"><div><p className="kicker">ARSIP ZIMO</p><h2>Papan Skor</h2></div><button className="btn btn-small" data-action="back-menu">Kembali</button></div><div className="score-summary" id="score-summary" /><div className="score-list" id="score-list" /></div></div>
        <div className="overlay hidden" id="screen-encyclopedia"><div className="panel"><div className="panel-head"><div><p className="kicker">KOLEKSI</p><h2>Ensiklopedia Mikroba</h2></div><button className="btn btn-small" data-action="back-menu">Kembali</button></div><p className="panel-note">Selesaikan misi untuk membuka kartu fakta bakteri.</p><div className="card-grid" id="card-grid" /></div></div>
        <div className="overlay hidden" id="screen-quiz"><div className="panel quiz-panel"><p className="kicker">KUIS EDUKASI</p><h2 id="quiz-title">Kuis Mikroba</h2><p className="quiz-question" id="quiz-question" /><div className="quiz-options" id="quiz-options" /><div className="quiz-feedback hidden" id="quiz-feedback"><p className="quiz-verdict" id="quiz-verdict" /><p className="quiz-explanation" id="quiz-explanation" /><button className="btn btn-primary" data-action="quiz-continue">Lihat Hasil</button></div></div></div>
        <div className="overlay hidden" id="screen-result"><div className="panel result-panel"><p className="kicker" id="result-kicker">MISI SELESAI</p><h2 id="result-title">Zona Bersih</h2><div className="result-stats" id="result-stats" /><div className="result-card" id="result-card" /><div className="result-actions"><button className="btn" data-action="result-retry">Ulangi</button><button className="btn btn-primary" id="result-next-btn" data-action="result-next">Misi Berikutnya</button><button className="btn btn-ghost" data-action="back-menu">Ke Menu</button></div></div></div>
        <div className="overlay hidden" id="screen-pause"><div className="panel compact"><p className="kicker">JEDA</p><h2>Misi Dihentikan</h2><p className="panel-note">Kumpulkan keberanian, lalu lanjutkan.</p><div className="menu-buttons"><button className="btn btn-primary" data-action="resume">Lanjutkan</button><button className="btn" data-action="restart-level">Ulangi Misi</button><button className="btn btn-ghost" data-action="quit-level">Keluar ke Menu</button></div></div></div>
        <div className="overlay hidden" id="screen-gameover"><div className="panel compact"><p className="kicker danger">INFEKSI MENANG</p><h2>Pasukan Leukosit Habis</h2><p className="panel-note" id="gameover-note">Tubuh butuh pertahanan lebih kuat. Coba lagi.</p><div className="result-stats" id="gameover-stats" /><div className="menu-buttons"><button className="btn btn-primary" data-action="gameover-retry">Coba Lagi</button><button className="btn btn-ghost" data-action="back-menu">Keluar ke Menu</button></div></div></div>
        <div className="modal hidden" id="modal-detail"><div className="modal-card" id="modal-card" /></div>
      </div>
    </>
  );
}

export default function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const profile = loadProfile();
    const audio = new AudioManager(profile.muted);
    const ui = new UI({ audio, profile, saveProfile });
    const game = new Game({ canvas: canvasRef.current, ui, audio, profile, saveProfile });
    ui.attach(game);
    game.init();
    window.__zimo = { game, ui, profile };
  }, []);

  return <AppShell canvasRef={canvasRef} />;
}
