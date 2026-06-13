import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════
//  CRYOWATCH  ·  Cold-chain monitoring for commercial refrigeration
//  Visual language: the Coors Light "cold-activated" can — brushed aluminum,
//  Rocky Mountain ridges that frost over icy blue, alpine night sky.
// ═══════════════════════════════════════════════════════════════════════════

// ── Arctic palette ────────────────────────────────────────────────────────────
const C = {
  // deep cold backgrounds
  abyss:    "#07131F",
  deep:     "#0C1E2E",
  steel:    "#112739",
  steel2:   "#173247",
  raised:   "#1C3C53",
  line:     "#1F3E55",
  lineLt:   "#2D5876",
  // cold-activated blues (the mountain blue)
  ice:      "#5CC8F2",
  iceBright:"#92DCF8",
  glacier:  "#1FA3DC",
  deepIce:  "#0C6FA6",
  // brushed metal
  aluminum: "#C2CACF",
  chrome:   "#EAF0F4",
  pewter:   "#7E8C97",
  // frost whites
  frost:    "#EAF5FC",
  snow:     "#F7FCFE",
  // accent — Coors banner red, used sparingly
  red:      "#D11F33",
  // text / status
  txt:      "#E7F1F8",
  dim:      "#6E8394",
  green:    "#3FD68A",
  amber:    "#F2B33D",
  orange:   "#F2843D",
  crit:     "#FF5C6C",
  purple:   "#A78BFA",
  teal:     "#2DD4BF",
};

const STORE_COLORS = [
  { main:"#5CC8F2", dim:"#0C3A52" },
  { main:"#2DD4BF", dim:"#0B463E" },
  { main:"#F2B33D", dim:"#4A3510" },
  { main:"#A78BFA", dim:"#33245A" },
  { main:"#3FD68A", dim:"#0E4329" },
  { main:"#F2843D", dim:"#4A2710" },
];

const NOTE_TYPES = [
  { id:"emergency",  label:"Emergency Fix",       color:C.crit,   icon:"🚨" },
  { id:"pm",         label:"Preventive Maint.",   color:C.teal,   icon:"🔧" },
  { id:"rack",       label:"Rack Issue",          color:C.orange, icon:"⚙" },
  { id:"defrost",    label:"Defrost Adj.",        color:C.ice,    icon:"❄" },
  { id:"sensor",     label:"Sensor / Wiring",     color:C.purple, icon:"📡" },
  { id:"door",       label:"Door / Gasket",       color:C.amber,  icon:"🚪" },
  { id:"ambient",    label:"Ambient / HVAC",      color:"#9FD8C4",icon:"🌡" },
  { id:"humidity",   label:"Humidity Issue",      color:C.iceBright,icon:"💧" },
  { id:"resolved",   label:"Resolved / Verified", color:C.green,  icon:"✓" },
  { id:"observation",label:"Observation",         color:C.dim,    icon:"👁" },
];

const URGENCY = {
  Today:        { color:C.crit,   bg:"#2A0E14", border:"#5A1A26", label:"TODAY" },
  "This Week":  { color:C.orange, bg:"#2A1A0A", border:"#5A3414", label:"THIS WEEK" },
  "Watch List": { color:C.ice,    bg:"#0A2433", border:"#13486A", label:"WATCH" },
  Resolved:     { color:C.green,  bg:"#0A2A1C", border:"#145A3A", label:"RESOLVED" },
};

const TYPE_ICON  = { Alarm:"⚠", Trending:"↗", Defrost:"❄", Compressor:"⚙" };
const TYPE_COLOR = { Alarm:C.crit, Trending:C.orange, Defrost:C.ice, Compressor:C.purple };

// ── Login profiles ─────────────────────────────────────────────────────────────
const TECHS = [
  { id:"jm",    name:"Jesse Mosko",  role:"Lead Refrigeration Tech", region:"Front Range",      initials:"JM", tint:C.ice },
  { id:"dr",    name:"Dana Reyes",   role:"Service Technician",      region:"Denver Metro",     initials:"DR", tint:C.teal },
  { id:"tb",    name:"Tom Becker",   role:"Overnight Monitoring",    region:"Boulder · North",  initials:"TB", tint:C.iceBright },
  { id:"guest", name:"Demo Access",  role:"Read-only walkthrough",   region:"All stores",       initials:"··", tint:C.aluminum, demo:true },
];

// ── Store 89 circuits ───────────────────────────────────────────────────────────
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

// ── Seed issues ─────────────────────────────────────────────────────────────────
let nextIssueId = 10;
const SEED_ISSUES = [
  { id:1, storeId:89, type:"Defrost",  urgency:"Today",      controllerName:"AK-CC 550", circuit:"SC11 BKRY CAKE FRIDG",   description:"SC11 running chronically in alarm zone (25-30°F). Defrost not terminating on temp — time-outs every cycle. Possible heater failure or sensor fault.", riskScore:9, createdAt:"2025-06-10", notes:"", autoLogged:true, overnight:true },
  { id:2, storeId:89, type:"Defrost",  urgency:"Today",      controllerName:"AK-CC 550", circuit:"2G DFBX 1-9",            description:"Defrost pattern shows inconsistent pull-down all week. 6/10 defrost ran long. Inspect heaters.", riskScore:7, createdAt:"2025-06-10", notes:"", autoLogged:true, overnight:true },
  { id:3, storeId:89, type:"Trending", urgency:"This Week",  controllerName:"AK-800A",   circuit:"2Ea RIFF 1-7",           description:"Baseline temp climbing from 32°F (6/05) to 34°F (6/11). Slow upward trend — monitor for coil ice or door seal issue.", riskScore:5, createdAt:"2025-06-09", notes:"", autoLogged:true, overnight:false },
  { id:4, storeId:89, type:"Defrost",  urgency:"This Week",  controllerName:"AK-CC 550", circuit:"2A BFBX 1-1",            description:"2A defrost peaks inconsistent. Some defrosts reaching 37°F, others 15°F. Possible heater cycling issue.", riskScore:6, createdAt:"2025-06-09", notes:"", autoLogged:true, overnight:true },
  { id:5, storeId:89, type:"Trending", urgency:"Watch List", controllerName:"AK-CC 550", circuit:"4T BEER 1-21a",           description:"Beer case temps running 41-43°F consistently above 41°F setpoint. Intermittent warm spikes. Monitor door seals.", riskScore:4, createdAt:"2025-06-08", notes:"", autoLogged:true, overnight:false },
];

// ── Seed circuit notes ────────────────────────────────────────────────────────────
let nextNoteId = 100;
const SEED_CIRCUIT_NOTES = [
  { id:1, storeId:89, circuitId:"SC11", type:"observation", text:"Cake fridge running 25-37°F all day — oscillating widely between low alarm and mid-range. Defrost only gets to 30°F max before timing out. Heater element suspect.", tech:"Auto-AI", date:"2025-06-10", time:"06:00", shift:"AM" },
  { id:2, storeId:89, circuitId:"2G",   type:"observation", text:"Deli freezer pull-down after defrost taking 45+ min to recover to 5°F. Defrost heater may be partially failed or fan cycling off too soon.", tech:"Auto-AI", date:"2025-06-10", time:"06:00", shift:"AM" },
  { id:3, storeId:89, circuitId:"2A",   type:"observation", text:"Bakery freezer defrost peaks erratic — 15°F one cycle, 37°F next. Pattern suggests one of two heater banks is not firing consistently.", tech:"Auto-AI", date:"2025-06-09", time:"06:00", shift:"AM" },
  { id:4, storeId:89, circuitId:"SC27", type:"humidity",   text:"Starbucks fridge SC27 showing rapid cycling — 34°F to 50°F swings on every compressor cycle. Door seal or fan shroud suspected. High ambient near coffee station.", tech:"Auto-AI", date:"2025-06-10", time:"06:00", shift:"AM" },
];

// ── Pattern detection engine ─────────────────────────────────────────────────────
function detectPatterns(circuitNotes, storeId) {
  const storeNotes = circuitNotes.filter(n => n.storeId === storeId);
  const patterns = [];
  const humidityNotes = storeNotes.filter(n => n.type === "humidity");
  if (humidityNotes.length >= 2) {
    const circuits = [...new Set(humidityNotes.map(n => n.circuitId))];
    patterns.push({ type:"humidity", severity:"warn", title:"Humidity Pattern Detected", body:`${circuits.length} circuits showing humidity-related issues (${circuits.join(", ")}). Check ambient conditions and door gaskets in affected zones.`, circuits, icon:"💧" });
  }
  const ambientNotes = storeNotes.filter(n => n.type === "ambient");
  if (ambientNotes.length >= 1) {
    patterns.push({ type:"ambient", severity:"warn", title:"Ambient Temp Concern", body:"One or more circuits flagged ambient/HVAC involvement. High store temp can cascade to multiple cases simultaneously.", circuits: ambientNotes.map(n=>n.circuitId), icon:"🌡" });
  }
  const defrostNotes = storeNotes.filter(n => n.type === "defrost" || n.type === "observation").filter(n => n.text.toLowerCase().includes("defrost"));
  if (defrostNotes.length >= 3) {
    const circuits = [...new Set(defrostNotes.map(n => n.circuitId))];
    patterns.push({ type:"defrost-cluster", severity:"crit", title:"Multiple Defrost Failures", body:`${circuits.length} circuits with defrost anomalies (${circuits.join(", ")}). Check rack defrost schedule overlap, AK-800A defrost outputs, and shared heater circuits.`, circuits, icon:"❄" });
  }
  const rackNotes = storeNotes.filter(n => n.type === "rack");
  if (rackNotes.length >= 1) {
    patterns.push({ type:"rack", severity:"crit", title:"Rack-Level Issue Noted", body:"Rack or compressor-level issue logged. Verify suction pressure, discharge pressure, and all circuits on this system.", circuits: rackNotes.map(n=>n.circuitId), icon:"⚙" });
  }
  return patterns;
}

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

// ── Type system ──────────────────────────────────────────────────────────────────
const F  = `'Oswald','Barlow Condensed','Segoe UI',sans-serif`;   // alpine condensed display
const FB = `'Inter','Segoe UI',sans-serif`;                        // body
const FM = `'Space Mono','JetBrains Mono',ui-monospace,monospace`; // instrument readouts

const inp = { width:"100%", background:"#06121C", border:`1px solid ${C.line}`, borderRadius:8, color:C.txt, padding:"10px 12px", fontSize:14, boxSizing:"border-box", outline:"none", fontFamily:FB };
const sel = { ...inp, cursor:"pointer" };
const lbl = { display:"block", color:C.dim, fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:1.5, marginBottom:6, fontFamily:F };

const getColor = id => STORE_COLORS[DEFAULT_STORES.findIndex(s=>s.id===id) % STORE_COLORS.length] || STORE_COLORS[0];
const pad2     = n  => String(n).padStart(2,"0");
const nowStr   = ()  => { const d=new Date(); return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; };
const nowTime  = ()  => { const d=new Date(); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const shiftOf  = ()  => { const h=new Date().getHours(); return h<12?"AM":h<17?"PM":"EVE"; };

// ── Global style: fonts, frost, cold-activation keyframes ──────────────────────────
function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
      @keyframes coldRise   { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(6% 0 0 0); } }
      @keyframes twinkle    { 0%,100% { opacity:.25; } 50% { opacity:.9; } }
      @keyframes drift      { from { transform: translateX(0); } to { transform: translateX(-40px); } }
      @keyframes sheen      { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
      @keyframes floatUp    { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform:none; } }
      @keyframes pulseRing  { 0% { box-shadow:0 0 0 0 rgba(92,200,242,.45);} 100% { box-shadow:0 0 0 10px rgba(92,200,242,0);} }
      .cw-snow { position:absolute; border-radius:50%; background:#cfeefb; animation:twinkle 4s ease-in-out infinite; }
      .cw-card-lift { transition: transform .25s cubic-bezier(.2,.7,.3,1), box-shadow .25s, border-color .25s; }
      .cw-card-lift:hover { transform: translateY(-4px); }
      .cw-metal { background:
          linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,0) 40%),
          linear-gradient(180deg, ${C.steel2}, ${C.steel}); }
      .cw-sheen { position:relative; overflow:hidden; }
      .cw-sheen::after { content:""; position:absolute; inset:0;
          background:linear-gradient(115deg, transparent 30%, rgba(255,255,255,.10) 48%, transparent 60%);
          background-size:200% 100%; animation:sheen 7s linear infinite; pointer-events:none; }
      @media (prefers-reduced-motion: reduce) {
        .cw-sheen::after, .cw-snow, [data-anim] { animation:none !important; }
        [data-cold] { clip-path: inset(6% 0 0 0) !important; }
      }
      ::-webkit-scrollbar { width:10px; height:10px; }
      ::-webkit-scrollbar-thumb { background:${C.line}; border-radius:8px; }
      ::-webkit-scrollbar-thumb:hover { background:${C.lineLt}; }
    `}</style>
  );
}

// ── Signature: cold-activated Rocky Mountain ridge ─────────────────────────────────
const RIDGE_BACK  = "M0,200 L0,140 L120,160 L210,95 L300,140 L380,70 L470,130 L560,60 L660,120 L760,80 L860,140 L940,100 L1000,135 L1000,200 Z";
const RIDGE_FRONT = "M0,200 L0,150 L90,168 L170,108 L250,150 L330,92 L420,148 L500,70 L590,140 L690,95 L780,150 L880,110 L1000,150 L1000,200 Z";

function FrostMountains({ height = 220, activate = false, animateOnce = false }) {
  // Two ridge layers; the front ridge "cold activates" — a blue frost wash rises from the base.
  const coldStyle = animateOnce
    ? { animation:"coldRise 2.4s cubic-bezier(.2,.7,.2,1) .3s both" }
    : { clipPath: activate ? "inset(6% 0 0 0)" : "inset(100% 0 0 0)", transition:"clip-path .9s cubic-bezier(.2,.7,.2,1)" };

  return (
    <div style={{ position:"relative", width:"100%", height, pointerEvents:"none" }}>
      {/* back ridge — frosted silver */}
      <svg viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.5 }}>
        <defs>
          <linearGradient id="backG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9FB3C2"/><stop offset="1" stopColor="#2A4A63"/>
          </linearGradient>
        </defs>
        <path d={RIDGE_BACK} fill="url(#backG)"/>
      </svg>

      {/* front ridge — base frost white */}
      <svg viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
        <defs>
          <linearGradient id="frontG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F2F9FE"/><stop offset=".55" stopColor="#C6D6E2"/><stop offset="1" stopColor="#3A5A74"/>
          </linearGradient>
        </defs>
        <path d={RIDGE_FRONT} fill="url(#frontG)"/>
      </svg>

      {/* front ridge — COLD-ACTIVATED blue overlay, revealed from bottom up */}
      <svg data-cold viewBox="0 0 1000 200" preserveAspectRatio="none"
           style={{ position:"absolute", inset:0, width:"100%", height:"100%", ...coldStyle }}>
        <defs>
          <linearGradient id="coldG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#BFE9FB"/><stop offset=".4" stopColor={C.ice}/><stop offset="1" stopColor={C.deepIce}/>
          </linearGradient>
        </defs>
        <path d={RIDGE_FRONT} fill="url(#coldG)"/>
      </svg>

      {/* snow caps glint on the peaks */}
      <svg viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
        <path d="M500,70 L520,82 L500,76 L482,84 Z M330,92 L348,102 L330,98 L314,103 Z M690,95 L706,104 L690,100 L676,105 Z"
              fill="#FFFFFF" opacity=".9"/>
      </svg>
    </div>
  );
}

// ── Small UI atoms ─────────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const colors = { ok:C.green, warn:C.orange, crit:C.crit };
  const col = colors[status] || C.dim;
  return <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:col, boxShadow:`0 0 8px ${col}88`, marginRight:5, flexShrink:0 }}/>;
}

function TempBar({ current, low, high, status }) {
  const range = high - low || 1;
  const pct   = Math.min(100, Math.max(0, ((current - low) / range) * 100));
  const color = status==="crit"?C.crit:status==="warn"?C.orange:C.ice;
  return (
    <div style={{ position:"relative", height:6, borderRadius:4, background:"#0A1A28", border:`1px solid ${C.line}`, width:"100%", marginTop:5, overflow:"hidden" }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${pct}%`, background:`linear-gradient(90deg, ${color}66, ${color})`, borderRadius:4, transition:"width .35s" }}/>
    </div>
  );
}

function NoteTypeBadge({ type }) {
  const nt = NOTE_TYPES.find(t=>t.id===type) || NOTE_TYPES[NOTE_TYPES.length-1];
  return (
    <span style={{ background:nt.color+"22", border:`1px solid ${nt.color}55`, color:nt.color, borderRadius:5, padding:"2px 8px", fontSize:11, fontWeight:600, fontFamily:F, letterSpacing:.5, whiteSpace:"nowrap" }}>
      {nt.icon} {nt.label}
    </span>
  );
}

function ShiftBadge({ shift }) {
  const colors = { AM:"#F2C94C", PM:C.purple, EVE:C.ice };
  return <span style={{ color:colors[shift]||C.dim, fontSize:10, fontWeight:700, fontFamily:F, letterSpacing:1 }}>{shift}</span>;
}

function Wordmark({ size=18 }) {
  return (
    <span style={{ fontFamily:F, fontWeight:600, fontSize:size, letterSpacing:2, display:"inline-flex", alignItems:"center", gap:7 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink:0 }}>
        <path d="M2 20 L8 9 L12 15 L16 6 L22 20 Z" fill={C.ice} opacity=".85"/>
        <path d="M8 9 L10 11.5 L8.6 10.8 L7.2 11.7 Z M16 6 L18 9 L16 8 L14.4 9 Z" fill="#fff"/>
      </svg>
      <span style={{ color:C.frost }}>CRYO</span><span style={{ color:C.ice }}>WATCH</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//  LOGIN — pick your profile
// ═══════════════════════════════════════════════════════════════════════════════════
function Login({ onSelect }) {
  const [hover, setHover] = useState(null);
  const snow = Array.from({ length: 26 }, (_, i) => ({
    left: (i * 37) % 100,
    top: (i * 53) % 60,
    size: (i % 3) + 1.5,
    delay: (i % 7) * 0.6,
  }));

  return (
    <div style={{ minHeight:"100vh", background:`radial-gradient(120% 90% at 50% -10%, #14344E 0%, ${C.deep}45%, ${C.abyss} 100%)`, color:C.txt, fontFamily:FB, position:"relative", overflow:"hidden" }}>
      {/* drifting frost specks */}
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        {snow.map((s,i)=>(
          <span key={i} className="cw-snow" style={{ left:`${s.left}%`, top:`${s.top}%`, width:s.size, height:s.size, animationDelay:`${s.delay}s` }}/>
        ))}
      </div>

      {/* content */}
      <div style={{ position:"relative", zIndex:2, maxWidth:880, margin:"0 auto", padding:"clamp(40px,7vh,90px) 20px 0", textAlign:"center", animation:"floatUp .8s ease both" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, border:`1px solid ${C.line}`, background:"#0B1C2A99", borderRadius:999, padding:"5px 14px", fontFamily:F, fontSize:11, letterSpacing:2, color:C.ice, marginBottom:22 }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:C.green, boxShadow:`0 0 8px ${C.green}` }}/> COLD-CHAIN ONLINE · COLORADO
        </div>
        <div style={{ marginBottom:8 }}><Wordmark size={46}/></div>
        <h1 style={{ fontFamily:F, fontWeight:300, fontSize:"clamp(20px,3.4vw,30px)", letterSpacing:1, color:C.frost, margin:"6px 0 6px" }}>
          Frost-brewed refrigeration monitoring.
        </h1>
        <p style={{ color:C.dim, fontSize:15, maxWidth:520, margin:"0 auto 30px", lineHeight:1.6 }}>
          Every rack, every case, every defrost — watched cold and caught early. Pick your profile to start your shift.
        </p>

        {/* profile picker */}
        <div style={{ fontFamily:F, fontSize:12, letterSpacing:2, color:C.pewter, marginBottom:14 }}>SELECT YOUR PROFILE</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:14, maxWidth:760, margin:"0 auto" }}>
          {TECHS.map((t,idx)=>{
            const active = hover===t.id;
            return (
              <button key={t.id}
                onMouseEnter={()=>setHover(t.id)} onMouseLeave={()=>setHover(null)}
                onClick={()=>onSelect(t)}
                className="cw-card-lift cw-metal"
                style={{ position:"relative", border:`1px solid ${active?t.tint:C.line}`, borderRadius:14, padding:"18px 16px 0", cursor:"pointer", textAlign:"left", overflow:"hidden", color:C.txt,
                  boxShadow: active ? `0 14px 34px -12px ${t.tint}66, inset 0 1px 0 rgba(255,255,255,.08)` : "0 6px 18px -10px #000a, inset 0 1px 0 rgba(255,255,255,.05)",
                  animation:`floatUp .6s ${0.15*idx+0.2}s ease both` }}>
                {/* badge top */}
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <div style={{ width:46, height:46, borderRadius:12, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F, fontWeight:600, fontSize:18, letterSpacing:1, color:C.abyss,
                    background:`linear-gradient(135deg, ${t.tint}, ${C.chrome})`,
                    boxShadow: active?`0 0 0 3px ${t.tint}33`:"none", transition:"box-shadow .25s" }}>
                    {t.initials}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontFamily:F, fontWeight:500, fontSize:17, letterSpacing:.5, color:C.frost, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.name}</div>
                    <div style={{ fontSize:11.5, color:active?t.tint:C.dim, transition:"color .2s" }}>{t.role}</div>
                  </div>
                </div>
                <div style={{ fontSize:11, color:C.pewter, letterSpacing:.5, marginBottom:14, display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontFamily:F }}>◷</span> {t.region}
                </div>
                {/* cold-activating mini ridge */}
                <div style={{ margin:"0 -16px -1px" }}>
                  <FrostMountains height={64} activate={active}/>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop:20, color:C.dim, fontSize:11.5 }}>
          No password screen here — this is a local demo build. Choose any profile to explore.
        </div>
      </div>

      {/* hero ridge across the floor of the screen */}
      <div style={{ position:"absolute", left:0, right:0, bottom:0, height:"clamp(180px,28vh,300px)", pointerEvents:"none" }}>
        <FrostMountains height="100%" animateOnce/>
        <div style={{ position:"absolute", inset:0, background:`linear-gradient(180deg, transparent 40%, ${C.abyss} 100%)` }}/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);

  const [stores]            = useState(DEFAULT_STORES);
  const [issues, setIssues] = useState(SEED_ISSUES);
  const [cNotes, setCNotes] = useState(SEED_CIRCUIT_NOTES);

  const [screen,        setScreen]        = useState("dashboard");
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [activeStoreId, setActiveStoreId] = useState(null);
  const [dashTab,       setDashTab]       = useState("overnight");

  const [showIssueForm,  setShowIssueForm]  = useState(false);
  const [issueForm,      setIssueForm]      = useState({});
  const [editingIssueId, setEditingIssueId] = useState(null);
  const [expandedId,     setExpandedId]     = useState(null);

  const [circuitFilter, setCircuitFilter] = useState("all");
  const [systemFilter,  setSystemFilter]  = useState("all");
  const [circuitSearch, setCircuitSearch] = useState("");

  const [noteModal,    setNoteModal]    = useState(null);
  const [noteForm,     setNoteForm]     = useState({});
  const [expandedNote, setExpandedNote] = useState(null);

  const [journalTab, setJournalTab] = useState("journal");

  if (!user) {
    return (<><GlobalStyle/><Login onSelect={u=>{ setUser(u); setScreen("dashboard"); }}/></>);
  }

  const activeStore = stores.find(s=>s.id===activeStoreId);
  const alarmCount  = issues.filter(i=>i.urgency==="Today"||i.type==="Alarm").length;

  const overnightIssues = issues.filter(i=>i.overnight&&i.urgency!=="Resolved");
  const todayIssues     = issues.filter(i=>i.urgency==="Today");
  const weekIssues      = issues.filter(i=>i.urgency==="This Week");
  const tabIssues       = dashTab==="overnight"?overnightIssues:dashTab==="today"?todayIssues:weekIssues;

  const storePatterns   = activeStore ? detectPatterns(cNotes, activeStore.id) : [];
  const resolvedNoNotes = activeStore ? findResolvedWithoutNotes(issues, cNotes, activeStore.id) : [];
  const storeCNotes     = activeStore ? cNotes.filter(n=>n.storeId===activeStore.id).sort((a,b)=>b.id-a.id) : [];

  const openNewIssue = (circuit=null) => {
    const sid   = activeStoreId||89;
    const store = stores.find(s=>s.id===sid);
    setEditingIssueId(null);
    setIssueForm({ storeId:sid, type:"Alarm", urgency:"Today", controllerName:store?.controllers[0]?.name||"", circuit:circuit?.name||"", description:"", riskScore:5, notes:"", overnight:true });
    setShowIssueForm(true);
  };
  const saveIssue = () => {
    if (!issueForm.circuit?.trim()||!issueForm.description?.trim()) return;
    if (editingIssueId) setIssues(p=>p.map(i=>i.id===editingIssueId?{...issueForm,id:editingIssueId}:i));
    else setIssues(p=>[...p,{...issueForm,id:nextIssueId++,createdAt:nowStr(),autoLogged:false}]);
    setShowIssueForm(false);
  };
  const deleteIssue   = id => setIssues(p=>p.filter(i=>i.id!==id));
  const updateUrgency = (id,u) => setIssues(p=>p.map(i=>i.id===id?{...i,urgency:u}:i));

  const openNoteModal = (circuitId, circuitName) => {
    setNoteModal({ circuitId, circuitName });
    setNoteForm({ type:"observation", text:"", tech:user.initials||"", date:nowStr(), time:nowTime(), shift:shiftOf() });
  };
  const saveNote = () => {
    if (!noteForm.text?.trim()) return;
    setCNotes(p=>[...p,{ id:nextNoteId++, storeId:activeStoreId, circuitId:noteModal.circuitId, ...noteForm }]);
    setNoteModal(null);
  };
  const deleteNote = id => setCNotes(p=>p.filter(n=>n.id!==id));

  const circuitNoteCount    = circId => cNotes.filter(n=>n.storeId===activeStoreId&&n.circuitId===circId).length;
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

  // ── Circuit card ──────────────────────────────────────────────────────────────
  function CircuitCard({ c }) {
    const accent = c.status==="crit"?C.crit:c.status==="warn"?C.orange:C.ice;
    const hasIssue   = circuitHasOpenIssue(c.id);
    const noteCount  = circuitNoteCount(c.id);
    const latestNote = cNotes.filter(n=>n.storeId===activeStoreId&&n.circuitId===c.id).sort((a,b)=>b.id-a.id)[0];
    return (
      <div className="cw-card-lift cw-metal" style={{ border:`1px solid ${C.line}`, borderLeft:`3px solid ${accent}`, borderRadius:12, padding:13, boxShadow:"0 6px 16px -12px #000c, inset 0 1px 0 rgba(255,255,255,.04)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
          <div style={{ flex:1, minWidth:0, marginRight:8 }}>
            <div style={{ fontFamily:F, fontWeight:600, fontSize:14, letterSpacing:.5, color:c.status==="ok"?C.frost:accent, lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.name}</div>
            <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{c.area} · {c.type}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
            <StatusDot status={c.status}/>
            {!c.defrostOk && <span style={{ fontSize:9, color:C.orange, fontFamily:F, fontWeight:600, background:C.orange+"1A", border:`1px solid ${C.orange}55`, borderRadius:4, padding:"1px 6px", letterSpacing:.5 }}>DEFROST ⚠</span>}
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:2 }}>
          <span style={{ fontFamily:FM, fontSize:24, fontWeight:700, color:c.status==="crit"?C.crit:c.status==="warn"?C.orange:C.ice, letterSpacing:-1 }}>{c.currentTemp}°<span style={{ fontSize:13, opacity:.6 }}>F</span></span>
          <span style={{ fontSize:11, color:C.dim, fontFamily:FM }}>{c.setpointLow}° – {c.setpointHigh}°</span>
        </div>
        <TempBar current={c.currentTemp} low={c.setpointLow} high={c.setpointHigh} status={c.status}/>
        {latestNote && (
          <div style={{ marginTop:9, background:"#0A1A28", borderRadius:7, padding:"6px 9px", borderLeft:`2px solid ${(NOTE_TYPES.find(t=>t.id===latestNote.type)||NOTE_TYPES[0]).color}` }}>
            <div style={{ fontSize:10, color:C.dim, marginBottom:2, fontFamily:F, letterSpacing:.5 }}>{latestNote.date} {latestNote.time} · <ShiftBadge shift={latestNote.shift}/></div>
            <div style={{ fontSize:11.5, color:C.aluminum, lineHeight:1.45 }}>{latestNote.text.length>80?latestNote.text.slice(0,80)+"…":latestNote.text}</div>
          </div>
        )}
        <div style={{ marginTop:9, display:"flex", gap:6, flexWrap:"wrap" }}>
          <button onClick={()=>openNoteModal(c.id,c.name)} style={{ flex:1, background:"#0A1A28", border:`1px solid ${C.line}`, color:C.aluminum, borderRadius:7, padding:"6px 0", fontSize:11.5, cursor:"pointer", fontFamily:F, letterSpacing:.5 }}>+ Note {noteCount>0?`(${noteCount})`:""}</button>
          <button onClick={()=>openNewIssue(c)} style={{ flex:1, background:"#0A1A28", border:`1px solid ${C.line}`, color:C.aluminum, borderRadius:7, padding:"6px 0", fontSize:11.5, cursor:"pointer", fontFamily:F, letterSpacing:.5 }}>+ Issue</button>
          {hasIssue && <span style={{ fontSize:10, color:C.crit, fontFamily:F, fontWeight:700, alignSelf:"center", letterSpacing:.5 }}>● OPEN</span>}
        </div>
      </div>
    );
  }

  // ── Issue row ─────────────────────────────────────────────────────────────────
  function IssueRow({ issue }) {
    const sc    = getColor(issue.storeId);
    const store = stores.find(s=>s.id===issue.storeId);
    const ucfg  = URGENCY[issue.urgency];
    const exp   = expandedId===issue.id;
    const riskCol = issue.riskScore>=7?C.crit:issue.riskScore>=5?C.orange:C.ice;
    return (
      <div className="cw-metal" style={{ border:`1px solid ${exp?ucfg.border:C.line}`, borderLeft:`4px solid ${sc.main}`, borderRadius:12, overflow:"hidden", marginBottom:9, boxShadow:"0 6px 16px -12px #000c" }}>
        <div onClick={()=>setExpandedId(exp?null:issue.id)} style={{ padding:"13px 15px", cursor:"pointer", display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ minWidth:38, height:38, borderRadius:9, background:riskCol+"18", border:`1px solid ${riskCol}55`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:17, fontFamily:FM, color:riskCol, flexShrink:0 }}>{issue.riskScore}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", alignItems:"center", marginBottom:3 }}>
              <span style={{ color:sc.main, fontFamily:F, fontWeight:600, fontSize:13, letterSpacing:.5 }}>{store?.name}</span>
              <span style={{ color:C.dim, fontSize:12 }}>·</span>
              <span style={{ color:TYPE_COLOR[issue.type], fontSize:12, fontWeight:600 }}>{TYPE_ICON[issue.type]} {issue.type}</span>
              <span style={{ color:C.dim, fontSize:12 }}>· {issue.controllerName}</span>
              {issue.autoLogged && <span style={{ background:C.glacier, color:C.abyss, borderRadius:5, padding:"1px 6px", fontSize:10, fontWeight:700, fontFamily:F, letterSpacing:.5 }}>⚡ AI</span>}
            </div>
            <div style={{ fontFamily:F, fontWeight:600, fontSize:15, letterSpacing:.5, color:C.frost, marginBottom:2 }}>{issue.circuit}</div>
            <div style={{ color:C.dim, fontSize:12.5, lineHeight:1.5 }}>{issue.description}</div>
          </div>
          <span style={{ color:C.dim, fontSize:16, flexShrink:0 }}>{exp?"∧":"∨"}</span>
        </div>
        {exp && (
          <div style={{ borderTop:`1px solid ${C.line}`, padding:"11px 15px", background:"#0A1A28" }}>
            {issue.notes && <div style={{ background:C.steel, border:`1px solid ${C.line}`, borderRadius:7, padding:"8px 11px", marginBottom:10, fontSize:12, color:C.aluminum }}><span style={{ color:C.pewter, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:1 }}>Notes: </span>{issue.notes}</div>}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ color:C.dim, fontSize:12 }}>Move:</span>
              {["Today","This Week","Watch List","Resolved"].filter(u=>u!==issue.urgency).map(u=>(
                <button key={u} onClick={()=>updateUrgency(issue.id,u)} style={{ background:URGENCY[u].bg, border:`1px solid ${URGENCY[u].border}`, color:URGENCY[u].color, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:700, fontFamily:F, letterSpacing:.5 }}>{URGENCY[u].label}</button>
              ))}
              <div style={{ flex:1 }}/>
              <button onClick={()=>{setEditingIssueId(issue.id);setIssueForm({...issue});setShowIssueForm(true);}} style={{ background:C.steel, border:`1px solid ${C.line}`, color:C.aluminum, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontFamily:F }}>Edit</button>
              <button onClick={()=>deleteIssue(issue.id)} style={{ background:C.crit+"18", border:`1px solid ${C.crit}55`, color:C.crit, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontFamily:F }}>Delete</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Pattern card ─────────────────────────────────────────────────────────────
  function PatternCard({ p }) {
    const color = p.severity==="crit"?C.crit:p.severity==="warn"?C.orange:C.ice;
    return (
      <div className="cw-metal" style={{ border:`1px solid ${color}55`, borderLeft:`3px solid ${color}`, borderRadius:12, padding:15, marginBottom:11 }}>
        <div style={{ display:"flex", gap:9, alignItems:"center", marginBottom:6 }}>
          <span style={{ fontSize:18 }}>{p.icon}</span>
          <span style={{ fontFamily:F, fontWeight:600, fontSize:16, color, letterSpacing:.5 }}>{p.title}</span>
        </div>
        <p style={{ fontSize:13, color:C.aluminum, margin:"0 0 9px 0", lineHeight:1.55 }}>{p.body}</p>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {p.circuits.map(cid=>(
            <span key={cid} style={{ background:color+"1A", border:`1px solid ${color}55`, color, borderRadius:5, padding:"2px 9px", fontSize:11, fontWeight:700, fontFamily:FM }}>{cid}</span>
          ))}
        </div>
      </div>
    );
  }

  // ── Journal entry ──────────────────────────────────────────────────────────────
  function JournalEntry({ note }) {
    const nt  = NOTE_TYPES.find(t=>t.id===note.type)||NOTE_TYPES[NOTE_TYPES.length-1];
    const exp = expandedNote===note.id;
    const circuit = activeStore?.circuits?.find(c=>c.id===note.circuitId);
    return (
      <div className="cw-metal" style={{ border:`1px solid ${C.line}`, borderLeft:`3px solid ${nt.color}`, borderRadius:12, marginBottom:9, overflow:"hidden" }}>
        <div onClick={()=>setExpandedNote(exp?null:note.id)} style={{ padding:"11px 15px", cursor:"pointer" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap", alignItems:"center", marginBottom:4 }}>
                <NoteTypeBadge type={note.type}/>
                <span style={{ color:C.dim, fontSize:11, fontFamily:FM }}>{note.date} {note.time}</span>
                <ShiftBadge shift={note.shift}/>
                {note.tech&&<span style={{ color:C.ice, fontSize:11 }}>· {note.tech}</span>}
              </div>
              <div style={{ fontFamily:F, fontWeight:600, fontSize:14, letterSpacing:.5, color:C.frost }}>{note.circuitId} {circuit?`— ${circuit.area}`:""}</div>
              <div style={{ fontSize:12, color:C.aluminum, marginTop:3, lineHeight:1.45 }}>{exp?note.text:note.text.slice(0,100)+(note.text.length>100?"…":"")}</div>
            </div>
            <span style={{ color:C.dim, fontSize:14, flexShrink:0 }}>{exp?"∧":"∨"}</span>
          </div>
        </div>
        {exp && (
          <div style={{ borderTop:`1px solid ${C.line}`, padding:"9px 15px", background:"#0A1A28", display:"flex", justifyContent:"flex-end" }}>
            <button onClick={()=>deleteNote(note.id)} style={{ background:C.crit+"18", border:`1px solid ${C.crit}55`, color:C.crit, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontFamily:F }}>Delete</button>
          </div>
        )}
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:`radial-gradient(140% 80% at 50% -20%, #112C42 0%, ${C.abyss} 60%)`, color:C.txt, fontFamily:FB, fontSize:14, position:"relative" }}>
      <GlobalStyle/>

      {/* HEADER — frosted glass with a hairline red banner accent */}
      <div className="cw-sheen" style={{ position:"fixed", top:0, left:0, right:0, height:56, background:"rgba(11,28,42,.82)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderBottom:`1px solid ${C.line}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", zIndex:200 }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:C.red, opacity:.85 }}/>
        <button onClick={()=>setDrawerOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:8, display:"flex", flexDirection:"column", gap:5 }}>
          {[0,1,2].map(i=><div key={i} style={{ width:20, height:2, background:C.aluminum, borderRadius:2 }}/>)}
        </button>
        <div style={{ textAlign:"center" }}>
          {screen==="store"&&activeStore
            ? <><div style={{ fontFamily:F, fontWeight:600, fontSize:16, letterSpacing:1, color:getColor(activeStore.id).main }}>{activeStore.name}</div>
               <div style={{ fontSize:10, color:C.dim, letterSpacing:.5 }}>{activeStore.brand} · {activeStore.refrigerant}</div></>
            : screen==="journal"&&activeStore
            ? <div style={{ fontFamily:F, fontWeight:600, fontSize:16, letterSpacing:1, color:C.ice }}>JOURNAL · {activeStore.name}</div>
            : <Wordmark size={17}/>
          }
        </div>
        <button onClick={()=>setScreen("dashboard")} style={{ background:"none", border:"none", cursor:"pointer", position:"relative", padding:8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.aluminum} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          {alarmCount>0&&<span style={{ position:"absolute", top:3, right:3, background:C.red, color:"#fff", borderRadius:"50%", width:15, height:15, fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F }}>{alarmCount}</span>}
        </button>
      </div>

      {/* DRAWER */}
      {drawerOpen && (
        <>
          <div onClick={()=>setDrawerOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(3,10,16,.7)", zIndex:300, backdropFilter:"blur(2px)" }}/>
          <div style={{ position:"fixed", top:0, left:0, bottom:0, width:300, background:C.deep, borderRight:`1px solid ${C.line}`, zIndex:400, overflowY:"auto", padding:"70px 14px 24px" }}>
            {/* user chip */}
            <div className="cw-metal" style={{ display:"flex", alignItems:"center", gap:11, border:`1px solid ${C.line}`, borderRadius:12, padding:"11px 13px", marginBottom:18 }}>
              <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F, fontWeight:600, fontSize:16, color:C.abyss, background:`linear-gradient(135deg, ${user.tint}, ${C.chrome})` }}>{user.initials}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:F, fontWeight:500, fontSize:15, letterSpacing:.5, color:C.frost }}>{user.name}</div>
                <div style={{ fontSize:11, color:C.dim }}>{user.region}</div>
              </div>
              <button onClick={()=>{ setUser(null); setDrawerOpen(false); }} title="Switch profile" style={{ background:"#0A1A28", border:`1px solid ${C.line}`, color:C.ice, borderRadius:7, padding:"6px 9px", cursor:"pointer", fontFamily:F, fontSize:11, letterSpacing:.5 }}>Switch</button>
            </div>

            <div style={{ fontFamily:F, fontSize:11, fontWeight:500, letterSpacing:2, color:C.pewter, textTransform:"uppercase", marginBottom:12 }}>Your Stores</div>
            {stores.map(store => {
              const sc = getColor(store.id);
              const todayCount   = issues.filter(i=>i.storeId===store.id&&i.urgency==="Today").length;
              const critCount    = store.circuits?.filter(c=>c.status==="crit").length||0;
              const warnCount    = store.circuits?.filter(c=>c.status==="warn").length||0;
              const journalCount = cNotes.filter(n=>n.storeId===store.id).length;
              return (
                <div key={store.id}>
                  <div onClick={()=>{ setActiveStoreId(store.id); setScreen("store"); setDrawerOpen(false); setCircuitFilter("all"); setSystemFilter("all"); setCircuitSearch(""); }} className="cw-metal" style={{ border:`1px solid ${C.line}`, borderLeft:`4px solid ${sc.main}`, borderRadius:10, padding:"12px 14px", cursor:"pointer", marginBottom:4 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontFamily:F, fontWeight:600, fontSize:17, letterSpacing:1, color:C.frost }}>{store.name}</div>
                        <div style={{ fontSize:12, color:C.dim }}>{store.location}</div>
                      </div>
                      {todayCount>0&&<span style={{ background:C.crit+"18", border:`1px solid ${C.crit}55`, color:C.crit, borderRadius:6, padding:"2px 8px", fontSize:12, fontWeight:700, fontFamily:FM }}>{todayCount}</span>}
                    </div>
                    <div style={{ marginTop:8, display:"flex", gap:10, alignItems:"center" }}>
                      <span style={{ fontSize:12, color:C.dim }}>{store.brand||"—"} · {store.refrigerant||"—"}</span>
                      {critCount>0&&<span style={{ fontSize:12, color:C.crit }}>⚠ {critCount}</span>}
                      {warnCount>0&&<span style={{ fontSize:12, color:C.orange }}>! {warnCount}</span>}
                    </div>
                    {store.note&&<div style={{ fontSize:11, color:C.ice, marginTop:5 }}>📋 {store.note}</div>}
                  </div>
                  {store.circuits?.length>0 && (
                    <button onClick={()=>{ setActiveStoreId(store.id); setScreen("journal"); setDrawerOpen(false); }} style={{ width:"100%", background:"transparent", border:`1px solid ${C.line}`, borderTop:"none", borderRadius:"0 0 8px 8px", color:C.dim, fontSize:11, padding:"6px 14px", cursor:"pointer", textAlign:"left", fontFamily:F, marginBottom:8, letterSpacing:.5 }}>📓 Journal & Patterns {journalCount>0?`(${journalCount} notes)`:""}</button>
                  )}
                </div>
              );
            })}
            <div style={{ marginTop:16, borderTop:`1px solid ${C.line}`, paddingTop:14 }}>
              <button onClick={()=>{setScreen("dashboard");setDrawerOpen(false);}} className="cw-metal" style={{ border:`1px solid ${C.line}`, color:C.aluminum, borderRadius:9, padding:"10px 16px", cursor:"pointer", fontWeight:600, fontSize:13, fontFamily:F, width:"100%", textAlign:"left", letterSpacing:.5 }}>📊 Dashboard</button>
            </div>
          </div>
        </>
      )}

      {/* MAIN */}
      <div style={{ paddingTop:56, minHeight:"100vh" }}>

        {/* DASHBOARD */}
        {screen==="dashboard" && (
          <div style={{ padding:14, maxWidth:720, margin:"0 auto" }}>
            <div style={{ display:"flex", gap:9, marginBottom:18, marginTop:8 }}>
              {[["overnight",overnightIssues.length,"🌙","OVERNIGHT"],["today",todayIssues.length,"🔴","TODAY"],["thisweek",weekIssues.length,"🟡","THIS WEEK"]].map(([tab,count,,label])=>(
                <div key={tab} onClick={()=>setDashTab(tab)} className={dashTab===tab?"cw-metal":""} style={{ flex:1, background:dashTab===tab?undefined:C.deep, border:`1px solid ${dashTab===tab?C.ice:C.line}`, borderRadius:12, padding:"13px 6px", cursor:"pointer", textAlign:"center", boxShadow: dashTab===tab?`0 0 0 1px ${C.ice}33`:"none" }}>
                  <div style={{ fontSize:22, fontFamily:FM, fontWeight:700, color:tab==="today"&&count>0?C.crit:tab==="thisweek"&&count>0?C.orange:C.frost }}>{count}</div>
                  <div style={{ fontSize:10, color:C.dim, fontFamily:F, fontWeight:500, letterSpacing:1.5, marginTop:3 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontFamily:F, fontWeight:600, fontSize:16, letterSpacing:1, color:C.aluminum }}>
                {dashTab==="overnight"?"🌙 Overnight Flags":dashTab==="today"?"🔴 Act Today":"🟡 This Week"}
              </div>
              <button onClick={()=>openNewIssue()} style={{ background:`linear-gradient(135deg, ${C.glacier}, ${C.deepIce})`, border:`1px solid ${C.ice}66`, color:"#fff", borderRadius:8, padding:"7px 15px", cursor:"pointer", fontWeight:600, fontSize:13, fontFamily:F, letterSpacing:.5 }}>+ Log Issue</button>
            </div>
            {tabIssues.length===0
              ? <div style={{ textAlign:"center", color:C.dim, padding:"48px 0" }}><div style={{ fontSize:26, marginBottom:8 }}>✓</div><div>Nothing flagged here — cold and quiet.</div></div>
              : tabIssues.sort((a,b)=>b.riskScore-a.riskScore).map(issue=><IssueRow key={issue.id} issue={issue}/>)
            }
          </div>
        )}

        {/* STORE CIRCUIT VIEW */}
        {screen==="store" && activeStore && (
          <div style={{ padding:14, maxWidth:980, margin:"0 auto" }}>
            <div className="cw-metal" style={{ border:`1px solid ${C.line}`, borderLeft:`4px solid ${getColor(activeStore.id).main}`, borderRadius:14, padding:15, marginBottom:14, overflow:"hidden", position:"relative" }}>
              <div style={{ position:"absolute", right:0, bottom:0, width:240, height:80, opacity:.25 }}><FrostMountains height={80} activate/></div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8, position:"relative" }}>
                <div>
                  <div style={{ fontFamily:F, fontWeight:600, fontSize:19, letterSpacing:1, color:C.frost }}>{activeStore.name} — {activeStore.location}</div>
                  <div style={{ color:C.dim, fontSize:12, marginTop:3 }}>{activeStore.brand} · {activeStore.refrigerant} · {activeStore.controllers.map(c=>c.name).join(", ")}</div>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {[["crit",C.crit,"Critical"],["warn",C.orange,"Warning"],["ok",C.green,"OK"]].map(([s,col,l])=>{
                    const n = activeStore.circuits?.filter(x=>x.status===s).length||0;
                    return <div key={s} style={{ background:"#0A1A28", border:`1px solid ${C.line}`, borderRadius:9, padding:"6px 11px", textAlign:"center" }}>
                      <div style={{ color:col, fontFamily:FM, fontWeight:700, fontSize:17 }}>{n}</div>
                      <div style={{ color:C.dim, fontSize:10, fontFamily:F, fontWeight:500, letterSpacing:1 }}>{l.toUpperCase()}</div>
                    </div>;
                  })}
                  <button onClick={()=>setScreen("journal")} style={{ background:C.ice+"1A", border:`1px solid ${C.ice}55`, color:C.ice, borderRadius:9, padding:"6px 13px", cursor:"pointer", fontFamily:F, fontWeight:600, fontSize:12, letterSpacing:.5 }}>📓 Journal</button>
                </div>
              </div>
              {activeStore.note&&<div style={{ marginTop:9, fontSize:12, color:C.ice, position:"relative" }}>📋 {activeStore.note}</div>}
            </div>

            {storePatterns.length>0 && (
              <div style={{ background:C.orange+"14", border:`1px solid ${C.orange}44`, borderRadius:12, padding:"11px 15px", marginBottom:14 }}>
                <div style={{ fontFamily:F, fontWeight:600, fontSize:13, color:C.orange, marginBottom:8, letterSpacing:.5 }}>⚠ {storePatterns.length} SYSTEM PATTERN{storePatterns.length>1?"S":""} DETECTED</div>
                {storePatterns.map((p,i)=>(
                  <div key={i} style={{ fontSize:12, color:C.aluminum, marginBottom:4 }}><span style={{ marginRight:6 }}>{p.icon}</span><strong style={{ color:p.severity==="crit"?C.crit:C.orange }}>{p.title}:</strong> {p.body.slice(0,90)}… <button onClick={()=>setScreen("journal")} style={{ background:"none", border:"none", color:C.ice, cursor:"pointer", fontSize:11, fontFamily:F }}>View →</button></div>
                ))}
              </div>
            )}

            {resolvedNoNotes.length>0 && (
              <div style={{ background:C.ice+"12", border:`1px solid ${C.ice}44`, borderRadius:12, padding:"11px 15px", marginBottom:14 }}>
                <div style={{ fontFamily:F, fontWeight:600, fontSize:13, color:C.ice, marginBottom:6, letterSpacing:.5 }}>📋 {resolvedNoNotes.length} RESOLVED ISSUE{resolvedNoNotes.length>1?"S":""} WITH NO TECH NOTE</div>
                {resolvedNoNotes.map(r=>(
                  <div key={r.id} style={{ fontSize:12, color:C.dim, marginBottom:3 }}>· {r.circuit} — resolved {r.createdAt} but no emergency/PM note logged. <button onClick={()=>openNoteModal(r.circuit?.split(" ")[0],r.circuit)} style={{ background:"none", border:"none", color:C.ice, cursor:"pointer", fontSize:11, fontFamily:F }}>Add note →</button></div>
                ))}
              </div>
            )}

            {/* Filters */}
            <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
              <input placeholder="Search circuit or area…" value={circuitSearch} onChange={e=>setCircuitSearch(e.target.value)} style={{ ...inp, width:190, padding:"7px 11px", fontSize:12 }}/>
              <div style={{ display:"flex", gap:6 }}>
                {["all","crit","warn","ok"].map(f=>{
                  const colors={all:C.aluminum,crit:C.crit,warn:C.orange,ok:C.green};
                  return <button key={f} onClick={()=>setCircuitFilter(f)} style={{ background:circuitFilter===f?C.steel2:"transparent", border:`1px solid ${circuitFilter===f?colors[f]:C.line}`, color:circuitFilter===f?colors[f]:C.dim, borderRadius:7, padding:"5px 11px", fontSize:12, cursor:"pointer", fontFamily:F, fontWeight:600, textTransform:"uppercase", letterSpacing:.5 }}>{f}</button>;
                })}
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {["all",...systems].map(s=>(
                  <button key={s} onClick={()=>setSystemFilter(s)} style={{ background:systemFilter===s?C.steel2:"transparent", border:`1px solid ${systemFilter===s?getColor(activeStore.id).main:C.line}`, color:systemFilter===s?getColor(activeStore.id).main:C.dim, borderRadius:7, padding:"5px 11px", fontSize:12, cursor:"pointer", fontFamily:F, letterSpacing:.5 }}>
                    {s==="all"?"All":s==="SC"?"Self-Cont.":`Sys ${s}`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(255px,1fr))", gap:11 }}>
              {filteredCircuits(activeStore).map(c=><CircuitCard key={c.id} c={c}/>)}
            </div>
            {filteredCircuits(activeStore).length===0&&(
              <div style={{ textAlign:"center", color:C.dim, padding:"48px 0" }}><div style={{ fontSize:22, marginBottom:8 }}>○</div><div>No circuits match this filter</div></div>
            )}
          </div>
        )}

        {/* JOURNAL / PATTERNS */}
        {screen==="journal" && activeStore && (
          <div style={{ padding:14, maxWidth:780, margin:"0 auto" }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:14 }}>
              <button onClick={()=>setScreen("store")} style={{ background:C.steel, border:`1px solid ${C.line}`, color:C.aluminum, borderRadius:8, padding:"6px 13px", cursor:"pointer", fontFamily:F, fontSize:12, letterSpacing:.5 }}>← Circuits</button>
              <div style={{ fontFamily:F, fontWeight:600, fontSize:17, color:C.frost, letterSpacing:.5 }}>{activeStore.name} · Log</div>
            </div>

            <div style={{ display:"flex", gap:7, marginBottom:14 }}>
              {[["journal","📓 Journal"],["patterns","🔍 Patterns"],["unresolved","⚠ Unresolved"]].map(([tab,label])=>(
                <button key={tab} onClick={()=>setJournalTab(tab)} className={journalTab===tab?"cw-metal":""} style={{ flex:1, background:journalTab===tab?undefined:C.deep, border:`1px solid ${journalTab===tab?C.ice:C.line}`, color:journalTab===tab?C.ice:C.dim, borderRadius:9, padding:"9px 0", cursor:"pointer", fontFamily:F, fontWeight:600, fontSize:12.5, letterSpacing:.5 }}>{label}</button>
              ))}
            </div>

            {journalTab==="journal" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ color:C.dim, fontSize:12 }}>{storeCNotes.length} entries · most recent first</div>
                  <button onClick={()=>openNoteModal("","General Note")} style={{ background:C.ice+"1A", border:`1px solid ${C.ice}55`, color:C.ice, borderRadius:8, padding:"6px 13px", cursor:"pointer", fontFamily:F, fontWeight:600, fontSize:12, letterSpacing:.5 }}>+ New Note</button>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                  {NOTE_TYPES.map(nt=>{
                    const count = storeCNotes.filter(n=>n.type===nt.id).length;
                    if (count===0) return null;
                    return <span key={nt.id} style={{ background:nt.color+"1A", border:`1px solid ${nt.color}55`, color:nt.color, borderRadius:5, padding:"2px 9px", fontSize:11, fontWeight:700, fontFamily:F }}>{nt.icon} {count}</span>;
                  })}
                </div>
                {storeCNotes.length===0
                  ? <div style={{ textAlign:"center", color:C.dim, padding:"40px 0" }}><div style={{ fontSize:22, marginBottom:8 }}>📓</div><div>No notes yet. Add your first entry above.</div></div>
                  : storeCNotes.map(note=><JournalEntry key={note.id} note={note}/>)
                }
              </div>
            )}

            {journalTab==="patterns" && (
              <div>
                {storePatterns.length===0 ? (
                  <div style={{ textAlign:"center", color:C.dim, padding:"40px 0" }}><div style={{ fontSize:22, marginBottom:8 }}>🔍</div><div>No system patterns detected yet.</div><div style={{ fontSize:12, marginTop:6 }}>Patterns emerge as you log more notes and issues.</div></div>
                ) : storePatterns.map((p,i)=><PatternCard key={i} p={p}/>)}
                <div className="cw-metal" style={{ border:`1px solid ${C.line}`, borderRadius:12, padding:15, marginTop:16 }}>
                  <div style={{ fontFamily:F, fontWeight:600, fontSize:13, color:C.aluminum, marginBottom:11, letterSpacing:1 }}>WHAT CRYOWATCH LOOKS FOR</div>
                  {[
                    ["💧","Humidity Clusters","2+ circuits with humidity flags in the same store → possible ambient or store HVAC issue"],
                    ["❄","Defrost Failures","3+ circuits with defrost anomalies → check rack defrost schedule, shared heater circuits, AK outputs"],
                    ["⚙","Rack-Level Issues","Rack notes trigger an immediate review of all circuits on that system"],
                    ["🌡","Ambient Temp","High store temp can cascade silently to medium-temp cases before alarms trigger"],
                    ["📋","Resolved w/o Notes","Any issue moved to Resolved with no corresponding tech note is flagged — someone must account for what was done"],
                  ].map(([icon,title,desc])=>(
                    <div key={title} style={{ marginBottom:11, display:"flex", gap:11 }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
                      <div>
                        <div style={{ fontFamily:F, fontWeight:600, fontSize:13.5, color:C.frost, letterSpacing:.5 }}>{title}</div>
                        <div style={{ fontSize:12, color:C.dim, lineHeight:1.45 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {journalTab==="unresolved" && (
              <div>
                {resolvedNoNotes.length>0 && (
                  <div style={{ background:C.ice+"12", border:`1px solid ${C.ice}44`, borderRadius:12, padding:15, marginBottom:16 }}>
                    <div style={{ fontFamily:F, fontWeight:600, fontSize:13, color:C.ice, marginBottom:9, letterSpacing:.5 }}>📋 RESOLVED WITHOUT A TECH NOTE</div>
                    {resolvedNoNotes.map(r=>(
                      <div key={r.id} style={{ marginBottom:10, background:C.steel, borderRadius:9, padding:"9px 12px" }}>
                        <div style={{ fontFamily:F, fontSize:14, color:C.frost, letterSpacing:.5 }}>{r.circuit}</div>
                        <div style={{ fontSize:12, color:C.dim, marginTop:2 }}>Logged {r.createdAt} · Resolved with no corresponding emergency or PM note</div>
                        <button onClick={()=>openNoteModal(r.circuit?.split(" ")[0]||"",r.circuit||"")} style={{ marginTop:7, background:C.ice+"1A", border:`1px solid ${C.ice}55`, color:C.ice, borderRadius:7, padding:"4px 11px", cursor:"pointer", fontFamily:F, fontSize:11 }}>+ Add Note</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ fontFamily:F, fontWeight:600, fontSize:13, color:C.aluminum, marginBottom:11, letterSpacing:1 }}>OPEN ISSUES — {activeStore.name}</div>
                {issues.filter(i=>i.storeId===activeStore.id&&i.urgency!=="Resolved").sort((a,b)=>b.riskScore-a.riskScore).map(issue=><IssueRow key={issue.id} issue={issue}/>)}
                {issues.filter(i=>i.storeId===activeStore.id&&i.urgency!=="Resolved").length===0&&(
                  <div style={{ textAlign:"center", color:C.dim, padding:"30px 0" }}>✓ No open issues</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* NOTE MODAL */}
      {noteModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(3,10,16,.85)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:600, backdropFilter:"blur(3px)" }}>
          <div className="cw-metal" style={{ border:`1px solid ${C.line}`, borderRadius:"18px 18px 0 0", padding:22, width:"100%", maxWidth:560, maxHeight:"88vh", overflowY:"auto" }}>
            <div style={{ fontFamily:F, fontWeight:600, fontSize:18, letterSpacing:1, marginBottom:4, color:C.frost }}>LOG NOTE</div>
            <div style={{ color:C.dim, fontSize:12, marginBottom:16 }}>{noteModal.circuitId} — {noteModal.circuitName}</div>
            <label style={lbl}>Note Type</label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
              {NOTE_TYPES.map(nt=>(
                <button key={nt.id} onClick={()=>setNoteForm(f=>({...f,type:nt.id}))} style={{ background:noteForm.type===nt.id?nt.color+"22":"transparent", border:`1px solid ${noteForm.type===nt.id?nt.color:C.line}`, color:noteForm.type===nt.id?nt.color:C.dim, borderRadius:6, padding:"5px 11px", fontSize:12, cursor:"pointer", fontFamily:F, fontWeight:600 }}>{nt.icon} {nt.label}</button>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
              <div><label style={lbl}>Date</label><input type="date" value={noteForm.date} onChange={e=>setNoteForm(f=>({...f,date:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Time</label><input type="time" value={noteForm.time} onChange={e=>setNoteForm(f=>({...f,time:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Shift</label><select value={noteForm.shift} onChange={e=>setNoteForm(f=>({...f,shift:e.target.value}))} style={sel}><option>AM</option><option>PM</option><option>EVE</option></select></div>
            </div>
            <div style={{ marginBottom:12 }}><label style={lbl}>Tech / Initials</label><input value={noteForm.tech||""} onChange={e=>setNoteForm(f=>({...f,tech:e.target.value}))} placeholder="e.g. JRS, Auto-AI…" style={inp}/></div>
            <div style={{ marginBottom:18 }}><label style={lbl}>Note</label><textarea rows={5} value={noteForm.text||""} onChange={e=>setNoteForm(f=>({...f,text:e.target.value}))} placeholder="What was found, what was done, parts ordered, patterns observed, temps at time of visit…" style={{...inp,resize:"vertical"}}/></div>
            <div style={{ fontSize:11.5, color:C.dim, marginBottom:16, lineHeight:1.5 }}>
              <strong style={{ color:C.orange }}>Tip:</strong> If a case was running bad but is now OK, note what you found and what fixed it. CryoWatch flags resolved issues with no tech note so nothing slips through.
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setNoteModal(null)} style={{ flex:1, background:C.steel, border:`1px solid ${C.line}`, color:C.aluminum, borderRadius:8, padding:"10px 0", cursor:"pointer", fontWeight:600, fontFamily:F, letterSpacing:.5 }}>Cancel</button>
              <button onClick={saveNote} style={{ flex:2, background:`linear-gradient(135deg, ${C.glacier}, ${C.deepIce})`, border:`1px solid ${C.ice}66`, color:"#fff", borderRadius:8, padding:"10px 0", cursor:"pointer", fontWeight:600, fontFamily:F, letterSpacing:.5 }}>Save Note</button>
            </div>
          </div>
        </div>
      )}

      {/* ISSUE FORM MODAL */}
      {showIssueForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(3,10,16,.85)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:500, backdropFilter:"blur(3px)" }}>
          <div className="cw-metal" style={{ border:`1px solid ${C.line}`, borderRadius:"18px 18px 0 0", padding:22, width:"100%", maxWidth:560, maxHeight:"85vh", overflowY:"auto" }}>
            <div style={{ fontFamily:F, fontWeight:600, fontSize:18, letterSpacing:1, marginBottom:18, color:C.frost }}>{editingIssueId?"EDIT ISSUE":"LOG NEW ISSUE"}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
              <div><label style={lbl}>Store</label><select value={issueForm.storeId} onChange={e=>setIssueForm(f=>({...f,storeId:Number(e.target.value)}))} style={sel}>{stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              <div><label style={lbl}>Type</label><select value={issueForm.type} onChange={e=>setIssueForm(f=>({...f,type:e.target.value}))} style={sel}>{["Alarm","Trending","Defrost","Compressor"].map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={lbl}>Urgency</label><select value={issueForm.urgency} onChange={e=>setIssueForm(f=>({...f,urgency:e.target.value}))} style={sel}>{["Today","This Week","Watch List","Resolved"].map(u=><option key={u}>{u}</option>)}</select></div>
              <div><label style={lbl}>Risk (1–10)</label><select value={issueForm.riskScore} onChange={e=>setIssueForm(f=>({...f,riskScore:Number(e.target.value)}))} style={sel}>{[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n}>{n}</option>)}</select></div>
            </div>
            <div style={{ marginBottom:12 }}><label style={lbl}>Circuit / Equipment</label><input value={issueForm.circuit||""} onChange={e=>setIssueForm(f=>({...f,circuit:e.target.value}))} placeholder="e.g. 2G DFBX 1-9" style={inp}/></div>
            <div style={{ marginBottom:12 }}><label style={lbl}>Description</label><textarea rows={3} value={issueForm.description||""} onChange={e=>setIssueForm(f=>({...f,description:e.target.value}))} placeholder="Specific values, patterns, what was flagged…" style={{...inp,resize:"vertical"}}/></div>
            <div style={{ marginBottom:20 }}><label style={lbl}>Notes</label><textarea rows={2} value={issueForm.notes||""} onChange={e=>setIssueForm(f=>({...f,notes:e.target.value}))} placeholder="Actions taken, parts ordered…" style={{...inp,resize:"vertical"}}/></div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowIssueForm(false)} style={{ flex:1, background:C.steel, border:`1px solid ${C.line}`, color:C.aluminum, borderRadius:8, padding:"10px 0", cursor:"pointer", fontWeight:600, fontFamily:F, letterSpacing:.5 }}>Cancel</button>
              <button onClick={saveIssue} style={{ flex:2, background:`linear-gradient(135deg, ${C.glacier}, ${C.deepIce})`, border:`1px solid ${C.ice}66`, color:"#fff", borderRadius:8, padding:"10px 0", cursor:"pointer", fontWeight:600, fontFamily:F, letterSpacing:.5 }}>{editingIssueId?"Save Changes":"Log Issue"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
