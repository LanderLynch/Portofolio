// ✰ webmeji ✰
// little creatures that walk around your website =w=b
// inspired by shimeji, originally by Lars de Rooij
// not affiliated with any other shimeji projects
// last updated: 27 january 2026
// homepage: webmeji.neocities.org
//
// this file defines:
// - which webmeji spawn
// - which actions are allowed
// - what animations they have
// - how often actions occur

const WEBMEJI_BASE_URL = new URL("./", document.currentScript?.src || window.location.href).href;

function resolveWebmejiFrames(config) {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => {
      if (!value || typeof value !== "object" || !Array.isArray(value.frames)) {
        return [key, value];
      }

      return [
        key,
        {
          ...value,
          frames: value.frames.map((frame) => new URL(frame, WEBMEJI_BASE_URL).href)
        }
      ];
    })
  );
}

// spawning setup --------------------------------------------------
// define which creatures spawn on the page. remove any unwanted ones.
// each id must be unique
// if two of them overlap and pet and dragging interactions happen, only the one stated here last will get interacted with
window.SPAWNING = [
  { id: 'webmeji-furina', config: 'FURINA_CONFIG' }
];

// base shimeji config ----------------------------------------------
// all configs should have same actions, but allowances can differ
window.SHIMEJI_CONFIG = {
  // pet   = hover animation (hard to see on mobile)
  // drag  = click or touch to pick up
  // top / left / right allow edge interactions
  // remove whichever you don't want, the only exceptions is that bottom must always be enabled
  ALLOWANCES: ['pet', 'drag', 'bottom'],

  // movement and physics -------------------------------------------
  // values are pixels movements per frame
  walkspeed: 50,
  fallspeed: 200,
  jumpspeed: 150,

  // time in ms before standing back up after falling
  gettingupspeed: 2000,

  // common idle and movement animations on the bottom edge ---------
  // these are the most frequently used actions
  // interval = time between frames (ms)
  // loops = how many times the frame sequence repeats
  // randomizeDuration sets random timeframe for actions, tune min and max to desired length
  walk: {
    frames: ["shimeji/shime1.png", "shimeji/shime2.png", "shimeji/shime3.png", "shimeji/shime2.png"],
    interval: 175, loops: 6},

  stand: {
    frames: ["shimeji/shime1.png"],
    interval: 200, loops: 1},

  sit: {
    frames: ["shimeji/shime11.png"],
    interval: 1000, loops: 1,
    randomizeDuration: true, min: 3000, max: 11000},

  spin: {
    frames: ["shimeji/shime1.png"],
    interval: 150, loops: 3},

  dance: {
    frames: ["shimeji/shime5.png", "shimeji/shime6.png", "shimeji/shime1.png"],
    interval: 200, loops: 5},

  trip: {
    frames: ["shimeji/shime20.png", "shimeji/shime21.png", "shimeji/shime21.png", "shimeji/shime20.png", "shimeji/shime21.png", "shimeji/shime21.png"],
    interval: 250, loops: 1},

  // behavior flow control ------------------------------------------
  // prevents awkward transitions like dancing immediately after sitting
  forcewalk: { // uses the walking frames, by default happens after tripping and spinning
    loops: 6},

  forcethink: { // by default happens after dancing
    frames: ["shimeji/shime27.png", "shimeji/shime28.png"],
    interval: 500, loops: 2},

  // user interaction animations ------------------------------------
  pet: {
    frames: ["shimeji/shime15.png", "shimeji/shime16.png", "shimeji/shime17.png"],
    interval: 75},

  drag: {
    frames: ["shimeji/shime5.png", "shimeji/shime7.png", "shimeji/shime5.png", "shimeji/shime6.png", "shimeji/shime8.png", "shimeji/shime6.png"],
    interval: 210},

  // falling and recovery animations --------------------------------
  falling: {
    frames: ["shimeji/shime4.png"],
    interval: 200, loops: 2},

  fallen: {
    frames: ["shimeji/shime19.png", "shimeji/shime18.png"],
    interval: 250, loops: 1},

  // action frequency and decision logic ----------------------------
  // anytime an action needs to be chosen, it randomly picks one of these
  // thus, having an action in here more than others, makes it happen more
  ORIGINAL_ACTIONS: [
    'walk','walk','walk','walk','walk','walk',
    'walk','walk','walk','walk','walk','walk',
    'spin','spin','spin',
    'sit','sit',
    'dance','dance',
    'trip'
  ],

  EDGE_ACTIONS: [
    'hang','hang',
    'climb','climb','climb','climb',
    'fall','fall'
  ],

  // when chosing an action on the bottom, it has this change to jump to an edge (if allowed)
  // this is standalone from the other action select
  JUMP_CHANCE: 0.05, // below 0 = never jump; above 1 = jump almost always

  // edge-specific animations ---------------------------------------
  climbSide: {
    frames: ["shimeji/shime13.png", "shimeji/shime14.png"],
    interval: 200, loops: 2},

  hangstillSide: {
    frames: ["shimeji/shime12.png"],
    interval: 200, loops: 2,
    randomizeDuration: true, min: 3000, max: 11000},

  climbTop: {
    frames: ["shimeji/shime24.png", "shimeji/shime25.png"],
    interval: 200, loops: 6},

  hangstillTop: {
    frames: ["shimeji/shime23.png"],
    interval: 200, loops: 2,
    randomizeDuration: true, min: 3000, max: 11000},

  jump: {
    frames: ["shimeji/shime22.png"],
    interval: 200}
};


// second config ----------------------------------------------------

window.FURINA_CONFIG = {
  // pet   = hover animation (hard to see on mobile)
  // drag  = click or touch to pick up
  // top / left / right allow edge interactions
  // remove whichever you don't want, the only exceptions is that bottom must always be enabled
  ALLOWANCES: ['pet', 'drag', 'bottom', 'top', 'left', 'right'],

  // movement and physics -------------------------------------------
  // values are pixels movements per frame
  walkspeed: 50,
  fallspeed: 150,
  jumpspeed: 200,

  // time in ms before standing back up after falling
  gettingupspeed: 3500,

  // common idle and movement animations on the bottom edge ---------
  // these are the most frequently used actions
  // interval = time between frames (ms)
  // loops = how many times the frame sequence repeats
  // randomizeDuration sets random timeframe for actions, tune min and max to desired length
  walk: {
    frames: ["Furina/shime1.png", "Furina/shime2.png", "Furina/shime3.png", "Furina/shime2.png"], 
    interval: 175, loops: 6},

  run: {
    frames: ["Furina/shime1.png", "Furina/shime2.png", "Furina/shime1.png", "Furina/shime3.png"],
    interval: 60, loops: 4},

  dash: {
    frames: ["Furina/shime1.png", "Furina/shime2.png", "Furina/shime1.png", "Furina/shime3.png"],
    interval: 40, loops: 3},

  chaseMouse: {
    frames: ["Furina/shime1.png", "Furina/shime2.png", "Furina/shime1.png", "Furina/shime3.png"],
    interval: 40, loops: 1},

  stand: {
    frames: ["Furina/shime1.png"], 
    interval: 1000, loops: 1},

  sit: {
    frames: ["Furina/shime11.png", "Furina/shime11v2.png", "Furina/shime11v3.png"], 
    interval: 1000, loops: 1,
    randomizeDuration: true, min: 3000, max: 11000},

  sitAndFaceMouse: {
    frames: ["Furina/shime11.png", "Furina/shime11v2.png", "Furina/shime11v3.png"],
    interval: 1000, loops: 1,
    randomizeDuration: true, min: 1800, max: 3600},

  sitAndSpinHead: {
    frames: [
      "Furina/shime26.png",
      "Furina/shime15.png",
      "Furina/shime27.png",
      "Furina/shime16.png",
      "Furina/shime28.png",
      "Furina/shime17.png",
      "Furina/shime29.png",
      "Furina/shime15.png",
      "Furina/shime27.png",
      "Furina/shime16.png",
      "Furina/shime28.png",
      "Furina/shime17.png",
      "Furina/shime29.png",
      "Furina/shime26.png",
      "Furina/shime1.png"
    ],
    interval: 150, loops: 1},

  sitAndLookUp: {
    frames: ["Furina/shime11.png", "Furina/shime11v2.png", "Furina/shime11v3.png", "Furina/shime11v2.png"],
    interval: 160, loops: 1,
    randomizeDuration: true, min: 1600, max: 2600},

  sitWhileDanglingLegs: {
    frames: [
      "Furina/shime31.png",
      "Furina/shime31v2.png",
      "Furina/shime32.png",
      "Furina/shime33.png",
      "Furina/shime32.png",
      "Furina/shime33.png",
      "Furina/shime32.png",
      "Furina/shime33.png",
      "Furina/shime32.png",
      "Furina/shime31v2.png",
      "Furina/shime30.png"
    ],
    interval: 180, loops: 1},

  lieDown: {
    frames: [
      "Furina/shime20.png",
      "Furina/shime20v2.png",
      "Furina/shime20v3.png",
      "Furina/shime20v4.png",
      "Furina/shime20v5.png",
      "Furina/shime20v6.png",
      "Furina/shime20v5.png",
      "Furina/shime20v6.png",
      "Furina/shime20v5.png",
      "Furina/shime20v6.png",
      "Furina/shime20v5.png",
      "Furina/shime20v6.png",
      "Furina/shime20v5.png",
      "Furina/shime20v6.png",
      "Furina/shime20v5.png",
      "Furina/shime20v6.png",
      "Furina/shime20v5.png",
      "Furina/shime20v6.png",
      "Furina/shime20v5.png",
      "Furina/shime20v6.png",
      "Furina/shime20v3.png",
      "Furina/shime20v2.png",
      "Furina/shime20.png"
    ],
    interval: 180, loops: 1,
    randomizeDuration: true, min: 3200, max: 6800},

  crawlAlongFloor: {
    frames: [
      "Furina/shime20.png",
      "Furina/shime20.png",
      "Furina/shime21.png",
      "Furina/shime21.png",
      "Furina/shime21.png"
    ],
    interval: 160, loops: 2},

  spin: {
    frames: ["Furina/shime1.png"], 
    interval: 150, loops: 1},

  dance: {
    frames: ["Furina/shime5.png", "Furina/shime6.png", "Furina/shime5.png", "Furina/shime6.png"], 
    interval: 120, loops: 2},

  trip: {
    frames: ["Furina/shime19.png", "Furina/shime18.png", "Furina/shime20.png", "Furina/shime20.png", "Furina/shime19.png"], 
    interval: 250, loops: 1},

  // behavior flow control ------------------------------------------
  // prevents awkward transitions like dancing immediately after sitting
  forcewalk: { // uses the walking frames
    loops: 6},

  forcethink: {
    frames: ["Furina/shime27.png", "Furina/shime28.png"], 
    interval: 500, loops: 2},

  // user interaction animations ------------------------------------
  pet: {
    frames: ["Furina/shime15.png", "Furina/shime16.png", "Furina/shime17.png"], 
    interval: 400},

  drag: {
    frames: ["Furina/shime9.png", "Furina/shime7.png", "Furina/shime5.png", "Furina/shime6v2.png", "Furina/shime10.png", "Furina/shime8.png"], 
    interval: 210},

  // falling and recovery animations --------------------------------
  falling: {
    frames: ["Furina/shime4.png", "Furina/shime4v2.png"], 
    interval: 200, loops: 2},

  fallen: {
    frames: ["Furina/shime18.png", "Furina/shime19.png"], 
    interval: 250, loops: 1},

  // action frequency and decision logic ----------------------------
  // anytime an action needs to be chosen, it randomly picks one of these
  // thus, having an action in here more than others, makes it happen more
  ORIGINAL_ACTIONS: [
    'stand','stand','stand',
    'walk','walk','walk','walk',
    'run','run',
    'sit','sit','sitAndFaceMouse',
    'sitAndSpinHead',
    'sitWhileDanglingLegs',
    'lieDown',
    'crawlAlongFloor',
    'chaseMouse'
  ],

  SIT_DOWN_NEXT_ACTIONS: [
    { name: 'sitWhileDanglingLegs', weight: 100 },
    { name: 'lieDown', weight: 100 }
  ],

  SIT_FACE_NEXT_ACTIONS: [
    { name: 'sitAndFaceMouse', weight: 100 },
    { name: 'sitAndSpinHead', weight: 100 },
    { name: 'sitWhileDanglingLegs', weight: 100 },
    { name: 'sitAndLookUp', weight: 100 }
  ],

  LIE_DOWN_NEXT_ACTIONS: [
    { name: 'sit', weight: 100 },
    { name: 'crawlAlongFloor', weight: 100 }
  ],

  EDGE_ACTIONS: [
    'hang','hang',
    'climb','climb','climb','climb','climb',
    'fall'
  ],

  // when chosing an action on the bottom, it has this change to jump to an edge (if allowed)
  // this is standalone from the other action select
  JUMP_CHANCE: 0.1, // below 0 = never jump; above 1 = jump almost always

  // edge-specific animations ---------------------------------------
  climbSide: {
    frames: ["Furina/shime14.png", "Furina/shime14.png", "Furina/shime12.png", "Furina/shime13.png", "Furina/shime13.png", "Furina/shime13.png", "Furina/shime12.png", "Furina/shime14.png"], 
    interval: 120, loops: 2},

  hangstillSide: {
    frames: ["Furina/shime13.png"], 
    interval: 200, loops: 2,
    randomizeDuration: true, min: 3000, max: 11000},

  climbTop: {
    frames: ["Furina/shime25.png", "Furina/shime25.png", "Furina/shime23.png", "Furina/shime24.png", "Furina/shime24.png", "Furina/shime24.png", "Furina/shime23.png", "Furina/shime25.png"], 
    interval: 120, loops: 3},

  hangstillTop: {
    frames: ["Furina/shime23.png"], 
    interval: 200, loops: 2,
    randomizeDuration: true, min: 3000, max: 11000},

  jump: {
    frames: ["Furina/shime22.png"], 
    interval: 200}
};

window.SHIMEJI_CONFIG = resolveWebmejiFrames(window.SHIMEJI_CONFIG);
window.FURINA_CONFIG = resolveWebmejiFrames(window.FURINA_CONFIG);
