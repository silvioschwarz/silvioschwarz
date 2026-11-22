import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { computeDistances } from "../../utils/faultDistance.js";

const nedToVec3 = ([n, e, d]) => new THREE.Vector3(e, -d, -n);

export default function EQDistRoute() {
  const containerRef = useRef(null);
  const objsRef = useRef(null);

  const [params, setParams] = useState({
    strikeDeg: 35,
    dipDeg: 45,
    lengthKm: 32,
    widthKm: 18,
    zTorKm: 4,
    stEast: 22,
    stNorth: -12,
  });

  const metrics = computeDistances(params);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(48, 38, 56);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const dirLight = new THREE.DirectionalLight(0xbae6fd, 1.8);
    dirLight.position.set(30, 60, 40);
    scene.add(dirLight);

    // Erdoberfläche & Nord-Pfeil
    scene.add(new THREE.GridHelper(120, 24, 0x334155, 0x1e293b));
    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })
    );
    scene.add(surface);
    scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(-52, 0.2, 52), 12, 0x38bdf8, 3, 2));

    // Bruchfläche & JB-Projektion
    const faultGeo = new THREE.BufferGeometry();
    const faultMesh = new THREE.Mesh(
      faultGeo,
      new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0x7c2d12, emissiveIntensity: 0.4, transparent: true, opacity: 0.72, side: THREE.DoubleSide })
    );
    const faultBorder = new THREE.LineLoop(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xfdba74 }));
    const jbLoop = new THREE.LineLoop(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xfacc15 }));
    scene.add(faultMesh, faultBorder, jbLoop);

    // Marker & Linien
    const stationMesh = new THREE.Mesh(new THREE.ConeGeometry(1.4, 3.2, 4), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 }));
    const hypMesh = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
    const epiMesh = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.4, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide }));
    const closestMesh = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfb923c }));
    scene.add(stationMesh, hypMesh, epiMesh, closestMesh);

    const makeLine = (color) => {
      const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color }));
      scene.add(line);
      return line;
    };

    objsRef.current = {
      faultGeo, faultBorder, jbLoop, stationMesh, hypMesh, epiMesh, closestMesh,
      lineRup: makeLine(0xf97316),
      lineJB: makeLine(0x38bdf8),
      lineHyp: makeLine(0xf43f5e),
      lineEpi: makeLine(0x34d399),
      lineDepth: makeLine(0x64748b),
    };

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const o = objsRef.current;
    if (!o) return;
    const { S, cRup, cJB, hyp, epi, corners } = computeDistances(params);
        const [p0, p1, p2, p3] = corners.map(nedToVec3);

    const verts = new Float32Array([
      p0.x, p0.y, p0.z,
      p1.x, p1.y, p1.z,
      p2.x, p2.y, p2.z,
      p0.x, p0.y, p0.z,
      p2.x, p2.y, p2.z,
      p3.x, p3.y, p3.z,
    ]);
    o.faultGeo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
    o.faultGeo.computeVertexNormals();
    o.faultBorder.geometry.setFromPoints([p0, p1, p2, p3]);
    o.jbLoop.geometry.setFromPoints(
      [p0, p1, p2, p3].map((v) => new THREE.Vector3(v.x, 0.05, v.z))
    );

    const vS = nedToVec3(S), vRup = nedToVec3(cRup), vJB = nedToVec3(cJB), vHyp = nedToVec3(hyp), vEpi = nedToVec3(epi);
    o.stationMesh.position.set(vS.x, 1.6, vS.z);
    o.hypMesh.position.copy(vHyp);
    o.epiMesh.position.set(vEpi.x, 0.08, vEpi.z);
    o.closestMesh.position.copy(vRup);

    o.lineRup.geometry.setFromPoints([vS.clone().setY(0.2), vRup]);
    o.lineJB.geometry.setFromPoints([vS.clone().setY(0.15), vJB.clone().setY(0.15)]);
    o.lineHyp.geometry.setFromPoints([vS.clone().setY(0.2), vHyp]);
    o.lineEpi.geometry.setFromPoints([vS.clone().setY(0.1), vEpi.clone().setY(0.1)]);
    o.lineDepth.geometry.setFromPoints([vHyp, vEpi]);
  }, [params]);

  const setVal = (key) => (e) => setParams((p) => ({ ...p, [key]: Number(e.target.value) }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-slate-100">EqDist — 3D Fault Distance Explorer</h1>
        <p className="mt-1 text-sm text-slate-400">Vergleich von R<sub>rup</sub>, R<sub>JB</sub>, R<sub>hyp</sub> und R<sub>epi</sub> an einer geneigten Bruchfläche.</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["R_rup (Bruchfläche)", metrics.rRup, "border-orange-500/30 text-orange-400"],
          ["R_JB (Joyner-Boore)", metrics.rJB, "border-sky-500/30 text-sky-400"],
          ["R_hyp (Hypozentrum)", metrics.rHyp, "border-rose-500/30 text-rose-400"],
          ["R_epi (Epizentrum)", metrics.rEpi, "border-emerald-500/30 text-emerald-400"],
        ].map(([label, val, cls]) => (
          <div key={label} className={`rounded-xl border bg-[#111827] p-3.5 ${cls.split(" ")}`}>
            <div className={`text-xs font-medium ${cls.split(" ")}`}>{label}</div>
            <div className="mt-1 text-2xl font-bold text-slate-100">{val.toFixed(2)} km</div>
          </div>
        ))}
      </div>

      <div className="relative mb-4 h-[500px] w-full overflow-hidden rounded-xl border border-slate-800 bg-[#090d16]">
        <div className="pointer-events-none absolute left-4 top-3 z-10 space-y-1 text-xs text-slate-300">
          <div><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-sky-400" />Messstation</div>
          <div><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />Bruchfläche (Fault Plane)</div>
          <div><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-yellow-400" />JB-Bodenprojektion</div>
          <div><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />Hypozentrum / <span className="text-emerald-400">Epizentrum</span></div>
        </div>
        <div ref={containerRef} className="h-full w-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-[#111827] p-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Strike (Streichen)", "strikeDeg", 0, 360, 1, "°"],
          ["Dip (Einfallen)", "dipDeg", 5, 90, 1, "°"],
          ["Länge L", "lengthKm", 5, 70, 1, " km"],
          ["Breite W", "widthKm", 5, 40, 1, " km"],
          ["Tiefe Z_TOR", "zTorKm", 0, 25, 0.5, " km"],
          ["Station East", "stEast", -50, 50, 1, " km"],
          ["Station North", "stNorth", -50, 50, 1, " km"],
        ].map(([label, key, min, max, step, unit]) => (
          <label key={key} className="block text-xs text-slate-300">
            <div className="mb-1 flex justify-between">
              <span>{label}</span>
              <strong className="text-sky-400">{params[key]}{unit}</strong>
            </div>
            <input type="range" min={min} max={max} step={step} value={params[key]} onChange={setVal(key)} className="w-full accent-sky-500" />
          </label>
        ))}
      </div>
    </div>
  );
}
