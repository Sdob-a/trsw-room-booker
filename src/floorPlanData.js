// src/floorPlanData.js - Spatial layout and floor plans for TRSW Buildings
// Clean schematic layout: Only school classrooms, studios, labs and offices (toilets, stairs, and corridors removed)
// Senior School has Ground Floor and First Floor only. Heads of Houses is on Ground Floor.

export const BUILDINGS_CONFIG = [
  {
    id: 'kensington',
    name: 'Kensington Building',
    subtitle: 'Lower School (Classrooms K1 - K19, Music, Science, IT, Art & Food)',
    blueprintImage: '/floorplans/image7.png',
    floors: [
      {
        id: 'ground',
        name: 'Ground Floor',
        description: 'Music Suites, Science Lab 1, IT Suite, Food Tech, Art Studio, Leadership & Meeting Rooms',
        topRow: [
          { roomId: 'K1', label: 'Room K1', sublabel: 'Music Suite 1', type: 'Music & Audio', span: 1.1, icon: 'music' },
          { roomId: 'K-PRAC1', label: 'Practice 1', sublabel: 'Music Practice', type: 'Music', span: 1 },
          { roomId: 'K-PRAC2', label: 'Practice 2', sublabel: 'Music Practice', type: 'Music', span: 1 },
          { roomId: 'K2', label: 'Room K2', sublabel: 'Music Suite 2', type: 'Music & Audio', span: 1.1, icon: 'music' },
          { roomId: 'K4', label: 'Room K4', sublabel: 'Classroom', type: 'General Classroom', span: 1 },
          { roomId: 'K-SCI-PREP1', label: 'Science Prep 1', sublabel: 'Prep Area', type: 'Specialist Workshop', span: 1 },
          { roomId: 'K-LEADER', label: 'Leadership Office', sublabel: 'SLT Office', type: 'Staff Office', span: 1.1 },
          { roomId: 'K6', label: 'Room K6', sublabel: 'Science Laboratory', type: 'Science Lab', span: 1.2, icon: 'flask' },
          { roomId: 'K8', label: 'Room K8', sublabel: 'Food Technology', type: 'Specialist Workshop', span: 1.2, icon: 'utensils' },
          { roomId: 'K-FOOD-PREP', label: 'Food Prep', sublabel: 'Ingredients Store', type: 'Specialist Workshop', span: 1 }
        ],
        bottomRow: [
          { roomId: 'K3', label: 'Room K3', sublabel: 'Classroom', type: 'General Classroom', span: 2 },
          { roomId: 'K5', label: 'Room K5', sublabel: 'Classroom', type: 'General Classroom', span: 2 },
          { roomId: 'K-MEET', label: 'Meeting Room', sublabel: 'Kensington Meeting', type: 'Meeting / Conference', span: 2 },
          { roomId: 'K-RECEPT', label: 'Reception & Resources', sublabel: 'Staff Resources Hub', type: 'Staff Office', span: 2.4 },
          { roomId: 'K7', label: 'Room K7', sublabel: 'IT Computer Suite', type: 'IT Computer Suite', span: 2.8, icon: 'monitor' },
          { roomId: 'K9', label: 'Room K9', sublabel: 'Classroom', type: 'General Classroom', span: 2 },
          { roomId: 'K10', label: 'Room K10', sublabel: 'Art Studio', type: 'Art & Design', span: 2.6, icon: 'palette' }
        ]
      },
      {
        id: 'first',
        name: 'First Floor',
        description: 'General Classrooms K11 - K19, Science Lab 2, Pastoral, Mentoring & Staff Work Room',
        topRow: [
          { roomId: 'K11', label: 'Room K11', sublabel: 'Classroom', type: 'General Classroom', span: 2 },
          { roomId: 'K12', label: 'Room K12', sublabel: 'Classroom', type: 'General Classroom', span: 2 },
          { roomId: 'K14', label: 'Room K14', sublabel: 'Classroom', type: 'General Classroom', span: 2 },
          { roomId: 'K-SCI-PREP2', label: 'Science Prep 2', sublabel: 'Prep Area', type: 'Specialist Workshop', span: 1.8 },
          { roomId: 'K-OFFICE1', label: 'Office 1 & 2', sublabel: 'Staff Office', type: 'Staff Office', span: 2 },
          { roomId: 'K15', label: 'Room K15', sublabel: 'Science Laboratory', type: 'Science Lab', span: 2.8, icon: 'flask' },
          { roomId: 'K17', label: 'Room K17', sublabel: 'Classroom', type: 'General Classroom', span: 2.2 }
        ],
        bottomRow: [
          { roomId: 'K13', label: 'Room K13', sublabel: 'Classroom', type: 'General Classroom', span: 2 },
          { roomId: 'K-MENTOR', label: 'Mentoring Room', sublabel: 'Student Mentoring', type: 'Meeting / Well-being', span: 2 },
          { roomId: 'K-PASTORAL', label: 'Pastoral Office', sublabel: 'Pastoral Support', type: 'Staff Office', span: 2 },
          { roomId: 'K-WORK', label: 'Kensington Work Room', sublabel: 'Staff PPA & Resources', type: 'Staff Work Room', span: 2.6 },
          { roomId: 'K16', label: 'Room K16', sublabel: 'Classroom', type: 'General Classroom', span: 2 },
          { roomId: 'K18', label: 'Room K18', sublabel: 'Classroom', type: 'General Classroom', span: 2 },
          { roomId: 'K19', label: 'Room K19', sublabel: 'Classroom', type: 'General Classroom', span: 2.2 }
        ]
      }
    ]
  },
  {
    id: 'holyrood',
    name: 'Holyrood Building',
    subtitle: 'Sixth Form & Senior Study Centre (H1 - H5, Library, SEND & Work Room)',
    blueprintImage: '/floorplans/image6.png',
    floors: [
      {
        id: 'ground',
        name: 'Ground Floor',
        description: 'Classrooms H1 - H2, Sixth Form Library & Study Hub',
        topRow: [
          { roomId: 'H1', label: 'Room H1', sublabel: 'Classroom', type: 'General Classroom', span: 3 },
          { roomId: 'H2', label: 'Room H2', sublabel: 'Classroom', type: 'General Classroom', span: 3 },
          { roomId: 'H3', label: 'H3 Library', sublabel: 'Sixth Form Library & Study Hub', type: 'Library / Resource Centre', span: 6, icon: 'book' }
        ],
        bottomRow: []
      },
      {
        id: 'first',
        name: 'First Floor',
        description: 'Classrooms H4 - H5, Domestic Office, SEND Hub, Staff Work Room & Counselling Suite',
        topRow: [
          { roomId: 'H4', label: 'Room H4', sublabel: 'Classroom', type: 'General Classroom', span: 2 },
          { roomId: 'H5', label: 'Room H5', sublabel: 'Classroom', type: 'General Classroom', span: 2 },
          { roomId: 'H-DOMESTIC', label: 'Domestic Office', sublabel: 'Facilities Desk', type: 'Staff Office', span: 2 },
          { roomId: 'H-SEND', label: 'SEND Office', sublabel: 'SEND Intervention', type: 'Staff Office', span: 2 },
          { roomId: 'H-WORK', label: 'Holyrood Work Room', sublabel: 'Staff PPA & Work Room', type: 'Staff Work Room', span: 2.5 },
          { roomId: 'H-COUNSEL', label: 'Counselling Room', sublabel: 'Private Consultation', type: 'Meeting / Well-being', span: 2 }
        ],
        bottomRow: []
      }
    ]
  },
  {
    id: 'senior-school',
    name: 'Senior School Building',
    subtitle: 'Senior Site (Victoria Hall, Theatre, MFL, English Suites E1-E7, Science Labs 1-6 & Com 1-2)',
    blueprintImage: '/floorplans/site_plan_p1_1_Img1.jpg',
    floors: [
      {
        id: 'ground',
        name: 'Ground Floor',
        description: 'Victoria Hall, Theatre, MFL 1-3, Computer Suites 1 & 2, Science Lab 1, Sixth Form, Heads of Houses & Leadership',
        topRow: [
          { roomId: 'SR-HEAD', label: 'Head of School', sublabel: 'Executive Office', type: 'Staff Office', span: 1 },
          { roomId: 'SR-PA', label: 'P.A. to Head', sublabel: 'PA Office', type: 'Staff Office', span: 1 },
          { roomId: 'SR-RECEPT', label: 'Senior Reception', sublabel: 'Main Visitors', type: 'Staff Office', span: 1 },
          { roomId: 'VIC-HALL', label: 'Victoria Hall', sublabel: 'Assembly & Exam Hall (Cap 300)', type: 'Assembly Hall', span: 1.5, icon: 'hall' },
          { roomId: 'SR-MEET', label: 'Meeting Room', sublabel: 'Senior Meeting', type: 'Meeting / Conference', span: 1 },
          { roomId: 'SR-ADMISSIONS', label: 'Admissions', sublabel: 'Admissions Hub', type: 'Staff Office', span: 1 },
          { roomId: 'SR-WELLBEING', label: 'Wellbeing Office', sublabel: 'Student Care', type: 'Meeting / Well-being', span: 1 },
          { roomId: 'SR-VP', label: 'VP Office', sublabel: 'Vice Principal', type: 'Staff Office', span: 1 },
          { roomId: 'HOH-OFFICE', label: 'Heads of Houses', sublabel: 'House Leaders Hub', type: 'Staff Office', span: 1 }
        ],
        bottomRow: [
          { roomId: 'SIXTH-FORM', label: 'Sixth Form Study', sublabel: 'Study Hub (Cap 60)', type: 'Library / Resource Centre', span: 1.3 },
          { roomId: 'MFL3', label: 'Room MFL 3', sublabel: 'Languages Room', type: 'General Classroom', span: 1 },
          { roomId: 'MFL2', label: 'Room MFL 2', sublabel: 'Languages Room', type: 'General Classroom', span: 1 },
          { roomId: 'MFL1', label: 'Room MFL 1', sublabel: 'Languages Room', type: 'General Classroom', span: 1 },
          { roomId: 'THEATRE', label: 'School Theatre', sublabel: 'Drama & Performance (Cap 180)', type: 'Drama / Performance', span: 1.5, icon: 'music' },
          { roomId: 'COM2', label: 'Room Com 2', sublabel: 'IT Computer Suite 2', type: 'IT Computer Suite', span: 1 },
          { roomId: 'COM1', label: 'Room Com 1', sublabel: 'IT Computer Suite 1', type: 'IT Computer Suite', span: 1 },
          { roomId: 'LAB1', label: 'Science Lab 1', sublabel: 'Biology & General Lab', type: 'Science Lab', span: 1.1, icon: 'flask' }
        ]
      },
      {
        id: 'first',
        name: 'First Floor',
        description: 'English Suites E1 - E7, Science Labs 2 - 6, Prep Rooms, Louise Hall (VP Office), Senior Staff Room & Administration',
        rows: [
          {
            label: 'English Suites, Louise Hall (VP) & Staff Hub',
            rooms: [
              { roomId: 'STAFF-ROOM', label: 'Senior Staff Room', sublabel: 'Staff Common Room (Cap 50)', type: 'Staff Work Room', span: 3 },
              { roomId: 'E1', label: 'Room E1', sublabel: 'English Suite', type: 'General Classroom', span: 2 },
              { roomId: 'E2', label: 'Room E2', sublabel: 'English Suite', type: 'General Classroom', span: 2 },
              { roomId: 'E3', label: 'Room E3', sublabel: 'English Suite', type: 'General Classroom', span: 2 },
              { roomId: 'E4', label: 'Room E4', sublabel: 'English Suite', type: 'General Classroom', span: 2 },
              { roomId: 'E5', label: 'Room E5', sublabel: 'English Suite', type: 'General Classroom', span: 2 },
              { roomId: 'E6', label: 'Room E6', sublabel: 'English Suite', type: 'General Classroom', span: 2 },
              { roomId: 'E7', label: 'Room E7', sublabel: 'English Suite', type: 'General Classroom', span: 2 },
              { roomId: 'LH', label: 'Louise Hall (VP)', sublabel: 'Vice Principal Office', type: 'Staff Office', span: 2 },
              { roomId: 'ORGAN-LOFT', label: 'Organ Loft', sublabel: 'Historic Installation', type: 'Specialist Workshop', span: 2 },
              { roomId: 'EXAM-STORE', label: 'Exam Store', sublabel: 'JCQ Secure Storage', type: 'Staff Office', span: 2 }
            ]
          },
          {
            label: 'Science Laboratories & Specialist Prep Facilities',
            rooms: [
              { roomId: 'LAB5', label: 'Science Lab 5', sublabel: 'Physics Laboratory', type: 'Science Lab', span: 2.5, icon: 'flask' },
              { roomId: 'CHEM-PREP', label: 'Chem Prep', sublabel: 'Chemistry Prep Area', type: 'Specialist Workshop', span: 2 },
              { roomId: 'LAB4', label: 'Science Lab 4', sublabel: 'Chemistry Laboratory', type: 'Science Lab', span: 2.5, icon: 'flask' },
              { roomId: 'LAB6', label: 'Science Lab 6', sublabel: 'General Science Lab', type: 'Science Lab', span: 2.5, icon: 'flask' },
              { roomId: 'LAB3', label: 'Science Lab 3', sublabel: 'Biology Lab', type: 'Science Lab', span: 2.5, icon: 'flask' },
              { roomId: 'PREP-2', label: 'Science Prep', sublabel: 'Technician Prep Hub', type: 'Specialist Workshop', span: 2 },
              { roomId: 'LAB2', label: 'Science Lab 2', sublabel: 'Chemistry Lab', type: 'Science Lab', span: 2.5, icon: 'flask' }
            ]
          },
          {
            label: 'School Administration, IT Infrastructure & Faculty Offices',
            rooms: [
              { roomId: 'HR-OFFICE', label: 'HR Office', sublabel: 'Personnel Desk', type: 'Staff Office', span: 2 },
              { roomId: 'FINANCE-OFFICE', label: 'Finance Office', sublabel: 'Accounts & Fees', type: 'Staff Office', span: 2 },
              { roomId: 'SERVER-ROOM', label: 'Server Room', sublabel: 'Network Core', type: 'Staff Office', span: 2 },
              { roomId: 'IT-OFFICE', label: 'IT Office', sublabel: 'Technician Hub', type: 'Staff Office', span: 2 },
              { roomId: 'ADMIN-OFFICE', label: 'Administration', sublabel: 'Senior Office', type: 'Staff Office', span: 2.4 },
              { roomId: 'STORE-1', label: 'Store Room', sublabel: 'Resource Store', type: 'Staff Office', span: 1.8 },
              { roomId: 'OFFICE-CH', label: 'C Howells Office', sublabel: 'Staff Office', type: 'Staff Office', span: 2 },
              { roomId: 'FD-OFFICE', label: 'FD Office', sublabel: 'Faculty Desk', type: 'Staff Office', span: 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'art-design',
    name: 'Art & Design Building',
    subtitle: 'Specialist Creative Studios (Ground Floor DT & Workshops, First Floor Art Studios 1-3)',
    blueprintImage: '/floorplans/site_plan_p4_1_Img1.jpg',
    floors: [
      {
        id: 'ground',
        name: 'Ground Floor (DT)',
        description: 'Design & Technology CAD Suite, Modeling Room, Main Heavy Workshop & Technician Office',
        topRow: [
          { roomId: 'DT-CAD', label: 'CAD Design Suite', sublabel: '26 CAD Workstations & 3D Printers', type: 'IT Computer Suite', span: 4.5, icon: 'monitor' },
          { roomId: 'DT-MAIN', label: 'DT Classroom', sublabel: 'Design & Modeling Room', type: 'Specialist Workshop', span: 4.5, icon: 'palette' }
        ],
        bottomRow: [
          { roomId: 'DT-WORKSHOP', label: 'Main DT Workshop', sublabel: 'Heavy Machinery & Benches', type: 'Specialist Workshop', span: 6 },
          { roomId: 'DT-OFFICE', label: 'Workshop Office', sublabel: 'Technician Office & Blade Store', type: 'Staff Office', span: 3 }
        ]
      },
      {
        id: 'first',
        name: 'First Floor (Art)',
        description: 'Fine Art Studios 1 - 3, Pottery Wheels, Kiln Access & Natural Light Skylights',
        topRow: [
          { roomId: 'ART1', label: 'Art Studio 1', sublabel: 'Fine Art & Painting Studio', type: 'Art & Design', span: 4.5, icon: 'palette' },
          { roomId: 'ART2', label: 'Art Studio 2', sublabel: 'Pottery, Ceramics & Kiln Hub', type: 'Art & Design', span: 4.5, icon: 'palette' }
        ],
        bottomRow: [
          { roomId: 'ART3', label: 'Art Studio 3', sublabel: 'Sculpture & Mixed Media Studio', type: 'Art & Design', span: 9, icon: 'palette' }
        ]
      }
    ]
  },
  {
    id: 'sports',
    name: 'Sports & Venues',
    subtitle: 'Sports Hall & All-Weather Astro Turf Pitches',
    floors: [
      {
        id: 'ground',
        name: 'Sports Facilities',
        description: 'Indoor Multi-Sport Arena & Floodlit All-Weather Astro Turf',
        topRow: [
          { roomId: 'SPORTS-HALL', label: 'Main Sports Hall', sublabel: 'Indoor Multi-Sport Courts (Cap 200)', type: 'Sports & PE', span: 6, icon: 'sports' },
          { roomId: 'ASTRO', label: 'All-Weather Astro Turf', sublabel: 'Full Size Pitch & Floodlit Training (Cap 150)', type: 'Sports & PE', span: 6, icon: 'sports' }
        ],
        bottomRow: []
      }
    ]
  }
];
