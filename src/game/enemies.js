import * as THREE from "three";

function enemyGeometry(shape) {
  if (shape === "coccus") {
    return new THREE.SphereGeometry(0.42, 16, 12);
  }
  if (shape === "spiral") {
    return new THREE.TorusKnotGeometry(0.28, 0.11, 48, 8);
  }
  return new THREE.CapsuleGeometry(0.3, 0.72, 6, 12);
}

export class SwarmGroup {
  constructor(scene, level, config, z, hpMultiplier = 1) {
    this.scene = scene;
    this.level = level;
    this.groupZ = z;
    this.enemies = [];
    this.time = 0;

    const geometry = enemyGeometry(level.bacteria.shape);
    const material = new THREE.MeshStandardMaterial({
      color: level.theme.enemy,
      emissive: level.theme.enemy,
      emissiveIntensity: 0.42,
      roughness: 0.42,
      metalness: 0.05
    });

    const cols = config.cols;
    const rows = config.rows;
    const spacing = cols > 1 ? 5.6 / (cols - 1) : 0;

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const mesh = new THREE.Mesh(geometry, material);
        const x = (c - (cols - 1) / 2) * spacing + (Math.random() - 0.5) * 0.16;
        const zz = z + r * 2.15 + (Math.random() - 0.5) * 0.18;
        mesh.position.set(x, 0.55, zz);
        mesh.rotation.set(Math.random() * 0.4, Math.random() * Math.PI * 2, Math.random() * 0.3);
        mesh.scale.setScalar(0.001);
        scene.add(mesh);

        const maxHp = Math.round(level.swarmHP * hpMultiplier * (1 + r * 0.22));
        this.enemies.push({
          mesh,
          hp: maxHp,
          maxHp,
          alive: true,
          remove: false,
          flash: 0,
          spawnT: 0,
          bobPhase: Math.random() * Math.PI * 2,
          baseScale: 0.9 + Math.random() * 0.25,
          deathT: 0
        });
      }
    }
  }

  update(dt, time) {
    for (const enemy of this.enemies) {
      if (enemy.remove) continue;
      const mesh = enemy.mesh;

      if (!enemy.alive) {
        enemy.deathT += dt;
        const shrink = Math.max(0, 1 - enemy.deathT / 0.3);
        mesh.scale.setScalar(enemy.baseScale * shrink);
        mesh.rotation.y += dt * 8;
        if (enemy.deathT >= 0.3) {
          mesh.visible = false;
          enemy.remove = true;
        }
        continue;
      }

      if (enemy.spawnT < 1) {
        enemy.spawnT = Math.min(1, enemy.spawnT + dt * 3.2);
        const eased = 1 - Math.pow(1 - enemy.spawnT, 3);
        mesh.scale.setScalar(enemy.baseScale * eased);
      }

      if (enemy.flash > 0) {
        enemy.flash = Math.max(0, enemy.flash - dt * 5);
      }

      const pop = 1 + enemy.flash * 0.22;
      mesh.scale.setScalar(enemy.baseScale * pop);
      mesh.position.y = 0.55 + Math.sin(time * 3.2 + enemy.bobPhase) * 0.1;
      mesh.rotation.y += dt * 1.4;
    }
  }
}

export class Boss {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;
    this.maxHp = level.bossHP;
    this.hp = level.bossHP;
    this.alive = true;
    this.radius = 2.35;
    this.flash = 0;
    this.baseZ = level.bossZ;
    this.attackTimer = 1.6;
    this.enraged = false;
    this.summoned = false;

    this.group = new THREE.Group();
    this.group.position.set(0, 3.1, level.bossZ);
    scene.add(this.group);

    this.body = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.05, 2),
      new THREE.MeshStandardMaterial({
        color: level.theme.enemy,
        emissive: level.theme.enemy,
        emissiveIntensity: 0.45,
        roughness: 0.35,
        metalness: 0.1
      })
    );
    this.group.add(this.body);

    const spikeMat = new THREE.MeshStandardMaterial({
      color: level.theme.accent2,
      emissive: level.theme.accent2,
      emissiveIntensity: 0.6,
      roughness: 0.3
    });
    const spikeGeo = new THREE.ConeGeometry(0.3, 1.15, 6);
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < 16; i += 1) {
      const y = 1 - (i / 15) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * 2.399963;
      const direction = new THREE.Vector3(
        Math.cos(theta) * radius,
        y,
        Math.sin(theta) * radius
      );
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.copy(direction).multiplyScalar(2.15);
      spike.quaternion.setFromUnitVectors(up, direction);
      this.body.add(spike);
    }

    const eyeWhite = new THREE.MeshBasicMaterial({ color: 0xfff1f2 });
    const pupil = new THREE.MeshBasicMaterial({ color: 0x2a0610 });
    this.eyeGroup = new THREE.Group();
    for (const side of [-1, 1]) {
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 12), eyeWhite);
      white.position.set(side * 0.72, 0.42, -1.72);
      const black = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 10), pupil);
      black.position.set(side * 0.72, 0.42, -2.06);
      this.eyeGroup.add(white, black);
    }
    this.group.add(this.eyeGroup);

    this.aura = new THREE.Mesh(
      new THREE.TorusGeometry(2.75, 0.08, 8, 64),
      new THREE.MeshBasicMaterial({
        color: level.theme.ring,
        transparent: true,
        opacity: 0.5
      })
    );
    this.aura.rotation.x = Math.PI / 2.4;
    this.group.add(this.aura);
  }

  update(dt, time) {
    if (!this.alive) {
      this.group.rotation.z += dt * 2.4;
      this.group.position.y = Math.max(0.8, this.group.position.y - dt * 2.2);
      this.group.scale.setScalar(Math.max(0.2, this.group.scale.x - dt * 0.5));
      return;
    }
    this.group.position.x = Math.sin(time * 0.58) * 2.05;
    this.group.position.y = 3.1 + Math.sin(time * 1.4) * 0.28;
    this.body.rotation.y += dt * 0.4;
    this.body.rotation.z = Math.sin(time * 0.9) * 0.08;
    this.aura.rotation.z += dt * 0.9;
    this.aura.scale.setScalar(1 + Math.sin(time * 2.2) * 0.04);
    this.eyeGroup.rotation.y = Math.sin(time * 0.7) * 0.18;

    if (this.flash > 0) {
      this.flash = Math.max(0, this.flash - dt * 4);
    }
    this.body.material.emissiveIntensity = 0.45 + this.flash * 0.9;
  }

  hit(damage) {
    if (!this.alive) return false;
    this.hp = Math.max(0, this.hp - damage);
    this.flash = 1;
    return this.hp <= 0;
  }

  die() {
    this.alive = false;
    this.group.scale.setScalar(1);
  }

  get position() {
    return this.group.position;
  }
}
