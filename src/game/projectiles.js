import * as THREE from "three";

const PLAYER_COLOR = 0x7df9ff;
const BOSS_COLOR = 0xc084fc;

export class ProjectilePool {
  constructor(scene, max = 90) {
    this.max = max;
    this.items = [];
    this.geometry = new THREE.SphereGeometry(0.17, 8, 8);
    this.materials = {
      player: new THREE.MeshBasicMaterial({ color: PLAYER_COLOR }),
      boss: new THREE.MeshBasicMaterial({ color: BOSS_COLOR })
    };

    for (let i = 0; i < max; i += 1) {
      const mesh = new THREE.Mesh(this.geometry, this.materials.player);
      mesh.visible = false;
      scene.add(mesh);
      this.items.push({
        mesh,
        alive: false,
        kind: "player",
        damage: 0,
        velocity: new THREE.Vector3()
      });
    }
  }

  spawn(x, y, z, velocity, damage, kind = "player") {
    const item = this.items.find((entry) => !entry.alive);
    if (!item) return null;
    item.alive = true;
    item.kind = kind;
    item.damage = damage;
    item.velocity.copy(velocity);
    item.mesh.material = this.materials[kind];
    item.mesh.position.set(x, y, z);
    item.mesh.visible = true;
    const scale = kind === "boss" ? 1.7 : 1;
    item.mesh.scale.setScalar(scale);
    return item;
  }

  update(dt) {
    for (const item of this.items) {
      if (!item.alive) continue;
      item.mesh.position.addScaledVector(item.velocity, dt);
    }
  }

  release(item) {
    item.alive = false;
    item.mesh.visible = false;
  }

  reset() {
    for (const item of this.items) {
      item.alive = false;
      item.mesh.visible = false;
    }
  }
}
