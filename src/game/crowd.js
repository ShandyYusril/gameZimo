import * as THREE from "three";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const MAX_VISIBLE = 110;
const MAX_COUNT = 150;

function damp(current, target, lambda, dt) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export class Crowd {
  constructor(scene) {
    this.scene = scene;
    this.count = 12;
    this.maxCount = MAX_COUNT;
    this.maxVisible = MAX_VISIBLE;
    this.leaderX = 0;
    this.targetX = 0;
    this.z = 0;
    this.time = 0;
    this.formationAngle = 0;
    this.shielded = false;
    this.alive = true;

    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0);
    scene.add(this.group);

    this.leader = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.46, 2),
      new THREE.MeshStandardMaterial({
        color: 0xf0feff,
        emissive: 0x22d3ee,
        emissiveIntensity: 0.55,
        roughness: 0.35,
        metalness: 0.1
      })
    );
    this.leader.position.y = 0.62;
    this.group.add(this.leader);

    this.core = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x7dd3fc })
    );
    this.leader.add(this.core);

    this.ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.68, 0.04, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.85 })
    );
    this.ring.rotation.x = Math.PI / 2;
    this.leader.add(this.ring);

    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.1, 0.78, 8),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, metalness: 0.65, roughness: 0.3 })
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.08, 0.58);
    this.leader.add(barrel);

    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xa3e635,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.shield = new THREE.Mesh(new THREE.SphereGeometry(1.5, 18, 18), shieldMat);
    this.shield.visible = false;
    this.group.add(this.shield);

    this.unitGeometry = new THREE.IcosahedronGeometry(0.245, 1);
    this.unitMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.4,
      roughness: 0.4,
      metalness: 0.05
    });
    this.units = new THREE.InstancedMesh(this.unitGeometry, this.unitMaterial, MAX_VISIBLE);
    this.units.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.units.frustumCulled = false;
    scene.add(this.units);

    this.unitState = [];
    const color = new THREE.Color();
    for (let i = 0; i < MAX_VISIBLE; i += 1) {
      this.unitState.push({
        x: (Math.random() - 0.5) * 1.6,
        y: 0.4 + Math.random() * 0.2,
        z: (Math.random() - 0.5) * 1.6,
        scale: 0.85 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2
      });
      const mix = Math.min(1, i / MAX_VISIBLE);
      color.setHSL(0.52 - mix * 0.06, 0.85, 0.72 - mix * 0.12);
      this.units.setColorAt(i, color);
    }
    if (this.units.instanceColor) {
      this.units.instanceColor.needsUpdate = true;
    }

    this.matrix = new THREE.Matrix4();
    this.quaternion = new THREE.Quaternion();
    this.vector = new THREE.Vector3();
    this.scaleVector = new THREE.Vector3();
    this.applyMatrices();
  }

  reset(count) {
    this.count = Math.max(1, count);
    this.leaderX = 0;
    this.targetX = 0;
    this.z = 0;
    this.time = 0;
    this.formationAngle = 0;
    this.alive = true;
    this.shielded = false;
    this.shield.visible = false;
    this.group.visible = true;
    this.units.visible = true;
    for (const unit of this.unitState) {
      unit.x = (Math.random() - 0.5) * 1.4;
      unit.y = 0.4 + Math.random() * 0.2;
      unit.z = this.z + (Math.random() - 0.5) * 1.4;
    }
    this.applyMatrices();
  }

  setCount(value) {
    this.count = Math.max(0, Math.min(this.maxCount, Math.round(value)));
    if (this.count <= 0) {
      this.alive = false;
    }
  }

  add(delta) {
    this.setCount(this.count + delta);
    return this.count;
  }

  damage(amount) {
    this.setCount(this.count - amount);
    return this.count;
  }

  setShield(active) {
    this.shielded = active;
    this.shield.visible = active;
  }

  get x() {
    return this.leaderX;
  }

  get y() {
    return 0.62;
  }

  get shieldActive() {
    return this.shielded;
  }

  update(dt, moving) {
    this.time += dt;
    this.leaderX = damp(this.leaderX, this.targetX, 13, dt);
    this.formationAngle += dt * 0.55;
    this.group.position.set(this.leaderX, 0, this.z);

    const bob = Math.sin(this.time * 5.5) * 0.07;
    this.leader.position.y = 0.62 + bob;
    this.leader.rotation.y += dt * 1.6;
    this.ring.rotation.z += dt * 2.2;
    this.core.scale.setScalar(0.9 + Math.sin(this.time * 7) * 0.12);

    if (this.shielded) {
      const pulse = 1 + Math.sin(this.time * 6) * 0.04;
      this.shield.scale.setScalar(pulse);
      this.shield.rotation.y += dt * 1.2;
      this.shield.material.opacity = 0.14 + Math.sin(this.time * 5) * 0.04;
    }

    const visible = Math.min(this.count, this.maxVisible);
    const formationSpin = this.formationAngle;

    for (let i = 0; i < this.maxVisible; i += 1) {
      const unit = this.unitState[i];
      if (i < visible) {
        const angle = i * GOLDEN_ANGLE + formationSpin;
        const radius = Math.min(2.85, 0.44 * Math.sqrt(i + 1));
        const targetX = this.leaderX + Math.cos(angle) * radius;
        const targetZ = this.z - 0.85 + Math.sin(angle) * radius * 0.82;
        const targetY = 0.4 + Math.sin(this.time * 5 + unit.phase) * 0.07;

        unit.x = damp(unit.x, targetX, 9, dt);
        unit.y = damp(unit.y, targetY, 9, dt);
        unit.z = damp(unit.z, targetZ, 9, dt);

        const stride = moving ? 0.12 + Math.sin(this.time * 8 + unit.phase) * 0.05 : 0.0;
        this.vector.set(unit.x, unit.y + stride * 0.4, unit.z);
        this.scaleVector.setScalar(unit.scale);
        this.matrix.compose(this.vector, this.quaternion, this.scaleVector);
        this.units.setMatrixAt(i, this.matrix);
      } else {
        this.scaleVector.setScalar(0);
        this.vector.set(0, -999, 0);
        this.matrix.compose(this.vector, this.quaternion, this.scaleVector);
        this.units.setMatrixAt(i, this.matrix);
      }
    }
    this.units.instanceMatrix.needsUpdate = true;
  }

  applyMatrices() {
    for (let i = 0; i < this.maxVisible; i += 1) {
      const unit = this.unitState[i];
      this.vector.set(unit.x, i < this.count ? unit.y : -999, unit.z);
      this.scaleVector.setScalar(i < this.count ? unit.scale : 0);
      this.matrix.compose(this.vector, this.quaternion, this.scaleVector);
      this.units.setMatrixAt(i, this.matrix);
    }
    this.units.instanceMatrix.needsUpdate = true;
  }

  hide() {
    this.group.visible = false;
    this.units.visible = false;
  }

  show() {
    this.group.visible = true;
    this.units.visible = true;
  }
}
