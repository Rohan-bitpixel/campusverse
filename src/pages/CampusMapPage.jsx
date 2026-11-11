import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import './CampusMap.css';

// Academic Block details
const ACADEMIC_DATA = {
  description: "The Academic Block serves as the central hub of a college campus, purposefully designed to foster learning, collaboration, and intellectual growth. It integrates modern classrooms, lecture halls, and specialized departmental laboratories equipped with contemporary teaching technologies.",
  directions: "1. Enter through the main gate and continue straight ahead for a short distance.\n2. On your left, you will see the signboard for the Academic Block.\n3. Just beside that board, take the arched pathway.\n4. After walking through the arch, the entrance to the Academic Building will be on your left.",
  images: [
    "/assets/building/academic-1.jpg",
    "/assets/building/academic-2.jpg",
    "/assets/building/academic-3.jpeg"
  ]
};

// Floor Plan asset mapping (uses final_first.svg and jpg blueprints)
const FLOOR_INFO = {
  ground: {
    title: "Ground Floor",
    image: "/assets/final_ground.svg"
  },
  first: {
    title: "First Floor",
    image: "/assets/final_first.svg"
  },
  second: {
    title: "Second Floor",
    image: "/assets/final_second.svg"
  }
};

const FLOOR_HOTSPOTS = {
  ground: [
    ["Networking Lab (132)", 24, 12, 9, 4],
    ["Computer Centre Lab (131 A)", 44, 12, 12, 4],
    ["Cyber Security Lab (132)", 62, 12, 10, 4],
    ["Unknown (126)", 28, 23, 5, 3],
    ["Assistant Librarian (131 B)", 39, 22, 5, 4],
    ["Sr. Network Engineer (131-C)", 42, 23, 5, 4],
    ["Server Room", 46, 23, 4, 3],
    ["Network Engineer (131-E)", 50, 24, 5, 4],
    ["Unknown (134)", 60, 23, 5, 3],
    ["Lecture Hall (122)", 31, 34, 9, 5],
    ["Faculty Room (125)", 43, 34, 6, 5],
    ["Lecture Hall (135)", 57, 36, 9, 5],
    ["Tutorial Room (124)", 22, 44, 6, 4],
    ["Tutorial Room (123)", 22, 51, 6, 4],
    ["3-D Institute Model", 44, 50, 8, 3],
    ["Anechoic Chamber (136)", 64, 45, 7, 4],
    ["Student Activity Centre (137)", 64, 52, 7, 4],
    ["Lecture Hall (121)", 31, 58, 8, 5],
    ["Lecture Hall (138)", 57, 58, 8, 5],
    ["Seminar-II (119)", 31, 74, 8, 4],
    ["Pantry (118)", 24, 74, 5, 3],
    ["Board Room (115)", 20, 83, 7, 4],
    ["Office (114)", 25, 85, 6, 4],
    ["Faculty Cabin (113)", 32, 87, 7, 4],
    ["Entrance Lobby", 44, 79, 10, 5],
    ["Registrar (106)", 58, 83, 5, 4],
    ["Director", 66, 83, 5, 4],
    ["Dean Academics (107)", 58, 74, 5, 4],
    ["Reception", 37, 76, 5, 3 ],
    ["JAO(SS)(108)", 58, 77, 4, 3],
    ["Toilet(M)Students.G", 11, 19, 9, 4 ],
    ["Toilet(F)Students.G", 21, 19, 9, 4],
    ["Lift Lobby (139)", 45, 61, 6, 4]
  ],
  first: [
    ["Big Data Lab (216)", 25, 12, 7, 4],
    ["AIDL (215)", 25, 19, 6, 4],
    ["Project Lab (214)", 27, 26, 6, 4],
    ["Library (218)", 42, 18, 12, 5],
    ["Wireless Communication Lab (220)", 58, 12, 10, 4],
    ["AI Experimental Lab (221)", 58, 19, 8, 4],
    ["PCB Design (219)", 49, 25, 7, 5],
    ["Speech Processing Lab (228)", 57, 25, 6, 4],
    ["Lecture Hall (209)", 29, 38, 8, 5],
    ["Faculty Room (227)", 43, 34, 6, 4],
    ["Lecture Hall (222)", 52, 38, 8, 5],
    ["Tutorial (208)", 22, 47, 5, 4],
    ["Tutorial (207)", 22, 55, 5, 4],
    ["Central Atrium", 42, 48, 9, 5],
    ["Tutorial (223)", 62, 46, 5, 4],
    ["Tutorial (224)", 62, 55, 5, 4],
    ["Lecture Hall (206)", 29, 58, 8, 5],
    ["Lecture Hall (225)", 52, 58, 8, 5],
    ["Faculty Cabin Entrance (205)", 31, 76, 9, 5],
    ["Confidential (203)", 51, 76, 6, 4],
    ["Examination Cell", 56, 67, 5, 3],
    ["Office (202)", 58, 83, 8, 5],
    ["Entrance Lobby", 41, 82, 10, 5],
    ["LIFT LOBBY (226)", 42, 61, 10, 6],
    ["Office all inclusive", 50, 66, 5, 4 ]
  ],
  second: [
    ["I.S.B.N. Lab (314)", 27, 14, 8, 4],
    ["AICTE IDEA Lab (316)", 44, 14, 11, 4],
    ["Robotics Lab (317)", 60, 14, 8, 4],
    ["Boys Common Room (313)", 28, 24, 7, 4],
    ["Unknown (318)", 60, 24, 6, 4],
    ["Class Room (308)", 30, 35, 8, 4],
    ["Faculty (325)", 45, 34, 6, 4],
    ["Class Room (319)", 55, 35, 8, 4],
    ["Class Room (307)", 30, 43, 8, 4],
    ["Class Room (320)", 55, 43, 8, 4],
    ["Tutorial (306)", 23, 48, 6, 4],
    ["Tutorial (305)", 23, 56, 6, 4],
    ["Central Atrium", 43, 49, 9, 5],
    ["R&D Space (321)", 66, 48, 6, 4],
    ["Unknown (322)", 66, 56, 6, 4],
    ["Lecture Hall (304)", 31, 63, 8, 5],
    ["Lecture Hall (323)", 56, 63, 8, 5],
    ["VLSI and Embedded Lab (303)", 30, 82, 10, 5],
    ["Electronic Circuit Lab (302)", 44, 82, 10, 5],
    ["Computer Programming Lab (301)", 56, 82, 10, 5],
    ["Meeting Room-1 (204)", 45, 76, 8, 4],
    ["Confidential (203)", 63, 78, 7, 4],
    ["Office (202)", 68, 88, 6, 4]
  ]
};

const ROOM_DATA = {
  "Networking Lab (132)": {
    description: "The Networking Lab is an interactive, hands-on space where students discover how the modern internet works and how global data connects.",
    directions: "1. Go straight, past the entrance lobby maintaining left side of corridor.\n2. At the end you will find room 131, facing it turn left then after few steps turn right.\n3. After few steps, on the left you will get networking lab.",
    images: ["/assets/Ground/networking-1.jpg", "/assets/Ground/networking-2.png", "/assets/Ground/networking-3.png"]
  },
  "Computer Centre Lab (131 A)": {
    description: "The Computer Centre Lab is an open-access resource center designed to support academic research and daily computing needs across all disciplines.",
    directions: "1. Go straight, past the entrance lobby maintaining left side of corridor.\n2. At the end you will find room 131, inside which is computer centre lab 131-A.",
    images: ["/assets/Ground/cc-1.png", "/assets/Ground/cc-2.jpg", "/assets/Ground/cc-3.jpg"]
  },
  "Cyber Security Lab (132)": {
    description: "The Cyber Security Lab is a specialized environment where students learn to defend digital infrastructure against real-world cyber threats.",
    directions: "1. Go straight past the entrance lobby maintaining right side of corridor.\n2. At the end, find room 135 on right.\n3. Turn right and take first left; on right is the lab.",
    images: ["/assets/Ground/cs-1.png", "/assets/Ground/cs-2.jpg"]
  },
  "Toilet(M)Students.G": {
    description: "Student Hygiene and Washroom Area (Male)",
    directions: "1. Past the entrance lobby, follow left corridor past room 131 through double doors.\n2. At almost the end of corridor, on right is the washroom.",
    images: ["/assets/Ground/Male-wc.jpg"]
  },
  "Toilet(F)Students.G": {
    description: "Student Hygiene and Washroom Area (Female)",
    directions: "1. Past entrance lobby, left corridor past 131 through two double doors.\n2. After crossing second double door, immediate right is the washroom.",
    images: ["/assets/Ground/Female-wc.jpg"]
  },
  "Lecture Hall (122)": {
    description: "ECE class for 1st year students for session 2026-27.",
    directions: "1. Go straight, past the entrance lobby maintaining left corridor.\n2. At the very end, room 122 is on your left.",
    images: ["/assets/Ground/LH-122-1.jpg"]
  },
  "Lecture Hall (135)": {
    description: "DSAI class for 1st year students for session 2026-27.",
    directions: "1. Past entrance lobby, maintain right corridor.\n2. At the end, find room 135 on your right.",
    images: ["/assets/Ground/LH-135-1.png", "/assets/Ground/LH-135-2.png", "/assets/Ground/LH-135-3.png"]
  },
  "Entrance Lobby": {
    description: "The Entrance Lobby serves as the welcoming gateway and central hub of the institute.",
    directions: "Enter directly from the main gate of Academic Block.",
    images: ["/assets/Ground/enterance looby-1.jpg", "/assets/Ground/Enterance looby-hd.jpg", "/assets/Ground/enterance-3.jpg"]
  },
  "Big Data Lab (216)": {
    description: "Equipped with high-performance computing infrastructure and advanced analytics software for processing massive, complex datasets.",
    directions: "1. Go straight from staircase until end of corridor.\n2. Turn left, then take right before double door.\n3. Lab is at the end on left.",
    images: ["/assets/First/big-data-216-1.jpg"]
  },
  "AIDL (215)": {
    description: "Experiential learning hub featuring advanced GPU clusters for training intelligent models.",
    directions: "1. Straight from stairs to end of corridor.\n2. Turn left, then right before double doors; on left.",
    images: ["/assets/First/aidl-215-1.jpg"]
  },
  "Library (218)": {
    description: "B.Tech students can issue five books at a time for 14 days.\nOpen Monday to Friday 9:30 AM – 8:30 PM, Saturday 10:00 AM – 5:00 PM.",
    directions: "1. Turn left after stairs, straight to end, then turn right.",
    images: ["/assets/First/library-218-1.jpg", "/assets/First/library-218-2.png", "/assets/First/library-218-3.jpg"]
  },
  "AICTE IDEA Lab (316)": {
    description: "State-of-the-art innovation center for prototyping, IoT fabrication, and multidisciplinary design.",
    directions: "2nd Floor central North wing.",
    images: ["/assets/Second/aicte-316-1.png", "/assets/Second/aicte-316-2.png", "/assets/Second/aicte-316-3.png"]
  },
  "Computer Programming Lab (301)": {
    description: "Computing lab configured for Data Structures and Algorithms in Java, Python, and web development.",
    directions: "2nd Floor, South-East computing corridor.",
    images: ["/assets/Second/computer programming-301-1.jpg"]
  }
};

export default function CampusMapPage() {
  const navigate = useNavigate();

  // Cinematic Zoom State
  const [isZoomed, setIsZoomed] = useState(false);

  // Modals
  const [academicModalOpen, setAcademicModalOpen] = useState(false);
  const [floorModalOpen, setFloorModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);

  // Active Floor & Room
  const [currentFloor, setCurrentFloor] = useState('ground');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [floorZoom, setFloorZoom] = useState(1);

  // Slideshow indices
  const [academicSlideIdx, setAcademicSlideIdx] = useState(0);
  const [roomSlideIdx, setRoomSlideIdx] = useState(0);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const viewportRef = useRef(null);

  // Cinematic Zoom Trigger
  const handleAcademicClick = () => {
    if (isZoomed) return;
    setIsZoomed(true);

    // Wait 750ms for the zoom animation to glide directly into the building before opening the modal
    setTimeout(() => {
      setAcademicSlideIdx(0);
      setAcademicModalOpen(true);
    }, 750);
  };

  const handleCloseAcademicModal = () => {
    setAcademicModalOpen(false);
    setIsZoomed(false); // Glides camera smoothly back out to full campus
  };

  const handleOpenFloor = (floorKey) => {
    setCurrentFloor(floorKey);
    setFloorZoom(1);
    setFloorModalOpen(true);
  };

  const handleCloseFloorModal = () => {
    setFloorModalOpen(false);
    setIsZoomed(false); // Zoom back out if returning from floor plans
  };

  const handleOpenRoom = (roomName, floorKey) => {
    const data = ROOM_DATA[roomName] || {
      description: "Room information and schedule directory.",
      directions: "Refer to floor circulation corridors.",
      images: []
    };
    setCurrentRoom({ name: roomName, floor: floorKey || currentFloor, ...data });
    setRoomSlideIdx(0);
    setRoomModalOpen(true);
  };

  const handleZoom = (delta) => {
    setFloorZoom((prev) => Math.min(Math.max(prev + delta, 1), 2.5));
  };

  const handleZoomReset = () => {
    setFloorZoom(1);
    if (viewportRef.current) viewportRef.current.scrollTo({ left: 0, top: 0 });
  };

  // Search filter
  const searchResults = [];
  if (searchQuery.trim()) {
    Object.entries(FLOOR_HOTSPOTS).forEach(([floor, rooms]) => {
      rooms.forEach(([name]) => {
        if (name.toLowerCase().includes(searchQuery.toLowerCase())) {
          searchResults.push({ name, floor });
        }
      });
    });
  }

  return (
    <div className="campus-map-page">
      {/* Top Header */}
      <header className="topbar">
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          CAMPUS <b>VERSE</b>
        </a>
        <span>KNOW YOUR COLLEGE</span>
        <button onClick={() => navigate('/')} className="outline-btn">
          <ArrowLeft size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Home
        </button>
      </header>

      <main>
        <section className="intro">
          <p className="eyebrow">EXPLORE THE CAMPUS</p>
          <h1>Campus Map</h1>
          <p>Select Academic Block to explore its floors and rooms.</p>
        </section>

        {/* Isometric Artwork Map with Zoom Stage */}
        <section className="campus-art">
          <div className={`campus-art-stage ${isZoomed ? 'is-zoomed' : ''}`}>
            <img
              src="/assets/Campus-isometric.jpg"
              alt="Isometric campus map"
              onError={(e) => { e.currentTarget.src = "/assets/Campus-isometric.png"; }}
            />

            {/* Clickable building facade hitbox */}
            <div
              className="building-hitbox"
              onClick={handleAcademicClick}
              title="Click to inspect Academic Block"
            />

            {/* Floating building pin */}
            <button
              onClick={handleAcademicClick}
              className="building-pin"
            >
              <span className="pin-dot"></span>
              Academic Block
            </button>
          </div>
        </section>

        {/* 1. ACADEMIC BLOCK POPUP */}
        {academicModalOpen && (
          <div className="modal-backdrop" onClick={handleCloseAcademicModal}>
            <section className="modal academic-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close" onClick={handleCloseAcademicModal}>×</button>

              <div className="academic-grid">
                <div className="slideshow">
                  <img
                    className="slide-image"
                    src={ACADEMIC_DATA.images[academicSlideIdx]}
                    alt="Academic Block"
                    onClick={() => setAcademicSlideIdx((prev) => (prev + 1) % ACADEMIC_DATA.images.length)}
                  />
                  <div className="slide-dots">
                    {ACADEMIC_DATA.images.map((_, i) => (
                      <button
                        key={i}
                        className={academicSlideIdx === i ? 'active' : ''}
                        onClick={() => setAcademicSlideIdx(i)}
                      />
                    ))}
                  </div>
                  <p className="image-help">Click image to cycle photos</p>
                </div>

                <div className="details">
                  <p className="eyebrow">BUILDING DETAILS</p>
                  <h2>Academic Block</h2>

                  <label>Description</label>
                  <p className="editable-copy">{ACADEMIC_DATA.description}</p>

                  <label>Directions</label>
                  <p className="editable-copy">{ACADEMIC_DATA.directions}</p>

                  <div className="floor-heading">Explore a floor</div>
                  <div className="floor-buttons">
                    <button onClick={() => { setAcademicModalOpen(false); handleOpenFloor('ground'); }}>
                      A · Ground Floor
                    </button>
                    <button onClick={() => { setAcademicModalOpen(false); handleOpenFloor('first'); }}>
                      B · First Floor
                    </button>
                    <button onClick={() => { setAcademicModalOpen(false); handleOpenFloor('second'); }}>
                      C · Second Floor
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 2. FLOOR PLAN POPUP WITH ROOM HOTSPOTS */}
        {floorModalOpen && (
          <div className="modal-backdrop" onClick={handleCloseFloorModal}>
            <section className="modal floor-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close" onClick={handleCloseFloorModal}>×</button>

              <div className="floor-modal-head">
                <div>
                  <p className="eyebrow">ACADEMIC BLOCK</p>
                  <h2>{FLOOR_INFO[currentFloor].title}</h2>
                  <p>Click any room hotspot to inspect details and photographs.</p>
                </div>

                <div className="floor-switcher">
                  {['ground', 'first', 'second'].map((fl) => (
                    <button
                      key={fl}
                      style={{
                        background: currentFloor === fl ? 'rgba(56, 213, 232, 0.25)' : 'rgba(14, 20, 32, 0.65)',
                        borderColor: currentFloor === fl ? '#38d5e8' : 'rgba(56, 213, 232, 0.22)'
                      }}
                      onClick={() => handleOpenFloor(fl)}
                    >
                      {fl.charAt(0).toUpperCase() + fl.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Global Search */}
              <div className="global-room-search">
                <div className="search-input-wrapper">
                  <Search size={16} color="#38d5e8" />
                  <input
                    type="search"
                    placeholder="Search any room across all floors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                  />
                </div>

                {isSearchFocused && searchResults.length > 0 && (
                  <div className="global-search-results">
                    {searchResults.map((res, idx) => (
                      <button
                        key={idx}
                        className="global-search-result"
                        onClick={() => {
                          setCurrentFloor(res.floor);
                          handleOpenRoom(res.name, res.floor);
                          setSearchQuery('');
                          setIsSearchFocused(false);
                        }}
                      >
                        <span>{res.name}</span>
                        <span className="search-floor-label">{FLOOR_INFO[res.floor].title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="floor-zoom-controls">
                <button type="button" onClick={() => handleZoom(0.25)} aria-label="Zoom in">+</button>
                <button type="button" onClick={() => handleZoom(-0.25)} aria-label="Zoom out">−</button>
                <button type="button" onClick={handleZoomReset}>Reset</button>
              </div>

              {/* Floor Plan Viewport */}
              <div className="floor-map-viewport" ref={viewportRef}>
                <div
                  className="plan-stage"
                  style={{ width: `${100 * floorZoom}%`, transformOrigin: 'top left' }}
                >
                  <img
                    src={FLOOR_INFO[currentFloor].image}
                    alt={`${FLOOR_INFO[currentFloor].title} plan`}
                  />
                  <div className="hotspot-layer">
                    {FLOOR_HOTSPOTS[currentFloor]?.map(([name, x, y, w, h], i) => (
                      <button
                        key={i}
                        className="room-hotspot"
                        type="button"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          width: `${w}%`,
                          height: `${h}%`
                        }}
                        title={`Open ${name}`}
                        onClick={() => handleOpenRoom(name, currentFloor)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {currentFloor !== 'ground' && (
                <p className="plan-hint">
                  Note: All directions on the first and second floors are given with reference to the staircase near the Entrance Lobby.
                </p>
              )}
            </section>
          </div>
        )}

        {/* 3. ROOM DETAILS POPUP */}
        {roomModalOpen && currentRoom && (
          <div className="modal-backdrop" onClick={() => setRoomModalOpen(false)}>
            <section className="modal room-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close" onClick={() => setRoomModalOpen(false)}>×</button>

              <div className="room-grid">
                <div className="details room-details">
                  <p className="eyebrow">{currentRoom.floor?.toUpperCase()} FLOOR</p>
                  <h2>{currentRoom.name}</h2>

                  <label>Description</label>
                  <p className="editable-copy">{currentRoom.description}</p>

                  <label>Directions</label>
                  <p className="editable-copy">{currentRoom.directions}</p>
                </div>

                <div className="slideshow">
                  {currentRoom.images && currentRoom.images.length > 0 ? (
                    <>
                      <img
                        className="slide-image"
                        src={currentRoom.images[roomSlideIdx]}
                        alt={currentRoom.name}
                        onClick={() => setRoomSlideIdx((prev) => (prev + 1) % currentRoom.images.length)}
                      />
                      <div className="slide-dots">
                        {currentRoom.images.map((_, i) => (
                          <button
                            key={i}
                            className={roomSlideIdx === i ? 'active' : ''}
                            onClick={() => setRoomSlideIdx(i)}
                          />
                        ))}
                      </div>
                      <p className="image-help">Click image to cycle photos</p>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 20px' }}>
                      <p>Photographs coming soon</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}