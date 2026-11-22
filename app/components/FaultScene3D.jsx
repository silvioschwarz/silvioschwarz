import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const nedToVec3 = ([n, e, d]) => new THREE.Vector3(e, -d, -n);

export default function FaultScene3D({ metrics }) {
  const containerRef = useRef(null);
  const objsRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(45, 36, 52);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const dirLight = new THREE.DirectionalLight(0xbae6fd, 1.8);
    dirLight.position.set(30, 60, 40);
    scene.add(dirLight);

    scene.add(new THREE.GridHelper(120, 24, 0x475569, 0x1e293b));
    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })
    );
    scene.add(surface);
    scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(-50, 0.2, 50), 12, 0x38bdf8, 3, 2));

    const faultGeo = new THREE.BufferGeometry();
    const faultMesh = new THREE.Mesh(
      faultGeo,
      new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0x7c2d12, emissiveIntensity: 0.45, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
    );
    const faultBorder = new THREE.LineLoop(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xfdba74 }));
    const jbLoop = new THREE.LineLoop(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xfacc15 }));
    scene.add(faultMesh, faultBorder, jbLoop);

    const stationMesh = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3.4, 4), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 }));
    const hypMesh = new THREE.Mesh(new THREE.SphereGeometry(1.15, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
    const epiMesh = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.5, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide }));
    const closestMesh = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfb923c }));
    scene.add(stationMesh, hypMesh, epiMesh, closestMesh);

    const makeLine = (color) => {
      const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color }));
      scene.add(line);
      return line;
    };

    const makeDashedLines = (color) =>
      Array.from({ length: 4 }, () => {
        const line = new THREE.Line(
          new THREE.BufferGeometry(),
          new THREE.LineDashedMaterial({ color, dashSize: 1.5, gapSize: 1.2, transparent: true, opacity: 0.65 })
        );
        scene.add(line);
        return line;
      });

    objsRef.current = {
      faultGeo, faultBorder, jbLoop, stationMesh, hypMesh, epiMesh, closestMesh,
      lineRup: makeLine(0xf97316),
      lineJB: makeLine(0x38bdf8),
      lineHyp: makeLine(0xf43f5e),
      lineEpi: makeLine(0x34d399),
      lineDepth: makeLine(0x94a3b8),
      cornerLines3D: makeDashedLines(0xa855f7),
      cornerLines2D: makeDashedLines(0xeab308),
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
    const { S, cRup, cJB, hyp, epi, corners } = metrics;
    const [p0, p1, p2, p3] = corners.map(nedToVec3);

    const verts = new Float32Array([
      p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z,
      p0.x, p0.y, p0.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z,
    ]);
    o.faultGeo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
    o.faultGeo.computeVertexNormals();
    o.faultBorder.geometry.setFromPoints([p0, p1, p2, p3]);
    o.jbLoop.geometry.setFromPoints([p0, p1, p2, p3].map((v) => new THREE.Vector3(v.x, 0.06, v.z)));

    const vS = nedToVec3(S), vRup = nedToVec3(cRup), vJB = nedToVec3(cJB), vHyp = nedToVec3(hyp), vEpi = nedToVec3(epi);
    o.stationMesh.position.set(vS.x, 1.7, vS.z);
    o.hypMesh.position.copy(vHyp);
    o.epiMesh.position.set(vEpi.x, 0.08, vEpi.z);
    o.closestMesh.position.copy(vRup);

    o.lineRup.geometry.setFromPoints([vS.clone().setY(0.2), vRup]);
    o.lineJB.geometry.setFromPoints([vS.clone().setY(0.15), vJB.clone().setY(0.15)]);
    o.lineHyp.geometry.setFromPoints([vS.clone().setY(0.2), vHyp]);
    o.lineEpi.geometry.setFromPoints([vS.clone().setY(0.1), vEpi.clone().setY(0.1)]);
    o.lineDepth.geometry.setFromPoints([vHyp, vEpi]);

    [p0, p1, p2, p3].forEach((pt, idx) => {
      const l3d = o.cornerLines3D.at(idx);
      if (l3d) {
        l3d.geometry.setFromPoints([vS.clone().setY(0.2), pt]);
        l3d.computeLineDistances();
      }
      const l2d = o.cornerLines2D.at(idx);
      if (l2d) {
        l2d.geometry.setFromPoints([vS.clone().setY(0.12), new THREE.Vector3(pt.x, 0.12, pt.z)]);
        l2d.computeLineDistances();
      }
    });
  }, [metrics]);

  return (
    <div className="relative mb-5 h-[620px] w-full overflow-hidden rounded-xl border border-slate-800 bg-[#0b1120] shadow-xl">
      <div className="pointer-events-none absolute left-4 top-4 z-10 space-y-1.5 rounded-lg border border-slate-700 bg-slate-950/90 px-3.5 py-2.5 text-xs font-medium text-white shadow">
        <div><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-sky-400" />Messstation (Oberfläche)</div>
        <div><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />Bruchfläche (Fault Plane)</div>
        <div><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-yellow-400" />JB-Bodenprojektion</div>
        <div><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />Hypozentrum / <span className="text-emerald-400">Epizentrum</span></div>
        <div><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-purple-400" />Eck-Linien (3D violett / 2D gelb)</div>
      </div>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
