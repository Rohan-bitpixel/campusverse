import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

// IIIT-NR Academic Block Directory Data
const ROOM_DIRECTORY = [
  { id: 'g-audi', name: 'Main Auditorium', roomNo: 'Auditorium', floor: 'ground', coords: { x: -4, y: 1, z: 0 }, desc: 'Auditorium & Events Wing' },
  { id: 'g-admin', name: 'Administrative Office & Accounts', roomNo: '101', floor: 'ground', coords: { x: 3, y: 1, z: 2 }, desc: 'Admin block & Admissions' },
  { id: 'g-dir', name: 'Director & Registrar Office', roomNo: '105', floor: 'ground', coords: { x: 5, y: 1, z: -2 }, desc: 'Executive Offices' },
  { id: '1-lib', name: 'Central Library', roomNo: 'Library', floor: 'first', coords: { x: -3, y: 3.8, z: 1 }, desc: 'Double-Storey Digital Library' },
  { id: '1-bigdata', name: 'Big Data Computing Lab', roomNo: '216', floor: 'first', coords: { x: 4, y: 3.8, z: 2 }, desc: 'Hadoop, Spark & AI Systems' },
  { id: '1-ec1', name: 'Virtual E-Classroom 1', roomNo: '202', floor: 'first', coords: { x: -2, y: 3.8, z: -3 }, desc: '120-Seater Interactive Hall' },
  { id: '2-prog', name: 'Computer Programming Lab', roomNo: '301', floor: 'second', coords: { x: 4, y: 6.8, z: 2 }, desc: 'Stephen Hawking Lab (Java/DSA/AI)' },
  { id: '2-ias', name: 'Intelligent Autonomous Systems Lab', roomNo: '317', floor: 'second', coords: { x: -3, y: 6.8, z: -2 }, desc: 'Robotics, Drones & Vision Lab' },
  { id: '2-fac', name: 'Faculty Cabins & Research Wing', roomNo: '310-325', floor: 'second', coords: { x: 1, y: 6.8, z: -3 }, desc: 'DSAI / CSE / ECE Faculty' }
];

const Campus3DViewer = ({ onClose }) => {
  const mountRef = useRef(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [isInside, setIsInside] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePin, setActivePin] = useState(null);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const markersGroupRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0d14); // Onyx theme
    sceneRef.current = scene;

    // 2. Camera: Wide campus overview position
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 22, 30);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05;
    controlsRef.current = controls;

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x6366f1, 2.2); // Electrifying Indigo highlight
    keyLight.position.set(20, 30, 20);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillLight.position.set(-20, 15, -20);
    scene.add(fillLight);

    // Subtle Ground Grid
    const grid = new THREE.GridHelper(70, 50, 0x4f46e5, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Markers Container
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // 6. Load Academic Block GLB
    const loader = new GLTFLoader();
    loader.load(
      '/models/academic_block.glb',
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center); // Auto-center to (0,0,0)
        model.position.y += (box.max.y - box.min.y) / 2; // Sit firmly on ground

        scene.add(model);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Model loading error:', err);
        setLoading(false);
      }
    );

    // 7. Render Loop
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      controls.update();

      // Gentle pulsing effect for pin markers
      if (markersGroupRef.current) {
        markersGroupRef.current.children.forEach((mesh) => {
          mesh.rotation.y += 0.03;
        });
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  // Smooth Zoom: From Aerial Campus into the Main Entrance Gate
  const enterAcademicBlock = () => {
    setIsInside(true);
    setSelectedFloor('ground');
    filterMarkersByFloor('ground');

    // Fly through main gate
    gsap.to(cameraRef.current.position, {
      x: 0,
      y: 3.5,
      z: 14,
      duration: 2.2,
      ease: 'power3.inOut',
      onUpdate: () => controlsRef.current.update(),
    });

    gsap.to(controlsRef.current.target, {
      x: 0,
      y: 1.5,
      z: 0,
      duration: 2.2,
      ease: 'power3.inOut',
    });
  };

  // Reset back to Outside Campus Overview
  const resetToCampus = () => {
    setIsInside(false);
    setSelectedFloor(null);
    setActivePin(null);
    if (markersGroupRef.current) markersGroupRef.current.clear();

    gsap.to(cameraRef.current.position, {
      x: 30,
      y: 22,
      z: 30,
      duration: 1.8,
      ease: 'power3.out',
      onUpdate: () => controlsRef.current.update(),
    });

    gsap.to(controlsRef.current.target, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.8,
      ease: 'power3.out',
    });
  };

  // Change Floor Level
  const handleFloorSelect = (floor) => {
    setSelectedFloor(floor);
    setActivePin(null);
    filterMarkersByFloor(floor);

    const targetY = floor === 'ground' ? 1.5 : floor === 'first' ? 4.5 : 7.5;

    gsap.to(controlsRef.current.target, {
      y: targetY,
      duration: 1.2,
      ease: 'power2.out',
    });

    gsap.to(cameraRef.current.position, {
      y: targetY + 3.5,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => controlsRef.current.update(),
    });
  };

  // Draw 3D glowing markers for the selected floor's rooms
  const filterMarkersByFloor = (floor) => {
    if (!markersGroupRef.current) return;
    markersGroupRef.current.clear();

    const floorRooms = ROOM_DIRECTORY.filter((r) => r.floor === floor);

    floorRooms.forEach((room) => {
      const pinGeom = new THREE.ConeGeometry(0.35, 0.9, 4);
      pinGeom.rotateX(Math.PI); // Point downward
      const pinMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        emissive: 0x4f46e5,
        roughness: 0.2,
        metalness: 0.8
      });
      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.set(room.coords.x, room.coords.y + 0.6, room.coords.z);
      markersGroupRef.current.add(pinMesh);
    });
  };

  // Search Jump: Switch floor, pan camera directly to the room
  const handleRoomSelect = (room) => {
    setSearchQuery('');
    setActivePin(room);

    if (!isInside) setIsInside(true);
    setSelectedFloor(room.floor);
    filterMarkersByFloor(room.floor);

    gsap.to(controlsRef.current.target, {
      x: room.coords.x,
      y: room.coords.y,
      z: room.coords.z,
      duration: 1.4,
      ease: 'power2.inOut',
    });

    gsap.to(cameraRef.current.position, {
      x: room.coords.x + 4,
      y: room.coords.y + 3,
      z: room.coords.z + 5,
      duration: 1.4,
      ease: 'power2.inOut',
      onUpdate: () => controlsRef.current.update(),
    });
  };

  const filteredSearchResults = searchQuery.trim() === ''
    ? []
    : ROOM_DIRECTORY.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.roomNo.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div style={{ position: 'relative', width: '100%', height: '88vh', background: '#08090f', borderRadius: '16px', overflow: 'hidden', border: '1px solid #312e81' }}>
      {/* 3D Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Loading Overlay */}
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8, 9, 15, 0.9)', backdropFilter: 'blur(8px)', zIndex: 30, color: '#a5b4fc' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading IIIT-NR Academic Block 3D...</p>
        </div>
      )}

      {/* Top Bar: Close / Campus Overview + Search Bar */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: '#1e1b4b', color: '#e0e7ff', border: '1px solid #4338ca', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, backdropFilter: 'blur(10px)' }}
            >
              ✕ Exit Map
            </button>
          )}
          {isInside && (
            <button
              onClick={resetToCampus}
              style={{ background: 'rgba(30, 27, 75, 0.85)', color: '#a5b4fc', border: '1px solid #4f46e5', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, backdropFilter: 'blur(10px)' }}
            >
              ↶ Campus Overview
            </button>
          )}
        </div>

        {/* Room Search Bar */}
        <div style={{ position: 'relative', width: '320px', pointerEvents: 'auto' }}>
          <input
            type="text"
            placeholder="Search room (e.g. 301, Big Data, Library)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #4f46e5',
              background: 'rgba(15, 23, 42, 0.9)',
              color: '#fff',
              outline: 'none',
              backdropFilter: 'blur(12px)',
              fontSize: '0.9rem'
            }}
          />
          {filteredSearchResults.length > 0 && (
            <div style={{ position: 'absolute', top: '50px', left: 0, width: '100%', background: 'rgba(15, 23, 42, 0.98)', border: '1px solid #4338ca', borderRadius: '12px', overflow: 'hidden', zIndex: 30, boxShadow: '0 10px 25px rgba(0,0,0,0.6)' }}>
              {filteredSearchResults.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleRoomSelect(room)}
                  style={{ padding: '10px 14px', borderBottom: '1px solid #1e293b', cursor: 'pointer', color: '#e2e8f0', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#312e81')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{room.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#818cf8' }}>Room {room.roomNo} • {room.floor.toUpperCase()} FLOOR</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sideway Building Selector (Visible outside) */}
      {!isInside && (
        <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 20 }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #4f46e5', borderRadius: '16px', padding: '18px', width: '220px', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '0.8rem', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Select Building</div>
            <h3 style={{ margin: '0 0 12px 0', color: '#f8fafc', fontSize: '1.15rem' }}>Academic Block</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.4 }}>IIIT-NR Main Academic Wing: Lecture Halls, Laboratories & Admin.</p>
            <button
              onClick={enterAcademicBlock}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Enter Main Gate ➜
            </button>
          </div>
        </div>
      )}

      {/* Floor Selector HUD (Visible once inside) */}
      {isInside && (
        <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 20 }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.92)', border: '1px solid #4338ca', borderRadius: '14px', padding: '14px', backdropFilter: 'blur(14px)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', letterSpacing: '1px' }}>Floors</span>
            {[
              { id: 'second', label: '2nd Floor' },
              { id: 'first', label: '1st Floor' },
              { id: 'ground', label: 'Ground Floor' }
            ].map((f) => {
              const active = selectedFloor === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleFloorSelect(f.id)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '8px',
                    border: active ? '2px solid #818cf8' : '1px solid #334155',
                    background: active ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'rgba(30, 41, 59, 0.6)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Pin Details Card */}
      {activePin && (
        <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #6366f1', borderRadius: '14px', padding: '16px 24px', minWidth: '320px', backdropFilter: 'blur(16px)', zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{activePin.name}</div>
            <div style={{ fontSize: '0.82rem', color: '#a5b4fc', marginTop: '2px' }}>Room {activePin.roomNo} • {activePin.floor.toUpperCase()} LEVEL</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{activePin.desc}</div>
          </div>
          <button
            onClick={() => setActivePin(null)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer', marginLeft: '16px' }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default Campus3DViewer;