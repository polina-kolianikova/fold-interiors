import * as THREE from "./assets/vendor/three.module.js?v=ce1fa418de16a19495a9f72495580e3015d7745c296d3ce0485897f902ddedfb";

const $ = (s) => document.querySelector(s),
  clamp = THREE.MathUtils.clamp,
  mix = THREE.MathUtils.lerp;
const smooth = (a, b, x) => {
  let t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const colours = {
  blue: { name: "Klein Blue", hex: "#2633d4" },
  orange: { name: "Burnt Orange", hex: "#c45a2d" },
  chalk: { name: "Warm Chalk", hex: "#e6d8c4" },
  plum: { name: "Deep Plum", hex: "#512f57" },
};
let selectedColor = "blue",
  selectedMaterial = "boucle",
  progress = 0,
  targetProgress = 0,
  rotation = 0,
  rotationTarget = 0,
  active = -1,
  invalidate = () => {};
let coverMaterial,
  shellMaterial,
  seamMaterial,
  scene,
  renderer,
  camera,
  chair,
  shellGroup,
  coverGroup,
  frameGroup;
const dialog = $("#spec-dialog");
function updateSpecification() {
  $("#finish-name").textContent = colours[selectedColor].name.toUpperCase();
  $("#spec-color").textContent = colours[selectedColor].name;
  $("#spec-material").textContent =
    selectedMaterial === "boucle" ? "Bouclé" : "Soft touch";
  $("#save-status").textContent = "";
}
function openSpec() {
  updateSpecification();
  dialog.showModal();
}
$("#details-button").addEventListener("click", openSpec);
$("#spec-button").addEventListener("click", openSpec);
$("#close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
});
document.querySelectorAll("[data-color]").forEach((b) =>
  b.addEventListener("click", () => {
    selectedColor = b.dataset.color;
    document
      .querySelectorAll("[data-color]")
      .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    if (coverMaterial) {
      coverMaterial.color.set(colours[selectedColor].hex);
      shellMaterial.color.set(colours[selectedColor].hex).multiplyScalar(0.68);
      seamMaterial.color.set(colours[selectedColor].hex).multiplyScalar(0.6);
    }
    updateSpecification();
    invalidate();
  }),
);
document.querySelectorAll("[data-material]").forEach((b) =>
  b.addEventListener("click", () => {
    selectedMaterial = b.dataset.material;
    document
      .querySelectorAll("[data-material]")
      .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    if (coverMaterial) {
      coverMaterial.roughness = selectedMaterial === "boucle" ? 0.94 : 0.42;
      coverMaterial.bumpScale = selectedMaterial === "boucle" ? 0.035 : 0.003;
    }
    updateSpecification();
    invalidate();
  }),
);
$("#reset-view").addEventListener("click", () => {
  rotationTarget = 0;
  invalidate();
});
$("#download-spec").addEventListener("click", () => {
  const content = `FOLD 01\nYour design specification\n\nColour: ${colours[selectedColor].name}\nSurface: ${selectedMaterial === "boucle" ? "Bouclé" : "Soft touch"}\nFrame: Polished stainless steel\nDimensions: W 76 × D 82 × H 84 cm\nSeat height: 42 cm\n\nIndependent furniture concept, 2026.\nDesign study dimensions. Not in production or offered for sale.\nIndependent concept by BlackStack Studio.\n`;
  const link = document.createElement("a"),
    url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" }),
    );
  link.href = url;
  link.download = `fold-01-${selectedColor}-${selectedMaterial}.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $("#save-status").textContent =
    "Specification saved. Make room on your moodboard.";
});
const sections = [...document.querySelectorAll(".chapter")],
  nav = [...document.querySelectorAll(".progress-nav a")];
function updateProgress() {
  let i = 0;
  while (i < sections.length - 1 && scrollY >= sections[i + 1].offsetTop) i++;
  const start = sections[i].offsetTop,
    end = sections[i + 1]?.offsetTop ?? start + innerHeight;
  targetProgress = i + clamp((scrollY - start) / (end - start), 0, 1);
  let current = Math.min(3, Math.round(targetProgress));
  if (current !== active) {
    active = current;
    nav.forEach((a, j) => {
      a.classList.toggle("active", j === current);
      if (j === current) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
    });
  }
}
addEventListener(
  "scroll",
  () => {
    updateProgress();
    invalidate();
  },
  { passive: true },
);
updateProgress();
const host = $("#scene");
try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, innerWidth < 800 ? 1.15 : 1.5),
  );
  renderer.setSize(host.clientWidth, host.clientHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.append(renderer.domElement);
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#d9ed38");
  scene.fog = new THREE.Fog("#d9ed38", 16, 34);
  camera = new THREE.PerspectiveCamera(
    36,
    host.clientWidth / host.clientHeight,
    0.05,
    80,
  );
  scene.add(new THREE.HemisphereLight("#ffffff", "#7b8143", 2.9));
  const key = new THREE.DirectionalLight("#ffffff", 4);
  key.position.set(-4.5, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -4;
  key.shadow.normalBias = 0.018;
  key.shadow.bias = -0.00015;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight("#c8d8ff", 2.4);
  rim.position.set(5, 3, -4);
  scene.add(rim);
  const fill = new THREE.DirectionalLight("#ffedc2", 0.8);
  fill.position.set(-5, 1, -3);
  scene.add(fill);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    new THREE.MeshStandardMaterial({ color: "#d9ed38", roughness: 0.86 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.005;
  ground.receiveShadow = true;
  scene.add(ground);
  // A knitted microtexture, generated locally rather than fetched from a stock library.
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#909090";
  ctx.fillRect(0, 0, 256, 256);
  let seed = 39;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let y = 0; y < 256; y += 4)
    for (let x = 0; x < 256; x += 4) {
      const shade = 80 + Math.floor(random() * 100);
      ctx.strokeStyle = `rgb(${shade},${shade},${shade})`;
      ctx.lineWidth = 1 + random();
      ctx.beginPath();
      ctx.ellipse(
        x + random() * 3,
        y + random() * 3,
        1.1,
        1.8,
        random(),
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  const textile = new THREE.CanvasTexture(canvas);
  textile.wrapS = textile.wrapT = THREE.RepeatWrapping;
  textile.repeat.set(3, 4);
  textile.anisotropy = 4;
  coverMaterial = new THREE.MeshStandardMaterial({
    color: colours.blue.hex,
    roughness: 0.94,
    bumpMap: textile,
    bumpScale: 0.035,
  });
  shellMaterial = new THREE.MeshStandardMaterial({
    color: colours.blue.hex,
    roughness: 0.54,
  });
  shellMaterial.color.multiplyScalar(0.68);
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: "#c5cbcc",
    metalness: 0.75,
    roughness: 0.2,
  });
  seamMaterial = new THREE.MeshStandardMaterial({
    color: "#17229c",
    roughness: 0.85,
    transparent: true,
  });
  chair = new THREE.Group();
  scene.add(chair);
  shellGroup = new THREE.Group();
  coverGroup = new THREE.Group();
  frameGroup = new THREE.Group();
  chair.add(shellGroup, coverGroup, frameGroup);
  const profile = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 2.74, -0.54),
      new THREE.Vector3(0, 2.52, -0.7),
      new THREE.Vector3(0, 1.9, -0.73),
      new THREE.Vector3(0, 1.4, -0.42),
      new THREE.Vector3(0, 1.18, 0.04),
      new THREE.Vector3(0, 1.17, 0.55),
      new THREE.Vector3(0, 1.07, 0.83),
    ],
    false,
    "catmullrom",
    0.35,
  );
  // A closed, thick, continuous folded shell. Every layer follows this same authored profile.
  function ribbonGeometry(width, thickness, lift) {
    const rows = 86,
      cols = 24,
      vertices = [],
      uvs = [],
      indices = [];
    for (let side = 0; side < 2; side++)
      for (let v = 0; v <= rows; v++) {
        const t = v / rows,
          p = profile.getPoint(t),
          tangent = profile.getTangent(t),
          ny = tangent.z,
          nz = -tangent.y;
        for (let u = 0; u <= cols; u++) {
          const a = u / cols - 0.5,
            w = width * (0.96 + 0.04 * Math.cos(t * Math.PI * 2)),
            x = a * w,
            edge = Math.pow(Math.abs(a) * 2, 3),
            cup = 0.035 * edge;
          const n = (side === 0 ? thickness / 2 : -thickness / 2) + lift;
          vertices.push(x, p.y + ny * n + cup, p.z + nz * n + edge * 0.055);
          uvs.push(u / cols, t);
        }
      }
    const layer = (rows + 1) * (cols + 1);
    for (let s = 0; s < 2; s++)
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const a = s * layer + r * (cols + 1) + c,
            b = a + 1,
            d = a + cols + 1,
            e = d + 1;
          if (s === 0) indices.push(a, d, b, b, d, e);
          else indices.push(a, b, d, b, e, d);
        }
    for (let r = 0; r < rows; r++)
      for (const c of [0, cols]) {
        const a = r * (cols + 1) + c,
          b = (r + 1) * (cols + 1) + c;
        indices.push(a, a + layer, b, a + layer, b + layer, b);
      }
    for (const r of [0, rows])
      for (let c = 0; c < cols; c++) {
        const a = r * (cols + 1) + c,
          b = a + 1;
        indices.push(a, b, a + layer, b, b + layer, a + layer);
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }
  function addFlatMorph(geometry, thickness) {
    const flat = geometry.attributes.position.array.slice(),
      layer = 87 * 25;
    for (let n = 0; n < flat.length / 3; n++) {
      const side = n >= layer ? 1 : 0,
        t = Math.floor((n % layer) / 25) / 86;
      flat[n * 3 + 1] = 1.45 + (side ? -0.5 : 0.5) * thickness;
      flat[n * 3 + 2] = (t - 0.5) * 3.35;
    }
    const target = new THREE.Float32BufferAttribute(flat, 3),
      flatGeometry = geometry.clone();
    flatGeometry.setAttribute("position", target);
    flatGeometry.computeVertexNormals();
    geometry.morphAttributes.position = [target];
    geometry.morphAttributes.normal = [flatGeometry.attributes.normal.clone()];
    flatGeometry.dispose();
    return geometry;
  }
  const shell = new THREE.Mesh(
    addFlatMorph(ribbonGeometry(1.82, 0.11, 0), 0.11),
    shellMaterial,
  );
  shell.castShadow = shell.receiveShadow = true;
  shellGroup.add(shell);
  const cover = new THREE.Mesh(
    addFlatMorph(ribbonGeometry(1.73, 0.09, 0.075), 0.09),
    coverMaterial,
  );
  cover.castShadow = cover.receiveShadow = true;
  coverGroup.add(cover);
  // Tailored piping follows the actual three-dimensional shell, no flat image on a plane.
  for (const side of [-1, 1]) {
    const points = [];
    for (let i = 0; i <= 86; i++) {
      const t = i / 86,
        p = profile.getPoint(t),
        tan = profile.getTangent(t);
      points.push(
        new THREE.Vector3(
          side * 0.83,
          p.y + tan.z * 0.13 + 0.033,
          p.z - tan.y * 0.13 + 0.05,
        ),
      );
    }
    const pipe = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points),
        86,
        0.007,
        6,
        false,
      ),
      seamMaterial,
    );
    pipe.castShadow = true;
    coverGroup.add(pipe);
  }
  function tube(points, radius = 0.034) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
      false,
      "centripetal",
    );
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 70, radius, 12, false),
      frameMaterial,
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    frameGroup.add(mesh);
    return mesh;
  }
  for (const side of [-1, 1]) {
    const x = side * 0.72;
    tube(
      [
        [x, 1.29, -0.38],
        [x, 1.13, -0.5],
        [x, 0.35, -0.68],
        [x, 0.14, -0.61],
        [x, 0.12, -0.34],
        [x, 0.12, 0.51],
        [x, 0.19, 0.68],
        [x, 0.65, 0.67],
        [x, 1.1, 0.56],
        [x, 1.18, 0.4],
      ],
      0.036,
    );
  }
  tube(
    [
      [-0.72, 1.16, 0.4],
      [0, 1.13, 0.42],
      [0.72, 1.16, 0.4],
    ],
    0.03,
  );
  tube(
    [
      [-0.72, 1.26, -0.4],
      [0, 1.26, -0.4],
      [0.72, 1.26, -0.4],
    ],
    0.03,
  );
  const feetMat = new THREE.MeshStandardMaterial({
    color: "#28302a",
    roughness: 0.8,
  });
  for (const x of [-0.72, 0.72])
    for (const z of [-0.47, 0.48]) {
      const foot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.047, 0.047, 0.035, 12),
        feetMat,
      );
      foot.position.set(x, 0.066, z);
      frameGroup.add(foot);
    }
  // Small, inset fabrication plate on the rear underside.
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.05, 0.01),
    frameMaterial,
  );
  plate.position.set(0, 1.25, -0.74);
  shellGroup.add(plate);
  let start = null;
  host.style.cursor = "grab";
  host.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") return;
    start = { x: e.clientX, value: rotationTarget };
    host.setPointerCapture(e.pointerId);
    host.style.cursor = "grabbing";
  });
  host.addEventListener("pointermove", (e) => {
    if (start) {
      rotationTarget = start.value + (e.clientX - start.x) * 0.006;
      invalidate();
    }
  });
  function endDrag() {
    start = null;
    host.style.cursor = "grab";
  }
  host.addEventListener("pointerup", endDrag);
  host.addEventListener("pointercancel", endDrag);
  // Touch users can use buttons without a horizontal gesture competing with native page scroll.
  const rotateButton = document.createElement("button");
  rotateButton.className = "rotate-touch";
  rotateButton.textContent = "TURN 45° ↻";
  rotateButton.setAttribute("aria-label", "Rotate the chair by 45 degrees");
  rotateButton.addEventListener("click", () => {
    rotationTarget += Math.PI / 4;
    invalidate();
  });
  $(".config-foot").append(rotateButton);
  let quality = Math.min(devicePixelRatio, innerWidth < 800 ? 1.15 : 1.5),
    raf = 0,
    visible = true,
    previous = 0,
    frames = 0,
    lastMorph = -1,
    lastRotation = -1,
    slow = 0;
  const diagnostics = (mode) => {
    const d = document.documentElement.dataset;
    d.renderFrames = String(frames);
    d.drawCalls = String(renderer.info.render.calls);
    d.triangles = String(renderer.info.render.triangles);
    d.renderDpr = String(renderer.getPixelRatio());
    d.renderMode = mode;
  };
  addEventListener("resize", () => {
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    quality = Math.min(devicePixelRatio, innerWidth < 800 ? 1.15 : 1.5);
    renderer.setPixelRatio(quality);
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    updateProgress();
    invalidate();
  });
  const poses = [
    { c: [4.1, 3.7, 6.8], l: [0, 1.5, 0], r: -0.3 },
    { c: [-3.5, 5.6, 7.4], l: [0, 1.9, 0], r: -0.25 },
    { c: [4.3, 3.5, 6.8], l: [0, 1.45, 0], r: 0.1 },
    { c: [3.8, 3.6, 7.2], l: [0, 1.45, 0], r: 0.1 },
  ];
  function render(now) {
    raf = 0;
    if (document.hidden || !visible) {
      diagnostics(document.hidden ? "hidden" : "offscreen");
      return;
    }
    const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 1 / 60;
    previous = now;
    const d = 1 - Math.exp(-9 * dt);
    progress = reduced.matches
      ? targetProgress
      : mix(progress, targetProgress, d);
    rotation = reduced.matches
      ? rotationTarget
      : mix(rotation, rotationTarget, d);
    const mobile = innerWidth < 800,
      p = reduced.matches
        ? Math.round(clamp(progress, 0, 3))
        : clamp(progress, 0, 3),
      i = Math.min(2, Math.floor(p)),
      t = smooth(0, 1, p - i),
      a = poses[i],
      b = poses[i + 1];
    const unfold = smooth(0.35, 0.95, p) * (1 - smooth(1.12, 1.8, p)),
      explode = smooth(0.55, 0.95, p) * (1 - smooth(1.15, 1.75, p));
    shell.morphTargetInfluences[0] = unfold;
    cover.morphTargetInfluences[0] = unfold;
    seamMaterial.opacity = 1 - smooth(0, 0.2, unfold);
    coverGroup.position.set(-explode * 0.15, explode * 0.7, 0);
    shellGroup.position.y = explode * 0.12;
    frameGroup.position.y = -explode * 0.04;
    const m = mobile ? 1.2 : 1;
    camera.position.set(
      mix(a.c[0], b.c[0], t) * m,
      mix(a.c[1], b.c[1], t) + (mobile ? 1.3 : 0),
      mix(a.c[2], b.c[2], t) * m,
    );
    camera.lookAt(0, mix(a.l[1], b.l[1], t) + (mobile ? 0.38 : 0), 0);
    chair.rotation.y = mix(a.r, b.r, t) + rotation;
    chair.scale.setScalar(mobile ? 0.83 : 1.18);
    const words = $(".poster-title").children;
    words[0].style.transform = `translate3d(${-p * 18}vw,0,0) rotate(${-p * 3}deg)`;
    words[1].style.transform = `translate3d(${p * 20}vw,0,0) rotate(${p * 3}deg)`;
    $(".poster-title").style.opacity = String(1 - smooth(0.3, 0.95, p));
    if (
      Math.abs(unfold - lastMorph) > 0.01 ||
      Math.abs(rotation - lastRotation) > 0.02 ||
      frames === 0
    ) {
      renderer.shadowMap.needsUpdate = true;
      lastMorph = unfold;
      lastRotation = rotation;
    }
    const start = performance.now();
    renderer.render(scene, camera);
    frames++;
    if (performance.now() - start > 24) slow++;
    else slow = Math.max(0, slow - 1);
    if (slow > 12 && quality > 0.8) {
      quality = Math.max(0.8, quality - 0.15);
      renderer.setPixelRatio(quality);
      slow = 0;
    }
    const moving =
      Math.abs(progress - targetProgress) > 0.0003 ||
      Math.abs(rotation - rotationTarget) > 0.0003;
    diagnostics(moving ? "active" : "idle");
    if (moving) raf = requestAnimationFrame(render);
  }
  invalidate = () => {
    if (!raf && !document.hidden && visible) {
      previous = 0;
      raf = requestAnimationFrame(render);
    }
  };
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (!visible) {
      cancelAnimationFrame(raf);
      raf = 0;
      diagnostics("offscreen");
    } else invalidate();
  }).observe($("main"));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      diagnostics("hidden");
    } else invalidate();
  });
  reduced.addEventListener("change", invalidate);
  invalidate();
  $("#loading").classList.add("done");
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
    visible = false;
    diagnostics("offscreen");
    document.body.classList.add("no-webgl");
    $("#drag-hint").textContent =
      "STATIC PREVIEW. CONFIGURATION REMAINS AVAILABLE.";
  });
} catch (error) {
  document.body.classList.add("no-webgl");
  $("#loading").classList.add("done");
  $("#drag-hint").textContent =
    "STATIC PREVIEW. CONFIGURATION REMAINS AVAILABLE.";
  console.warn("Static furniture view enabled.", error.message);
}
