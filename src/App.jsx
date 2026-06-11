import { useState, useRef, useEffect } from "react";

// ── Palette ──────────────────────────────────────────────────────────────────
const AVS = {
  bg:       "#0E0D14",
  surface:  "#161420",
  card:     "#1D1B28",
  card2:    "#221F30",
  border:   "#2E2A40",
  borderLt: "#3A3555",
  burgundy: "#6F263D",
  burLight: "#9B3455",
  steel:    "#236192",
  steelLt:  "#3880B8",
  silver:   "#A2AAAD",
  silverDk: "#6B7280",
  white:    "#F0EEF5",
  dim:      "#7A748F",
  green:    "#2ECC71",
  yellow:   "#E6B800",
  orange:   "#E67E22",
  red:      "#E74C3C",
  purple:   "#8B5CF6",
  teal:     "#14B8A6",
};

const STORE_COLORS = [
  { main: "#C0392B", dim: "#7B1A11" },
  { main: "#E67E22", dim: "#7D4210" },
  { main: "#27AE60", dim: "#145A32" },
  { main: "#8E44AD", dim: "#4A235A" },
  { main: "#16A085", dim: "#0B5345" },
  { main: "#D4AC0D", dim: "#7D6608" },
];

const NOTE_TYPES = [
  { id: "emergency",  label: "Emergency Fix",        color: AVS.red,    icon: "🚨" },
  { id: "pm",         label: "Preventive Maint.",    color: AVS.teal,   icon: "🔧" },
  { id: "rack",       label: "Rack Issue",           color: AVS.orange, icon: "⚙" },
  { id: "defrost",    label: "Defrost Adj.",         color: "#5DADE2",  icon: "❄" },
  { id: "sensor",     label: "Sensor / Wiring",      color: AVS.purple, icon: "📡" },
  { id: "door",       label: "Door / Gasket",        color: AVS.yellow, icon: "🚪" },
  { id: "ambient",    label: "Ambient / HVAC",       color: "#A8D8A8",  icon: "🌡" },
  { id: "humidity",   label: "Humidity Issue",       color: "#74B9FF",  icon: "💧" },
  { id: "resolved",   label: "Resolved / Verified",  color: AVS.green,  icon: "✓" },
  { id: "observation",label: "Observation",          color: AVS.dim,    icon: "👁" },
];

const URGENCY = {
  Today:        { color: AVS.red,    bg: "#3A0E0E", border: "#6B1A1A", label: "TODAY" },
  "This Week":  { color: AVS.orange, bg: "#3A2000", border: "#6B3800", label: "THIS WEEK" },
  "Watch List": { color: AVS.steelLt,bg: "#0D2233", border: "#1A4060", label: "WATCH" },
  Resolved:     { color: AVS.green,  bg: "#0A2A14", border: "#145A2A", label: "RESOLVED" },
};

const TYPE_ICON  = { Alarm:"⚠", Trending:"↗", Defrost:"❄", Compressor:"⚙" };
const TYPE_COLOR = { Alarm: AVS.red, Trending: AVS.orange, Defrost:"#5DADE2", Compressor: AVS.purple };

// ── Store 89 circuits ─────────────────────────────────────────────────────────
const S89_CIRCUITS = [
  { id:"1A",  name:"1A GFBX 1-1",    system:"1", type:"Freezer",      area:"Back Room",    setpointLow:-5,  setpointHigh:12, currentTemp:3,   defrostOk:true,  status:"ok"   },
  { id:"1B",  name:"1B RIFF 1-2",    system:"1", type:"Glass Door",   area:"Aisle 17",     setpointLow:-5,  setpointHigh:10, currentTemp:4,   defrostOk:true,  status:"ok"   },
  { id:"1C",  name:"1C CFN-BK4 1-3", system:"1", type:"Bunker",       area:"Bakery",       setpointLow:10,  setpointHigh:20, currentTemp:16,  defrostOk:true,  status:"warn" },
  { id:"1D",  name:"1D CFN-MT4 1-4", system:"1", type:"Bunker",       area:"Meat Right",   setpointLow:28,  setpointHigh:38, currentTemp:32,  defrostOk:true,  status:"ok"   },
  { id:"1E",  name:"1E RIIC 1-5",    system:"1", type:"Glass Door",   area:"Aisle 17",     setpointLow:-10, setpointHigh:0,  currentTemp:-3,  defrostOk:true,  status:"ok"   },
  { id:"1F",  name:"1F RIIC 1-6",    system:"1", type:"Glass Door",   area:"Aisle 17",     setpointLow:-10, setpointHigh:2,  currentTemp:-4,  defrostOk:true,  status:"ok"   },
  { id:"1FA", name:"1FA RIIC 1-7",   system:"1", type:"End Cap",      area:"Aisle 17",     setpointLow:-14, setpointHigh:2,  currentTemp:-2,  defrostOk:true,  status:"ok"   },
  { id:"2A",  name:"2A BFBX 1-1",    system:"2", type:"Freezer",      area:"Bakery Back",  setpointLow:-5,  setpointHigh:12, currentTemp:6,   defrostOk:false, status:"warn" },
  { id:"2B",  name:"2B RIFF 1-2",    system:"2", type:"Glass Door",   area:"Aisle 17",     setpointLow:-5,  setpointHigh:10, currentTemp:5,   defrostOk:true,  status:"ok"   },
  { id:"2Ba", name:"2Ba RIFF 1-3",   system:"2", type:"End Cap",      area:"Aisle 17",     setpointLow:-6,  setpointHigh:12, currentTemp:-1,  defrostOk:true,  status:"ok"   },
  { id:"2C",  name:"2C RIFF 1-4",    system:"2", type:"Glass Door",   area:"Aisle 16",     setpointLow:-5,  setpointHigh:10, currentTemp:7,   defrostOk:true,  status:"ok"   },
  { id:"2D",  name:"2D RIFF 1-5",    system:"2", type:"Glass Door",   area:"Aisle 16",     setpointLow:-5,  setpointHigh:12, currentTemp:8,   defrostOk:true,  status:"ok"   },
  { id:"2E",  name:"2E RIFF 1-6",    system:"2", type:"Glass Door",   area:"Aisle 16",     setpointLow:-5,  setpointHigh:10, currentTemp:0,   defrostOk:true,  status:"ok"   },
  { id:"2Ea", name:"2Ea RIFF 1-7",   system:"2", type:"End Cap",      area:"Aisle 16",     setpointLow:29,  setpointHigh:42, currentTemp:33,  defrostOk:true,  status:"warn" },
  { id:"2F",  name:"2F RIFF 1-8",    system:"2", type:"Glass Door",   area:"Meat Right",   setpointLow:-5,  setpointHigh:12, currentTemp:5,   defrostOk:true,  status:"ok"   },
  { id:"2G",  name:"2G DFBX 1-9",    system:"2", type:"Freezer",      area:"Deli",         setpointLow:-5,  setpointHigh:12, currentTemp:5,   defrostOk:false, status:"warn" },
  { id:"2H",  name:"2H RIFF 1-10",   system:"2", type:"Glass Door",   area:"Aisle 16",     setpointLow:-5,  setpointHigh:10, currentTemp:4,   defrostOk:true,  status:"ok"   },
  { id:"2I",  name:"2I FZCAKE4 1-8", system:"2", type:"Glass Door",   area:"Bakery",       setpointLow:-5,  setpointHigh:12, currentTemp:3,   defrostOk:true,  status:"ok"   },
  { id:"3A",  name:"3A SDMT 1-1",    system:"3", type:"Low Profile",  area:"Meat Middle",  setpointLow:22,  setpointHigh:43, currentTemp:34,  defrostOk:true,  status:"ok"   },
  { id:"3B",  name:"3B SDMT 1-2",    system:"3", type:"Low Profile",  area:"Meat Middle",  setpointLow:22,  setpointHigh:43, currentTemp:36,  defrostOk:true,  status:"ok"   },
  { id:"3C",  name:"3C SDMT 1-3",    system:"3", type:"Low Profile",  area:"Meat Middle",  setpointLow:22,  setpointHigh:43, currentTemp:33,  defrostOk:true,  status:"ok"   },
  { id:"3D",  name:"3D SDMT 1-4",    system:"3", type:"Low Profile",  area:"Meat Middle",  setpointLow:22,  setpointHigh:43, currentTemp:39,  defrostOk:false, status:"warn" },
  { id:"3E",  name:"3E SVDL 1-5",    system:"3", type:"Service Case", area:"Deli",         setpointLow:28,  setpointHigh:41, currentTemp:35,  defrostOk:true,  status:"ok"   },
  { id:"3F",  name:"3F SVMT 1-6",    system:"3", type:"Service Case", area:"Meat Front",   setpointLow:22,  setpointHigh:43, currentTemp:40,  defrostOk:true,  status:"ok"   },
  { id:"3G",  name:"3G SVFH 1-7",    system:"3", type:"Service Case", area:"Meat Front",   setpointLow:22,  setpointHigh:42, currentTemp:33,  defrostOk:true,  status:"ok"   },
  { id:"3H",  name:"3H MDFH 1-8",    system:"3", type:"Low Profile",  area:"Seafood",      setpointLow:22,  setpointHigh:43, currentTemp:37,  defrostOk:true,  status:"ok"   },
  { id:"3J",  name:"3J MDDL 1-9",    system:"3", type:"Multi Deck",   area:"Deli",         setpointLow:28,  setpointHigh:48, currentTemp:38,  defrostOk:true,  status:"ok"   },
  { id:"3K",  name:"3K DLBX 1-10",   system:"3", type:"Cooler",       area:"Deli",         setpointLow:28,  setpointHigh:41, currentTemp:36,  defrostOk:true,  status:"ok"   },
  { id:"3L",  name:"3L MTPR 1-11",   system:"3", type:"Cooler",       area:"Meat Left",    setpointLow:46,  setpointHigh:55, currentTemp:52,  defrostOk:true,  status:"ok"   },
  { id:"3M",  name:"3M MTBX 1-12",   system:"3", type:"Cooler",       area:"Meat Left",    setpointLow:22,  setpointHigh:43, currentTemp:38,  defrostOk:false, status:"warn" },
  { id:"3N",  name:"3N P-BOX 1-13",  system:"3", type:"Cooler",       area:"Produce Back", setpointLow:31,  setpointHigh:43, currentTemp:37,  defrostOk:true,  status:"ok"   },
  { id:"4A",  name:"4A MDDY 1-18a",  system:"4", type:"Island",       area:"Dairy",        setpointLow:28,  setpointHigh:43, currentTemp:35,  defrostOk:true,  status:"ok"   },
  { id:"4B",  name:"4B SUSHI 1-19",  system:"4", type:"Over/Under",   area:"Deli",         setpointLow:28,  setpointHigh:43, currentTemp:36,  defrostOk:true,  status:"ok"   },
  { id:"4C",  name:"4C P-SLD 1-3",   system:"4", type:"Multi Deck",   area:"Produce",      setpointLow:28,  setpointHigh:43, currentTemp:39,  defrostOk:true,  status:"ok"   },
  { id:"4D",  name:"4D FLWI 1-4",    system:"4", type:"Cooler",       area:"Floral",       setpointLow:34,  setpointHigh:48, currentTemp:37,  defrostOk:true,  status:"ok"   },
  { id:"4G",  name:"4G P-WET 1-8",   system:"4", type:"Green Rack",   area:"Produce",      setpointLow:32,  setpointHigh:50, currentTemp:39,  defrostOk:true,  status:"ok"   },
  { id:"4J",  name:"4J PKDL 1-10",   system:"4", type:"Multi Deck",   area:"Meat Front",   setpointLow:22,  setpointHigh:50, currentTemp:35,  defrostOk:true,  status:"ok"   },
  { id:"4K",  name:"4K DYWI 1-11",   system:"4", type:"Cooler",       area:"Dairy Middle", setpointLow:28,  setpointHigh:43, currentTemp:36,  defrostOk:true,  status:"ok"   },
  { id:"4L",  name:"4L MDDY 1-12",   system:"4", type:"Multi Deck",   area:"Dairy Left",   setpointLow:28,  setpointHigh:43, currentTemp:35,  defrostOk:true,  status:"ok"   },
  { id:"4M",  name:"4M MDDY 1-13",   system:"4", type:"Multi Deck",   area:"Dairy Right",  setpointLow:28,  setpointHigh:43, currentTemp:33,  defrostOk:true,  status:"ok"   },
  { id:"4N",  name:"4N JUICE 1-14",  system:"4", type:"Multi Deck",   area:"Dairy/Aisle",  setpointLow:28,  setpointHigh:43, currentTemp:35,  defrostOk:true,  status:"ok"   },
  { id:"4S",  name:"4S BEER 1-20a",  system:"4", type:"Glass Door",   area:"Aisle 20",     setpointLow:28,  setpointHigh:43, currentTemp:35,  defrostOk:true,  status:"ok"   },
  { id:"4T",  name:"4T BEER 1-21a",  system:"4", type:"Glass Door",   area:"Aisle 20",     setpointLow:28,  setpointHigh:43, currentTemp:38,  defrostOk:true,  status:"warn" },
  { id:"SC04",name:"SC04 CLKLST FZR",system:"SC",type:"Freezer SC",   area:"Back Room",    setpointLow:-5,  setpointHigh:12, currentTemp:6,   defrostOk:false, status:"warn" },
  { id:"SC11",name:"SC11 BKRY CAKE", system:"SC",type:"Refrigerator", area:"Bakery",       setpointLow:23,  setpointHigh:30, currentTemp:29,  defrostOk:false, status:"crit" },
  { id:"SC13",name:"SC13 BKRY RETRD",system:"SC",type:"Refrigerator", area:"Bakery",       setpointLow:28,  setpointHigh:42, currentTemp:40,  defrostOk:false, status:"warn" },
  { id:"SC27",name:"SC27 STARBUCKS",  system:"SC",type:"Refrigerator", area:"Coffee Shop",  setpointLow:28,  setpointHigh:43, currentTemp:40,  defrostOk:false, status:"warn" },
  { id:"SC22",name:"SC22 BERRY CASE", system:"SC",type:"Self Cont",   area:"Produce",      setpointLow:28,  setpointHigh:43, currentTemp:38,  defrostOk:false, status:"warn" },
];

const DEFAULT_STORES = [
  { id:89, name:"Store #89", location:"Division 620", brand:"Danfoss", refrigerant:"R-404A",
    controllers:[{id:"ak800",name:"AK-800A",role:"System Controller"},{id:"akcc",name:"AK-CC 550",role:"Case Controllers"}],
    circuits:S89_CIRCUITS, note:"KS89611 · 7-day temp log loaded" },
  { id:1, name:"Store #1", location:"Main St",   brand:"CPC", refrigerant:"R-404A",
    controllers:[{id:"c1",name:"E2 #1 — Rack",role:"Compressor Rack"},{id:"c2",name:"E2 #2 — MT",role:"Medium-Temp"},{id:"c3",name:"E2 #3 — LT",role:"Low-Temp"}],
    circuits:[], note:"" },
  { id:2, name:"Store #2", location:"Oak Ave",   brand:"", refrigerant:"", controllers:[], circuits:[], note:"" },
  { id:3, name:"Store #3", location:"River Rd",  brand:"", refrigerant:"", controllers:[], circuits:[], note:"" },
  { id:4, name:"Store #4", location:"Pine Blvd", brand:"", refrigerant:"", controllers:[], circuits:[], note:"" },
  { id:5, name:"Store #5", location:"Cedar Ln",  brand:"", refrigerant:"", controllers:[], circuits:[], note:"" },
];

// ── Rack / compressor system data ────────────────────────────────────────────
// Will be refined with real R6 data. Based on KS89611 structure: 4 systems + SC.
const STORE_RACK_SYSTEMS = {
  89: [
    {
      id: "sys1",
      name: "System 1",
      label: "Low Temp — Frozen",
      controller: "AK-800A",
      refrigerant: "R-404A",
      type: "low-temp",
      compressors: [
        { id:"C1", model:"Copeland ZF18", hp:15, status:"run",  role:"Lead" },
        { id:"C2", model:"Copeland ZF18", hp:15, status:"run",  role:"Lag 1" },
        { id:"C3", model:"Copeland ZF09", hp:7.5,status:"off",  role:"Lag 2" },
      ],
      suctionPsi:    18,
      suctionTarget: 20,
      dischargePsi:  245,
      dischargeTarget: 225,
      suctionTemp:   -18,
      dischargeTemp: 195,
      saturatedSuction: -15,
      superheat: 12,
      subcooling: 10,
      defrostType: "Electric",
      defrostSchedule: "4x daily",
      status: "warn",   // discharge slightly high
      alerts: ["Discharge pressure elevated (+20 psi above target)"],
      circuits: ["1A","1B","1C","1D","1E","1F","1FA"],
    },
    {
      id: "sys2",
      name: "System 2",
      label: "Medium Temp — Refrigerated",
      controller: "AK-800A",
      refrigerant: "R-404A",
      type: "med-temp",
      compressors: [
        { id:"C1", model:"Copeland ZS45", hp:45, status:"run",  role:"Lead" },
        { id:"C2", model:"Copeland ZS45", hp:45, status:"run",  role:"Lag 1" },
        { id:"C3", model:"Copeland ZS21", hp:21, status:"run",  role:"Lag 2" },
        { id:"C4", model:"Copeland ZS21", hp:21, status:"off",  role:"Lag 3" },
      ],
      suctionPsi:    28,
      suctionTarget: 30,
      dischargePsi:  230,
      dischargeTarget: 225,
      suctionTemp:   22,
      dischargeTemp: 185,
      saturatedSuction: 26,
      superheat: 9,
      subcooling: 12,
      defrostType: "Electric",
      defrostSchedule: "3x daily",
      status: "ok",
      alerts: [],
      circuits: ["2A","2B","2Ba","2C","2D","2E","2Ea","2F","2G","2H","2I"],
    },
    {
      id: "sys3",
      name: "System 3",
      label: "Service / Deli / Meat",
      controller: "AK-800A",
      refrigerant: "R-404A",
      type: "med-temp",
      compressors: [
        { id:"C1", model:"Copeland ZS30", hp:30, status:"run",  role:"Lead" },
        { id:"C2", model:"Copeland ZS30", hp:30, status:"run",  role:"Lag 1" },
        { id:"C3", model:"Copeland ZS30", hp:30, status:"off",  role:"Lag 2" },
      ],
      suctionPsi:    32,
      suctionTarget: 32,
      dischargePsi:  222,
      dischargeTarget: 225,
      suctionTemp:   28,
      dischargeTemp: 178,
      saturatedSuction: 30,
      superheat: 10,
      subcooling: 11,
      defrostType: "Off-Cycle",
      defrostSchedule: "2x daily",
      status: "ok",
      alerts: [],
      circuits: ["3A","3B","3C","3D","3E","3F","3G","3H","3J","3K","3L","3M","3N"],
    },
    {
      id: "sys4",
      name: "System 4",
      label: "Dairy / Produce / Beer",
      controller: "AK-800A",
      refrigerant: "R-404A",
      type: "med-temp",
      compressors: [
        { id:"C1", model:"Copeland ZS45", hp:45, status:"run",  role:"Lead" },
        { id:"C2", model:"Copeland ZS45", hp:45, status:"run",  role:"Lag 1" },
        { id:"C3", model:"Copeland ZS21", hp:21, status:"off",  role:"Lag 2" },
      ],
      suctionPsi:    30,
      suctionTarget: 30,
      dischargePsi:  228,
      dischargeTarget: 225,
      suctionTemp:   25,
      dischargeTemp: 182,
      saturatedSuction: 28,
      superheat: 11,
      subcooling: 10,
      defrostType: "Off-Cycle",
      defrostSchedule: "2x daily",
      status: "ok",
      alerts: [],
      circuits: ["4A","4B","4C","4D","4G","4J","4K","4L","4M","4N","4S","4T"],
    },
    {
      id: "sysSC",
      name: "Self-Contained",
      label: "SC Units — Independent",
      controller: "None (standalone)",
      refrigerant: "Mixed",
      type: "sc",
      compressors: [],
      suctionPsi: null, dischargePsi: null,
      suctionTarget: null, dischargeTarget: null,
      suctionTemp: null, dischargeTemp: null,
      saturatedSuction: null, superheat: null, subcooling: null,
      defrostType: "Internal",
      defrostSchedule: "Varies",
      status: "crit",
      alerts: ["SC11 BKRY CAKE FRIDG — chronic alarm zone", "SC27 Starbucks rapid cycling"],
      circuits: ["SC04","SC11","SC13","SC22","SC27"],
    },
  ],
};

// ── Seed issues ───────────────────────────────────────────────────────────────
let nextIssueId = 10;
const SEED_ISSUES = [
  { id:1, storeId:89, type:"Defrost",  urgency:"Today",      controllerName:"AK-CC 550", circuit:"SC11 BKRY CAKE FRIDG",   description:"SC11 running chronically in alarm zone (25-30°F). Defrost not terminating on temp — time-outs every cycle. Possible heater failure or sensor fault.", riskScore:9, createdAt:"2025-06-10", notes:"", autoLogged:true, overnight:true },
  { id:2, storeId:89, type:"Defrost",  urgency:"Today",      controllerName:"AK-CC 550", circuit:"2G DFBX 1-9",            description:"Defrost pattern shows inconsistent pull-down all week. 6/10 defrost ran long. Inspect heaters.", riskScore:7, createdAt:"2025-06-10", notes:"", autoLogged:true, overnight:true },
  { id:3, storeId:89, type:"Trending", urgency:"This Week",  controllerName:"AK-800A",   circuit:"2Ea RIFF 1-7",           description:"Baseline temp climbing from 32°F (6/05) to 34°F (6/11). Slow upward trend — monitor for coil ice or door seal issue.", riskScore:5, createdAt:"2025-06-09", notes:"", autoLogged:true, overnight:false },
  { id:4, storeId:89, type:"Defrost",  urgency:"This Week",  controllerName:"AK-CC 550", circuit:"2A BFBX 1-1",            description:"2A defrost peaks inconsistent. Some defrosts reaching 37°F, others 15°F. Possible heater cycling issue.", riskScore:6, createdAt:"2025-06-09", notes:"", autoLogged:true, overnight:true },
  { id:5, storeId:89, type:"Trending", urgency:"Watch List", controllerName:"AK-CC 550", circuit:"4T BEER 1-21a",           description:"Beer case temps running 41-43°F consistently above 41°F setpoint. Intermittent warm spikes. Monitor door seals.", riskScore:4, createdAt:"2025-06-08", notes:"", autoLogged:true, overnight:false },
];

// ── Seed circuit notes ────────────────────────────────────────────────────────
let nextNoteId = 100;
const SEED_CIRCUIT_NOTES = [
  { id:1, storeId:89, circuitId:"SC11", type:"observation", text:"Cake fridge running 25-37°F all day — oscillating widely between low alarm and mid-range. Defrost only gets to 30°F max before timing out. Heater element suspect.", tech:"Auto-AI", date:"2025-06-10", time:"06:00", shift:"AM" },
  { id:2, storeId:89, circuitId:"2G",   type:"observation", text:"Deli freezer pull-down after defrost taking 45+ min to recover to 5°F. Defrost heater may be partially failed or fan cycling off too soon.", tech:"Auto-AI", date:"2025-06-10", time:"06:00", shift:"AM" },
  { id:3, storeId:89, circuitId:"2A",   type:"observation", text:"Bakery freezer defrost peaks erratic — 15°F one cycle, 37°F next. Pattern suggests one of two heater banks is not firing consistently.", tech:"Auto-AI", date:"2025-06-09", time:"06:00", shift:"AM" },
  { id:4, storeId:89, circuitId:"SC27", type:"humidity",   text:"Starbucks fridge SC27 showing rapid cycling — 34°F to 50°F swings on every compressor cycle. Door seal or fan shroud suspected. High ambient near coffee station.", tech:"Auto-AI", date:"2025-06-10", time:"06:00", shift:"AM" },
];

// ── Pattern detection engine ─────────────────────────────────────────────────
function detectPatterns(circuitNotes, storeId) {
  const storeNotes = circuitNotes.filter(n => n.storeId === storeId);
  const patterns = [];

  // Humidity cluster
  const humidityNotes = storeNotes.filter(n => n.type === "humidity");
  if (humidityNotes.length >= 2) {
    const circuits = [...new Set(humidityNotes.map(n => n.circuitId))];
    patterns.push({ type:"humidity", severity:"warn", title:"Humidity Pattern Detected", body:`${circuits.length} circuits showing humidity-related issues (${circuits.join(", ")}). Check ambient conditions and door gaskets in affected zones.`, circuits, icon:"💧" });
  }

  // Ambient/HVAC
  const ambientNotes = storeNotes.filter(n => n.type === "ambient");
  if (ambientNotes.length >= 1) {
    patterns.push({ type:"ambient", severity:"warn", title:"Ambient Temp Concern", body:"One or more circuits flagged ambient/HVAC involvement. High store temp can cascade to multiple cases simultaneously.", circuits: ambientNotes.map(n=>n.circuitId), icon:"🌡" });
  }

  // Defrost cluster
  const defrostNotes = storeNotes.filter(n => n.type === "defrost" || n.type === "observation").filter(n => n.text.toLowerCase().includes("defrost"));
  if (defrostNotes.length >= 3) {
    const circuits = [...new Set(defrostNotes.map(n => n.circuitId))];
    patterns.push({ type:"defrost-cluster", severity:"crit", title:"Multiple Defrost Failures", body:`${circuits.length} circuits with defrost anomalies (${circuits.join(", ")}). Check rack defrost schedule overlap, AK-800A defrost outputs, and shared heater circuits.`, circuits, icon:"❄" });
  }

  // Rack-level issue (multiple circuits on same system)
  const rackNotes = storeNotes.filter(n => n.type === "rack");
  if (rackNotes.length >= 1) {
    patterns.push({ type:"rack", severity:"crit", title:"Rack-Level Issue Noted", body:"Rack or compressor-level issue logged. Verify suction pressure, discharge pressure, and all circuits on this system.", circuits: rackNotes.map(n=>n.circuitId), icon:"⚙" });
  }

  return patterns;
}

// ── Resolved-without-note detection ─────────────────────────────────────────
function findResolvedWithoutNotes(issues, circuitNotes, storeId) {
  const resolved = issues.filter(i => i.storeId === storeId && i.urgency === "Resolved");
  return resolved.filter(issue => {
    const hasNote = circuitNotes.some(n =>
      n.storeId === storeId &&
      (n.circuitId === issue.circuit || issue.circuit?.includes(n.circuitId)) &&
      (n.type === "emergency" || n.type === "pm" || n.type === "resolved")
    );
    return !hasNote;
  });
}

const F  = `'Barlow Condensed','Inter','Segoe UI',sans-serif`;
const FB = `'Inter','Segoe UI',sans-serif`;
const inp = { width:"100%", background:"#090810", border:`1px solid ${AVS.border}`, borderRadius:6, color:AVS.white, padding:"9px 11px", fontSize:14, boxSizing:"border-box", outline:"none", fontFamily:FB };
const sel = { ...inp, cursor:"pointer" };
const lbl = { display:"block", color:AVS.dim, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:5, fontFamily:F };

const getColor   = id => STORE_COLORS[DEFAULT_STORES.findIndex(s=>s.id===id) % STORE_COLORS.length] || STORE_COLORS[0];
const pad2       = n  => String(n).padStart(2,"0");
const nowStr     = ()  => { const d=new Date(); return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; };
const nowTime    = ()  => { const d=new Date(); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const shiftOf    = ()  => { const h=new Date().getHours(); return h<12?"AM":h<17?"PM":"EVE"; };

function StatusDot({ status }) {
  const colors = { ok:AVS.green, warn:AVS.orange, crit:AVS.red };
  return <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:colors[status]||"#888", marginRight:5, flexShrink:0 }}/>;
}

function TempBar({ current, low, high, status }) {
  const range = high - low || 1;
  const pct   = Math.min(100, Math.max(0, ((current - low) / range) * 100));
  const color = status==="crit"?AVS.red:status==="warn"?AVS.orange:AVS.green;
  return (
    <div style={{ position:"relative", height:5, borderRadius:3, background:AVS.border, width:"100%", marginTop:4 }}>
      <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${pct}%`, background:color, borderRadius:3, transition:"width 0.3s" }}/>
    </div>
  );
}

function NoteTypeBadge({ type }) {
  const nt = NOTE_TYPES.find(t=>t.id===type) || NOTE_TYPES[NOTE_TYPES.length-1];
  return (
    <span style={{ background:nt.color+"22", border:`1px solid ${nt.color}44`, color:nt.color, borderRadius:4, padding:"2px 7px", fontSize:11, fontWeight:700, fontFamily:F, whiteSpace:"nowrap" }}>
      {nt.icon} {nt.label}
    </span>
  );
}

function ShiftBadge({ shift }) {
  const colors = { AM:"#F6D365", PM:"#A18CD1", EVE:"#3880B8" };
  return <span style={{ color:colors[shift]||AVS.dim, fontSize:10, fontWeight:700, fontFamily:F }}>{shift}</span>;
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [stores]          = useState(DEFAULT_STORES);
  const [issues,  setIssues]  = useState(SEED_ISSUES);
  const [cNotes,  setCNotes]  = useState(SEED_CIRCUIT_NOTES);

  // Navigation
  const [screen,        setScreen]        = useState("dashboard");
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [activeStoreId, setActiveStoreId] = useState(null);

  // Dashboard tabs
  const [dashTab, setDashTab] = useState("overnight");

  // Issue form
  const [showIssueForm,  setShowIssueForm]  = useState(false);
  const [issueForm,      setIssueForm]      = useState({});
  const [editingIssueId, setEditingIssueId] = useState(null);
  const [expandedId,     setExpandedId]     = useState(null);

  // Store sub-tab: "systems" | "circuits"
  const [storeTab,      setStoreTab]      = useState("circuits");

  // Circuit view filters
  const [circuitFilter, setCircuitFilter] = useState("all");
  const [systemFilter,  setSystemFilter]  = useState("all");
  const [circuitSearch, setCircuitSearch] = useState("");

  // Note modal
  const [noteModal,     setNoteModal]     = useState(null); // { circuitId, circuitName } or null
  const [noteForm,      setNoteForm]      = useState({});
  const [expandedNote,  setExpandedNote]  = useState(null);

  // Journal / patterns view
  const [journalTab,    setJournalTab]    = useState("journal"); // journal | patterns | unresolved

  const activeStore = stores.find(s=>s.id===activeStoreId);
  const alarmCount  = issues.filter(i=>i.urgency==="Today"||i.type==="Alarm").length;

  const overnightIssues = issues.filter(i=>i.overnight&&i.urgency!=="Resolved");
  const todayIssues     = issues.filter(i=>i.urgency==="Today");
  const weekIssues      = issues.filter(i=>i.urgency==="This Week");
  const tabIssues       = dashTab==="overnight"?overnightIssues:dashTab==="today"?todayIssues:weekIssues;

  const storePatterns   = activeStore ? detectPatterns(cNotes, activeStore.id) : [];
  const resolvedNoNotes = activeStore ? findResolvedWithoutNotes(issues, cNotes, activeStore.id) : [];
  const storeCNotes     = activeStore ? cNotes.filter(n=>n.storeId===activeStore.id).sort((a,b)=>b.id-a.id) : [];
  const rackSystems     = activeStore ? (STORE_RACK_SYSTEMS[activeStore.id] || []) : [];

  // ── Helpers ────────────────────────────────────────────────────────────────
  const openNewIssue = (circuit=null) => {
    const sid   = activeStoreId||89;
    const store = stores.find(s=>s.id===sid);
    setEditingIssueId(null);
    setIssueForm({ storeId:sid, type:"Alarm", urgency:"Today", controllerName:store?.controllers[0]?.name||"", circuit:circuit?.name||"", description:"", riskScore:5, notes:"", overnight:true });
    setShowIssueForm(true);
  };

  const saveIssue = () => {
    if (!issueForm.circuit?.trim()||!issueForm.description?.trim()) return;
    if (editingIssueId) {
      setIssues(p=>p.map(i=>i.id===editingIssueId?{...issueForm,id:editingIssueId}:i));
    } else {
      setIssues(p=>[...p,{...issueForm,id:nextIssueId++,createdAt:nowStr(),autoLogged:false}]);
    }
    setShowIssueForm(false);
  };

  const deleteIssue  = id => setIssues(p=>p.filter(i=>i.id!==id));
  const updateUrgency = (id,u) => setIssues(p=>p.map(i=>i.id===id?{...i,urgency:u}:i));

  const openNoteModal = (circuitId, circuitName) => {
    setNoteModal({ circuitId, circuitName });
    setNoteForm({ type:"observation", text:"", tech:"", date:nowStr(), time:nowTime(), shift:shiftOf() });
  };

  const saveNote = () => {
    if (!noteForm.text?.trim()) return;
    setCNotes(p=>[...p,{ id:nextNoteId++, storeId:activeStoreId, circuitId:noteModal.circuitId, ...noteForm }]);
    setNoteModal(null);
  };

  const deleteNote = id => setCNotes(p=>p.filter(n=>n.id!==id));

  const circuitNoteCount = circId => cNotes.filter(n=>n.storeId===activeStoreId&&n.circuitId===circId).length;
  const circuitHasOpenIssue = circId => issues.some(i=>i.storeId===activeStoreId&&i.urgency!=="Resolved"&&(i.circuit?.includes(circId)));

  const filteredCircuits = (store) => {
    if (!store?.circuits) return [];
    return store.circuits.filter(c => {
      if (circuitFilter!=="all"&&c.status!==circuitFilter) return false;
      if (systemFilter!=="all"&&c.system!==systemFilter) return false;
      if (circuitSearch&&!c.name.toLowerCase().includes(circuitSearch.toLowerCase())&&!c.area.toLowerCase().includes(circuitSearch.toLowerCase())) return false;
      return true;
    });
  };

  const systems = activeStore ? [...new Set(activeStore.circuits?.map(c=>c.system)||[])] : [];

  // ── Circuit card ───────────────────────────────────────────────────────────
  function CircuitCard({ c }) {
    const borderColor = c.status==="crit"?"#6B1A1A":c.status==="warn"?"#6B3800":AVS.border;
    const hasIssue    = circuitHasOpenIssue(c.id);
    const noteCount   = circuitNoteCount(c.id);
    const latestNote  = cNotes.filter(n=>n.storeId===activeStoreId&&n.circuitId===c.id).sort((a,b)=>b.id-a.id)[0];

    return (
      <div style={{ background:AVS.card, border:`1px solid ${borderColor}`, borderLeft:`3px solid ${c.status==="crit"?AVS.red:c.status==="warn"?AVS.orange:AVS.border}`, borderRadius:8, padding:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
          <div style={{ flex:1, minWidth:0, marginRight:8 }}>
            <div style={{ fontFamily:F, fontWeight:700, fontSize:13, color:c.status==="crit"?AVS.red:c.status==="warn"?AVS.orange:AVS.white, lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.name}</div>
            <div style={{ fontSize:11, color:AVS.dim, marginTop:1 }}>{c.area} · {c.type}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3, flexShrink:0 }}>
            <StatusDot status={c.status}/>
            {!c.defrostOk && <span style={{ fontSize:9, color:AVS.orange, fontFamily:F, fontWeight:700, background:"#3A200044", border:`1px solid ${AVS.orange}44`, borderRadius:3, padding:"1px 5px" }}>DEFROST ⚠</span>}
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:2 }}>
          <span style={{ fontFamily:F, fontSize:22, fontWeight:800, color:c.status==="crit"?AVS.red:c.status==="warn"?AVS.orange:AVS.green }}>{c.currentTemp}°F</span>
          <span style={{ fontSize:11, color:AVS.dim }}>{c.setpointLow}° — {c.setpointHigh}°</span>
        </div>
        <TempBar current={c.currentTemp} low={c.setpointLow} high={c.setpointHigh} status={c.status}/>

        {latestNote && (
          <div style={{ marginTop:8, background:AVS.surface, borderRadius:5, padding:"5px 8px", borderLeft:`2px solid ${(NOTE_TYPES.find(t=>t.id===latestNote.type)||NOTE_TYPES[0]).color}` }}>
            <div style={{ fontSize:10, color:AVS.dim, marginBottom:2, fontFamily:F }}>{latestNote.date} {latestNote.time} · <ShiftBadge shift={latestNote.shift}/></div>
            <div style={{ fontSize:11, color:AVS.silver, lineHeight:1.4 }}>{latestNote.text.length>80?latestNote.text.slice(0,80)+"…":latestNote.text}</div>
          </div>
        )}

        <div style={{ marginTop:8, display:"flex", gap:5, flexWrap:"wrap" }}>
          <button onClick={()=>openNoteModal(c.id,c.name)} style={{ flex:1, background:AVS.surface, border:`1px solid ${AVS.border}`, color:AVS.silver, borderRadius:5, padding:"5px 0", fontSize:11, cursor:"pointer", fontFamily:F }}>
            + Note {noteCount>0?`(${noteCount})`:""}
          </button>
          <button onClick={()=>openNewIssue(c)} style={{ flex:1, background:AVS.surface, border:`1px solid ${AVS.border}`, color:AVS.silver, borderRadius:5, padding:"5px 0", fontSize:11, cursor:"pointer", fontFamily:F }}>
            + Issue
          </button>
          {hasIssue && <span style={{ fontSize:10, color:AVS.red, fontFamily:F, fontWeight:700, alignSelf:"center" }}>● OPEN</span>}
        </div>
      </div>
    );
  }

  // ── Pressure gauge SVG ────────────────────────────────────────────────────
  function PressureGauge({ value, target, min, max, label, unit="psi", size=80 }) {
    if (value === null) return null;
    const angle  = (v) => -135 + Math.min(1, Math.max(0, (v - min) / (max - min))) * 270;
    const polar  = (deg, r) => {
      const rad = (deg - 90) * Math.PI / 180;
      return { x: size/2 + r * Math.cos(rad), y: size/2 + r * Math.sin(rad) };
    };
    const vPct   = Math.min(1, Math.max(0, (value - min) / (max - min)));
    const tPct   = Math.min(1, Math.max(0, (target - min) / (max - min)));
    const vAngle = angle(value);
    const tAngle = angle(target);
    const r      = size * 0.38;
    const rInner = size * 0.24;

    // arc path helper
    const arcPath = (startDeg, endDeg, radius) => {
      const s = polar(startDeg, radius);
      const e = polar(endDeg, radius);
      const large = (endDeg - startDeg) > 180 ? 1 : 0;
      return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
    };

    const deviation = Math.abs(value - target) / target;
    const color = deviation > 0.1 ? (value > target ? AVS.red : AVS.steelLt) : AVS.green;

    // needle
    const needleTip = polar(vAngle, r * 0.85);
    const needleBase1 = polar(vAngle + 90, 3);
    const needleBase2 = polar(vAngle - 90, 3);

    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background arc */}
          <path d={arcPath(-135, 135, r)} fill="none" stroke={AVS.border} strokeWidth={size*0.075} strokeLinecap="round"/>
          {/* Value arc */}
          <path d={arcPath(-135, vAngle, r)} fill="none" stroke={color} strokeWidth={size*0.075} strokeLinecap="round" style={{ filter:`drop-shadow(0 0 3px ${color}88)` }}/>
          {/* Target tick */}
          {(() => { const tp = polar(tAngle, r); const ti = polar(tAngle, rInner+size*0.04); return <line x1={tp.x} y1={tp.y} x2={ti.x} y2={ti.y} stroke={AVS.dim} strokeWidth={1.5} strokeLinecap="round"/>; })()}
          {/* Needle */}
          <polygon points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`} fill={color}/>
          {/* Center dot */}
          <circle cx={size/2} cy={size/2} r={size*0.055} fill={AVS.card2} stroke={color} strokeWidth={1.5}/>
          {/* Value text */}
          <text x={size/2} y={size/2+size*0.13} textAnchor="middle" fill={color} fontSize={size*0.175} fontWeight="800" fontFamily={F}>{value}</text>
          <text x={size/2} y={size/2+size*0.24} textAnchor="middle" fill={AVS.dim} fontSize={size*0.1} fontFamily={F}>{unit}</text>
        </svg>
        <div style={{ fontSize:10, color:AVS.dim, fontFamily:F, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</div>
        <div style={{ fontSize:10, color:AVS.dim }}>target {target}{unit}</div>
      </div>
    );
  }

  // ── Compressor pill ────────────────────────────────────────────────────────
  function CompressorPill({ comp, index }) {
    const isRun = comp.status === "run";
    const color = isRun ? AVS.green : AVS.dim;
    return (
      <div style={{ background:isRun?AVS.green+"11":AVS.surface, border:`1px solid ${isRun?AVS.green+"44":AVS.border}`, borderRadius:8, padding:"10px 12px", minWidth:90, flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
          <div style={{ fontFamily:F, fontWeight:800, fontSize:13, color }}>{comp.id}</div>
          <div style={{ width:7, height:7, borderRadius:"50%", background:color, marginTop:2,
            ...(isRun ? { boxShadow:`0 0 5px ${AVS.green}` } : {}) }}/>
        </div>
        <div style={{ fontSize:10, color:AVS.dim, marginBottom:2 }}>{comp.model}</div>
        <div style={{ fontFamily:F, fontSize:12, color:AVS.silver }}>{comp.hp} HP</div>
        <div style={{ fontFamily:F, fontSize:10, color:color, marginTop:3, fontWeight:700 }}>{comp.role}</div>
        <div style={{ marginTop:5, height:3, borderRadius:2, background:AVS.border }}>
          {isRun && <div style={{ height:"100%", width:"100%", borderRadius:2, background:`linear-gradient(90deg, ${AVS.green}88, ${AVS.green})`, animation:"pulse 2s ease-in-out infinite" }}/>}
        </div>
      </div>
    );
  }

  // ── Rack system card ───────────────────────────────────────────────────────
  function RackSystemCard({ sys, storeCircuits }) {
    const [expanded, setExpanded] = useState(false);
    const statusColor = sys.status==="crit"?AVS.red:sys.status==="warn"?AVS.orange:AVS.green;
    const typeColor   = sys.type==="low-temp"?"#5DADE2":sys.type==="sc"?AVS.purple:AVS.teal;
    const running     = sys.compressors.filter(c=>c.status==="run").length;
    const total       = sys.compressors.length;
    const linkedCircuits = storeCircuits.filter(c=>sys.circuits.includes(c.id));
    const warnCircuits   = linkedCircuits.filter(c=>c.status==="warn"||c.status==="crit");

    return (
      <div style={{ background:AVS.card, border:`1px solid ${sys.status==="crit"?AVS.red+"44":sys.status==="warn"?AVS.orange+"44":AVS.border}`, borderRadius:12, overflow:"hidden", marginBottom:14 }}>

        {/* Header bar */}
        <div style={{ background:AVS.card2, borderBottom:`1px solid ${AVS.border}`, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:3 }}>
              <span style={{ background:typeColor+"22", border:`1px solid ${typeColor}44`, color:typeColor, borderRadius:4, padding:"2px 8px", fontSize:10, fontWeight:700, fontFamily:F }}>{sys.type==="low-temp"?"LOW TEMP":sys.type==="sc"?"SELF-CONT.":"MED TEMP"}</span>
              {sys.alerts.length>0 && <span style={{ background:statusColor+"22", border:`1px solid ${statusColor}44`, color:statusColor, borderRadius:4, padding:"2px 7px", fontSize:10, fontWeight:700, fontFamily:F }}>⚠ {sys.alerts.length} ALERT{sys.alerts.length>1?"S":""}</span>}
            </div>
            <div style={{ fontFamily:F, fontWeight:700, fontSize:18, letterSpacing:1, color:AVS.white }}>{sys.name} <span style={{ color:AVS.dim, fontSize:13, fontWeight:400 }}>— {sys.label}</span></div>
            <div style={{ fontSize:11, color:AVS.dim, marginTop:2 }}>{sys.controller} · {sys.refrigerant} · Defrost: {sys.defrostType} ({sys.defrostSchedule})</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
            {sys.compressors.length > 0 && (
              <div style={{ fontFamily:F, fontWeight:700, fontSize:13, color:running>0?AVS.green:AVS.dim }}>
                {running}/{total} <span style={{ fontSize:11, color:AVS.dim, fontWeight:400 }}>running</span>
              </div>
            )}
            <div style={{ fontSize:11, color:AVS.dim }}>{linkedCircuits.length} circuits {warnCircuits.length>0?<span style={{ color:AVS.orange }}>· {warnCircuits.length} warn</span>:""}</div>
          </div>
        </div>

        {/* Compressors row */}
        {sys.compressors.length > 0 && (
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${AVS.border}` }}>
            <div style={{ fontSize:10, color:AVS.dim, fontFamily:F, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Compressors</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {sys.compressors.map((comp,i)=><CompressorPill key={comp.id} comp={comp} index={i}/>)}
            </div>
          </div>
        )}

        {/* Gauges row */}
        {sys.suctionPsi !== null && (
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${AVS.border}`, display:"flex", gap:20, justifyContent:"space-around", flexWrap:"wrap" }}>
            <PressureGauge value={sys.suctionPsi}   target={sys.suctionTarget}   min={0}   max={80}  label="Suction"   unit="psi" size={88}/>
            <PressureGauge value={sys.dischargePsi}  target={sys.dischargeTarget} min={100} max={350} label="Discharge" unit="psi" size={88}/>
            <div style={{ display:"flex", flexDirection:"column", gap:10, justifyContent:"center" }}>
              {[
                ["Suct. Temp",  sys.suctionTemp,  "°F",  v => v < 0 ? AVS.steelLt : AVS.green],
                ["Disch. Temp", sys.dischargeTemp, "°F",  v => v > 220 ? AVS.red : v > 200 ? AVS.orange : AVS.green],
                ["Superheat",   sys.superheat,     "°F",  v => v < 6 ? AVS.red : v > 16 ? AVS.orange : AVS.green],
                ["Subcooling",  sys.subcooling,    "°F",  v => v < 5 ? AVS.orange : AVS.green],
                ["Sat. Suction",sys.saturatedSuction,"°F",()=>AVS.dim],
              ].map(([label, val, unit, colorFn]) => val !== null && (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", gap:16, alignItems:"baseline" }}>
                  <span style={{ fontSize:11, color:AVS.dim, fontFamily:F, minWidth:80 }}>{label}</span>
                  <span style={{ fontFamily:F, fontWeight:700, fontSize:14, color:colorFn(val) }}>{val}{unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {sys.alerts.length > 0 && (
          <div style={{ padding:"10px 16px", borderBottom:`1px solid ${AVS.border}`, background:statusColor+"08" }}>
            {sys.alerts.map((a,i)=>(
              <div key={i} style={{ fontSize:12, color:statusColor, display:"flex", gap:6, alignItems:"flex-start", marginBottom:i<sys.alerts.length-1?4:0 }}>
                <span style={{ flexShrink:0 }}>⚠</span><span>{a}</span>
              </div>
            ))}
          </div>
        )}

        {/* Linked circuits expandable */}
        <div onClick={()=>setExpanded(e=>!e)} style={{ padding:"10px 16px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, color:AVS.dim, fontFamily:F }}>Linked circuits ({linkedCircuits.length})</span>
          <span style={{ color:AVS.dim, fontSize:13 }}>{expanded?"∧":"∨"}</span>
        </div>
        {expanded && (
          <div style={{ padding:"0 16px 14px", display:"flex", gap:6, flexWrap:"wrap" }}>
            {linkedCircuits.map(c=>(
              <span key={c.id} style={{ background:c.status==="crit"?AVS.red+"22":c.status==="warn"?AVS.orange+"22":AVS.surface, border:`1px solid ${c.status==="crit"?AVS.red+"44":c.status==="warn"?AVS.orange+"44":AVS.border}`, color:c.status==="crit"?AVS.red:c.status==="warn"?AVS.orange:AVS.dim, borderRadius:5, padding:"3px 8px", fontSize:11, fontFamily:F, fontWeight:600 }}>
                {c.id} {c.status!=="ok"&&`● `}{c.area.split(" ")[0]}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Issue row ──────────────────────────────────────────────────────────────
  function IssueRow({ issue }) {
    const sc    = getColor(issue.storeId);
    const store = stores.find(s=>s.id===issue.storeId);
    const ucfg  = URGENCY[issue.urgency];
    const exp   = expandedId===issue.id;
    return (
      <div style={{ background:AVS.card, border:`1px solid ${exp?ucfg.border:AVS.border}`, borderLeft:`4px solid ${sc.main}`, borderRadius:8, overflow:"hidden", marginBottom:8 }}>
        <div onClick={()=>setExpandedId(exp?null:issue.id)} style={{ padding:"12px 14px", cursor:"pointer", display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ minWidth:34, height:34, borderRadius:6, background:issue.riskScore>=7?"#3A0E0E":issue.riskScore>=5?"#3A2000":"#0D2233", border:`1px solid ${issue.riskScore>=7?AVS.red+"55":issue.riskScore>=5?AVS.orange+"55":AVS.steelLt+"55"}`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, fontFamily:F, color:issue.riskScore>=7?AVS.red:issue.riskScore>=5?AVS.orange:AVS.steelLt, flexShrink:0 }}>
            {issue.riskScore}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center", marginBottom:3 }}>
              <span style={{ color:sc.main, fontFamily:F, fontWeight:700, fontSize:13 }}>{store?.name}</span>
              <span style={{ color:AVS.dim, fontSize:12 }}>·</span>
              <span style={{ color:TYPE_COLOR[issue.type], fontSize:12, fontWeight:600 }}>{TYPE_ICON[issue.type]} {issue.type}</span>
              <span style={{ color:AVS.dim, fontSize:12 }}>· {issue.controllerName}</span>
              {issue.autoLogged && <span style={{ background:AVS.steel, color:AVS.white, borderRadius:4, padding:"1px 5px", fontSize:10, fontWeight:700 }}>⚡ AI</span>}
            </div>
            <div style={{ fontFamily:F, fontWeight:700, fontSize:15, color:AVS.white, marginBottom:2 }}>{issue.circuit}</div>
            <div style={{ color:AVS.dim, fontSize:12, lineHeight:1.5 }}>{issue.description}</div>
          </div>
          <span style={{ color:AVS.dim, fontSize:16, flexShrink:0 }}>{exp?"∧":"∨"}</span>
        </div>
        {exp && (
          <div style={{ borderTop:`1px solid ${AVS.border}`, padding:"10px 14px", background:AVS.surface }}>
            {issue.notes && <div style={{ background:AVS.card, border:`1px solid ${AVS.border}`, borderRadius:6, padding:"7px 10px", marginBottom:10, fontSize:12, color:AVS.dim }}><span style={{ color:AVS.silverDk, fontWeight:700, fontSize:10, textTransform:"uppercase" }}>Notes: </span>{issue.notes}</div>}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ color:AVS.dim, fontSize:12 }}>Move:</span>
              {["Today","This Week","Watch List","Resolved"].filter(u=>u!==issue.urgency).map(u=>(
                <button key={u} onClick={()=>updateUrgency(issue.id,u)} style={{ background:URGENCY[u].bg, border:`1px solid ${URGENCY[u].border}`, color:URGENCY[u].color, borderRadius:5, padding:"3px 9px", fontSize:11, cursor:"pointer", fontWeight:700, fontFamily:F }}>{URGENCY[u].label}</button>
              ))}
              <div style={{ flex:1 }}/>
              <button onClick={()=>{setEditingIssueId(issue.id);setIssueForm({...issue});setShowIssueForm(true);}} style={{ background:AVS.card, border:`1px solid ${AVS.border}`, color:AVS.silver, borderRadius:5, padding:"3px 9px", fontSize:11, cursor:"pointer", fontFamily:F }}>Edit</button>
              <button onClick={()=>deleteIssue(issue.id)} style={{ background:"#3A0E0E", border:"1px solid #6B1A1A", color:AVS.red, borderRadius:5, padding:"3px 9px", fontSize:11, cursor:"pointer", fontFamily:F }}>Delete</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Pattern card ───────────────────────────────────────────────────────────
  function PatternCard({ p }) {
    const color = p.severity==="crit"?AVS.red:p.severity==="warn"?AVS.orange:AVS.steelLt;
    return (
      <div style={{ background:AVS.card, border:`1px solid ${color}44`, borderLeft:`3px solid ${color}`, borderRadius:8, padding:14, marginBottom:10 }}>
        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
          <span style={{ fontSize:18 }}>{p.icon}</span>
          <span style={{ fontFamily:F, fontWeight:700, fontSize:15, color }}>{p.title}</span>
        </div>
        <p style={{ fontSize:13, color:AVS.silver, margin:"0 0 8px 0", lineHeight:1.5 }}>{p.body}</p>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {p.circuits.map(cid=>(
            <span key={cid} style={{ background:color+"22", border:`1px solid ${color}44`, color, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:700, fontFamily:F }}>{cid}</span>
          ))}
        </div>
      </div>
    );
  }

  // ── Journal entry ──────────────────────────────────────────────────────────
  function JournalEntry({ note }) {
    const nt  = NOTE_TYPES.find(t=>t.id===note.type)||NOTE_TYPES[NOTE_TYPES.length-1];
    const exp = expandedNote===note.id;
    const circuit = activeStore?.circuits?.find(c=>c.id===note.circuitId);
    return (
      <div style={{ background:AVS.card, border:`1px solid ${AVS.border}`, borderLeft:`3px solid ${nt.color}`, borderRadius:8, marginBottom:8, overflow:"hidden" }}>
        <div onClick={()=>setExpandedNote(exp?null:note.id)} style={{ padding:"10px 14px", cursor:"pointer" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center", marginBottom:4 }}>
                <NoteTypeBadge type={note.type}/>
                <span style={{ color:AVS.dim, fontSize:11 }}>{note.date} {note.time}</span>
                <ShiftBadge shift={note.shift}/>
                {note.tech&&<span style={{ color:AVS.steelLt, fontSize:11 }}>· {note.tech}</span>}
              </div>
              <div style={{ fontFamily:F, fontWeight:700, fontSize:14, color:AVS.white }}>{note.circuitId} {circuit?`— ${circuit.area}`:"" }</div>
              <div style={{ fontSize:12, color:AVS.silver, marginTop:3, lineHeight:1.4 }}>{exp?note.text:note.text.slice(0,100)+(note.text.length>100?"…":"")}</div>
            </div>
            <span style={{ color:AVS.dim, fontSize:14, flexShrink:0 }}>{exp?"∧":"∨"}</span>
          </div>
        </div>
        {exp && (
          <div style={{ borderTop:`1px solid ${AVS.border}`, padding:"8px 14px", background:AVS.surface, display:"flex", justifyContent:"flex-end" }}>
            <button onClick={()=>deleteNote(note.id)} style={{ background:"#3A0E0E", border:"1px solid #6B1A1A", color:AVS.red, borderRadius:5, padding:"3px 9px", fontSize:11, cursor:"pointer", fontFamily:F }}>Delete</button>
          </div>
        )}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:AVS.bg, color:AVS.white, fontFamily:FB, fontSize:14, position:"relative" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>

      {/* HEADER */}
      <div style={{ position:"fixed", top:0, left:0, right:0, height:54, background:AVS.surface, borderBottom:`1px solid ${AVS.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", zIndex:200 }}>
        <button onClick={()=>setDrawerOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:8, display:"flex", flexDirection:"column", gap:5 }}>
          {[0,1,2].map(i=><div key={i} style={{ width:20, height:2, background:AVS.silver, borderRadius:2 }}/>)}
        </button>
        <div style={{ textAlign:"center" }}>
          {screen==="store"&&activeStore
            ? <><div style={{ fontFamily:F, fontWeight:700, fontSize:16, letterSpacing:1, color:getColor(activeStore.id).main }}>{activeStore.name}</div>
               <div style={{ fontSize:10, color:AVS.dim }}>{activeStore.brand} · {activeStore.refrigerant}</div></>
            : screen==="systems"&&activeStore
            ? <><div style={{ fontFamily:F, fontWeight:700, fontSize:16, letterSpacing:1, color:getColor(activeStore.id).main }}>{activeStore.name}</div>
               <div style={{ fontSize:10, color:AVS.teal }}>RACK SYSTEMS</div></>
            : screen==="journal"&&activeStore
            ? <div style={{ fontFamily:F, fontWeight:700, fontSize:16, letterSpacing:1, color:AVS.steelLt }}>JOURNAL · {activeStore.name}</div>
            : <div style={{ fontFamily:F, fontWeight:700, fontSize:16, letterSpacing:1 }}>CRYO<span style={{ color:AVS.burgundy }}>WATCH</span></div>
          }
        </div>
        <button onClick={()=>setScreen("dashboard")} style={{ background:"none", border:"none", cursor:"pointer", position:"relative", padding:8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AVS.silver} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          {alarmCount>0&&<span style={{ position:"absolute", top:3, right:3, background:AVS.burgundy, color:AVS.white, borderRadius:"50%", width:15, height:15, fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F }}>{alarmCount}</span>}
        </button>
      </div>

      {/* DRAWER */}
      {drawerOpen && (
        <>
          <div onClick={()=>setDrawerOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:300 }}/>
          <div style={{ position:"fixed", top:0, left:0, bottom:0, width:300, background:AVS.surface, borderRight:`1px solid ${AVS.border}`, zIndex:400, overflowY:"auto", padding:"68px 14px 24px" }}>
            <div style={{ fontFamily:F, fontSize:11, fontWeight:700, letterSpacing:2, color:AVS.dim, textTransform:"uppercase", marginBottom:12 }}>Your Stores</div>
            {stores.map(store => {
              const sc    = getColor(store.id);
              const todayCount = issues.filter(i=>i.storeId===store.id&&i.urgency==="Today").length;
              const critCount  = store.circuits?.filter(c=>c.status==="crit").length||0;
              const warnCount  = store.circuits?.filter(c=>c.status==="warn").length||0;
              const journalCount = cNotes.filter(n=>n.storeId===store.id).length;
              return (
                <div key={store.id}>
                  <div onClick={()=>{ setActiveStoreId(store.id); setScreen("systems"); setDrawerOpen(false); setCircuitFilter("all"); setSystemFilter("all"); setCircuitSearch(""); }} style={{ background:AVS.card, border:`1px solid ${AVS.border}`, borderLeft:`4px solid ${sc.main}`, borderRadius:8, padding:"12px 14px", cursor:"pointer", marginBottom:4 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontFamily:F, fontWeight:700, fontSize:17, letterSpacing:1, color:AVS.white }}>{store.name}</div>
                        <div style={{ fontSize:12, color:AVS.dim }}>{store.location}</div>
                      </div>
                      {todayCount>0&&<span style={{ background:"#3A0E0E", border:"1px solid #6B1A1A", color:AVS.red, borderRadius:5, padding:"2px 8px", fontSize:12, fontWeight:700, fontFamily:F }}>{todayCount}</span>}
                    </div>
                    <div style={{ marginTop:8, display:"flex", gap:10 }}>
                      <span style={{ fontSize:12, color:AVS.dim }}>{store.brand||"—"} · {store.refrigerant||"—"}</span>
                      {critCount>0&&<span style={{ fontSize:12, color:AVS.red }}>⚠ {critCount}</span>}
                      {warnCount>0&&<span style={{ fontSize:12, color:AVS.orange }}>! {warnCount}</span>}
                    </div>
                    {store.note&&<div style={{ fontSize:11, color:AVS.steelLt, marginTop:4 }}>📋 {store.note}</div>}
                  </div>
                  {store.circuits?.length>0 && (
                    <button onClick={()=>{ setActiveStoreId(store.id); setScreen("journal"); setDrawerOpen(false); }} style={{ width:"100%", background:"transparent", border:`1px solid ${AVS.border}`, borderTop:"none", borderRadius:"0 0 6px 6px", color:AVS.dim, fontSize:11, padding:"5px 14px", cursor:"pointer", textAlign:"left", fontFamily:F, marginBottom:8 }}>
                      📓 Journal & Patterns {journalCount>0?`(${journalCount} notes)`:""}
                    </button>
                  )}
                </div>
              );
            })}
            <div style={{ marginTop:16, borderTop:`1px solid ${AVS.border}`, paddingTop:14 }}>
              <button onClick={()=>{setScreen("dashboard");setDrawerOpen(false);}} style={{ background:AVS.card, border:`1px solid ${AVS.border}`, color:AVS.silver, borderRadius:6, padding:"9px 16px", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:F, width:"100%", textAlign:"left" }}>📊 Dashboard</button>
            </div>
          </div>
        </>
      )}

      {/* MAIN */}
      <div style={{ paddingTop:54, minHeight:"100vh" }}>

        {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
        {screen==="dashboard" && (
          <div style={{ padding:14, maxWidth:700, margin:"0 auto" }}>
            <div style={{ display:"flex", gap:8, marginBottom:18, marginTop:8 }}>
              {[["overnight",overnightIssues.length,"🌙","OVERNIGHT"],["today",todayIssues.length,"🔴","TODAY"],["thisweek",weekIssues.length,"🟡","THIS WEEK"]].map(([tab,count,,label])=>(
                <div key={tab} onClick={()=>setDashTab(tab)} style={{ flex:1, background:dashTab===tab?AVS.card:AVS.surface, border:`1px solid ${dashTab===tab?AVS.burgundy:AVS.border}`, borderRadius:8, padding:"11px 6px", cursor:"pointer", textAlign:"center" }}>
                  <div style={{ fontSize:20, fontFamily:F, fontWeight:800, color:tab==="today"&&count>0?AVS.red:tab==="thisweek"&&count>0?AVS.orange:AVS.white }}>{count}</div>
                  <div style={{ fontSize:10, color:AVS.dim, fontFamily:F, fontWeight:700, letterSpacing:1, marginTop:2 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontFamily:F, fontWeight:700, fontSize:15, letterSpacing:1, color:AVS.silver }}>
                {dashTab==="overnight"?"🌙 Overnight Flags":dashTab==="today"?"🔴 Act Today":"🟡 This Week"}
              </div>
              <button onClick={()=>openNewIssue()} style={{ background:AVS.burgundy, border:`1px solid ${AVS.burLight}`, color:AVS.white, borderRadius:6, padding:"6px 14px", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:F }}>+ Log Issue</button>
            </div>
            {tabIssues.length===0
              ? <div style={{ textAlign:"center", color:AVS.dim, padding:"48px 0" }}><div style={{ fontSize:24, marginBottom:8 }}>✓</div><div>Nothing flagged here</div></div>
              : tabIssues.sort((a,b)=>b.riskScore-a.riskScore).map(issue=><IssueRow key={issue.id} issue={issue}/>)
            }
          </div>
        )}

        {/* ── STORE CIRCUIT VIEW ────────────────────────────────────────── */}
        {(screen==="store"||screen==="systems") && activeStore && (
          <div style={{ padding:14, maxWidth:960, margin:"0 auto" }}>

            {/* Store header */}
            <div style={{ background:AVS.card, border:`1px solid ${AVS.border}`, borderLeft:`4px solid ${getColor(activeStore.id).main}`, borderRadius:10, padding:14, marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
                <div>
                  <div style={{ fontFamily:F, fontWeight:700, fontSize:18, letterSpacing:1 }}>{activeStore.name} — {activeStore.location}</div>
                  <div style={{ color:AVS.dim, fontSize:12, marginTop:2 }}>{activeStore.brand} · {activeStore.refrigerant} · {activeStore.controllers.map(c=>c.name).join(", ")}</div>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {[["crit",AVS.red,"Critical"],["warn",AVS.orange,"Warning"],["ok",AVS.green,"OK"]].map(([s,c,l])=>{
                    const n = activeStore.circuits?.filter(x=>x.status===s).length||0;
                    return <div key={s} style={{ background:AVS.surface, border:`1px solid ${AVS.border}`, borderRadius:6, padding:"5px 10px", textAlign:"center" }}>
                      <div style={{ color:c, fontFamily:F, fontWeight:800, fontSize:17 }}>{n}</div>
                      <div style={{ color:AVS.dim, fontSize:10, fontFamily:F, fontWeight:700 }}>{l.toUpperCase()}</div>
                    </div>;
                  })}
                </div>
              </div>
              {activeStore.note&&<div style={{ marginTop:8, fontSize:12, color:AVS.steelLt }}>📋 {activeStore.note}</div>}
            </div>

            {/* Store nav tab strip */}
            <div style={{ display:"flex", gap:6, marginBottom:14 }}>
              {[
                ["systems","⚙ Systems & Racks"],
                ["store",  "📋 Circuits"],
                ["journal","📓 Journal"],
              ].map(([tab,label])=>{
                const active = screen===tab || (tab==="store"&&screen==="store");
                const tabColor = tab==="systems"?AVS.teal:tab==="journal"?AVS.steelLt:AVS.silver;
                const alertBadge = tab==="systems" && rackSystems.some(s=>s.status!=="ok")
                  ? <span style={{ background:AVS.red+"33", borderRadius:"50%", width:14, height:14, fontSize:9, color:AVS.red, fontWeight:800, display:"inline-flex", alignItems:"center", justifyContent:"center", marginLeft:4 }}>!</span>
                  : null;
                return (
                  <button key={tab} onClick={()=>{ if(tab==="journal") setScreen("journal"); else setScreen(tab); }} style={{ flex:1, background:active?AVS.card:AVS.surface, border:`1px solid ${active?tabColor:AVS.border}`, color:active?tabColor:AVS.dim, borderRadius:8, padding:"9px 0", cursor:"pointer", fontFamily:F, fontWeight:700, fontSize:12 }}>
                    {label}{alertBadge}
                  </button>
                );
              })}
            </div>

            {/* ── SYSTEMS TAB ─────────────────────────────────────────────── */}
            {screen==="systems" && (
              <div>
                {/* Summary strip */}
                <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
                  {rackSystems.map(sys=>{
                    const sc = sys.status==="crit"?AVS.red:sys.status==="warn"?AVS.orange:AVS.green;
                    const running = sys.compressors.filter(c=>c.status==="run").length;
                    return (
                      <div key={sys.id} style={{ flex:1, minWidth:100, background:AVS.card, border:`1px solid ${sc}44`, borderRadius:8, padding:"10px 12px", cursor:"pointer" }} onClick={()=>{ const el=document.getElementById(`rack-${sys.id}`); if(el) el.scrollIntoView({behavior:"smooth",block:"start"}); }}>
                        <div style={{ fontFamily:F, fontWeight:700, fontSize:14, color:sc }}>{sys.name}</div>
                        <div style={{ fontSize:10, color:AVS.dim, marginBottom:4 }}>{sys.label.split("—")[0].trim()}</div>
                        {sys.compressors.length>0
                          ? <div style={{ fontFamily:F, fontSize:12, color:running>0?AVS.green:AVS.dim }}>{running}/{sys.compressors.length} comp.</div>
                          : <div style={{ fontSize:11, color:AVS.dim }}>SC units</div>
                        }
                        {sys.alerts.length>0&&<div style={{ fontSize:10, color:sc, marginTop:2 }}>⚠ {sys.alerts.length} alert{sys.alerts.length>1?"s":""}</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Rack cards */}
                {rackSystems.map(sys=>(
                  <div key={sys.id} id={`rack-${sys.id}`}>
                    <RackSystemCard sys={sys} storeCircuits={activeStore.circuits||[]}/>
                  </div>
                ))}
              </div>
            )}

            {/* ── CIRCUITS TAB ─────────────────────────────────────────────── */}
            {screen==="store" && (
              <div>
                {/* Patterns banner */}
                {storePatterns.length>0 && (
                  <div style={{ background:"#1A0A00", border:`1px solid ${AVS.orange}44`, borderRadius:8, padding:"10px 14px", marginBottom:14 }}>
                    <div style={{ fontFamily:F, fontWeight:700, fontSize:13, color:AVS.orange, marginBottom:8 }}>⚠ {storePatterns.length} SYSTEM PATTERN{storePatterns.length>1?"S":""} DETECTED</div>
                    {storePatterns.map((p,i)=>(
                      <div key={i} style={{ fontSize:12, color:AVS.silver, marginBottom:4 }}><span style={{ marginRight:6 }}>{p.icon}</span><strong style={{ color:p.severity==="crit"?AVS.red:AVS.orange }}>{p.title}:</strong> {p.body.slice(0,90)}… <button onClick={()=>setScreen("journal")} style={{ background:"none", border:"none", color:AVS.steelLt, cursor:"pointer", fontSize:11, fontFamily:F }}>View →</button></div>
                    ))}
                  </div>
                )}

                {/* Resolved-without-notes banner */}
                {resolvedNoNotes.length>0 && (
                  <div style={{ background:"#0A0A22", border:`1px solid ${AVS.steelLt}44`, borderRadius:8, padding:"10px 14px", marginBottom:14 }}>
                    <div style={{ fontFamily:F, fontWeight:700, fontSize:13, color:AVS.steelLt, marginBottom:6 }}>📋 {resolvedNoNotes.length} RESOLVED ISSUE{resolvedNoNotes.length>1?"S":""} WITH NO TECH NOTE</div>
                    {resolvedNoNotes.map(r=>(
                      <div key={r.id} style={{ fontSize:12, color:AVS.dim, marginBottom:3 }}>· {r.circuit} — resolved {r.createdAt} but no emergency/PM note logged. <button onClick={()=>openNoteModal(r.circuit?.split(" ")[0],r.circuit)} style={{ background:"none", border:"none", color:AVS.steelLt, cursor:"pointer", fontSize:11, fontFamily:F }}>Add note →</button></div>
                    ))}
                  </div>
                )}

                {/* Filters */}
                <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
                  <input placeholder="Search circuit or area…" value={circuitSearch} onChange={e=>setCircuitSearch(e.target.value)} style={{ ...inp, width:180, padding:"6px 10px", fontSize:12 }}/>
                  <div style={{ display:"flex", gap:5 }}>
                    {["all","crit","warn","ok"].map(f=>{
                      const colors={all:AVS.silver,crit:AVS.red,warn:AVS.orange,ok:AVS.green};
                      return <button key={f} onClick={()=>setCircuitFilter(f)} style={{ background:circuitFilter===f?AVS.card:"transparent", border:`1px solid ${circuitFilter===f?colors[f]:AVS.border}`, color:circuitFilter===f?colors[f]:AVS.dim, borderRadius:5, padding:"4px 10px", fontSize:12, cursor:"pointer", fontFamily:F, fontWeight:700, textTransform:"uppercase" }}>{f}</button>;
                    })}
                  </div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    {["all",...systems].map(s=>(
                      <button key={s} onClick={()=>setSystemFilter(s)} style={{ background:systemFilter===s?AVS.card:"transparent", border:`1px solid ${systemFilter===s?getColor(activeStore.id).main:AVS.border}`, color:systemFilter===s?getColor(activeStore.id).main:AVS.dim, borderRadius:5, padding:"4px 10px", fontSize:12, cursor:"pointer", fontFamily:F }}>
                        {s==="all"?"All":s==="SC"?"Self-Cont.":`Sys ${s}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(250px,1fr))", gap:10 }}>
                  {filteredCircuits(activeStore).map(c=><CircuitCard key={c.id} c={c}/>)}
                </div>
                {filteredCircuits(activeStore).length===0&&(
                  <div style={{ textAlign:"center", color:AVS.dim, padding:"48px 0" }}><div style={{ fontSize:22, marginBottom:8 }}>○</div><div>No circuits match this filter</div></div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── JOURNAL / PATTERNS VIEW ───────────────────────────────────── */}
        {screen==="journal" && activeStore && (
          <div style={{ padding:14, maxWidth:760, margin:"0 auto" }}>
            {/* Back + title */}
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:14 }}>
              <button onClick={()=>setScreen("store")} style={{ background:AVS.card, border:`1px solid ${AVS.border}`, color:AVS.silver, borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:F, fontSize:12 }}>← Circuits</button>
              <div style={{ fontFamily:F, fontWeight:700, fontSize:17, color:AVS.white }}>{activeStore.name} · Log</div>
            </div>

            {/* Tab bar */}
            <div style={{ display:"flex", gap:6, marginBottom:14 }}>
              {[["journal","📓 Journal"],["patterns","🔍 Patterns"],["unresolved","⚠ Unresolved"]].map(([tab,label])=>(
                <button key={tab} onClick={()=>setJournalTab(tab)} style={{ flex:1, background:journalTab===tab?AVS.card:AVS.surface, border:`1px solid ${journalTab===tab?AVS.steelLt:AVS.border}`, color:journalTab===tab?AVS.steelLt:AVS.dim, borderRadius:7, padding:"8px 0", cursor:"pointer", fontFamily:F, fontWeight:700, fontSize:12 }}>{label}</button>
              ))}
            </div>

            {/* JOURNAL TAB */}
            {journalTab==="journal" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ color:AVS.dim, fontSize:12 }}>{storeCNotes.length} entries · most recent first</div>
                  <button onClick={()=>openNoteModal("","General Note")} style={{ background:AVS.steel+"33", border:`1px solid ${AVS.steelLt}44`, color:AVS.steelLt, borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:F, fontWeight:700, fontSize:12 }}>+ New Note</button>
                </div>

                {/* Filter by type */}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                  {NOTE_TYPES.map(nt=>{
                    const count = storeCNotes.filter(n=>n.type===nt.id).length;
                    if (count===0) return null;
                    return (
                      <span key={nt.id} style={{ background:nt.color+"22", border:`1px solid ${nt.color}44`, color:nt.color, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:700, fontFamily:F }}>
                        {nt.icon} {count}
                      </span>
                    );
                  })}
                </div>

                {storeCNotes.length===0
                  ? <div style={{ textAlign:"center", color:AVS.dim, padding:"40px 0" }}><div style={{ fontSize:22, marginBottom:8 }}>📓</div><div>No notes yet. Add your first entry above.</div></div>
                  : storeCNotes.map(note=><JournalEntry key={note.id} note={note}/>)
                }
              </div>
            )}

            {/* PATTERNS TAB */}
            {journalTab==="patterns" && (
              <div>
                {storePatterns.length===0 ? (
                  <div style={{ textAlign:"center", color:AVS.dim, padding:"40px 0" }}><div style={{ fontSize:22, marginBottom:8 }}>🔍</div><div>No system patterns detected yet.</div><div style={{ fontSize:12, marginTop:6 }}>Patterns emerge as you log more notes and issues.</div></div>
                ) : storePatterns.map((p,i)=><PatternCard key={i} p={p}/>)}

                {/* Pattern legend */}
                <div style={{ background:AVS.card, border:`1px solid ${AVS.border}`, borderRadius:8, padding:14, marginTop:16 }}>
                  <div style={{ fontFamily:F, fontWeight:700, fontSize:13, color:AVS.silver, marginBottom:10 }}>WHAT CRYOWATCH LOOKS FOR</div>
                  {[
                    ["💧","Humidity Clusters","2+ circuits with humidity flags in the same store → possible ambient or store HVAC issue"],
                    ["❄","Defrost Failures","3+ circuits with defrost anomalies → check rack defrost schedule, shared heater circuits, AK outputs"],
                    ["⚙","Rack-Level Issues","Rack notes trigger an immediate review of all circuits on that system"],
                    ["🌡","Ambient Temp","High store temp can cascade silently to medium-temp cases before alarms trigger"],
                    ["📋","Resolved w/o Notes","Any issue moved to Resolved with no corresponding tech note is flagged — someone must account for what was done"],
                  ].map(([icon,title,desc])=>(
                    <div key={title} style={{ marginBottom:10, display:"flex", gap:10 }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
                      <div>
                        <div style={{ fontFamily:F, fontWeight:700, fontSize:13, color:AVS.white }}>{title}</div>
                        <div style={{ fontSize:12, color:AVS.dim, lineHeight:1.4 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UNRESOLVED TAB */}
            {journalTab==="unresolved" && (
              <div>
                {resolvedNoNotes.length>0 && (
                  <div style={{ background:"#0A0A22", border:`1px solid ${AVS.steelLt}44`, borderRadius:8, padding:14, marginBottom:16 }}>
                    <div style={{ fontFamily:F, fontWeight:700, fontSize:13, color:AVS.steelLt, marginBottom:8 }}>📋 RESOLVED WITHOUT A TECH NOTE</div>
                    {resolvedNoNotes.map(r=>(
                      <div key={r.id} style={{ marginBottom:10, background:AVS.card, borderRadius:6, padding:"8px 12px" }}>
                        <div style={{ fontFamily:F, fontSize:14, color:AVS.white }}>{r.circuit}</div>
                        <div style={{ fontSize:12, color:AVS.dim, marginTop:2 }}>Logged {r.createdAt} · Resolved with no corresponding emergency or PM note</div>
                        <button onClick={()=>openNoteModal(r.circuit?.split(" ")[0]||"",r.circuit||"")} style={{ marginTop:6, background:AVS.steel+"33", border:`1px solid ${AVS.steelLt}44`, color:AVS.steelLt, borderRadius:5, padding:"3px 10px", cursor:"pointer", fontFamily:F, fontSize:11 }}>+ Add Note</button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ fontFamily:F, fontWeight:700, fontSize:13, color:AVS.silver, marginBottom:10 }}>OPEN ISSUES — {activeStore.name}</div>
                {issues.filter(i=>i.storeId===activeStore.id&&i.urgency!=="Resolved").sort((a,b)=>b.riskScore-a.riskScore).map(issue=><IssueRow key={issue.id} issue={issue}/>)}
                {issues.filter(i=>i.storeId===activeStore.id&&i.urgency!=="Resolved").length===0&&(
                  <div style={{ textAlign:"center", color:AVS.dim, padding:"30px 0" }}>✓ No open issues</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── NOTE MODAL ─────────────────────────────────────────────────────── */}
      {noteModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:600 }}>
          <div style={{ background:AVS.surface, border:`1px solid ${AVS.border}`, borderRadius:"16px 16px 0 0", padding:22, width:"100%", maxWidth:560, maxHeight:"88vh", overflowY:"auto" }}>
            <div style={{ fontFamily:F, fontWeight:700, fontSize:17, letterSpacing:1, marginBottom:4 }}>LOG NOTE</div>
            <div style={{ color:AVS.dim, fontSize:12, marginBottom:16 }}>{noteModal.circuitId} — {noteModal.circuitName}</div>

            {/* Type selector */}
            <label style={lbl}>Note Type</label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
              {NOTE_TYPES.map(nt=>(
                <button key={nt.id} onClick={()=>setNoteForm(f=>({...f,type:nt.id}))} style={{ background:noteForm.type===nt.id?nt.color+"33":"transparent", border:`1px solid ${noteForm.type===nt.id?nt.color:AVS.border}`, color:noteForm.type===nt.id?nt.color:AVS.dim, borderRadius:5, padding:"4px 10px", fontSize:12, cursor:"pointer", fontFamily:F, fontWeight:700 }}>
                  {nt.icon} {nt.label}
                </button>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
              <div><label style={lbl}>Date</label><input type="date" value={noteForm.date} onChange={e=>setNoteForm(f=>({...f,date:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Time</label><input type="time" value={noteForm.time} onChange={e=>setNoteForm(f=>({...f,time:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Shift</label>
                <select value={noteForm.shift} onChange={e=>setNoteForm(f=>({...f,shift:e.target.value}))} style={sel}>
                  <option>AM</option><option>PM</option><option>EVE</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom:12 }}><label style={lbl}>Tech / Initials</label><input value={noteForm.tech||""} onChange={e=>setNoteForm(f=>({...f,tech:e.target.value}))} placeholder="e.g. JRS, Auto-AI…" style={inp}/></div>
            <div style={{ marginBottom:18 }}><label style={lbl}>Note</label>
              <textarea rows={5} value={noteForm.text||""} onChange={e=>setNoteForm(f=>({...f,text:e.target.value}))} placeholder="What was found, what was done, parts ordered, patterns observed, temps at time of visit…" style={{...inp,resize:"vertical"}}/>
            </div>

            <div style={{ fontSize:11, color:AVS.dim, marginBottom:16, lineHeight:1.5 }}>
              <strong style={{ color:AVS.orange }}>Tip:</strong> If a case was running bad but is now OK, note what you found and what fixed it. CryoWatch will flag resolved issues with no tech note so nothing slips through.
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setNoteModal(null)} style={{ flex:1, background:AVS.card, border:`1px solid ${AVS.border}`, color:AVS.silver, borderRadius:6, padding:"9px 0", cursor:"pointer", fontWeight:700, fontFamily:F }}>Cancel</button>
              <button onClick={saveNote} style={{ flex:2, background:AVS.steel, border:`1px solid ${AVS.steelLt}`, color:AVS.white, borderRadius:6, padding:"9px 0", cursor:"pointer", fontWeight:700, fontFamily:F }}>Save Note</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ISSUE FORM MODAL ───────────────────────────────────────────────── */}
      {showIssueForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:500 }}>
          <div style={{ background:AVS.surface, border:`1px solid ${AVS.border}`, borderRadius:"16px 16px 0 0", padding:22, width:"100%", maxWidth:560, maxHeight:"85vh", overflowY:"auto" }}>
            <div style={{ fontFamily:F, fontWeight:700, fontSize:17, letterSpacing:1, marginBottom:18 }}>{editingIssueId?"EDIT ISSUE":"LOG NEW ISSUE"}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
              <div><label style={lbl}>Store</label>
                <select value={issueForm.storeId} onChange={e=>setIssueForm(f=>({...f,storeId:Number(e.target.value)}))} style={sel}>
                  {stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Type</label>
                <select value={issueForm.type} onChange={e=>setIssueForm(f=>({...f,type:e.target.value}))} style={sel}>
                  {["Alarm","Trending","Defrost","Compressor"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Urgency</label>
                <select value={issueForm.urgency} onChange={e=>setIssueForm(f=>({...f,urgency:e.target.value}))} style={sel}>
                  {["Today","This Week","Watch List","Resolved"].map(u=><option key={u}>{u}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Risk (1–10)</label>
                <select value={issueForm.riskScore} onChange={e=>setIssueForm(f=>({...f,riskScore:Number(e.target.value)}))} style={sel}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:12 }}><label style={lbl}>Circuit / Equipment</label><input value={issueForm.circuit||""} onChange={e=>setIssueForm(f=>({...f,circuit:e.target.value}))} placeholder="e.g. 2G DFBX 1-9" style={inp}/></div>
            <div style={{ marginBottom:12 }}><label style={lbl}>Description</label><textarea rows={3} value={issueForm.description||""} onChange={e=>setIssueForm(f=>({...f,description:e.target.value}))} placeholder="Specific values, patterns, what was flagged…" style={{...inp,resize:"vertical"}}/></div>
            <div style={{ marginBottom:20 }}><label style={lbl}>Notes</label><textarea rows={2} value={issueForm.notes||""} onChange={e=>setIssueForm(f=>({...f,notes:e.target.value}))} placeholder="Actions taken, parts ordered…" style={{...inp,resize:"vertical"}}/></div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowIssueForm(false)} style={{ flex:1, background:AVS.card, border:`1px solid ${AVS.border}`, color:AVS.silver, borderRadius:6, padding:"9px 0", cursor:"pointer", fontWeight:700, fontFamily:F }}>Cancel</button>
              <button onClick={saveIssue} style={{ flex:2, background:AVS.burgundy, border:`1px solid ${AVS.burLight}`, color:AVS.white, borderRadius:6, padding:"9px 0", cursor:"pointer", fontWeight:700, fontFamily:F }}>{editingIssueId?"Save Changes":"Log Issue"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}