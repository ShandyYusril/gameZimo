import * as THREE from "three";

function makeParticleTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.45, "rgba(255,255,255,0.65)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export class Particles {
  constructor(scene, max = 320) {
    this.max = max;
    this.cursor = 0;
    this.positions = new Float32Array(max * 3);
    this.colors = new Float32Array(max * 3);
    this.velocities = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max);
    this.baseColor = new Float32Array(max * 3);

    for (let i = 0; i < max; i += 1) {
      this.positions[i * 3 + 1] = -999;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.6,
      map: makeParticleTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true
    });

    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.geometry = geometry;
  }

  burst(position, color, count = 10, speed = 4, life = 0.55, spread = 1) {
    const tint = new THREE.Color(color);
    for (let n = 0; n < count; n += 1) {
      const index = this.cursor;
      this.cursor = (this.cursor + 1) % this.max;
      const i3 = index * 3;
      this.positions[i3] = position.x + (Math.random() - 0.5) * 0.3;
      this.positions[i3 + 1] = position.y + (Math.random() - 0.5) * 0.3;
      this.positions[i3 + 2] = position.z + (Math.random() - 0.5) * 0.3;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const magnitude = speed * (0.35 + Math.random() * 0.65);
      this.velocities[i3] = Math.sin(phi) * Math.cos(theta) * magnitude * spread;
      this.velocities[i3 + 1] = Math.abs(Math.cos(phi)) * magnitude * 0.9 + 1.2;
      this.velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * magnitude * spread;

      this.life[index] = life * (0.7 + Math.random() * 0.6);
      this.maxLife[index] = this.life[index];
      this.baseColor[i3] = tint.r;
      this.baseColor[i3 + 1] = tint.g;
      this.baseColor[i3 + 2] = tint.b;
      this.colors[i3] = tint.r;
      this.colors[i3 + 1] = tint.g;
      this.colors[i3 + 2] = tint.b;
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  update(dt) {
    let dirty = false;
    for (let i = 0; i < this.max; i += 1) {
      if (this.life[i] <= 0) continue;
      dirty = true;
      const i3 = i * 3;
      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        this.positions[i3 + 1] = -999;
        this.colors[i3] = 0;
        this.colors[i3 + 1] = 0;
        this.colors[i3 + 2] = 0;
        continue;
      }
      this.velocities[i3 + 1] -= 7.5 * dt;
      this.positions[i3] += this.velocities[i3] * dt;
      this.positions[i3 + 1] += this.velocities[i3 + 1] * dt;
      this.positions[i3 + 2] += this.velocities[i3 + 2] * dt;
      const ratio = this.life[i] / this.maxLife[i];
      this.colors[i3] = this.baseColor[i3] * ratio;
      this.colors[i3 + 1] = this.baseColor[i3 + 1] * ratio;
      this.colors[i3 + 2] = this.baseColor[i3 + 2] * ratio;
    }
    if (dirty) {
      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.color.needsUpdate = true;
    }
  }

  reset() {
    for (let i = 0; i < this.max; i += 1) {
      this.life[i] = 0;
      this.positions[i * 3 + 1] = -999;
      this.colors[i * 3] = 0;
      this.colors[i * 3 + 1] = 0;
      this.colors[i * 3 + 2] = 0;
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }
}
