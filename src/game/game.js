import * as THREE from "three";
import { LEVELS } from "../data/levels.js";
import { getTrivia } from "../data/trivia.js";
import { Crowd } from "./crowd.js";
import { Track } from "./track.js";
import { SwarmGroup, Boss } from "./enemies.js";
import { ProjectilePool } from "./projectiles.js";
import { Particles } from "./effects.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function gateSymbol(op, value) {
  if (op === "add") return `+${value}`;
  if (op === "sub") return `\u2212${value}`;
  if (op === "mult") return `\u00d7${value}`;
  return `\u00f7${value}`;
}

export class Game {
  constructor({ canvas, ui, audio, profile, saveProfile }) {
    this.canvas = canvas;
    this.ui = ui;
    this.audio = audio;
    this.profile = profile;
    this.saveProfile = saveProfile;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      280
    );

    this.clock = new THREE.Clock();
    this.time = 0;
    this.mode = "idle";
    this.prevMode = "run";
    this.level = LEVELS[0];
    this.levelIndex = 0;

    this.worldRoot = new THREE.Group();
    this.scene.add(this.worldRoot);

    this.hemi = new THREE.HemisphereLight(0xd8fbff, 0x08313a, 1.25);
    this.scene.add(this.hemi);
    this.dirLight = new THREE.DirectionalLight(0xffffff, 2.1);
    this.dirLight.position.set(12, 20, 8);
    this.scene.add(this.dirLight);
    this.rimLight = new THREE.DirectionalLight(0x67e8f9, 1.1);
    this.rimLight.position.set(-10, 8, -12);
    this.scene.add(this.rimLight);

    this.particles = new Particles(this.scene);
    this.projectiles = new ProjectilePool(this.scene);
    this.crowd = new Crowd(this.scene);
    this.crowd.hide();

    this.track = null;
    this.boss = null;
    this.groupList = [];
    this.enemies = [];

    this.idleZ = 4;
    this.elapsed = 0;
    this.kills = 0;
    this.fireTimer = 0;
    this.bossTimer = 0;
    this.bossTriggered = false;
    this.victoryTimer = 0;
    this.gameOverTimer = 0;
    this.gameOverShown = false;
    this.quizOpened = false;
    this.shake = 0;
    this.shieldTimer = 0;
    this.keyDir = 0;
    this.dragging = false;
    this.lastPointerX = 0;
    this.lastShotSound = 0;

    this.loop = this.loop.bind(this);
    this.onResize = this.onResize.bind(this);

    window.addEventListener("resize", this.onResize);
    this.bindInput();
  }

  init() {
    this.showMenuScene();
    requestAnimationFrame(this.loop);
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height);
  }

  bindInput() {
    const handleDown = (event) => {
      if (this.mode !== "run" && this.mode !== "boss") return;
      this.audio.ensure();
      this.dragging = true;
      this.lastPointerX = event.clientX;
      if (this.canvas.setPointerCapture) {
        try {
          this.canvas.setPointerCapture(event.pointerId);
        } catch (error) {
          /* noop */
        }
      }
    };

    const handleMove = (event) => {
      if (!this.dragging) return;
      if (this.mode !== "run" && this.mode !== "boss") return;
      const dx = event.clientX - this.lastPointerX;
      this.lastPointerX = event.clientX;
      const span = Math.max(320, window.innerWidth);
      this.crowd.targetX = clamp(this.crowd.targetX + (dx / span) * 12, -2.55, 2.55);
      if (event.cancelable) event.preventDefault();
    };

    const handleUp = () => {
      this.dragging = false;
    };

    this.canvas.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        this.keyDir = -1;
      } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        this.keyDir = 1;
      } else if (event.key === "Escape" && (this.mode === "run" || this.mode === "boss")) {
        this.pause();
      }
    });

    window.addEventListener("keyup", (event) => {
      if (
        ["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(event.key)
      ) {
        this.keyDir = 0;
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && (this.mode === "run" || this.mode === "boss")) {
        this.pause();
      }
    });
  }

  applyTheme(level) {
    const theme = level.theme;
    this.scene.background = new THREE.Color(theme.sky);
    this.scene.fog = new THREE.Fog(theme.fog, 28, 135);
    this.hemi.color.set(theme.ring);
    this.hemi.groundColor.set(theme.ground);
    this.rimLight.color.set(theme.accent);
  }

  disposeWorld() {
    this.worldRoot.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (material.map) material.map.dispose();
          material.dispose();
        }
      }
    });
    this.worldRoot.clear();
    this.track = null;
    this.boss = null;
    this.groupList = [];
    this.enemies = [];
  }

  showMenuScene() {
    this.disposeWorld();
    this.mode = "idle";
    this.level = LEVELS[0];
    this.levelIndex = 0;
    this.applyTheme(this.level);
    this.track = new Track(this.worldRoot, this.level, { menu: true });
    this.crowd.hide();
    this.projectiles.reset();
    this.particles.reset();
    this.track.update(0, this.time);
    this.ui.hideHud();
    this.ui.hideBoss();
    this.idleZ = 4;
    this.camera.position.set(0, 6.8, this.idleZ);
    this.camera.lookAt(0, 1.6, this.idleZ + 13);
  }

  startLevel(index) {
    const safeIndex = clamp(index, 0, LEVELS.length - 1);
    this.levelIndex = safeIndex;
    this.level = LEVELS[safeIndex];

    this.disposeWorld();
    this.applyTheme(this.level);

    this.track = new Track(this.worldRoot, this.level);
    this.boss = new Boss(this.worldRoot, this.level);
    this.groupList = [];
    this.enemies = [];

    for (let i = 0; i < this.level.swarms.length; i += 1) {
      const group = new SwarmGroup(
        this.worldRoot,
        this.level,
        this.level.swarms[i],
        this.level.swarmZ[i]
      );
      this.groupList.push(group);
      this.enemies.push(...group.enemies);
    }

    this.crowd.reset(this.level.startCrowd);
    this.crowd.show();
    this.crowd.z = 0;
    this.crowd.targetX = 0;
    this.crowd.leaderX = 0;

    this.projectiles.reset();
    this.particles.reset();

    this.mode = "run";
    this.elapsed = 0;
    this.kills = 0;
    this.fireTimer = 0;
    this.bossTimer = 1.6;
    this.bossTriggered = false;
    this.victoryTimer = 0;
    this.gameOverTimer = 0;
    this.gameOverShown = false;
    this.quizOpened = false;
    this.shake = 0;
    this.shieldTimer = 0;
    this.keyDir = 0;
    this.dragging = false;

    this.camera.position.set(0, 7.8, -11);
    this.camera.lookAt(0, 1.1, 6);

    this.ui.showScreen(null);
    this.ui.hideBoss();
    this.ui.showHud(this.level);
  }

  pause() {
    if (this.mode !== "run" && this.mode !== "boss") return;
    this.prevMode = this.mode;
    this.mode = "paused";
    this.ui.showScreen("pause");
  }

  resume() {
    if (this.mode !== "paused") return;
    this.mode = this.prevMode;
    this.ui.showScreen(null);
  }

  restartLevel() {
    this.startLevel(this.levelIndex);
  }

  nextLevel() {
    if (this.levelIndex < LEVELS.length - 1) {
      this.startLevel(this.levelIndex + 1);
    } else {
      this.quitToMenu();
    }
  }

  quitToMenu() {
    this.showMenuScene();
    this.ui.showScreen("menu");
    this.ui.renderMenuFooter();
  }

  loop() {
    requestAnimationFrame(this.loop);
    const raw = Math.min(this.clock.getDelta(), 0.05);
    const dt = this.mode === "paused" ? 0 : raw;
    this.time += dt;
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  update(dt) {
    this.particles.update(dt);

    switch (this.mode) {
      case "idle":
        this.updateIdle(dt);
        break;
      case "run":
        this.updateRun(dt);
        break;
      case "boss":
        this.updateBoss(dt);
        break;
      case "victory":
        this.updateVictory(dt);
        break;
      case "gameover":
        this.updateGameOver(dt);
        break;
      default:
        this.updateCamera(0);
        break;
    }
  }

  updateIdle(dt) {
    this.idleZ += dt * 5.2;
    const limit = this.level.bossZ + 12;
    if (this.idleZ > limit) this.idleZ = 3;
    this.track.update(dt, this.time);
    this.camera.position.set(0, 6.8, this.idleZ);
    this.camera.lookAt(0, 1.6, this.idleZ + 13);
  }

  moveCrowd(dt) {
    if (this.keyDir !== 0) {
      this.crowd.targetX = clamp(
        this.crowd.targetX + this.keyDir * 9 * dt,
        -2.55,
        2.55
      );
    }
  }

  updateRun(dt) {
    this.elapsed += dt;
    const speed = this.level.speed * (this.crowd.count > 5 ? 1 : 0.88);
    this.crowd.z += speed * dt;
    this.moveCrowd(dt);
    this.crowd.update(dt, true);
    this.track.update(dt, this.time);

    for (const group of this.groupList) {
      group.update(dt, this.time);
    }

    this.cullPassedEnemies();

    for (const pair of this.track.gates) {
      if (pair.used) continue;
      if (this.crowd.z >= pair.z) {
        pair.used = true;
        const gate = this.crowd.x >= 0 ? pair.right : pair.left;
        this.applyGate(pair, gate);
      }
    }

    this.checkPickups();
    this.updateCombat(dt);

    if (this.mode !== "run") {
      this.updateCamera(dt);
      return;
    }

    const progress = clamp(this.crowd.z / (this.level.bossZ - 13), 0, 1);
    this.ui.setProgress(progress);

    if (this.crowd.z >= this.level.bossZ - 15) {
      this.enterBoss();
      return;
    }

    if (this.crowd.count <= 0) {
      this.triggerGameOver();
      return;
    }

    this.updateCamera(dt);
  }

  cullPassedEnemies() {
    for (const enemy of this.enemies) {
      if (!enemy.alive || enemy.remove) continue;
      if (enemy.mesh.position.z < this.crowd.z - 1.5) {
        enemy.alive = false;
        enemy.remove = true;
        enemy.mesh.visible = false;
      }
    }
  }

  applyGate(pair, gate) {
    const before = this.crowd.count;
    let after = before;

    if (gate.op === "add") after = before + gate.value;
    else if (gate.op === "sub") after = Math.max(1, before - gate.value);
    else if (gate.op === "mult") after = Math.floor(before * gate.value);
    else after = Math.max(1, Math.floor(before / gate.value));

    after = clamp(after, 1, this.crowd.maxCount);
    this.crowd.setCount(after);
    this.ui.setCrowd(after);

    const positive = gate.op === "add" || gate.op === "mult";
    const color = positive ? this.level.theme.accent : 0xfb7185;
    const panelPos = new THREE.Vector3(
      gate.group.position.x,
      2.0,
      gate.group.position.z
    );
    this.particles.burst(panelPos, color, 16, 5.5, 0.6, 1.4);

    if (positive) {
      this.audio.gateGood();
      this.ui.toast(`${gateSymbol(gate.op, gate.value)} ${gate.label.toUpperCase()}  \u2192  ${after} LEUKOSIT`);
    } else {
      this.audio.gateBad();
      this.cameraShake(0.22);
      this.ui.toast(
        `${gateSymbol(gate.op, gate.value)} ${gate.label.toUpperCase()}  \u2192  ${after} LEUKOSIT`,
        true
      );
    }

    gate.panel.material.opacity = 0.35;
  }

  checkPickups() {
    for (const pickup of this.track.pickups) {
      if (pickup.taken) continue;
      const dz = this.crowd.z - pickup.spot.z;
      if (Math.abs(dz) < 1.6 && Math.abs(this.crowd.x - pickup.spot.x) < 1.8) {
        pickup.taken = true;
        pickup.group.visible = false;
        this.crowd.setCount(this.crowd.count + 6);
        this.ui.setCrowd(this.crowd.count);
        this.shieldTimer = 6;
        this.crowd.setShield(true);
        this.audio.pickup();
        this.particles.burst(pickup.group.position, 0xbef264, 18, 5, 0.6);
        this.ui.toast("LACTOBACILLUS: +6 LEUKOSIT & SHIELD");
      }
    }
  }

  updateCombat(dt) {
    if (this.shieldTimer > 0) {
      this.shieldTimer -= dt;
      if (this.shieldTimer <= 0) {
        this.crowd.setShield(false);
      }
    }

    const bossActive = this.mode === "boss" && this.boss && this.boss.alive;
    const targetExists = bossActive || this.enemies.some((enemy) => {
      if (!enemy.alive || enemy.remove) return false;
      const z = enemy.mesh.position.z;
      return z > this.crowd.z + 1 && z < this.crowd.z + 65;
    });

    this.fireTimer -= dt;
    if (targetExists && this.fireTimer <= 0) {
      this.fireTimer = this.crowd.shieldActive ? 0.12 : 0.16;
      this.shootVolley(bossActive);
    }

    this.projectiles.update(dt);
    this.resolveProjectiles();

    for (const enemy of this.enemies) {
      if (!enemy.alive || enemy.remove) continue;
      const dz = enemy.mesh.position.z - this.crowd.z;
      if (dz < 2.05 && dz > -1.2 && Math.abs(enemy.mesh.position.x - this.crowd.x) < 2.25) {
        enemy.alive = false;
        enemy.deathT = 0;
        enemy.flash = 0;
        this.particles.burst(enemy.mesh.position, 0xfb7185, 10, 4.5, 0.45);
        this.damageCrowd(Math.round(enemy.maxHp * 0.32) + 2);
      }
    }

    if (this.crowd.count <= 0) {
      this.triggerGameOver();
    }
  }

  shootVolley(bossActive) {
    const damage = 2 + this.crowd.count * 0.14;
    const target = bossActive
      ? new THREE.Vector3(this.boss.position.x, 2.3, this.boss.position.z)
      : null;

    for (let i = 0; i < 2; i += 1) {
      const offset = (i === 0 ? -0.34 : 0.34) + (Math.random() - 0.5) * 0.14;
      const spawn = new THREE.Vector3(
        this.crowd.x + offset,
        0.8,
        this.crowd.z + 1.0
      );
      const velocity = new THREE.Vector3(0, 0, 34);
      if (target) {
        velocity.copy(target).sub(spawn).normalize().multiplyScalar(34);
      }
      this.projectiles.spawn(spawn.x, spawn.y, spawn.z, velocity, damage, "player");
    }

    this.audio.shoot();
  }

  resolveProjectiles() {
    for (const item of this.projectiles.items) {
      if (!item.alive) continue;
      const position = item.mesh.position;

      if (
        position.z > this.crowd.z + 75 ||
        position.z < this.crowd.z - 25 ||
        Math.abs(position.x) > 14 ||
        position.y < -1
      ) {
        this.projectiles.release(item);
        continue;
      }

      if (item.kind === "player") {
        let hit = false;
        for (const enemy of this.enemies) {
          if (!enemy.alive || enemy.remove) continue;
          const dx = enemy.mesh.position.x - position.x;
          const dy = enemy.mesh.position.y - position.y;
          const dz = enemy.mesh.position.z - position.z;
          if (dx * dx + dy * dy + dz * dz < 1.15 * 1.15) {
            this.damageEnemy(enemy, item.damage);
            this.projectiles.release(item);
            hit = true;
            break;
          }
        }
        if (hit) continue;

        if (this.boss && this.boss.alive && this.mode === "boss") {
          const dx = this.boss.position.x - position.x;
          const dy = this.boss.position.y - position.y;
          const dz = this.boss.position.z - position.z;
          const radius = this.boss.radius + 0.7;
          if (dx * dx + dy * dy + dz * dz < radius * radius) {
            const died = this.boss.hit(item.damage);
            this.particles.burst(position, 0xc084fc, 4, 3, 0.32);
            this.audio.bossHit();
            this.projectiles.release(item);
            if (died) {
              this.triggerVictory();
            }
          }
        }
      } else {
        const dx = this.crowd.x - position.x;
        const dy = this.crowd.y - position.y;
        const dz = this.crowd.z - position.z;
        if (dx * dx + dy * dy + dz * dz < 1.7 * 1.7) {
          const base = Math.round(6 + this.crowd.count * 0.18);
          this.damageCrowd(base);
          this.particles.burst(position, 0xc084fc, 12, 5, 0.5);
          this.audio.hit();
          this.projectiles.release(item);
        }
      }
    }
  }

  damageEnemy(enemy, damage) {
    enemy.hp -= damage;
    enemy.flash = 1;
    if (enemy.hp <= 0) {
      enemy.alive = false;
      enemy.deathT = 0;
      this.kills += 1;
      this.particles.burst(enemy.mesh.position, this.level.theme.enemy, 9, 4.5, 0.5);
    } else {
      this.particles.burst(enemy.mesh.position, 0xa5f3fc, 3, 3.4, 0.28);
    }
  }

  damageCrowd(amount) {
    let finalAmount = amount;
    if (this.crowd.shieldActive) {
      finalAmount = Math.max(1, Math.ceil(amount / 2));
    }
    this.crowd.damage(finalAmount);
    this.ui.setCrowd(this.crowd.count);
    this.cameraShake(0.35);
  }

  enterBoss() {
    if (this.bossTriggered) return;
    this.bossTriggered = true;
    this.mode = "boss";
    this.crowd.z = this.level.bossZ - 15;
    this.bossTimer = 2.2;
    this.ui.showBoss(this.level.bacteria.name, this.boss.hp, this.boss.maxHp);
    this.ui.toast(`${this.level.bacteria.name.toUpperCase()} MUNCUL`);
    this.cameraShake(0.3);
  }

  updateBoss(dt) {
    this.elapsed += dt;
    const speed = this.level.speed * 0.8;
    const arenaZ = this.level.bossZ - 15;
    if (this.crowd.z < arenaZ) {
      this.crowd.z = Math.min(arenaZ, this.crowd.z + speed * dt);
    }
    this.moveCrowd(dt);
    this.crowd.update(dt, this.crowd.z < arenaZ);
    this.track.update(dt, this.time);

    for (const group of this.groupList) {
      group.update(dt, this.time);
    }

    this.cullPassedEnemies();
    this.checkPickups();
    this.updateCombat(dt);

    if (this.mode !== "boss") {
      this.updateCamera(dt);
      return;
    }

    this.boss.update(dt, this.time);

    if (this.boss.hp < this.boss.maxHp * 0.5 && !this.boss.enraged) {
      this.boss.enraged = true;
      this.summonMinions();
      this.ui.toast("FASE 2: BOS MENGAMUK");
      this.cameraShake(0.4);
    }

    this.bossTimer -= dt;
    if (this.bossTimer <= 0 && this.boss.alive && this.mode === "boss") {
      this.bossAttack();
      this.bossTimer = this.boss.enraged ? 1.05 : 1.75;
    }

    this.ui.setBoss(this.boss.hp, this.boss.maxHp);

    if (this.boss.hp <= 0 && this.boss.alive) {
      this.triggerVictory();
      return;
    }

    if (this.crowd.count <= 0) {
      this.triggerGameOver();
      return;
    }

    this.updateCamera(dt);
  }

  bossAttack() {
    const origin = new THREE.Vector3(
      this.boss.position.x,
      2.2,
      this.boss.position.z - 2.0
    );
    const shots = this.boss.enraged ? 3 : 2;
    for (let i = 0; i < shots; i += 1) {
      const target = new THREE.Vector3(
        this.crowd.x + (Math.random() - 0.5) * 2.2,
        0.9,
        this.crowd.z
      );
      const direction = target.sub(origin).normalize().multiplyScalar(16 + i * 0.6);
      this.projectiles.spawn(origin.x, origin.y, origin.z, direction, 0, "boss");
    }
    const shotPos = origin.clone();
    this.particles.burst(shotPos, 0xc084fc, 8, 3, 0.4);
  }

  summonMinions() {
    if (this.boss.summoned) return;
    this.boss.summoned = true;
    const group = new SwarmGroup(
      this.worldRoot,
      this.level,
      { cols: 5, rows: 2 },
      this.level.bossZ - 7,
      1.15
    );
    this.groupList.push(group);
    this.enemies.push(...group.enemies);
  }

  triggerVictory() {
    if (this.mode === "victory" || this.mode === "ended" || this.quizOpened) return;
    this.mode = "victory";
    this.victoryTimer = 1.8;
    this.boss.die();
    this.audio.victory();
    this.ui.setBoss(0, this.boss.maxHp);
    const center = this.boss.position.clone();
    this.particles.burst(center, this.level.theme.enemy, 30, 8, 1.0, 1.6);
    this.particles.burst(center, 0xfef08a, 20, 6, 0.9, 1.4);
    this.cameraShake(0.6);
  }

  updateVictory(dt) {
    this.boss.update(dt, this.time);
    this.crowd.update(dt, false);
    this.projectiles.update(dt);
    this.updateCamera(dt);
    this.victoryTimer -= dt;
    if (this.victoryTimer <= 0) {
      this.openQuiz();
    }
  }

  openQuiz() {
    if (this.quizOpened) return;
    this.quizOpened = true;
    this.mode = "quiz";
    this.ui.hideHud();
    const trivia = getTrivia(this.level.triviaId);
    this.ui.showQuiz(trivia, (correct) => {
      const result = this.completeLevel(correct);
      this.mode = "ended";
      this.ui.showResult(result);
    });
  }

  completeLevel(correct) {
    const timeBonus = Math.max(0, Math.round(300 - this.elapsed * 4));
    const score = Math.round(
      this.kills * 10 + this.crowd.count * 10 + 250 + timeBonus
    );
    const quizExp = correct ? 150 : 50;
    const expGain = Math.round(score / 8) + quizExp;

    const levelId = this.level.id;
    const previousBest = this.profile.best[levelId] || 0;
    const isNewBest = score > previousBest;
    if (isNewBest) this.profile.best[levelId] = score;

    const cardNew = !this.profile.cards.includes(this.level.triviaId);
    if (cardNew) this.profile.cards.push(this.level.triviaId);

    if (!this.profile.completed.includes(levelId)) {
      this.profile.completed.push(levelId);
    }
    this.profile.exp += expGain;
    this.profile.totalRuns = (this.profile.totalRuns || 0) + 1;
    this.saveProfile(this.profile);

    this.ui.renderMenuFooter();

    return {
      level: this.level,
      levelIndex: this.levelIndex,
      score,
      best: this.profile.best[levelId],
      isNewBest,
      expGain,
      quizExp,
      correct,
      kills: this.kills,
      remaining: this.crowd.count,
      elapsed: this.elapsed,
      cardNew,
      trivia: getTrivia(this.level.triviaId),
      hasNext: this.levelIndex < LEVELS.length - 1,
      totalExp: this.profile.exp
    };
  }

  triggerGameOver() {
    if (this.mode === "gameover" || this.mode === "ended") return;
    this.mode = "gameover";
    this.gameOverTimer = 1.1;
    this.gameOverShown = false;
    this.crowd.setCount(0);
    this.crowd.hide();
    this.audio.defeat();
    this.particles.burst(
      new THREE.Vector3(this.crowd.x, 0.8, this.crowd.z),
      0xfb7185,
      24,
      6,
      0.9
    );
    this.cameraShake(0.7);
    this.ui.hideBoss();
    this.ui.setCrowd(0);
  }

  updateGameOver(dt) {
    this.projectiles.update(dt);
    this.bossTimeline(dt);
    this.updateCamera(dt);
    this.gameOverTimer -= dt;
    if (this.gameOverTimer <= 0 && !this.gameOverShown) {
      this.gameOverShown = true;
      this.mode = "ended";
      this.ui.hideHud();
      this.ui.showGameOver({
        level: this.level,
        levelIndex: this.levelIndex,
        kills: this.kills,
        elapsed: this.elapsed
      });
    }
  }

  bossTimeline(dt) {
    if (this.boss) {
      this.boss.update(dt, this.time);
    }
  }

  cameraShake(amount) {
    this.shake = Math.min(0.9, this.shake + amount);
  }

  updateCamera(dt) {
    let targetPos;
    let lookAt;

    if (
      this.mode === "boss" ||
      this.mode === "victory" ||
      this.mode === "gameover" ||
      (this.mode === "ended" && this.bossTriggered)
    ) {
      const arenaZ = this.level.bossZ - 15;
      targetPos = new THREE.Vector3(this.crowd.x * 0.22, 7.4, arenaZ - 12.5);
      lookAt = new THREE.Vector3(
        this.boss ? this.boss.position.x * 0.3 : 0,
        2.7,
        this.level.bossZ - 5
      );
    } else {
      targetPos = new THREE.Vector3(this.crowd.x * 0.35, 7.7, this.crowd.z - 11.5);
      lookAt = new THREE.Vector3(this.crowd.x * 0.45, 1.05, this.crowd.z + 7);
    }

    const factor = dt > 0 ? 1 - Math.exp(-dt * 4.6) : 0;
    this.camera.position.lerp(targetPos, factor);
    this.camera.lookAt(lookAt);

    if (this.shake > 0.001) {
      this.camera.position.x += (Math.random() - 0.5) * this.shake;
      this.camera.position.y += (Math.random() - 0.5) * this.shake * 0.7;
      this.shake = Math.max(0, this.shake - (dt > 0 ? dt * 2.4 : 0.05));
    }
  }
}
