import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import './CampusMap.css';

const ACADEMIC_DATA = {
  description:
    'The Academic Block serves as the central hub of a college campus, purposefully designed to foster learning, collaboration, and intellectual growth. It integrates modern classrooms, lecture halls, and specialized departmental laboratories equipped with contemporary teaching technologies.',
  directions:
    '1. Enter through the main gate and continue straight ahead for a short distance.\n' +
    '2. On your left, you will see the signboard for the Academic Block.\n' +
    '3. Just beside that board, take the arched pathway.\n' +
    '4. After walking through the arch, the entrance to the Academic Building will be on your left.',
  images: [
    '/assets/building/academic-1.webp',
    '/assets/building/academic-2.webp',
    '/assets/building/academic-3.webp'
  ]
};

const FLOOR_INFO = {
  ground: {
    title: 'Ground Floor',
    image: '/assets/final_ground.svg'
  },
  first: {
    title: 'First Floor',
    image: '/assets/final_first.svg'
  },
  second: {
    title: 'Second Floor',
    image: '/assets/final_second.svg'
  }
};

const FLOOR_HOTSPOTS = {
  ground: [
    ['Networking Lab (132)', 24, 12, 9, 4],
    ['Computer Centre Lab (131 A)', 44, 12, 12, 4],
    ['Cyber Security Lab (132)', 62, 12, 10, 4],
    ['Unknown (126)', 28, 23, 5, 3],
    ['Assistant Librarian (131 B)', 39, 22, 5, 4],
    ['Sr. Network Engineer (131-C)', 42, 23, 5, 4],
    ['Server Room', 46, 23, 4, 3],
    ['Network Engineer (131-E)', 50, 24, 5, 4],
    ['Unknown (134)', 60, 23, 5, 3],
    ['Lecture Hall (122)', 31, 34, 9, 5],
    ['Faculty Room (125)', 43, 34, 6, 5],
    ['Lecture Hall (135)', 57, 36, 9, 5],
    ['Tutorial Room (124)', 22, 44, 6, 4],
    ['Tutorial Room (123)', 22, 51, 6, 4],
    ['3-D Institute Model', 44, 50, 8, 3],
    ['Anechoic Chamber (136)', 64, 45, 7, 4],
    ['Student Activity Centre (137)', 64, 52, 7, 4],
    ['Lecture Hall (121)', 31, 58, 8, 5],
    ['Lecture Hall (138)', 57, 58, 8, 5],
    ['Seminar-II (119)', 31, 74, 8, 4],
    ['Pantry (118)', 24, 74, 5, 3],
    ['Board Room (115)', 20, 83, 7, 4],
    ['Office (114)', 25, 85, 6, 4],
    ['Faculty Cabin (113)', 32, 87, 7, 4],
    ['Entrance Lobby', 44, 79, 10, 5],
    ['Registrar (106)', 58, 83, 5, 4],
    ['Director', 66, 83, 5, 4],
    ['Dean Academics (107)', 58, 74, 5, 4],
    ['Reception', 37, 76, 5, 3],
    ['JAO(SS)(108)', 58, 77, 4, 3],
    ['Toilet(M)Students', 11, 19, 9, 4],
    ['Toilet(F)Students', 21, 19, 9, 4],
    ['Lift Lobby (139)', 45, 61, 6, 4]
  ],
  first: [
    ['Big Data Lab (216)', 25, 12, 7, 4],
    ['AIDL (215)', 25, 19, 6, 4],
    ['Project Lab (214)', 27, 26, 6, 4],
    ['Library (218)', 42, 18, 12, 5],
    ['Wireless Communication Lab (220)', 58, 12, 10, 4],
    ['AI Experimental Lab (221)', 58, 19, 8, 4],
    ['PCB Design (219)', 49, 25, 7, 5],
    ['Speech Processing Lab (228)', 57, 25, 6, 4],
    ['Lecture Hall (209)', 29, 38, 8, 5],
    ['Faculty Room (227)', 43, 34, 6, 4],
    ['Lecture Hall (222)', 52, 38, 8, 5],
    ['Tutorial (208)', 22, 46, 5, 4],
    ['Tutorial (207)', 22, 53, 5, 4],
    ['Central Atrium', 42, 47, 9, 5],
    ['Tutorial (223)', 62, 46, 5, 4],
    ['Tutorial (224)', 62, 53, 5, 4],
    ['Lecture Hall (206)', 29, 58, 8, 5],
    ['Lecture Hall (225)', 52, 58, 8, 5],
    ['Faculty Cabin Entrance (205)', 31, 76, 9, 5],
    ['Confidential (203)', 51, 76, 6, 4],
    ['Examination Cell', 56, 67, 5, 3],
    ['Office (202)', 58, 80, 8, 5],
    ['Entrance Lobby', 41, 78, 10, 5],
    ['LIFT LOBBY (226)', 42, 61, 10, 6],
    ['Meeting Room-1 (204)', 38, 73, 8, 7],
    ['Toilet(M)students', 10, 21, 9, 4],
    ['Toilet(F)students', 21, 21, 9, 4],
    ['CFAO (201)', 55, 70, 4, 3],
    ['Confidential (203)', 63, 77, 7, 4],
    ['Office (202)', 68, 88, 6, 4],
    ['Office all inclusive', 50, 66, 5, 4]
  ],
  second: [
    ['I.S.B.N. Lab (314)', 27, 14, 8, 4],
    ['AICTE IDEA Lab (316)', 46, 16, 11, 4],
    ['Robotics Lab (317)', 65, 14, 9, 5],
    ['Boys Common Room (313)', 28, 22, 7, 4],
    ['Unknown (318)', 63, 23, 6, 4],
    ['Class Room (308)', 31, 34, 8, 4],
    ['Faculty (325)', 45, 34, 6, 4],
    ['Class Room (319)', 59, 34, 8, 4],
    ['Class Room (307)', 32, 40.5, 8, 4],
    ['Class Room (320)', 59, 40.5, 8, 4],
    ['Tutorial (306)', 21, 45, 6, 4],
    ['Tutorial (305)', 21, 53, 6, 4],
    ['Central Atrium', 45, 49, 9, 5],
    ['R&D Space (321)', 68, 45, 6, 4],
    ['Unknown (322)', 68, 52, 6, 4],
    ['Lecture Hall (304)', 31, 61, 8, 5],
    ['ToileT(M)Students', 11, 18, 9, 4],
    ['ToileT(F)Students', 21, 18, 9, 4],
    ['Lecture Hall (323)', 59, 61, 8, 5],
    ['VLSI and Embedded Lab (303)', 32, 79, 10, 6],
    ['Electronic Circuit Lab (302)', 45, 79, 10, 6],
    ['Computer Programming Lab (301)', 58, 79, 10, 6]
  ]
};

const ROOM_DATA = {
  // ==========================================
  // GROUND FLOOR
  // ==========================================
  'Networking Lab (132)': {
    description:
      'The Networking Lab is an interactive, hands-on space where students discover how the modern internet works and how global data connects. It introduces beginners to the foundational building blocks of digital communication through engaging simulations and physical routing hardware.',
    directions:
      '1. Go straight, past the entrance lobby maintaining left side of corridor.\n' +
      '2. At the end you will find room 131, facing it turn left then after few steps turn right.\n' +
      '3. After few steps, on the left you will get networking lab.',
    images: [
      '/assets/Ground/networking-1.webp',
      '/assets/Ground/networking-2.webp',
      '/assets/Ground/networking-3.webp'
    ]
  },
  'Computer Centre Lab (131 A)': {
    description:
      "The Computer Centre Lab is an open-access resource center designed to support academic research, assignment formatting, and daily computing needs across all disciplines. It is the university's primary shared workspace for digital literacy, independent study, and technological support.",
    directions:
      '1. Go straight, past the entrance lobby maintaining left side of corridor.\n' +
      '2. At the end you will find room 131, inside which, is computer centre lab, room 131-A.',
    images: [
      '/assets/Ground/cc-1.webp',
      '/assets/Ground/cc-2.webp',
      '/assets/Ground/cc-3.webp'
    ]
  },
  'Cyber Security Lab (132)': {
    description:
      'The Cyber Security Lab is a specialized, secure environment where students learn to defend digital infrastructure against real-world cyber threats.',
    directions:
      '1. Go straight, past the entrance lobby maintaining right side of corridor.\n' +
      '2. Coming to the very end, you will find room 135 at right.\n' +
      '3. Turn right in the corridor ahead and take the first left.\n' +
      '4. Few steps ahead, on right you will find cyber security lab.',
    images: [
      '/assets/Ground/cs-1.webp',
      '/assets/Ground/cs-2.webp'
    ]
  },
  'Unknown (126)': {
    description: 'Room label not specified.',
    directions:
      '1. Go straight, past the entrance lobby maintaining left side of corridor.\n' +
      '2. Coming to the very end, you will find room 131, facing it turn left.\n' +
      '3. Continue straight past the double door.\n' +
      '4. After the double door, on immediate right you will find room 126.',
    images: []
  },
  'Toilet(M)Students': {
    description: 'Hygiene and Washroom Area.',
    directions:
      '1. Go straight, past the entrance lobby maintaining left side of corridor.\n' +
      '2. At the end you will find room 131.\n' +
      '3. Go straight, you will find two double doors in your way, go past it.\n' +
      '4. At almost end of that corridor, on the right is your desired wc.',
    images: ['/assets/Ground/Male-wc.webp']
  },
  'Toilet(F)Students': {
    description: 'Hygiene and Washroom Area.',
    directions:
      '1. Go straight, past the entrance lobby maintaining left side of corridor.\n' +
      '2. At the end you will find room 131.\n' +
      '3. Go straight, you will find two double doors in your way, go past it.\n' +
      '4. After crossing the second double door, at immediate right, is your desired wc.',
    images: ['/assets/Ground/Female-wc.webp']
  },
  'Assistant Librarian (131 B)': {
    description: '',
    directions:
      '1. Go straight, past the entrance lobby maintaining left side of corridor.\n' +
      '2. At the end you will find room 131.\n' +
      '3. Few steps inside 131, on your right, lies assist. librarian room.',
    images: ['/assets/Ground/librarian-1.webp']
  },
  'Sr. Network Engineer (131-C)': {
    description: '',
    directions:
      '1. Go straight, past the entrance lobby maintaining left side of corridor.\n' +
      '2. At the end you will find room 131. Upon entering you will find 131-A.\n' +
      '3. Go inside 131-A and on right first cabin is your desired room.',
    images: []
  },
  'Server Room': {
    description:
      "The Server Room is the secure, central nervous system of the university's digital landscape, housing the critical infrastructure that powers campus network operations.",
    directions:
      '1. Go straight, past the entrance lobby maintaining left side of corridor.\n' +
      '2. At the end you will find room 131. Upon entering you will find 131-A.\n' +
      '3. Go inside 131-A, on right after few steps, you will find server room.',
    images: []
  },
  'Network Engineer (131-E)': {
    description: '',
    directions:
      '1. Go straight, past the entrance lobby maintaining left side of corridor.\n' +
      '2. At the end you will find room 131. Upon entering you will find 131-A.\n' +
      '3. Go inside 131-A, turn right go straight, just after the projector, is your desired room.',
    images: []
  },
  'Unknown (134)': {
    description: 'Room label not specified.',
    directions:
      '1. Go straight, past the entrance lobby maintaining right side of corridor.\n' +
      '2. Coming to the very end, you will find room 135, take right in the corridor ahead.\n' +
      '3. Continue straight past the double door.\n' +
      '4. After the double door, on immediate left you will find room 134.',
    images: []
  },
  'Lecture Hall (122)': {
    description:
      'ECE class for 1st year students for session 2026-27.\n' +
      'ILC class for Advance 2 students for session 2026-27.',
    directions:
      '1. Go straight, past the entrance lobby maintaining left side of corridor.\n' +
      '2. Coming to the very end, you will find room 122 on your left, before the next corridor.',
    images: ['/assets/Ground/LH-122-1.webp']
  },
  'Faculty Room (125)': {
    description: '',
    directions:
      '1. Go straight, past the entrance lobby, following straight path to the lift lobby.\n' +
      '2. Go straight through the lift lobby and you will find institute model.\n' +
      '3. Move ahead few steps in the same direction and on your front you will find room 125.',
    images: ['/assets/Ground/facultyG-1.webp']
  },
  'Lecture Hall (135)': {
    description:
      'DSAI class for 1st year students for session 2026-27.\n' +
      'ILC class for basic students for session 2026-27.',
    directions:
      '1. Go straight, past the entrance lobby maintaining right side of corridor.\n' +
      '2. Coming to the very end, you will find room 135 on your right, before the next corridor.',
    images: [
      '/assets/Ground/LH-135-1.webp',
      '/assets/Ground/LH-135-2.webp',
      '/assets/Ground/LH-135-3.webp'
    ]
  },
  'Tutorial Room (124)': {
    description: '',
    directions:
      '1. Go straight, past the entrance lobby maintaining left side of corridor.\n' +
      '2. Continuing your path, you will find institute model on your right.\n' +
      '3. Take the left path, on your way, parallel to the model.\n' +
      '4. Go straight and you will find two rooms out of which one is 124.',
    images: ['/assets/Ground/Tuts-124-1.webp']
  },
  Reception: {
    description:
      'The college reception serves as the central hub for campus visitors, handling inquiries, guest check-ins, and general administrative routing.',
    directions:
      '1. After entering from the main gate, look diagonally left and you will find it.\n' +
      '(bonus) after entering main gate, at immediate right is the help desk.',
    images: []
  },
  'Tutorial Room (123)': {
    description: '',
    directions:
      '1. Go straight, past the entrance lobby maintaining left side of corridor.\n' +
      '2. Continuing your path, you will find institute model on your right.\n' +
      '3. Take the left path, on your way, parallel to the model.\n' +
      '4. Go straight and you will find two rooms out of which one is 123.',
    images: ['/assets/Ground/Tuts-123-1.webp']
  },
  '3-D Institute Model': {
    description: '3-D model of our institute.',
    directions:
      '1. Go straight, past the entrance lobby, following straight path to the lift lobby.\n' +
      '2. Go straight through the lift lobby and you will find institute model.',
    images: []
  },
  'Anechoic Chamber (136)': {
    description:
      'An anechoic chamber is a specialized, echo-free room designed to completely absorb reflections of either sound or electromagnetic waves. Isolated from external noise, it creates a controlled environment where students and researchers can precisely measure acoustics, antenna performance, and wireless device signals.',
    directions:
      '1. Go straight, past the entrance lobby maintaining right side of corridor.\n' +
      '2. Continuing your path, you will find institute model on your left.\n' +
      '3. Take the right path, on your way, parallel to the model.\n' +
      '4. Go straight and you will find two rooms out of which one is 136.',
    images: ['/assets/Ground/anechoic-136-1.webp']
  },
  'Student Activity Centre (137)': {
    description: 'Previously SAC, now used as microwave radar lab (MRL).',
    directions:
      '1. Go straight, past the entrance lobby maintaining right side of corridor.\n' +
      '2. Continuing your path, you will find institute model on your left.\n' +
      '3. Take the right path, on your way, parallel to the model.\n' +
      '4. Go straight and you will find two rooms out of which one is 137 (MRL).',
    images: ['/assets/Ground/MRL-137-1.webp']
  },
  'Lecture Hall (121)': {
    description: 'Generally used for club activities and events.',
    directions:
      '1. Go straight, past the entrance lobby maintaining left side of corridor.\n' +
      '2. After going past the lobby and horizontal corridor, on your path you will find room 121 on left.',
    images: [
      '/assets/Ground/LH-121-1.webp',
      '/assets/Ground/LH-121-2.webp'
    ]
  },
  'Lecture Hall (138)': {
    description:
      'Lecture Hall for CSE 1st year for the session 2026-27.\n' +
      'ILC Advance 1 class for the session 2026-27.',
    directions:
      '1. Go straight, past the entrance lobby maintaining right side of corridor.\n' +
      '2. After going past the lobby and horizontal corridor, on your path you will find room 138 on right.',
    images: [
      '/assets/Ground/LH-138-1.webp',
      '/assets/Ground/LH-138-2.webp',
      '/assets/Ground/LH-138-3.webp'
    ]
  },
  'Seminar-II (119)': {
    description: '',
    directions:
      '1. Upon entering the lobby, turn left and you will see a double door.\n' +
      '2. Go past the double door and on the immediate right, is your desired room.',
    images: []
  },
  'Pantry (118)': {
    description: '',
    directions:
      '1. Upon entering the lobby, turn left and you will see a double door.\n' +
      '2. Go past the double door and you will find a small lobby.\n' +
      '3. Turn right from the lobby and just before the doors lies pantry.',
    images: []
  },
  'Board Room (115)': {
    description: '',
    directions:
      '1. Upon entering the lobby, turn left and you will see a double door.\n' +
      '2. Go past the double door and you will find a small lobby.\n' +
      '3. On entering the lobby you will find board room in front of you.',
    images: []
  },
  'Office (114)': {
    description: '',
    directions:
      '1. Upon entering the lobby, turn left and you will see a double door.\n' +
      '2. Go past the double door and you will find a small lobby.\n' +
      '3. Turn left from the lobby and you will find office in front of you.',
    images: []
  },
  'Faculty Cabin (113)': {
    description: '',
    directions:
      '1. Upon entering the lobby, turn left and you will see a double door.\n' +
      '2. Go past the double door and on the immediate left, is your desired room.',
    images: []
  },
  'Entrance Lobby': {
    description:
      'The Entrance Lobby serves as the welcoming gateway and central hub of the institute, providing a vibrant first impression for visitors and students alike.',
    directions: 'Enter from the main gate of academic block.',
    images: [
      '/assets/Ground/enterance looby-1.webp',
      '/assets/Ground/Enterance looby-hd.webp',
      '/assets/Ground/enterance-3.webp'
    ]
  },
  'Registrar (106)': {
    description:
      'The Registrar Room is the central administrative hub responsible for managing essential student records, academic transcripts, and enrollment data.',
    directions:
      '1. Upon entering the lobby, turn right and you will see a double door.\n' +
      '2. Go past the double door and on the immediate right corridor, is your desired room.',
    images: []
  },
  Director: {
    description: '',
    directions:
      '1. Upon entering the lobby, turn right and you will see a double door.\n' +
      '2. Go past the double door, move ahead of the corridor in your way and in front of you is the director cabin.',
    images: []
  },
  'Dean Academics (107)': {
    description: '',
    directions:
      '1. Upon entering the lobby, turn right and you will see a double door.\n' +
      '2. Go past the double door and on the immediate left corridor, is your desired room.',
    images: []
  },
  'JAO(SS)(108)': {
    description: '',
    directions:
      '1. Upon entering the lobby, turn right and you will see a double door.\n' +
      '2. Go past the double door and on the immediate left corridor, is your desired room.',
    images: []
  },
  'Lift Lobby (139)': {
    description: 'An area for accessing lift facility.',
    directions:
      '1. Walk straight through the entrance lobby and you will find the lift lobby just after crossing the lobby.',
    images: [
      '/assets/Ground/lift g-1.webp',
      '/assets/Ground/lift g-2.webp'
    ]
  },

  // ==========================================
  // FIRST FLOOR
  // ==========================================
  'Big Data Lab (216)': {
    description:
      'A big data lab is a specialized campus facility equipped with high-performance computing infrastructure and advanced analytics software for processing massive, complex datasets. It provides students and researchers with hands-on experience in data mining, machine learning, and predictive modeling to solve real-world industry problems.',
    directions:
      '1. Go straight from staircase until the end of the corridor.\n' +
      '2. Turn left at the corridor ends. After few steps you will see a double door.\n' +
      '3. Just before the double door, turn right in the corridor that follows.\n' +
      '4. At the end of corridor on left you have your desired lab.',
    images: ['/assets/First/big-data-216-1.webp']
  },
  'AIDL (215)': {
    description:
      'An AI data lab is a cutting-edge campus facility featuring advanced GPU hardware and deep learning frameworks for training intelligent models and analyzing complex data. It serves as an experiential learning hub where students and researchers build, test, and deploy artificial intelligence and machine learning applications.',
    directions:
      '1. Go straight from staircase until the end of the corridor.\n' +
      '2. Turn left at the corridor ends. After few steps you will see a double door.\n' +
      '3. Just before the double door, turn right in the corridor that follows.\n' +
      '4. After few steps, you have your AIDL lab on left.',
    images: ['/assets/First/aidl-215-1.webp']
  },
  'Project Lab (214)': {
    description:
      'A project lab is a dedicated, collaborative space equipped with specialized tools, software, and hardware for students to design, prototype, and build their capstone or research projects.',
    directions:
      '1. Go straight from staircase until the end of the corridor.\n' +
      '2. Turn left at the corridor ends. After few steps you will see a double door.\n' +
      '3. Past the double door, at immediate right, is your project lab.',
    images: ['/assets/First/project-214-1.webp']
  },
  'Library (218)': {
    description:
      'Monday to Friday, the opening hours and issue/return timings are from 9:30 AM to 8:30 PM.\n' +
      'On Saturday, the opening hour is from 10 AM to 5 PM and issue/return timing is from 10:30 AM to 5 PM.\n' +
      'On Sunday library is closed.',
    directions:
      '1. Turn left after stairs.\n' +
      '2. Go straight until corridor ends and then turn right.\n' +
      '3. At the end of corridor you will find library.',
    images: [
      '/assets/First/library-218-1.webp',
      '/assets/First/library-218-2.webp',
      '/assets/First/library-218-3.webp',
      '/assets/First/library-218-4.webp',
      '/assets/First/library-218-5.webp'
    ]
  },
  'Wireless Communication Lab (220)': {
    description:
      'A wireless communication lab is a specialized facility equipped with advanced signal generators, spectrum analyzers, and simulation software like MATLAB. It enables students to analyze radio frequency signals, design antenna systems, and test modern cellular, Wi-Fi, and IoT protocols.',
    directions:
      '1. Go straight from staircase until the end of the corridor.\n' +
      '2. Turn right at the end of corridor and take left immediately.\n' +
      '3. Go till the end of corridor and at right you will find the lab.',
    images: [
      '/assets/First/wireless-220-1.webp',
      '/assets/First/wireless-220-2.webp'
    ]
  },
  'AI Experimental Lab (221)': {
    description:
      'An AI experimental lab is an advanced testing environment where students build, train, and deploy next-generation artificial intelligence algorithms.',
    directions:
      '1. Go straight from staircase until the end of the corridor.\n' +
      '2. Turn right at the end of corridor and take left immediately.\n' +
      '3. After few steps at right is your AI Experimental lab.',
    images: ['/assets/First/aiel-221-1.webp']
  },
  'PCB Design (219)': {
    description:
      'A PCB design lab is a hands-on technical workshop where students learn to conceptualize, simulate, and fabricate custom Printed Circuit Boards.',
    directions:
      '1. Go straight from staircase until the end of corridor.\n' +
      '2. At the end, look slight right and you will find the lab.',
    images: ['/assets/First/pcb-219-1.webp']
  },
  'Speech Processing Lab (228)': {
    description:
      'The laboratory focuses on the research and development activities related to speech processing, biomedical signal and image processing, cognition, and language processing areas with high-performance computing workstations and GPU servers.',
    directions:
      '1. Go straight from staircase until the end of the corridor.\n' +
      '2. Turn right and go past the double door.\n' +
      '3. After crossing at immediate left is your desired lab.',
    images: ['/assets/First/speech-228-1.webp']
  },
  'Lecture Hall (209)': {
    description:
      'Lecture Hall for ECE 2nd year, for the session 2026-27.\n' +
      'Lecture hall for minors in cyber security.',
    directions:
      '1. Turn left from stairs, go till end of corridor.\n' +
      '2. Turn right at the end and after some steps, your desired lecture hall on left.',
    images: ['/assets/First/LH-209-1.webp']
  },
  'Faculty Room (227)': {
    description: '',
    directions:
      '1. Go straight after stairs and after some distance, on your right you will see entry for room 222.\n' +
      '2. After reaching parallel to the door, move left and after few steps, on right you will find the desired room.',
    images: ['/assets/First/faculty-227-1.webp']
  },
  'Lecture Hall (222)': {
    description:
      'Lecture Hall for DSAI 2nd year, for the session 2026-27.\n' +
      'Lecture hall for minors in business informatics.',
    directions:
      'Go straight until the end of corridor.\n' +
      'Before starting of the next corridor, on your right is the desired room.',
    images: []
  },
  'Tutorial (208)': {
    description: '',
    directions:
      '1. Turn left from stairs, go till end of corridor.\n' +
      '2. At the end of corridor turn right and after some distance turn left to the inner corridor.\n' +
      '3. Go straight and you will find two rooms out of which one is 208.',
    images: ['/assets/First/Tuts-208-1.webp']
  },
  'Tutorial (207)': {
    description: '',
    directions:
      '1. Turn left from stairs, go till end of corridor.\n' +
      '2. At the end of corridor turn right and after some distance turn left to the inner corridor.\n' +
      '3. Go straight and you will find two rooms out of which one is 207.',
    images: ['/assets/First/Tuts-207-1.webp']
  },
  'Central Atrium': {
    description: '',
    directions: 'Go straight from stairs and at left you will find atrium.',
    images: []
  },
  'Tutorial (223)': {
    description: '',
    directions:
      '1. Go straight from stairs.\n' +
      '2. Halfway through the main corridor, turn right to the inner corridor.\n' +
      '3. Go straight and you will find two rooms out of which one is 223.',
    images: ['/assets/First/Tuts-223-1.webp']
  },
  'Tutorial (224)': {
    description: '',
    directions:
      '1. Go straight from stairs.\n' +
      '2. Halfway through the main corridor, turn right to the inner corridor.\n' +
      '3. Go straight and you will find two rooms out of which one is 224.',
    images: ['/assets/First/Tuts-224-1.webp']
  },
  'Lecture Hall (206)': {
    description:
      'Lecture Hall for CSE 2nd year, for the session 2026-27.\n' +
      'Lecture Hall for minors in digital humanities.',
    directions:
      '1. Turn left from the stairs, go till the end of corridor.\n' +
      '2. At the end of corridor turn right. After few steps room 206 is on your left.',
    images: ['/assets/First/LH-206-1.webp']
  },
  'Lecture Hall (225)': {
    description: 'Lecture Hall for CSE 3rd year, for the session 2026-27.',
    directions: 'Few steps straight after stairs, on right.',
    images: [
      '/assets/First/LH-225-1.webp',
      '/assets/First/LH-C-1.webp',
      '/assets/First/LH-C-2.webp'
    ]
  },
  'Faculty Cabin Entrance (205)': {
    description: '',
    directions:
      '1. Turn left from stairs and walk straight.\n' +
      '2. At the end of corridor you will find the cabin.',
    images: ['/assets/First/faculty cabin-205-1.webp']
  },
  'Confidential (203)': {
    description:
      'A confidential room in a college is a secure, private space designated for sensitive discussions, counseling sessions, or handling protected student records.',
    directions:
      '1. Turn right from stairs, enter inside office all inclusive.\n' +
      '2. Walk straight and turn right, at the turn, on right is the confidential room.',
    images: []
  },
  'CFAO (201)': {
    description: '',
    directions:
      '1. Turn right from stairs, enter inside office all inclusive.\n' +
      '2. Walk straight and turn right, at the turn, on left is the CFAO.',
    images: []
  },
  'Toilet(M)students': {
    description: 'Hygiene and Washroom Area.',
    directions:
      '1. Go straight, from the stairs until the end of corridor.\n' +
      '2. At the end you will find pcb design room.\n' +
      '3. Turn left, go straight, you will find two double doors in your way, go past it.\n' +
      '4. At almost end of that corridor, on the right is your desired wc.',
    images: []
  },
  'Toilet(F)students': {
    description: 'Hygiene and Washroom Area.',
    directions:
      '1. Go straight, from the stairs until the end of corridor.\n' +
      '2. At the end you will find pcb design room.\n' +
      '3. Turn left, go straight, you will find two double doors in your way, go past it.\n' +
      '4. At immediate right of the second double door, is your desired wc.',
    images: []
  },
  'Examination Cell': {
    description:
      'The examination cell is the core administrative hub responsible for the smooth planning, scheduling, and execution of all college exams.',
    directions:
      '1. Turn right from stairs, enter inside office all inclusive.\n' +
      '2. Walk straight and at the end you will find examination cell.',
    images: []
  },
  'Office (202)': {
    description: '',
    directions:
      '1. Turn right from stairs, enter inside office all inclusive.\n' +
      '2. Walk straight and turn right, after few steps ahead you will find office.',
    images: []
  },
  'LIFT LOBBY (226)': {
    description: 'An area for accessing lift facility.',
    directions: 'From the stairs, turn left and after some steps turn right\nYou will find lift lobby.',
    images: ['/assets/First/lift f-1.webp']
  },
  'Office all inclusive': {
    description: '',
    directions: 'Immediate right after stairs.',
    images: ['/assets/First/oai-1.webp']
  },
  'Meeting Room-1 (204)': {
    description: '',
    directions:
      '1. Turn left from the stairs and walk straight.\n' +
      '2. Before the end of passage, meeting room is on your left.',
    images: ['/assets/First/meeting-204-1.webp']
  },

  // ==========================================
  // SECOND FLOOR
  // ==========================================
  'I.S.B.N. Lab (314)': {
    description:
      'The INFORMATION SECURITY AND BLOCKCHAIN NETWORK (ISBN) lab is responsible for performing world class research in the field of Information Security and Block-Chain Technology. The ISBN Lab supports student’s research with latest and upgraded hardware and software tools to perform their experiments.',
    directions:
      '1. Go straight from the stairs until end of corridor.\n' +
      '2. Turn left from the end, and go straight until the double door.\n' +
      '3. Before the double door, turn right.\n' +
      '4. After few steps, the lab is on the left.',
    images: ['/assets/second/isbn-lab-314-1.webp']
  },
  'AICTE IDEA Lab (316)': {
    description:
      'AICTE-IDEA (Idea Development, Evaluation & Application) Labs are being established across the country to encourage students to apply STEM fundamentals towards enhanced hands-on experience.\n' +
      'The IDEA Lab serves as a common facility embedded in the institution to make engineering graduates more imaginative and creative. It provides a 24x7 collaborative space for converting ideas into prototypes.',
    directions:
      '1. Walk straight along the passage and keep moving ahead. Turn left at the end and continue forward.\n' +
      '2. You will reach the AICTE IDEA Lab, on your right.',
    images: [
      '/assets/second/aicte-316-1.webp',
      '/assets/second/aicte-316-2.webp',
      '/assets/second/aicte-316-3.webp',
      '/assets/second/aicte-316-4.webp',
      '/assets/second/aicte-316-5.webp'
    ]
  },
  'Robotics Lab (317)': {
    description:
      'A robotics lab is a dedicated, hands-on learning or research space where people design, build, program, and test working robotic systems rather than just studying theory from books.',
    directions:
      '1. Enter the second floor and walk straight towards the main corridor until the end.\n' +
      '2. Turn right and then turn left on the inner corridor.\n' +
      '3. Walk straight until you find robotics lab on your right.',
    images: ['/assets/second/robotics-317-1.webp']
  },
  'Boys Common Room (313)': {
    description: '',
    directions:
      '1. Walk straight along the corridor and at the end of it, take left.\n' +
      '2. Continue along the corridor and go past the first double door.\n' +
      '3. After crossing the double door, at immediate right is your desired room.',
    images: ['/assets/second/boys c-313-1.webp']
  },
  'Unknown (318)': {
    description: '',
    directions:
      '1. Walk straight along the corridor and at the end of it, take right.\n' +
      '2. Continue along the corridor and go past the first double door.\n' +
      '3. After crossing the double door, at immediate left is your desired room.',
    images: []
  },
  'Class Room (308)': {
    description:
      'Classroom for minors in digital mobility.\n' +
      'DSAI and CSE classroom for 4th year students for the session 2026-2027.',
    directions:
      '1. Turn left and move until the end of corridor and take right.\n' +
      '2. Walk straight until the end of corridor, and just before the end, on left is classroom 308.',
    images: ['/assets/second/classroom-308-1.webp']
  },
  'Faculty (325)': {
    description: '',
    directions:
      '1. Go straight from stairs and after some distance, on your right you will see entry for room 320.\n' +
      '2. After reaching parallel to the door, move left and after few steps, on right you will find the desired room.',
    images: ['/assets/second/faculty-325-1.webp']
  },
  'Class Room (319)': {
    description: '',
    directions:
      '1. Walk straight from the stairs and move until the end of corridor.\n' +
      '2. Before the end of corridor, you will find room 319 on your right.',
    images: ['/assets/second/classroom-319-1.webp']
  },
  'Class Room (307)': {
    description: 'ECE Classroom for 4th year students for the year 2026-27.',
    directions:
      '1. Turn left from the stairs until the end of passage, then turn right.\n' +
      '2. Walk straight, and after reaching parallel to end of the atrium, on your left, is room 307.',
    images: ['/assets/second/classroom-307-1.webp']
  },
  'Class Room (320)': {
    description: '',
    directions:
      '1. Go straight from the stairs.\n' +
      '2. Walk straight, and after reaching parallel to end of the atrium, on your right, is room 320.',
    images: ['/assets/second/classroom-320-1.webp']
  },
  'Tutorial (306)': {
    description: '',
    directions:
      '1. Turn left from stairs, go till end of corridor.\n' +
      '2. At the end of corridor turn right and after some distance turn left to the inner corridor.\n' +
      '3. Go straight and you will find two rooms out of which one is 306.',
    images: ['/assets/second/Tuts-306-1.webp']
  },
  'Tutorial (305)': {
    description: '',
    directions:
      '1. Turn left from stairs, go till end of corridor.\n' +
      '2. At the end of corridor turn right and after some distance turn left to the inner corridor.\n' +
      '3. Go straight and you will find two rooms out of which one is 305.',
    images: ['/assets/second/Tuts-305-1.webp']
  },
  'R&D Space (321)': {
    description:
      'An experiential ecosystem designed to bridge the gap between academic curiosity and commercial application through hands-on fabrication and testing. This vibrant space empowers the next generation of researchers to patent proprietary technologies, launch student startups, and solve real-world industrial challenges.',
    directions:
      '1. Go straight from stairs.\n' +
      '2. Halfway through the main corridor, turn right to the inner corridor.\n' +
      '3. Go straight and you will find two rooms out of which one is 321.',
    images: ['/assets/second/rd-space-321-1.webp']
  },
  'Unknown (322)': {
    description: '',
    directions:
      '1. Go straight from stairs.\n' +
      '2. Halfway through the main corridor, turn right to the inner corridor.\n' +
      '3. Go straight and you will find two rooms out of which one is 322.',
    images: ['/assets/second/unknown-322-1.webp']
  },
  'Lecture Hall (304)': {
    description: 'Lecture hall for 3rd year DSAI students for the session 2026-27.',
    directions:
      '1. Take a left turn and walk straight along the corridor.\n' +
      '2. At the end turn right, after few steps room 304 is on your left.',
    images: []
  },
  'Lecture Hall (323)': {
    description: '',
    directions: '1. Go straight from stairs and after few steps on your right is room 323.',
    images: ['/assets/second/LH-323-1.webp']
  },
  'VLSI and Embedded Lab (303)': {
    description:
      'A specialized facility where students design, simulate, and test advanced integrated circuits (VLSI) alongside microcontrollers and real-time operating systems (Embedded Systems). It bridges the gap between hardware architecture and software control, equipping future engineers with hands-on experience in cutting-edge chip design and smart automation.',
    directions:
      '1. Turn left from stairs and go straight.\n' +
      '2. At the end you will find VLSI lab.',
    images: ['/assets/second/vlsi-303-1.webp']
  },
  'Electronic Circuit Lab (302)': {
    description:
      'Electronic Circuit Lab is associated with the institute core course Digital System Design, Electronic Circuits, Analog Integrated Circuits and IT Workshop (Hardware Module). This lab runs in both the semester and accommodates approximately 120 students per semester. The laboratory has basic electronic experiments on analog, digital and mixed signal circuits.',
    directions: 'At immediate left from the stairs.',
    images: ['/assets/second/electronic-circuit-302-1.webp']
  },
  'ToileT(M)Students': {
    description: 'Hygiene and Washroom Area',
    directions:
      '1. Go straight, from the stairs until the end of corridor.\n' +
      '2. At the end, turn left.\n' +
      '3. Go straight, you will find two double doors in your way, go past it.\n' +
      '4. At almost end of that corridor, on the right is your desired wc.',
    images: []
  },
  'ToileT(F)Students': {
    description: 'Hygiene and Washroom Area.',
    directions:
      '1. Go straight, from the stairs until the end of corridor.\n' +
      '2. At the end, turn left.\n' +
      '3. Go straight, you will find two double doors in your way, go past it.\n' +
      '4. At immediate right of the second double door, is your desired wc.',
    images: []
  },
  'Computer Programming Lab (301)': {
    description:
      'The interactive experiments in this lab will give the students an opportunity for learning and better understanding of the basic concepts and constructs of computer programming as well as advanced methodology concepts like Deep learning, Big data Technologies, Artificial Intelligence, Computational Intelligence etc.',
    directions: 'At immediate right from the stairs.',
    images: ['/assets/second/computer programming-301-1.webp']
  }
};

function SmartMapImage({ src, alt, className, onClick, fallbackNotice = true }) {
  const candidates = src
    ? Array.from(
        new Set([
          src,
          src.replace(/\.webp$/i, '.png'),
          src.replace(/\.webp$/i, '.jpg'),
          src.replace(/\.webp$/i, '.jpeg')
        ])
      )
    : [];
  const [attemptIdx, setAttemptIdx] = useState(0);

  useEffect(() => {
    setAttemptIdx(0);
  }, [src]);

  if (candidates.length === 0 || attemptIdx >= candidates.length) {
    if (!fallbackNotice) return null;
    return (
      <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 20px' }}>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>Photographs coming soon</p>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={candidates[attemptIdx]}
      alt={alt}
      decoding="async"
      onClick={onClick}
      onError={() => setAttemptIdx((prev) => prev + 1)}
    />
  );
}

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
  const searchBoxRef = useRef(null);
  const wheelLockRef = useRef(false);
  const zoomTimerRef = useRef(null);

  // Single-trigger Cinematic Zoom
  const handleAcademicClick = () => {
    if (isZoomed || academicModalOpen) return;
    setIsZoomed(true);
    clearTimeout(zoomTimerRef.current);

    zoomTimerRef.current = setTimeout(() => {
      setAcademicSlideIdx(0);
      setAcademicModalOpen(true);
    }, 600);
  };

  const handleCloseAcademicModal = useCallback(() => {
    clearTimeout(zoomTimerRef.current);
    setAcademicModalOpen(false);
    setIsZoomed(false);
  }, []);

  const handleOpenFloor = (floorKey) => {
    setCurrentFloor(floorKey);
    setFloorZoom(1);
    setFloorModalOpen(true);
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ left: 0, top: 0 });
    }
  };

  const handleCloseFloorModal = useCallback(() => {
    clearTimeout(zoomTimerRef.current);
    setFloorModalOpen(false);
    setIsZoomed(false);
  }, []);

  const handleOpenRoom = (roomName, floorKey) => {
    const data = ROOM_DATA[roomName] || {
      description: 'Room information and schedule directory.',
      directions: 'Refer to floor circulation corridors.',
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

  // Automatic 4.5s slideshow for Academic Block modal
  useEffect(() => {
    if (!academicModalOpen || ACADEMIC_DATA.images.length <= 1) return;
    const timer = setInterval(() => {
      setAcademicSlideIdx((prev) => (prev + 1) % ACADEMIC_DATA.images.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [academicModalOpen]);

  // Automatic 4.5s slideshow for Room modal
  useEffect(() => {
    const imgs = currentRoom?.images || [];
    if (!roomModalOpen || imgs.length <= 1) return;
    const timer = setInterval(() => {
      setRoomSlideIdx((prev) => (prev + 1) % imgs.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [roomModalOpen, currentRoom]);

  // Preload next slide in the background so switching photos is instant
  useEffect(() => {
    const imgs = roomModalOpen
      ? currentRoom?.images
      : academicModalOpen
      ? ACADEMIC_DATA.images
      : null;
    if (!imgs || imgs.length <= 1) return;

    const activeIdx = roomModalOpen ? roomSlideIdx : academicSlideIdx;
    const nextSrc = imgs[(activeIdx + 1) % imgs.length];
    if (nextSrc) {
      const preload = new Image();
      preload.src = nextSrc;
    }
  }, [roomModalOpen, academicModalOpen, currentRoom, roomSlideIdx, academicSlideIdx]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (roomModalOpen) {
          setRoomModalOpen(false);
        } else if (floorModalOpen) {
          handleCloseFloorModal();
        } else if (academicModalOpen) {
          handleCloseAcademicModal();
        }
        return;
      }

      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      if (
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName))
      ) {
        return;
      }

      const direction = event.key === 'ArrowRight' ? 1 : -1;

      if (roomModalOpen && currentRoom?.images?.length > 1) {
        const len = currentRoom.images.length;
        setRoomSlideIdx((prev) => (prev + direction + len) % len);
        event.preventDefault();
      } else if (academicModalOpen && ACADEMIC_DATA.images.length > 1) {
        const len = ACADEMIC_DATA.images.length;
        setAcademicSlideIdx((prev) => (prev + direction + len) % len);
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    roomModalOpen,
    floorModalOpen,
    academicModalOpen,
    currentRoom,
    handleCloseFloorModal,
    handleCloseAcademicModal
  ]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSlideImageClick = (e, total, setIdx) => {
    if (total <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickedX = e.clientX - rect.left;
    const dir = clickedX < rect.width / 2 ? -1 : 1;
    setIdx((prev) => (prev + dir + total) % total);
  };

  const handleModalWheel = (e, total, setIdx) => {
    if (total <= 1) return;
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (wheelLockRef.current) return;
    wheelLockRef.current = true;
    const dir = e.deltaX > 0 ? 1 : -1;
    setIdx((prev) => (prev + dir + total) % total);
    setTimeout(() => {
      wheelLockRef.current = false;
    }, 400);
  };

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
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
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

        {/* Isometric Artwork Map with Cinematic Zoom Stage */}
        <section className="campus-art">
          <div className={`campus-art-stage ${isZoomed ? 'is-zoomed' : ''}`}>
            <SmartMapImage
              src="/assets/Campus-isometric.webp"
              alt="Isometric campus map"
              fallbackNotice={false}
            />

            {/* Clickable building facade hitbox */}
            <div
              className="building-hitbox"
              onClick={handleAcademicClick}
              title="Click to inspect Academic Block"
            />

            {/* Floating building pin */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAcademicClick();
              }}
              className="building-pin"
            >
              <span className="pin-dot"></span>
              Academic Block
            </button>
          </div>
        </section>

        {/* 1. ACADEMIC BLOCK POPUP */}
        {academicModalOpen && (
          <div
            className="modal-backdrop"
            onClick={handleCloseAcademicModal}
            onWheel={(e) =>
              handleModalWheel(e, ACADEMIC_DATA.images.length, setAcademicSlideIdx)
            }
          >
            <section className="modal academic-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close" onClick={handleCloseAcademicModal} aria-label="Close">
                ×
              </button>

              <div className="academic-grid">
                <div className="slideshow">
                  <SmartMapImage
                    className="slide-image"
                    src={ACADEMIC_DATA.images[academicSlideIdx]}
                    alt={`Academic Block ${academicSlideIdx + 1}`}
                    onClick={(e) =>
                      handleSlideImageClick(e, ACADEMIC_DATA.images.length, setAcademicSlideIdx)
                    }
                  />
                  <div className="slide-dots">
                    {ACADEMIC_DATA.images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Show photo ${i + 1}`}
                        className={academicSlideIdx === i ? 'active' : ''}
                        onClick={() => setAcademicSlideIdx(i)}
                      />
                    ))}
                  </div>
                  <p className="image-help">Click left/right side of image or use arrow keys</p>
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
                    <button
                      onClick={() => {
                        setAcademicModalOpen(false);
                        handleOpenFloor('ground');
                      }}
                    >
                      A · Ground Floor
                    </button>
                    <button
                      onClick={() => {
                        setAcademicModalOpen(false);
                        handleOpenFloor('first');
                      }}
                    >
                      B · First Floor
                    </button>
                    <button
                      onClick={() => {
                        setAcademicModalOpen(false);
                        handleOpenFloor('second');
                      }}
                    >
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
              <button className="close" onClick={handleCloseFloorModal} aria-label="Close">
                ×
              </button>

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
                        background:
                          currentFloor === fl
                            ? 'rgba(56, 213, 232, 0.25)'
                            : 'rgba(14, 20, 32, 0.65)',
                        borderColor:
                          currentFloor === fl ? '#38d5e8' : 'rgba(56, 213, 232, 0.22)'
                      }}
                      onClick={() => handleOpenFloor(fl)}
                    >
                      {fl.charAt(0).toUpperCase() + fl.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Global Search */}
              <div className="global-room-search" ref={searchBoxRef}>
                <div className="search-input-wrapper">
                  <Search size={16} color="#38d5e8" />
                  <input
                    type="search"
                    placeholder="Search any room across all floors..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchFocused(true);
                    }}
                    onFocus={() => setIsSearchFocused(true)}
                  />
                </div>

                {isSearchFocused && searchQuery.trim() !== '' && (
                  <div className="global-search-results" role="listbox">
                    {searchResults.length === 0 ? (
                      <div
                        style={{
                          padding: '12px 16px',
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)'
                        }}
                      >
                        No matching rooms found.
                      </div>
                    ) : (
                      searchResults.map((res, idx) => (
                        <button
                          key={`${res.floor}-${res.name}-${idx}`}
                          type="button"
                          role="option"
                          className="global-search-result"
                          onClick={() => {
                            setCurrentFloor(res.floor);
                            handleOpenRoom(res.name, res.floor);
                            setSearchQuery('');
                            setIsSearchFocused(false);
                          }}
                        >
                          <span>{res.name}</span>
                          <span className="search-floor-label">
                            {FLOOR_INFO[res.floor].title}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="floor-zoom-controls">
                <button type="button" onClick={() => handleZoom(0.25)} aria-label="Zoom in">
                  +
                </button>
                <button type="button" onClick={() => handleZoom(-0.25)} aria-label="Zoom out">
                  −
                </button>
                <button type="button" onClick={handleZoomReset}>
                  Reset
                </button>
              </div>

              {/* Floor Plan Viewport */}
              <div className="floor-map-viewport" ref={viewportRef}>
                <div
                  className="plan-stage"
                  style={{ width: `${100 * floorZoom}%`, transformOrigin: 'top left' }}
                >
                  <img
                    src={FLOOR_INFO[currentFloor].image}
                    alt={`${FLOOR_INFO[currentFloor].title} AutoCAD floor plan`}
                  />
                  <div className="hotspot-layer">
                    {FLOOR_HOTSPOTS[currentFloor]?.map(([name, x, y, w, h], i) => (
                      <button
                        key={`${currentFloor}-${name}-${i}`}
                        className="room-hotspot"
                        type="button"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          width: `${w}%`,
                          height: `${h}%`
                        }}
                        title={`Open ${name}`}
                        aria-label={`Open details for ${name}`}
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
                  Note: To avoid confusion, all directions on the first and second floors are given
                  with reference to the staircase near the Entrance Lobby.
                </p>
              )}
            </section>
          </div>
        )}

        {/* 3. ROOM DETAILS POPUP */}
        {roomModalOpen && currentRoom && (
          <div
            className="modal-backdrop"
            onClick={() => setRoomModalOpen(false)}
            onWheel={(e) =>
              handleModalWheel(e, currentRoom.images?.length || 0, setRoomSlideIdx)
            }
          >
            <section className="modal room-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="close"
                onClick={() => setRoomModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>

              <div className="room-grid">
                <div className="details room-details">
                  <p className="eyebrow">{currentRoom.floor?.toUpperCase()} FLOOR</p>
                  <h2>{currentRoom.name}</h2>

                  <label>Description</label>
                  <p className="editable-copy">{currentRoom.description || '—'}</p>

                  <label>Directions</label>
                  <p className="editable-copy">{currentRoom.directions || '—'}</p>
                </div>

                <div className="slideshow">
                  {currentRoom.images && currentRoom.images.length > 0 ? (
                    <>
                      <SmartMapImage
                        className="slide-image"
                        src={currentRoom.images[roomSlideIdx]}
                        alt={`${currentRoom.name} ${roomSlideIdx + 1}`}
                        onClick={(e) =>
                          handleSlideImageClick(e, currentRoom.images.length, setRoomSlideIdx)
                        }
                      />
                      <div className="slide-dots">
                        {currentRoom.images.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            aria-label={`Show photo ${i + 1}`}
                            className={roomSlideIdx === i ? 'active' : ''}
                            onClick={() => setRoomSlideIdx(i)}
                          />
                        ))}
                      </div>
                      <p className="image-help">Click left/right side of image or use arrow keys</p>
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