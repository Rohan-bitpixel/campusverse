import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ArrowLeft, X, Layers } from 'lucide-react';

const ROOM_DATABASE = {
  'g-audi': {
    title: 'Main Central Auditorium',
    code: 'AUDI-01',
    floor: 'Ground Floor',
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80'
    ],
    desc: 'Equipped with 600+ seating capacity, line-array acoustics, and stage automation for convocations, hackathons, and fests.'
  },
  'g-admin': {
    title: 'Academic & Administration Office',
    code: '101',
    floor: 'Ground Floor',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'
    ],
    desc: 'Primary registry for student enrollment verifications, scholarship documents, fee records, and institutional permissions.'
  },
  'g-dir': {
    title: 'Director & Registrar Secretariat',
    code: '105',
    floor: 'Ground Floor',
    images: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80'
    ],
    desc: 'Offices of the Institute Director and Registrar for institute governance and administrative leadership.'
  },
  '1-lib': {
    title: 'Dr. SPM Central Digital Library',
    code: 'LIB-201',
    floor: '1st Floor',
    images: [
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80',
      'https://images.unsplash.com/photo-1507842229450-782124e12e58?w=800&q=80'
    ],
    desc: 'High-speed internet workstations, subscriptions to IEEE/ACM digital libraries, and quiet study reading zones.'
  },
  '1-bigdata': {
    title: 'Big Data & AI Systems Lab',
    code: '216',
    floor: '1st Floor',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80'
    ],
    desc: 'High-performance computing cluster setup for large model fine-tuning, distributed systems, and DSA research.'
  },
  '2-prog': {
    title: 'Stephen Hawking Programming Lab',
    code: '301',
    floor: '2nd Floor',
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80'
    ],
    desc: '120 modern Linux/Windows dual-boot systems optimized for Data Structures, Algorithms in Java, and Web Architecture.'
  }
};

export default function CampusMapPage() {
  const navigate = useNavigate();
  const mountRef = useRef(null);

  const [activeFloorSvg, setActiveFloorSvg] = useState(null);
  const [inspectedRoom, setInspectedRoom] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [loadingModel, setLoadingModel] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c14);

    // Front-facing elevation camera preset
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    camera.position.set(0, 7.5, 42);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 4.5, 0);
    controls.maxPolarAngle = Math.PI / 2.02;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(15, 30, 25);
    sun.castShadow = true;
    scene.add(sun);

    const fillSky = new THREE.DirectionalLight(0x818cf8, 0.7);
    fillSky.position.set(-20, 20, -10);
    scene.add(fillSky);

    // Campus Lawn Greenery
    const grassGeo = new THREE.PlaneGeometry(160, 160);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x143521,
      roughness: 0.9,
      metalness: 0.1
    });
    const grassPlane = new THREE.Mesh(grassGeo, grassMat);
    grassPlane.rotation.x = -Math.PI / 2;
    grassPlane.position.y = -0.05;
    scene.add(grassPlane);

    // Forecourt Walkway
    const forecourtGeo = new THREE.PlaneGeometry(42, 28);
    const forecourtMat = new THREE.MeshStandardMaterial({
      color: 0x242a38,
      roughness: 0.8
    });
    const forecourt = new THREE.Mesh(forecourtGeo, forecourtMat);
    forecourt.rotation.x = -Math.PI / 2;
    forecourt.position.set(0, 0, 10);
    scene.add(forecourt);

    // Green Hedge Borders
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x1e5128, roughness: 0.8 });
    const leftHedge = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 24), hedgeMat);
    leftHedge.position.set(-18, 0.5, 10);
    scene.add(leftHedge);

    const rightHedge = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 24), hedgeMat);
    rightHedge.position.set(18, 0.5, 10);
    scene.add(rightHedge);

    // Load Academic Block GLB
    const loader = new GLTFLoader();
    loader.load(
      '/models/academic_block.glb',
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.y += (box.max.y - box.min.y) / 2;

        scene.add(model);
        setLoadingModel(false);
      },
      undefined,
      (err) => {
        console.error('Model load failed:', err);
        setLoadingModel(false);
      }
    );

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#0a0c14', overflow: 'hidden', color: '#fff' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Exit Button */}
      <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 10 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 12,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid #4338ca',
            color: '#e2e8f0',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={18} /> Exit to Campus
        </button>
      </div>

      {/* Side Panel: Floor Blueprints */}
      <div style={{ position: 'absolute', top: 80, left: 24, zIndex: 10, width: 280 }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.92)',
          border: '1px solid #4f46e5',
          borderRadius: 16,
          padding: 20,
          backdropFilter: 'blur(14px)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Academic Facility
          </span>
          <h2 style={{ fontSize: '1.35rem', margin: '6px 0 16px 0', color: '#fff' }}>Academic Block</h2>

          <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4, margin: '0 0 18px 0' }}>
            Click any floor below to open its layout and inspect rooms.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { id: 'ground', label: 'Ground Floor Plan' },
              { id: 'first', label: '1st Floor Plan' },
              { id: 'second', label: '2nd Floor Plan' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFloorSvg(f.id);
                  setInspectedRoom(null);
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: activeFloorSvg === f.id ? '2px solid #6366f1' : '1px solid #334155',
                  background: activeFloorSvg === f.id ? 'rgba(99, 102, 241, 0.3)' : 'rgba(30, 41, 59, 0.7)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{f.label}</span>
                <Layers size={16} color={activeFloorSvg === f.id ? '#818cf8' : '#64748b'} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Floorplan Overlay */}
      {activeFloorSvg && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 14, 0.88)',
          backdropFilter: 'blur(16px)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 30
        }}>
          <div style={{ width: '100%', maxWidth: 1100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', textTransform: 'capitalize' }}>
                {activeFloorSvg} Floor Blueprint
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Click on any marked room to view photos and details
              </span>
            </div>
            <button
              onClick={() => {
                setActiveFloorSvg(null);
                setInspectedRoom(null);
              }}
              style={{
                background: '#1e293b',
                border: '1px solid #475569',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <X size={18} /> Close Floorplan
            </button>
          </div>

          <div style={{
            width: '100%',
            maxWidth: 1100,
            height: '65vh',
            background: '#0d111d',
            border: '2px solid #312e81',
            borderRadius: 16,
            padding: 20,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg viewBox="0 0 950 500" style={{ width: '100%', height: '100%' }}>
              <rect x="50" y="50" width="850" height="400" rx="12" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
              <rect x="100" y="220" width="750" height="60" fill="#172033" />
              <text x="475" y="255" fill="#475569" fontSize="13" textAnchor="middle" letterSpacing="3">MAIN CIRCULATION CORRIDOR</text>

              {activeFloorSvg === 'ground' && (
                <>
                  <g onClick={() => { setInspectedRoom(ROOM_DATABASE['g-audi']); setActiveImageIdx(0); }} style={{ cursor: 'pointer' }}>
                    <rect x="80" y="70" width="260" height="130" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
                    <text x="210" y="130" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">Main Auditorium</text>
                    <text x="210" y="155" fill="#818cf8" fontSize="12" textAnchor="middle">Click to Inspect ➜</text>
                  </g>
                  <g onClick={() => { setInspectedRoom(ROOM_DATABASE['g-admin']); setActiveImageIdx(0); }} style={{ cursor: 'pointer' }}>
                    <rect x="360" y="70" width="220" height="130" rx="8" fill="#1e293b" stroke="#4f46e5" strokeWidth="2" />
                    <text x="470" y="125" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">Admin Office (101)</text>
                    <text x="470" y="150" fill="#94a3b8" fontSize="12" textAnchor="middle">Click to Inspect ➜</text>
                  </g>
                  <g onClick={() => { setInspectedRoom(ROOM_DATABASE['g-dir']); setActiveImageIdx(0); }} style={{ cursor: 'pointer' }}>
                    <rect x="600" y="70" width="270" height="130" rx="8" fill="#1e293b" stroke="#4f46e5" strokeWidth="2" />
                    <text x="735" y="125" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">Director Office (105)</text>
                    <text x="735" y="150" fill="#94a3b8" fontSize="12" textAnchor="middle">Click to Inspect ➜</text>
                  </g>
                </>
              )}

              {activeFloorSvg === 'first' && (
                <>
                  <g onClick={() => { setInspectedRoom(ROOM_DATABASE['1-lib']); setActiveImageIdx(0); }} style={{ cursor: 'pointer' }}>
                    <rect x="80" y="70" width="380" height="130" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
                    <text x="270" y="130" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">Central Digital Library (201)</text>
                    <text x="270" y="155" fill="#818cf8" fontSize="12" textAnchor="middle">Click to Inspect ➜</text>
                  </g>
                  <g onClick={() => { setInspectedRoom(ROOM_DATABASE['1-bigdata']); setActiveImageIdx(0); }} style={{ cursor: 'pointer' }}>
                    <rect x="490" y="70" width="380" height="130" rx="8" fill="#1e293b" stroke="#4f46e5" strokeWidth="2" />
                    <text x="680" y="130" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">Big Data & AI Lab (216)</text>
                    <text x="680" y="155" fill="#94a3b8" fontSize="12" textAnchor="middle">Click to Inspect ➜</text>
                  </g>
                </>
              )}

              {activeFloorSvg === 'second' && (
                <>
                  <g onClick={() => { setInspectedRoom(ROOM_DATABASE['2-prog']); setActiveImageIdx(0); }} style={{ cursor: 'pointer' }}>
                    <rect x="180" y="70" width="580" height="130" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
                    <text x="470" y="130" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">Stephen Hawking Lab (301)</text>
                    <text x="470" y="155" fill="#818cf8" fontSize="12" textAnchor="middle">Click to Inspect ➜</text>
                  </g>
                </>
              )}
            </svg>
          </div>
        </div>
      )}

      {/* Room Details Modal */}
      {inspectedRoom && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 620,
          background: 'rgba(15, 23, 42, 0.98)',
          border: '2px solid #6366f1',
          borderRadius: 18,
          overflow: 'hidden',
          zIndex: 60,
          boxShadow: '0 24px 60px rgba(0,0,0,0.8)'
        }}>
          <div style={{ position: 'relative', width: '100%', height: 260, background: '#020617' }}>
            <img
              src={inspectedRoom.images[activeImageIdx]}
              alt={inspectedRoom.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {inspectedRoom.images.length > 1 && (
              <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 6 }}>
                {inspectedRoom.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: activeImageIdx === i ? '#6366f1' : '#64748b',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            )}
            <button
              onClick={() => setInspectedRoom(null)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(0,0,0,0.65)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: 22 }}>
            <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 700 }}>
              ROOM {inspectedRoom.code} • {inspectedRoom.floor.toUpperCase()}
            </span>
            <h3 style={{ margin: '4px 0 10px 0', fontSize: '1.3rem', color: '#fff' }}>
              {inspectedRoom.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              {inspectedRoom.desc}
            </p>
            <button
              onClick={() => setInspectedRoom(null)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                background: '#4f46e5',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Done Viewing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}