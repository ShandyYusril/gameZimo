import * as THREE from "three";

const POSITIVE_OPS = new Set(["add", "mult"]);

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function gateSymbol(op, value) {
  if (op === "add") return `+${value}`;
  if (op === "sub") return `\u2212${value}`;
  if (op === "mult") return `\u00d7${value}`;
  return `\u00f7${value}`;
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function makeGateTexture(gate, positive) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  if (positive) {
    gradient.addColorStop(0, "rgba(13, 148, 136, 0.96)");
    gradient.addColorStop(0.55, "rgba(8, 145, 178, 0.94)");
    gradient.addColorStop(1, "rgba(34, 211, 238, 0.92)");
  } else {
    gradient.addColorStop(0, "rgba(190, 18, 60, 0.95)");
    gradient.addColorStop(0.55, "rgba(225, 29, 72, 0.93)");
    gradient.addColorStop(1, "rgba(251, 146, 60, 0.92)");
  }

  ctx.save();
  ctx.shadowColor = positive ? "rgba(34, 211, 238, 0.9)" : "rgba(251, 113, 133, 0.9)";
  ctx.shadowBlur = 42;
  roundRect(ctx, 26, 26, size - 52, size - 52, 52);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();

  roundRect(ctx, 26, 26, size - 52, size - 52, 52);
  ctx.lineWidth = 9;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.stroke();

  roundRect(ctx, 46, 46, size - 92, size - 92, 40);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.32)";
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  ctx.font = "800 30px 'Segoe UI', Arial, sans-serif";
  ctx.fillText(positive ? "NUTRISI" : "RISIKO", size / 2, 108);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 148px 'Segoe UI', Arial, sans-serif";
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillText(gateSymbol(gate.op, gate.value), size / 2, 286);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.font = "700 44px 'Segoe UI', Arial, sans-serif";
  const lines = wrapText(ctx, gate.label.toUpperCase(), 350);
  let y = 366;
  for (const line of lines.slice(0, 2)) {
    ctx.fillText(line, size / 2, y);
    y += 52;
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.font = "700 26px 'Segoe UI', Arial, sans-serif";
  ctx.fillText(positive ? "TAMBAH PASUKAN" : "KURANGI PASUKAN", size / 2, 462);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createGate(level, gate, x, z) {
  const positive = POSITIVE_OPS.has(gate.op);
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const texture = makeGateTexture(gate, positive);
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(3.3, 3.3),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    })
  );
  panel.position.y = 2.05;
  panel.rotation.y = Math.PI;
  group.add(panel);

  const frameColor = positive ? level.theme.accent : 0xfb7185;
  const frameMat = new THREE.MeshStandardMaterial({
    color: frameColor,
    emissive: frameColor,
    emissiveIntensity: 0.9,
    roughness: 0.35,
    metalness: 0.2
  });
  const frameThickness = 0.11;
  const frameGeometryVertical = new THREE.BoxGeometry(frameThickness, 3.5, frameThickness);
  const frameGeometryHorizontal = new THREE.BoxGeometry(3.5, frameThickness, frameThickness);
  const offsets = [
    [-1.72, 2.05, 0, frameGeometryVertical],
    [1.72, 2.05, 0, frameGeometryVertical],
    [0, 3.77, 0, frameGeometryHorizontal],
    [0, 0.33, 0, frameGeometryHorizontal]
  ];
  for (const [ox, oy, oz, geometry] of offsets) {
    const bar = new THREE.Mesh(geometry, frameMat);
    bar.position.set(ox, oy, oz);
    group.add(bar);
  }

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(3.3, 0.07, 0.5),
    new THREE.MeshBasicMaterial({ color: frameColor, transparent: true, opacity: 0.7 })
  );
  base.position.y = 0.06;
  group.add(base);

  return {
    ...gate,
    positive,
    group,
    panel,
    frameMat,
    used: false
  };
}

export class Track {
  constructor(scene, level, options = {}) {
    this.scene = scene;
    this.level = level;
    this.menu = Boolean(options.menu);
    this.group = new THREE.Group();
    scene.add(this.group);
    this.gates = [];
    this.pickups = [];
    this.time = 0;
    this.build();
  }

  build() {
    const level = this.level;
    const theme = level.theme;
    const endZ = level.bossZ + 45;
    const length = endZ + 25;

    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.4, length),
      new THREE.MeshStandardMaterial({
        color: theme.ground,
        roughness: 0.92,
        metalness: 0.08
      })
    );
    ground.position.set(0, -0.2, (endZ - 25) / 2 + 1);
    this.group.add(ground);

    const railMat = new THREE.MeshStandardMaterial({
      color: theme.accent,
      emissive: theme.accent,
      emissiveIntensity: 0.85,
      roughness: 0.4
    });
    for (const x of [-4.05, 4.05]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, length), railMat);
      rail.position.set(x, 0.11, ground.position.z);
      this.group.add(rail);
    }

    const dashGeo = new THREE.BoxGeometry(0.07, 0.02, 1.4);
    const dashMat = new THREE.MeshBasicMaterial({
      color: theme.ring,
      transparent: true,
      opacity: 0.28
    });
    const steps = Math.floor(endZ / 4);
    const dashes = new THREE.InstancedMesh(dashGeo, dashMat, steps * 3);
    const matrix = new THREE.Matrix4();
    let cursor = 0;
    for (let i = 0; i < steps; i += 1) {
      for (const x of [-2.55, 0, 2.55]) {
        matrix.makeTranslation(x, 0.02, 4 + i * 4);
        dashes.setMatrixAt(cursor, matrix);
        cursor += 1;
      }
    }
    dashes.instanceMatrix.needsUpdate = true;
    this.group.add(dashes);

    const ringMat = new THREE.MeshBasicMaterial({
      color: theme.ring,
      transparent: true,
      opacity: 0.22
    });
    const ringGeo = new THREE.TorusGeometry(9.6, 0.14, 8, 48);
    for (let z = 10; z < endZ; z += 15) {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 7.4, z);
      this.group.add(ring);
    }

    const decorGeo = new THREE.IcosahedronGeometry(1, 1);
    const decorMat = new THREE.MeshStandardMaterial({
      color: theme.accent2,
      emissive: theme.accent2,
      emissiveIntensity: 0.28,
      roughness: 0.5,
      transparent: true,
      opacity: 0.55
    });
    const decor = new THREE.InstancedMesh(decorGeo, decorMat, 54);
    const decorMatrix = new THREE.Matrix4();
    const decorQuat = new THREE.Quaternion();
    const decorScale = new THREE.Vector3();
    const decorPos = new THREE.Vector3();
    for (let i = 0; i < 54; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      decorPos.set(
        side * (6.5 + Math.random() * 9),
        1 + Math.random() * 8,
        6 + Math.random() * endZ
      );
      const scale = 0.3 + Math.random() * 1.3;
      decorScale.setScalar(scale);
      decorQuat.setFromEuler(
        new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      );
      decorMatrix.compose(decorPos, decorQuat, decorScale);
      decor.setMatrixAt(i, decorMatrix);
    }
    decor.instanceMatrix.needsUpdate = true;
    this.group.add(decor);

    const dustCount = 460;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i += 1) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 36;
      dustPositions[i * 3 + 1] = Math.random() * 14;
      dustPositions[i * 3 + 2] = -12 + Math.random() * (endZ + 30);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: theme.ring,
      size: 0.26,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      sizeAttenuation: true
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    this.group.add(dust);

    const arena = new THREE.Mesh(
      new THREE.CylinderGeometry(7.2, 7.2, 0.14, 48),
      new THREE.MeshStandardMaterial({
        color: theme.accent2,
        emissive: theme.accent2,
        emissiveIntensity: 0.22,
        roughness: 0.7
      })
    );
    arena.position.set(0, 0.04, level.bossZ);
    this.group.add(arena);

    const arenaRing = new THREE.Mesh(
      new THREE.TorusGeometry(5.6, 0.16, 8, 60),
      new THREE.MeshBasicMaterial({ color: theme.accent, transparent: true, opacity: 0.6 })
    );
    arenaRing.rotation.x = Math.PI / 2;
    arenaRing.position.set(0, 0.14, level.bossZ);
    this.group.add(arenaRing);

    if (!this.menu) {
      for (let i = 0; i < level.gateSets.length; i += 1) {
        const z = level.gateZ[i];
        const set = level.gateSets[i];
        const left = createGate(level, set[0], -1.75, z);
        const right = createGate(level, set[1], 1.75, z);
        this.group.add(left.group, right.group);
        this.gates.push({ z, left, right, used: false });
      }

      for (const spot of level.pickups) {
        const pickup = this.createPickup(spot, theme);
        this.pickups.push(pickup);
      }
    }
  }

  createPickup(spot, theme) {
    const group = new THREE.Group();
    group.position.set(spot.x, 1.15, spot.z);

    const body = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.46, 1),
      new THREE.MeshStandardMaterial({
        color: 0xbef264,
        emissive: 0x84cc16,
        emissiveIntensity: 0.8,
        roughness: 0.3
      })
    );
    group.add(body);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.05, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0xd9f99d, transparent: true, opacity: 0.85 })
    );
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    const dotMat = new THREE.MeshBasicMaterial({ color: 0xecfccb });
    for (let i = 0; i < 3; i += 1) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), dotMat);
      const angle = (i / 3) * Math.PI * 2;
      dot.position.set(Math.cos(angle) * 0.5, Math.sin(angle) * 0.32, Math.sin(angle) * 0.4);
      group.add(dot);
    }

    this.group.add(group);
    return { group, body, halo, spot, taken: false };
  }

  update(dt, time) {
    this.time = time;
    for (const pickup of this.pickups) {
      if (pickup.taken) continue;
      pickup.group.rotation.y += dt * 1.8;
      pickup.halo.rotation.z += dt * 2.4;
      pickup.body.position.y = Math.sin(time * 2.6 + pickup.spot.z) * 0.12;
      pickup.group.position.y = 1.15 + Math.sin(time * 2.2 + pickup.spot.x) * 0.08;
    }
    for (const pair of this.gates) {
      const pulse = 0.75 + Math.sin(time * 3 + pair.z) * 0.25;
      pair.left.frameMat.emissiveIntensity = pair.used ? 0.15 : pulse;
      pair.right.frameMat.emissiveIntensity = pair.used ? 0.15 : pulse;
      if (pair.used) {
        const fade = (material) => {
          material.opacity = Math.max(0.08, material.opacity - dt * 3.5);
        };
        fade(pair.left.panel.material);
        fade(pair.right.panel.material);
      }
    }
  }
}
