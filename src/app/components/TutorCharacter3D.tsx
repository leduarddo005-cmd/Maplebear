// ============================================================
// TutorCharacter3D — 3D animated character using Three.js directly
// (No React Three Fiber — works with React 18)
//
// Each GLB is a self-contained model+animation from Mixamo.
// Strategy: load all 3, show only the active one, crossfade via opacity.
// ============================================================

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// 3 estados do personagem:
// "waiting"   → Aguardando o aluno (parado, atento)        → Sad Idle.glb
// "listening" → Escutando o aluno falar (dando tchauzinho)  → Waving.glb
// "talking"   → Tutor falando/respondendo (boca mexendo)    → Talking.glb
const MODEL_URLS: Record<string, string> = {
  waiting: "https://raw.githubusercontent.com/powerdesignluizeduardo-sketch/maplebear3d/main/Sad%20Idle.glb",
  listening: "https://raw.githubusercontent.com/powerdesignluizeduardo-sketch/maplebear3d/main/Waving.glb",
  talking: "https://raw.githubusercontent.com/powerdesignluizeduardo-sketch/maplebear3d/main/Talking.glb",
};

export type CharacterState = "waiting" | "listening" | "talking";

interface TutorCharacter3DProps {
  state?: CharacterState;
  micVolume?: number;
  className?: string;
}

// Each loaded model holds its own scene, mixer, and action
interface LoadedModel {
  scene: THREE.Group;
  mixer: THREE.AnimationMixer;
  action: THREE.AnimationAction | null;
}

export function TutorCharacter3D({
  state = "waiting",
  micVolume = 0,
  className = "",
}: TutorCharacter3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<CharacterState>(state);
  const volumeRef = useRef(micVolume);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Keep refs in sync every render
  stateRef.current = state;
  volumeRef.current = micVolume;

  const initScene = useCallback((container: HTMLDivElement) => {
    // ---- Scene ----
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.5, 3);
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ---- Lighting ----
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const d1 = new THREE.DirectionalLight(0xffffff, 1.2);
    d1.position.set(5, 5, 5);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xffffff, 0.4);
    d2.position.set(-3, 3, -3);
    scene.add(d2);
    const p1 = new THREE.PointLight(0xffffff, 0.5);
    p1.position.set(0, 3, 0);
    scene.add(p1);

    // ---- Internal state ----
    const clock = new THREE.Clock();
    let animFrameId = 0;
    let isDisposed = false;
    let currentKey = "";

    const models: Record<string, LoadedModel> = {};

    // Loading spinner
    const loadingMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xaf0100, wireframe: true })
    );
    scene.add(loadingMesh);

    // ---- Loader ----
    const loader = new GLTFLoader();
    let loadCount = 0;
    const totalLoads = Object.keys(MODEL_URLS).length;

    /** Show one model, hide the others */
    const switchTo = (key: string) => {
      if (key === currentKey) return;
      // Hide current
      if (currentKey && models[currentKey]) {
        models[currentKey].scene.visible = false;
        models[currentKey].action?.stop();
      }
      // Show next
      if (models[key]) {
        models[key].scene.visible = true;
        models[key].action?.reset().play();
        currentKey = key;
      }
    };

    const onAllLoaded = () => {
      if (isDisposed) return;
      scene.remove(loadingMesh);
      loadingMesh.geometry.dispose();
      (loadingMesh.material as THREE.Material).dispose();

      // Hide all first
      for (const k of Object.keys(models)) {
        models[k].scene.visible = false;
        models[k].action?.stop();
      }

      // Activate the current requested state
      const initKey = stateRef.current;
      if (models[initKey]) {
        switchTo(initKey);
      } else {
        // fallback
        const first = Object.keys(models)[0];
        if (first) switchTo(first);
      }
    };

    const loadModel = (key: string, url: string) => {
      loader.load(
        url,
        (gltf) => {
          if (isDisposed) return;

          const modelScene = gltf.scene;
          modelScene.position.set(0, -1, 0);
          modelScene.visible = false; // hidden until activated
          scene.add(modelScene);

          const mixer = new THREE.AnimationMixer(modelScene);
          let action: THREE.AnimationAction | null = null;

          if (gltf.animations.length > 0) {
            action = mixer.clipAction(gltf.animations[0]);
            action.loop = THREE.LoopRepeat;
          }

          models[key] = { scene: modelScene, mixer, action };

          loadCount++;
          if (loadCount >= totalLoads) onAllLoaded();
        },
        undefined,
        (error) => {
          console.error(`[3D] Failed to load ${key}:`, error);
          loadCount++;
          if (loadCount >= totalLoads) onAllLoaded();
        }
      );
    };

    // Kick off loading
    for (const [key, url] of Object.entries(MODEL_URLS)) {
      loadModel(key, url);
    }

    // ---- Render loop ----
    const animate = () => {
      if (isDisposed) return;
      animFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update all mixers (only the visible one really matters, but cheap)
      for (const m of Object.values(models)) {
        m.mixer.update(delta);
      }

      // Loading cube spin
      if (loadCount < totalLoads) {
        loadingMesh.rotation.y += 0.02;
        loadingMesh.rotation.x += 0.01;
      }

      // Switch model on state change
      const target = stateRef.current;
      if (target !== currentKey && models[target]) {
        switchTo(target);
      }

      // Subtle sway + volume pulse on the active model
      const activeModel = models[currentKey];
      if (activeModel) {
        activeModel.scene.rotation.y = Math.sin(elapsed * 0.5) * 0.03;

        const vol = volumeRef.current;
        const targetScale = vol > 0.05 ? 1 + vol * 0.02 : 1;
        const cur = activeModel.scene.scale.x;
        activeModel.scene.scale.setScalar(
          THREE.MathUtils.lerp(cur, targetScale, vol > 0.05 ? 0.1 : 0.05)
        );
      }

      renderer.render(scene, camera);
    };
    animate();

    // ---- Resize ----
    const onResize = () => {
      if (isDisposed || !container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // ---- Cleanup ----
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animFrameId);
      ro.disconnect();

      for (const m of Object.values(models)) {
        m.mixer.stopAllAction();
      }

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          mats.forEach((mat) => mat?.dispose());
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tid = setTimeout(() => {
      if (containerRef.current) {
        cleanupRef.current = initScene(containerRef.current);
      }
    }, 50);

    return () => {
      clearTimeout(tid);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [initScene]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ minHeight: "200px" }}
    />
  );
}