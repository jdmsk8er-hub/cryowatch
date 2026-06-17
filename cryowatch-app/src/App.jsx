import { useState, useMemo, useRef, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea } from "recharts";

// ═══════════════════════════════════════════════════════════════════════════
//  CRYOWATCH · neon shell + Cryo, the AI tech assistant
//  Home (Morning Briefing + store wall) → Store → Rack → Case · plus RTUs
//  Cryo: ask-anything assistant (reads live data, deep-links) + proactive briefing
// ═══════════════════════════════════════════════════════════════════════════

const P = {
  bg0:"#080611", bg1:"#0C0A1A", panel:"#141029", panel2:"#191338",
  line:"#2A2150", lineLt:"#3C2F70",
  blue:"#3B82F6", cyan:"#38BDF8", sky:"#5B9DF9",
  violet:"#8B5CF6", purple:"#A855F7", magenta:"#E83FB0", pink:"#F472D0",
  txt:"#ECE8FB", frost:"#F6F3FF", dim:"#8B83B0", pewter:"#6F6796",
  green:"#34D399", amber:"#FBBF24", orange:"#FB923C", crit:"#FB5773",
};
const F=`'Oswald','Segoe UI',sans-serif`, FB=`'Inter','Segoe UI',sans-serif`, FM=`'Space Mono',ui-monospace,monospace`;
const DAY=86400000, STEP=30*60000, R=14, RB=10;
const sCol = s => ({ ok:P.green, warn:P.amber, crit:P.crit }[s] || P.dim);
const PCATS = [["belts","Belts"],["filters","Filters"],["fans","Fans"],["motors","Motors"],["coils","Coils"]];

const rng = s => () => { s|=0; s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
function genHistory(target,{ seed=1, turnDaysAgo=0, riseDays=3, peakDelta=0, fixDaysAgo=0 }={}) {
  const r=rng(seed), now=Date.now(), start=now-30*DAY, out=[]; const turnAt=now-turnDaysAgo*DAY, fixAt=now-fixDaysAgo*DAY;
  for(let t=start;t<=now;t+=STEP){ let v=target+(r()-0.5)*1.6; if(Math.floor((t-start)/STEP)%12===0) v+=5.5;
    if(peakDelta&&t>=turnAt&&t<fixAt){ const ramp=Math.min(1,(t-turnAt)/(riseDays*DAY)); v+=peakDelta*ramp; }
    out.push({ t, temp:+v.toFixed(1) }); }
  return out;
}

// ── demo data ──────────────────────────────────────────────────────────────────
const TECHS_0 = [
  { id:"jm", name:"Jesse Mosko", role:"Lead Refrigeration Tech", email:"jesse@coldchain.io", initials:"JM", tint:P.cyan },
  { id:"dr", name:"Dana Reyes",  role:"Service Technician",      email:"dana@coldchain.io",  initials:"DR", tint:P.violet },
  { id:"tb", name:"Tom Becker",  role:"Overnight Monitoring",    email:"tom@coldchain.io",   initials:"TB", tint:P.magenta },
];
const C = (id,name,sys,target,status,cur,opts,extra={}) => ({ id,name,sys,target,band:6,status,cur,opts,kind:"circuit",
  model:"AK-CC55-018x", serial:"3915G-0"+id.replace(/\D/g,"").padStart(3,"0"), refrig:"R-448A", location:name, pmDate:"2026-04-10",
  parts:{ fans:[{spec:"Evap fan 12in ECM",qty:2}] }, summary:"No open issues.", remark:"Stable.", photos:[], ...extra });

const STORES_0 = [
  { id:89, number:"#0089", name:"Riverside", address:"123 Riverside Ave, Broomfield CO", phone:"(303) 555-0189", overnight:1,
    racks:[
      { id:"A", name:"Rack A · Low Temp", comps:[{n:1,on:true},{n:2,on:true},{n:3,on:true}], systems:["Frozen","Ice Cream"], suction:"16 psi", condenser:"90°",
        cases:[ C("A01","Frozen Food","1",-5,"ok",-3,{seed:5}), C("A02","Ice Cream","2",-10,"ok",-8,{seed:9}) ] },
      { id:"B", name:"Rack B · Med Temp", comps:[{n:1,on:true},{n:2,on:true},{n:3,on:false}], systems:["Dairy","Produce / Deli"], suction:"45 psi", condenser:"92°",
        cases:[
          C("B01","Dairy","1",34,"ok",35,{seed:3}),
          C("B02","Produce Coffin","2",36,"ok",37,{seed:7,turnDaysAgo:15,riseDays:3,peakDelta:14,fixDaysAgo:12},{ color:P.magenta,
            summary:"Ran poor due to evap fan — fan changed 6/4/26, good since.",
            remark:"Temps climbed ~14°F over 3 days starting ~6/1 before the swap. Classic failing evap-fan signature.",
            parts:{ fans:[{spec:"Evap fan 12in ECM",qty:2}], coils:[{spec:"Evap coil 6-row",qty:1}] },
            photos:[{cap:"Iced coil",who:"JM",date:"6/1"},{cap:"Failed fan",who:"JM",date:"6/4"},{cap:"New fan in",who:"JM",date:"6/4"}] }),
          C("B03","Deli Service","2",33,"ok",33,{seed:11}),
          C("B12","Seafood SS","2",26,"crit",38,{seed:23,turnDaysAgo:2,riseDays:2,peakDelta:12,fixDaysAgo:0},{ color:P.crit,
            summary:"Alarming since ~00:30 — climbing.", remark:"Rapid rise overnight while rack B comp 3 is down. Likely capacity loss on the med-temp rack — check comp 3 before chasing the case." }),
        ] },
    ],
    rtus:[
      { id:"RTU-1", kind:"rtu", name:"RTU-1 · Front Entrance", type:"Carrier 48TC", model:"48TCED12", serial:"4817C-221", location:"Roof NW", status:"ok", note:"", photos:[],
        parts:{ belts:[{spec:"BX-48 V-belt",qty:2}], filters:[{spec:"20x25x2 pleated",qty:4}], motors:[{spec:"Cond fan motor 1HP",qty:1}] } },
      { id:"RTU-2", kind:"rtu", name:"RTU-2 · Bakery", type:"Trane Voyager", model:"YHC060", serial:"TRN-552", location:"Roof SE", status:"warn", note:"Belt squeal reported AM.", photos:[],
        parts:{ belts:[{spec:"AX-42 V-belt",qty:1}], filters:[{spec:"16x20x2 pleated",qty:6}] } },
    ] },
  { id:116, number:"#0116", name:"Oakridge", address:"44 Oakridge Rd, Westminster CO", phone:"(303) 555-0116", overnight:0,
    racks:[ { id:"A", name:"Rack A · Med Temp", comps:[{n:1,on:true},{n:2,on:true}], systems:["Dairy","Produce"], suction:"44 psi", condenser:"89°",
      cases:[ C("A01","Dairy","1",34,"ok",34,{seed:31}), C("A02","Produce","2",36,"ok",36,{seed:33}) ] } ],
    rtus:[ { id:"RTU-1", kind:"rtu", name:"RTU-1 · Sales Floor", type:"Carrier 48TC", model:"48TCED08", serial:"4817C-330", location:"Roof", status:"ok", note:"", photos:[], parts:{ belts:[{spec:"BX-42 V-belt",qty:1}], filters:[{spec:"20x20x2",qty:4}] } } ] },
  { id:204, number:"#0204", name:"Pinewood", address:"9 Pinewood Blvd, Erie CO", phone:"(720) 555-0204", overnight:0,
    racks:[ { id:"A", name:"Rack A · Med Temp", comps:[{n:1,on:true},{n:2,on:true}], systems:["Meat","Deli"], suction:"46 psi", condenser:"91°",
      cases:[ C("A01","Meat Case","1",30,"warn",36,{seed:41,turnDaysAgo:5,riseDays:4,peakDelta:7,fixDaysAgo:0},{ summary:"Drifting up — watch.", remark:"Slow climb over 4 days; possible early door-gasket or coil-ice. Not alarming yet." }) ] } ],
    rtus:[] },
];
const ALARMS_0 = [
  { id:1, storeId:89,  rackId:"B", caseId:"B12", store:"Riverside", text:"B12 Seafood SS — high temp, 12° over setpoint.", time:"00:34", sev:"crit", state:"active",  ack:false },
  { id:2, storeId:204, rackId:"A", caseId:"A01", store:"Pinewood",  text:"A01 Meat Case — trending above target.",       time:"03:10", sev:"warn", state:"active",  ack:false },
  { id:3, storeId:89,  rackId:"A", caseId:"A02", store:"Riverside", text:"A02 Ice Cream — high temp during defrost.",     time:"02:05", sev:"ok",   state:"cleared", ack:false },
  { id:4, storeId:116, rackId:"A", caseId:"A02", store:"Oakridge",  text:"A02 Produce — brief high temp, recovered.",     time:"23:48", sev:"ok",   state:"cleared", ack:true  },
];
const MSGS_0 = [
  { id:1, who:"Dana R.", storeId:89,  text:"On-call: acknowledged B12 at Riverside, comp 3 looks down on rack B. Someone grab it AM.", time:"02:14", ack:false },
  { id:2, who:"Tom B.",  storeId:116, text:"Swapped contactor on Oakridge RTU-1, back online. Old part's in the rack room.", time:"03:40", ack:false },
];
const TRUCK_0 = [
  { id:1, part:"20x25x2 pleated filter", qty:12 }, { id:2, part:"BX-48 V-belt", qty:3 },
  { id:3, part:"Evap fan 12in ECM", qty:2 }, { id:4, part:"Contactor 40A 2-pole", qty:4 },
  { id:5, part:"R-448A (25 lb)", qty:1 },
];
const RANGES = { Day:1, Week:7, Month:30 };
const SUGGEST = ["What's my priority today?","Why might compressor 3 be down?","What's wrong with B12?","What parts for B12?"];

// ── Cryo's brain: reads live state, answers in plain English, can deep-link ─────────
function brain(qRaw, stores, alarms, msgs){
  const q=(qRaw||"").toLowerCase();
  const bad=[]; stores.forEach(s=>(s.racks||[]).forEach(r=>r.cases.forEach(c=>{ if(c.status!=="ok") bad.push({s,r,c}); })));
  bad.sort((a,b)=>(a.c.status==="crit"?0:1)-(b.c.status==="crit"?0:1));
  const node=x=>({screen:"case",storeId:x.s.id,rackId:x.r.id,caseId:x.c.id});

  const idm=q.match(/\b([a-z]\d{1,2}[a-z]?)\b/);
  if(idm){ const id=idm[1]; let f=null;
    stores.forEach(s=>(s.racks||[]).forEach(r=>r.cases.forEach(c=>{ if(c.id.toLowerCase()===id) f={s,r,c}; })));
    if(f){
      if(q.includes("part")){ const p=f.c.parts||{}; const lines=PCATS.map(([k,L])=>(p[k]&&p[k].length)?`${L}: ${p[k].map(x=>`${x.qty}× ${x.spec}`).join(", ")}`:null).filter(Boolean);
        return { text:`${f.c.id} ${f.c.name} — parts on file:\n${lines.length?lines.join("\n"):"none logged yet."}`, action:{label:`Open ${f.c.id}`, node:node(f)} }; }
      return { text:`${f.c.id} ${f.c.name} at ${f.s.name} is ${f.c.status.toUpperCase()} — ${f.c.cur}° vs ${f.c.target}° target.\n\nLikely cause: ${f.c.remark}`, action:{label:`Open ${f.c.id}`, node:node(f)} };
    }
  }
  if(q.includes("priorit")||q.includes("run order")||q.includes("first")||q.includes("today")||q.includes("what should")||q.includes("worst")){
    if(!bad.length) return { text:"You're clear — every case across your stores is in range. Quiet morning." };
    const lines=bad.map((x,i)=>`${i+1}. ${x.c.id} ${x.c.name} — ${x.s.name} · Rack ${x.r.id} (${x.c.cur}°, ${x.c.status})`);
    return { text:`Run order, worst first:\n${lines.join("\n")}\n\nStart with ${bad[0].c.id}: ${bad[0].c.remark}`, action:{label:`Open ${bad[0].c.id}`, node:node(bad[0])} };
  }
  if(q.includes("overnight")||q.includes("chang")||q.includes("away")||q.includes("night")){
    const act=alarms.filter(a=>a.state==="active");
    return { text:`Overnight: ${act.length} active alarm(s), ${alarms.filter(a=>a.state==="cleared").length} cleared, ${msgs.length} tech hand-off(s).\n${act.map(a=>`• ${a.store}: ${a.text}`).join("\n")}` };
  }
  const st=stores.find(s=>q.includes(s.name.toLowerCase()));
  if(st){ const b=bad.filter(x=>x.s.id===st.id);
    return { text:`${st.name}: ${b.length?b.map(x=>`${x.c.id} ${x.c.name} (${x.c.cur}°, ${x.c.status})`).join("; "):"all cases nominal."}`, action:b.length?{label:`Open ${st.name}`, node:{screen:"store",storeId:st.id}}:null }; }
  return { text:`I'm Cryo. Try: "what's my priority today?", "what changed overnight?", "what's wrong with B12?", or "what parts for B12?"` };
}

const CRYO_SYS = `You are Cryo, the AI assistant built into CryoWatch — an app for commercial refrigeration technicians. You have deep, practical refrigeration knowledge: parallel/rack compressor systems, low- and med-temp circuits, superheat and subcooling, head pressure and condensers, defrost cycles, evaporator coils and fans, common compressor failure modes (tripped safeties on high head pressure or low oil, failed contactor or start components, overload/thermal trips, locked rotor, loss of charge, bad valves/reeds), RTUs and HVAC, refrigerants, and electrical controls.
Talk like an experienced tech helping another tech: plain language, concise (2–5 sentences), specific and practical. When asked to diagnose, give the most likely causes ranked and the first things to check. Ground answers in the live system snapshot provided — actual racks, compressor states, readings, and notes. Be honest when something can't be known from the data alone, and remember you advise — the tech verifies, especially anything electrical or refrigerant-related. Plain prose only: no markdown headers, no bullet characters.`;

function snapshot(stores, alarms, msgs, node){
  const lines = stores.map(s=>{
    const racks = (s.racks||[]).map(r=>{
      const comps = r.comps.map(c=>`C${c.n} ${c.on?"running":"DOWN"}`).join(", ");
      const cases = r.cases.map(c=>`${c.id} ${c.name} ${c.cur}°/${c.target}° ${c.status}${c.remark&&c.status!=="ok"?` [${c.remark}]`:""}`).join("; ");
      return `  Rack ${r.id} (${r.name}; controls ${r.systems.join(" & ")}; compressors: ${comps}; suction ${r.suction}, condenser ${r.condenser}) → ${cases}`;
    }).join("\n");
    const rtus = (s.rtus||[]).map(u=>`${u.id} ${u.type} ${u.status}${u.note?` (${u.note})`:""}`).join("; ");
    return `STORE ${s.name} ${s.number}:\n${racks}${rtus?`\n  RTUs: ${rtus}`:""}`;
  }).join("\n");
  const where = node.screen==="case"?`looking at case ${node.caseId}`:node.screen==="rack"?`looking at rack ${node.rackId}`:node.screen==="store"?"looking at a store":"on the home screen";
  return `LIVE SYSTEM SNAPSHOT (the tech is currently ${where}):\n${lines}\nAlarms: ${alarms.map(a=>`${a.store} — ${a.text} [${a.state}]`).join("; ")||"none"}\nTech notes/hand-offs: ${msgs.map(m=>`${m.who}: ${m.text}`).join("; ")||"none"}`;
}

// ── interactive dot-wave background ────────────────────────────────────────────────
function DotWave(){
  const ref=useRef(null);
  useEffect(()=>{
    const c=ref.current; if(!c) return; const ctx=c.getContext("2d"); if(!ctx) return;
    let raf,t=0; const mouse={x:-999,y:-999}; const dpr=Math.min(2,window.devicePixelRatio||1);
    const resize=()=>{ c.width=c.offsetWidth*dpr; c.height=c.offsetHeight*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); };
    resize(); window.addEventListener("resize",resize);
    const onMove=e=>{ mouse.x=e.clientX; mouse.y=e.clientY; }; window.addEventListener("pointermove",onMove);
    const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
    const blue=hx(P.blue),vio=hx(P.violet),mag=hx(P.magenta); const L=(a,b,f)=>a+(b-a)*f;
    const draw=()=>{
      const w=c.offsetWidth,h=c.offsetHeight; ctx.clearRect(0,0,w,h); const gap=28; t+=0.011;
      for(let x=-gap;x<w+gap;x+=gap){ const f=Math.min(1,Math.max(0,x/w));
        const col=f<0.5?blue.map((b,i)=>L(b,vio[i],f*2)):vio.map((v,i)=>L(v,mag[i],(f-0.5)*2));
        for(let y=-gap;y<h+gap;y+=gap){ const wave=Math.sin(x*0.012+y*0.006+t)*9+Math.cos(x*0.02-t*0.7)*5; const py=y+wave;
          let r=1.9,a=0.42; const d=Math.hypot(x-mouse.x,py-mouse.y); if(d<90){ const k=1-d/90; r+=k*3; a=Math.min(1,a+k*0.55); }
          a*=0.55+0.3*Math.sin(t*2+x*0.03+y*0.02); if(a<=0) continue;
          ctx.beginPath(); ctx.arc(x,py,r,0,7); ctx.fillStyle=`rgba(${col[0]|0},${col[1]|0},${col[2]|0},${a.toFixed(3)})`; ctx.fill(); } }
      raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",resize); window.removeEventListener("pointermove",onMove); };
  },[]);
  return <canvas ref={ref} style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:.5, zIndex:0 }}/>;
}

// ── atoms ──────────────────────────────────────────────────────────────────────────
const Dot=({s})=><span style={{ width:8,height:8,borderRadius:"50%",background:sCol(s),boxShadow:`0 0 8px ${sCol(s)}`,display:"inline-block",flexShrink:0 }}/>;
const card={ background:`linear-gradient(180deg, ${P.panel2}, ${P.panel})`, border:`1px solid ${P.line}`, borderRadius:R };
const lbl={ display:"block", color:P.dim, fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:1.2, marginBottom:5, fontFamily:F };
const inp={ width:"100%", background:"#0A0818", border:`1px solid ${P.line}`, borderRadius:RB, color:P.txt, padding:"9px 11px", fontSize:13, boxSizing:"border-box", outline:"none", fontFamily:FB };
const seg=(on,tint=P.cyan)=>({ background:on?P.panel2:"transparent", border:`1px solid ${on?tint:P.line}`, color:on?tint:P.dim, borderRadius:RB, padding:"7px 13px", cursor:"pointer", fontFamily:F, fontWeight:600, fontSize:12.5, letterSpacing:.5 });
const primary={ background:`linear-gradient(135deg, ${P.violet}, ${P.magenta})`, border:"none", color:"#fff", borderRadius:RB, padding:"9px 16px", cursor:"pointer", fontWeight:600, fontFamily:F, letterSpacing:.5, fontSize:13 };
const ghost={ background:P.panel, border:`1px solid ${P.line}`, color:P.txt, borderRadius:RB, padding:"9px 14px", cursor:"pointer", fontWeight:600, fontFamily:F, letterSpacing:.5, fontSize:13 };
const head={ fontFamily:F, fontWeight:600, fontSize:13, letterSpacing:1.5, color:P.dim, margin:"4px 2px 12px" };
const CryoMark=({size=30})=>(<div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, background:`conic-gradient(from 0deg, ${P.blue}, ${P.violet}, ${P.magenta}, ${P.cyan}, ${P.blue})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 16px ${P.magenta}66` }}><div style={{ width:size*0.42, height:size*0.42, borderRadius:"50%", background:P.bg0 }}/></div>);

export default function App(){
  const [user,setUser]=useState(null);
  const [techs,setTechs]=useState(TECHS_0);
  const [stores,setStores]=useState(STORES_0);
  const [alarms,setAlarms]=useState(ALARMS_0);
  const [msgs,setMsgs]=useState(MSGS_0);
  const [truck,setTruck]=useState(TRUCK_0);

  const [stack,setStack]=useState([{screen:"home"}]);
  const [drawer,setDrawer]=useState(false);
  const node=stack[stack.length-1];
  const go=n=>setStack(s=>[...s,n]);
  const back=()=>setStack(s=>s.length>1?s.slice(0,-1):s);
  const goHome=()=>{ setStack([{screen:"home"}]); setDrawer(false); };

  const [range,setRange]=useState("Month");
  const [compare,setCompare]=useState(false);
  const [editMode,setEditMode]=useState("view");
  const [unitTab,setUnitTab]=useState("overview");
  const [notifTab,setNotifTab]=useState("alarms");
  const [ackView,setAckView]=useState(false);
  const [partForm,setPartForm]=useState({cat:"belts",spec:"",qty:"1"});
  const [newTech,setNewTech]=useState({name:"",role:"",email:""});
  const [newStore,setNewStore]=useState({number:"",name:"",address:"",phone:""});
  const [newPart,setNewPart]=useState({part:"",qty:"1"});

  // Cryo assistant
  const [cryoOpen,setCryoOpen]=useState(false);
  const [chat,setChat]=useState([{role:"cryo",text:"I'm Cryo, your AI tech assistant. I know refrigeration — ask me to diagnose a case, explain a reading, or what needs attention. I'll reason over your live system data."}]);
  const [chatIn,setChatIn]=useState("");
  const [thinking,setThinking]=useState(false);

  const aStore = stores.find(s=>s.id===node.storeId);
  const aRack  = aStore?.racks.find(r=>r.id===node.rackId);
  const aCase  = aRack?.cases.find(c=>c.id===node.caseId);
  const aRtu   = aStore?.rtus?.find(u=>u.id===node.rtuId);
  const unread = alarms.filter(a=>!a.ack).length + msgs.filter(m=>!m.ack).length;

  useEffect(()=>{ setUnitTab("overview"); setEditMode("view"); },[node.screen,node.caseId,node.rtuId]);

  const caseData = useMemo(()=>{
    if(node.screen!=="case"||!aCase) return [];
    const cutoff=Date.now()-RANGES[range]*DAY;
    const base=genHistory(aCase.target,aCase.opts).filter(p=>p.t>=cutoff);
    if(!compare) return base.map(p=>({ t:p.t, [aCase.id]:p.temp }));
    const idx=new Map(base.map(p=>[p.t,{ t:p.t, [aCase.id]:p.temp }]));
    (aRack?.cases||[]).filter(c=>c.id!==aCase.id).forEach(m=>genHistory(m.target,m.opts).filter(p=>p.t>=cutoff).forEach(p=>{ const row=idx.get(p.t); if(row) row[m.id]=p.temp; }));
    return [...idx.values()];
  },[node.screen,node.storeId,node.rackId,node.caseId,range,compare]);

  const findNode=text=>{ const m=(text||"").toLowerCase().match(/\b([a-z]\d{1,2}[a-z]?)\b/); if(!m) return null; let f=null; stores.forEach(s=>(s.racks||[]).forEach(r=>r.cases.forEach(c=>{ if(c.id.toLowerCase()===m[1]) f={s,r,c}; }))); return f?{label:`Open ${f.c.id}`, node:{screen:"case",storeId:f.s.id,rackId:f.r.id,caseId:f.c.id}}:null; };
  const send=async(arg)=>{ const text=(arg!=null?arg:chatIn).trim(); if(!text) return; setChat(c=>[...c,{role:"user",text}]); setChatIn(""); setThinking(true);
    const action=findNode(text);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1000, system:CRYO_SYS, messages:[{ role:"user", content:`${snapshot(stores,alarms,msgs,node)}\n\nThe tech asks: ${text}` }] }) });
      if(!res.ok) throw new Error("api"); const data=await res.json();
      const out=(data.content||[]).map(b=>b&&b.type==="text"?b.text:"").join("").trim();
      if(!out) throw new Error("empty");
      setChat(c=>[...c,{ role:"cryo", text:out, action }]);
    }catch(e){ const a=brain(text,stores,alarms,msgs); setChat(c=>[...c,{ role:"cryo", ...a }]); }
    setThinking(false);
  };
  const askCase=id=>{ setCryoOpen(true); send(`what's wrong with ${id}`); };
  const mic=()=>{ try{ const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR) return; const r=new SR(); r.lang="en-US"; r.interimResults=false; r.onresult=e=>setChatIn(e.results[0][0].transcript); r.start(); }catch(e){} };

  if(!user) return <Login techs={techs} onPick={u=>{ setUser(u); goHome(); }}/>;

  const flags = s => { let crit=0,warn=0; (s.racks||[]).forEach(r=>r.cases.forEach(c=>{ if(c.status==="crit")crit++; else if(c.status==="warn")warn++; })); (s.rtus||[]).forEach(u=>{ if(u.status==="warn")warn++; if(u.status==="crit")crit++; }); return {crit,warn}; };
  const flagCases = s => { const out=[]; (s.racks||[]).forEach(r=>r.cases.forEach(c=>{ if(c.status!=="ok") out.push({rack:r,c}); })); return out.sort((a,b)=>(a.c.status==="crit"?0:1)-(b.c.status==="crit"?0:1)); };
  const storePriority = s => { const f=flags(s); return f.crit?0:f.warn?1:s.overnight?2:3; };
  const fmtX=t=>{ const d=new Date(t); return range==="Day"?`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`:range==="Week"?["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()]:`${d.getMonth()+1}/${d.getDate()}`; };

  const mutateUnit = fn => setStores(prev=>prev.map(s=>{
    if(s.id!==node.storeId) return s;
    if(node.screen==="case") return {...s, racks:s.racks.map(r=>r.id!==node.rackId?r:{...r, cases:r.cases.map(c=>c.id!==node.caseId?c:fn(c))})};
    return {...s, rtus:s.rtus.map(u=>u.id!==node.rtuId?u:fn(u))};
  }));
  const addPart = (cat,spec,qty)=>{ if(!spec.trim()) return; mutateUnit(u=>({...u, parts:{...u.parts, [cat]:[...(u.parts?.[cat]||[]), {spec:spec.trim(), qty:Number(qty)||1}]}})); setPartForm(f=>({...f,spec:"",qty:"1"})); };
  const removePart = (cat,i)=>mutateUnit(u=>({...u, parts:{...u.parts, [cat]:(u.parts?.[cat]||[]).filter((_,j)=>j!==i)}}));

  const chipsGrid = fields => (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:9 }}>
      {fields.map(([k,v])=> editMode==="view"
        ? <div key={k} style={{ background:"#0A0818", border:`1px solid ${P.line}`, borderRadius:RB, padding:"8px 11px" }}><div style={{ fontSize:10, color:P.pewter, fontFamily:F, letterSpacing:1, textTransform:"uppercase" }}>{k}</div><div style={{ fontSize:13.5, color:P.frost, marginTop:2 }}>{v}</div></div>
        : <div key={k}><label style={lbl}>{k}</label><input defaultValue={v} style={inp}/></div>)}
    </div>
  );
  const partsBlock = unit => {
    const p=unit.parts||{};
    return (
      <div>
        {PCATS.map(([k,label])=>{ const rows=p[k]||[]; if(rows.length===0&&editMode!=="edit") return null;
          return (
            <div key={k} style={{ marginBottom:13 }}>
              <div style={{ fontFamily:F, fontWeight:600, fontSize:11, letterSpacing:1.2, color:P.cyan, marginBottom:6 }}>{label.toUpperCase()}</div>
              {rows.length===0 && <div style={{ fontSize:12.5, color:P.pewter }}>None on file</div>}
              {rows.map((r,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 11px", background:"#0A0818", border:`1px solid ${P.line}`, borderRadius:RB, marginBottom:6 }}>
                  <span style={{ fontFamily:FM, color:P.magenta, fontWeight:700, fontSize:13 }}>{r.qty}×</span>
                  <span style={{ flex:1, fontSize:13, color:P.frost }}>{r.spec}</span>
                  {editMode==="edit" && <button onClick={()=>removePart(k,i)} style={{ background:"none", border:`1px solid ${P.line}`, color:P.crit, borderRadius:8, cursor:"pointer", padding:"2px 9px", fontFamily:F }}>remove</button>}
                </div>
              ))}
            </div>
          ); })}
        {editMode==="edit" && (
          <div style={{ borderTop:`1px solid ${P.line}`, marginTop:6, paddingTop:12, display:"flex", gap:8, flexWrap:"wrap", alignItems:"flex-end" }}>
            <div style={{ flex:"1 1 110px" }}><label style={lbl}>Category</label>
              <select value={partForm.cat} onChange={e=>setPartForm(f=>({...f,cat:e.target.value}))} style={{ ...inp, appearance:"auto" }}>{PCATS.map(([k,label])=><option key={k} value={k} style={{color:"#000"}}>{label}</option>)}</select></div>
            <div style={{ flex:"3 1 160px" }}><label style={lbl}>Part / spec</label><input value={partForm.spec} onChange={e=>setPartForm(f=>({...f,spec:e.target.value}))} placeholder="e.g. BX-48 V-belt" style={inp}/></div>
            <div style={{ flex:"1 1 60px" }}><label style={lbl}>Qty</label><input value={partForm.qty} onChange={e=>setPartForm(f=>({...f,qty:e.target.value}))} style={inp}/></div>
            <button onClick={()=>addPart(partForm.cat,partForm.spec,partForm.qty)} style={{ ...primary, height:38 }}>Add</button>
          </div>
        )}
      </div>
    );
  };
  const albumBlock = unit => (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(104px,1fr))", gap:9 }}>
      {(unit.photos||[]).map((ph,i)=>(
        <div key={i} className="glow" style={{ borderRadius:R, overflow:"hidden", border:`1px solid ${P.line}`, cursor:"pointer", aspectRatio:"1", position:"relative", background:`linear-gradient(135deg, ${[P.blue,P.violet,P.magenta,P.cyan][i%4]}55, ${P.panel} 70%)` }}>
          <div style={{ position:"absolute", left:0, right:0, bottom:0, padding:"5px 7px", background:"linear-gradient(180deg, transparent, #000a)", fontSize:10 }}><div style={{ color:P.frost, fontWeight:600 }}>{ph.cap}</div><div style={{ color:P.dim, fontFamily:FM }}>{ph.who} · {ph.date}</div></div>
        </div>
      ))}
      <button className="glow" style={{ aspectRatio:"1", borderRadius:R, border:`1px dashed ${P.lineLt}`, background:"transparent", color:P.dim, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, fontFamily:F, fontSize:12 }}><span style={{ fontSize:20, color:P.violet }}>+</span> Add photo</button>
    </div>
  );
  const unitTabBar = () => (
    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:14 }}>
      {["overview","parts","album"].map(t=><button key={t} onClick={()=>setUnitTab(t)} style={seg(unitTab===t)}>{t[0].toUpperCase()+t.slice(1)}</button>)}
      <div style={{ flex:1 }}/>
      <button onClick={()=>setEditMode("view")} style={seg(editMode==="view")}>View</button>
      <button onClick={()=>setEditMode("edit")} style={seg(editMode==="edit",P.magenta)}>Edit</button>
    </div>
  );

  // ── screens ──
  const Home = () => {
    const sorted=[...stores].sort((a,b)=>storePriority(a)-storePriority(b));
    const bad=[]; stores.forEach(s=>(s.racks||[]).forEach(r=>r.cases.forEach(c=>{ if(c.status!=="ok") bad.push({s,r,c}); })));
    bad.sort((a,b)=>(a.c.status==="crit"?0:1)-(b.c.status==="crit"?0:1));
    const hr=new Date().getHours(); const part=hr<12?"morning":hr<18?"afternoon":"evening";
    const storesHit=new Set(bad.map(x=>x.s.id)).size; const top=bad[0];
    return (
      <Wrap>
        {/* Cryo morning briefing */}
        <div style={{ ...card, borderColor:P.lineLt, padding:"15px 16px", marginBottom:16, boxShadow:`0 0 0 1px ${P.violet}22, 0 18px 50px -30px ${P.magenta}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <CryoMark size={30}/><div style={{ fontFamily:F, fontWeight:600, letterSpacing:1.5, fontSize:12, color:P.pink }}>CRYO · BRIEFING</div>
            <div style={{ flex:1 }}/><span style={{ fontSize:11, color:P.pewter, fontFamily:FM }}>prepared {String(hr).padStart(2,"0")}:05</span>
          </div>
          <div style={{ fontFamily:F, fontWeight:600, fontSize:18, color:P.frost, marginBottom:6 }}>Good {part}, {user.name.split(" ")[0]}.</div>
          <div style={{ fontSize:13.5, color:P.txt, lineHeight:1.55 }}>
            {bad.length
              ? <>{storesHit} of your {stores.length} stores need you. Your priority is <b style={{color:P.crit}}>{top.c.id} {top.c.name}</b> at {top.s.name} — {top.c.remark}</>
              : <>All quiet — every case across your {stores.length} stores is in range. I'll ping you the moment that changes.</>}
          </div>
          {bad.length>0 && <div style={{ marginTop:12 }}>
            <div style={{ fontFamily:F, fontSize:10.5, letterSpacing:1.5, color:P.dim, marginBottom:7 }}>RUN ORDER</div>
            {bad.slice(0,3).map((x,i)=>(
              <div key={x.c.id} onClick={()=>go({screen:"case",storeId:x.s.id,rackId:x.r.id,caseId:x.c.id})} className="glow" style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 11px", background:"#0A0818", border:`1px solid ${P.line}`, borderRadius:RB, marginBottom:6, cursor:"pointer" }}>
                <span style={{ fontFamily:FM, color:P.dim, fontSize:12 }}>{i+1}</span><Dot s={x.c.status}/>
                <span style={{ fontFamily:F, color:P.frost, fontSize:13.5 }}>{x.c.id} {x.c.name}</span>
                <span style={{ fontFamily:FM, color:sCol(x.c.status), fontSize:12.5 }}>{x.c.cur}°</span>
                <span style={{ fontSize:11.5, color:P.dim }}>· {x.s.name}</span><div style={{ flex:1 }}/><span style={{ color:P.dim }}>›</span>
              </div>
            ))}
          </div>}
          <div style={{ marginTop:10, fontSize:12, color:P.dim, lineHeight:1.5 }}><span style={{ color:P.cyan }}>Watching:</span> B02 produce fan was replaced 6/4 — trend's normal since; I'll flag it if it slips again.</div>
          <div style={{ display:"flex", gap:8, marginTop:13, flexWrap:"wrap" }}>
            {bad.length>0 && <button onClick={()=>go({screen:"case",storeId:top.s.id,rackId:top.r.id,caseId:top.c.id})} style={primary}>Open {top.c.id}</button>}
            <button onClick={()=>{ setCryoOpen(true); }} style={ghost}>Ask Cryo</button>
          </div>
        </div>

        <div style={head}>YOUR STORES · {stores.length}</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:12 }}>
          {sorted.map(s=>{ const f=flags(s); const pc=f.crit?P.crit:f.warn?P.amber:s.overnight?P.violet:P.green;
            return (
              <div key={s.id} onClick={()=>go({screen:"store",storeId:s.id})} className="glow" style={{ ...card, borderLeft:`4px solid ${pc}`, padding:14, cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div><div style={{ fontFamily:F, fontWeight:600, fontSize:18, letterSpacing:.5, color:P.frost }}>{s.name}</div>
                    <div style={{ fontSize:11.5, color:P.dim, marginTop:2 }}>{s.number} · {s.address.split(",")[0]}</div></div>
                  {f.crit>0 && <span style={{ background:P.crit+"22", border:`1px solid ${P.crit}66`, color:P.crit, borderRadius:RB, padding:"2px 9px", fontSize:13, fontWeight:700, fontFamily:FM }}>{f.crit}</span>}
                </div>
                <div style={{ display:"flex", gap:10, marginTop:12, fontSize:12, color:P.dim, alignItems:"center" }}>
                  <Dot s={f.crit?"crit":f.warn?"warn":"ok"}/>
                  <span>{f.crit?`${f.crit} today`:f.warn?`${f.warn} watch`:"all nominal"}</span>
                  <div style={{ flex:1 }}/><span>{s.racks.length} rack(s) · {(s.rtus||[]).length} RTU</span>
                </div>
              </div>
            ); })}
        </div>
      </Wrap>
    );
  };

  const Store = () => (
    <Wrap>
      <Crumb path={[aStore.name]} onBack={back}/>
      <div style={{ ...card, padding:15, marginBottom:14 }}>
        <div style={{ fontFamily:F, fontWeight:600, fontSize:20, letterSpacing:.5, color:P.frost }}>{aStore.name} <span style={{ color:P.dim, fontSize:14 }}>{aStore.number}</span></div>
        <div style={{ fontSize:12.5, color:P.dim, marginTop:4 }}>{aStore.address}</div>
        {aStore.phone && <div style={{ fontSize:12.5, color:P.cyan, marginTop:2 }}>{aStore.phone}</div>}
      </div>
      {flagCases(aStore).length>0 && (
        <div style={{ background:P.crit+"12", border:`1px solid ${P.crit}55`, borderRadius:R, padding:"12px 15px", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}><Dot s="crit"/><span style={{ fontFamily:F, fontWeight:600, fontSize:13, color:P.crit, letterSpacing:.5 }}>RED FLAGS TODAY</span></div>
          {flagCases(aStore).map(({rack,c})=>(
            <div key={c.id} onClick={()=>go({screen:"case",storeId:aStore.id,rackId:rack.id,caseId:c.id})} className="glow" style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 11px", cursor:"pointer", background:"#0A0818", border:`1px solid ${P.line}`, borderRadius:RB, marginTop:7 }}>
              <Dot s={c.status}/><span style={{ fontFamily:F, color:P.frost, fontSize:14 }}>{c.id} {c.name}</span>
              <span style={{ fontFamily:FM, color:sCol(c.status), fontSize:13 }}>{c.cur}°</span>
              <span style={{ fontSize:12, color:P.dim }}>· Rack {rack.id}</span><div style={{ flex:1 }}/><span style={{ color:P.dim }}>›</span>
            </div>
          ))}
        </div>
      )}
      <div style={head}>RACKS</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
        {aStore.racks.map(r=>{ const down=r.comps.filter(c=>!c.on); const bad=r.cases.some(c=>c.status==="crit");
          return (
            <div key={r.id} onClick={()=>go({screen:"rack",storeId:aStore.id,rackId:r.id})} className="glow" style={{ ...card, borderLeft:`4px solid ${down.length||bad?P.crit:P.green}`, padding:14, cursor:"pointer" }}>
              <div style={{ fontFamily:F, fontWeight:600, fontSize:16, color:P.frost, letterSpacing:.5 }}>{r.name}</div>
              <div style={{ fontSize:12, color:P.dim, marginTop:3 }}>Controls: {r.systems.join(" · ")}</div>
              <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
                {r.comps.map(cp=><span key={cp.n} style={{ fontFamily:FM, fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:RB, background:(cp.on?P.green:P.crit)+"1A", border:`1px solid ${(cp.on?P.green:P.crit)}66`, color:cp.on?P.green:P.crit }}>C{cp.n} {cp.on?"on":"DOWN"}</span>)}
              </div>
              <div style={{ display:"flex", gap:12, marginTop:10, fontSize:12, color:P.dim, fontFamily:FM }}>
                <span>Suct {r.suction}</span><span>Cond {r.condenser}</span><div style={{ flex:1 }}/><span>{r.cases.length} cases</span>
              </div>
            </div>
          ); })}
      </div>
      {(aStore.rtus||[]).length>0 && <>
        <div style={head}>ROOFTOP UNITS</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:11 }}>
          {aStore.rtus.map(u=>(
            <div key={u.id} onClick={()=>go({screen:"rtu",storeId:aStore.id,rtuId:u.id})} className="glow" style={{ ...card, borderLeft:`3px solid ${sCol(u.status)}`, padding:13, cursor:"pointer" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontFamily:F, fontWeight:600, fontSize:14, color:P.frost, letterSpacing:.5 }}>{u.name}</span><Dot s={u.status}/></div>
              <div style={{ fontSize:12, color:P.dim, marginTop:5 }}>{u.type} · {u.location}</div>
              {u.note && <div style={{ fontSize:11.5, color:P.amber, marginTop:5 }}>{u.note}</div>}
            </div>
          ))}
        </div>
      </>}
    </Wrap>
  );

  const Rack = () => (
    <Wrap>
      <Crumb path={[aStore.name, aRack.name]} onBack={back}/>
      <div style={{ ...card, padding:15, marginBottom:14 }}>
        <div style={{ fontFamily:F, fontWeight:600, fontSize:19, color:P.frost, letterSpacing:.5 }}>{aRack.name}</div>
        <div style={{ fontSize:12.5, color:P.dim, marginTop:3 }}>Controls {aRack.systems.join(" · ")}</div>
        <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
          {aRack.comps.map(cp=>(
            <div key={cp.n} style={{ flex:"1 1 90px", background:"#0A0818", border:`1px solid ${(cp.on?P.green:P.crit)}55`, borderRadius:RB, padding:"10px 12px", textAlign:"center" }}>
              <div style={{ fontFamily:FM, fontWeight:700, fontSize:16, color:cp.on?P.green:P.crit }}>{cp.on?"RUNNING":"DOWN"}</div>
              <div style={{ fontSize:11, color:P.dim, fontFamily:F, letterSpacing:1, marginTop:3 }}>COMPRESSOR {cp.n}</div>
            </div>
          ))}
        </div>
        {aRack.comps.some(c=>!c.on) && <div style={{ marginTop:10, fontSize:12.5, color:P.amber }}>Compressor {aRack.comps.filter(c=>!c.on).map(c=>c.n).join(", ")} down — combined capacity reduced on {aRack.systems.join(" / ")}.</div>}
      </div>
      <div style={head}>CASES ON THIS RACK</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:11 }}>
        {aRack.cases.map(c=>(
          <div key={c.id} onClick={()=>go({screen:"case",storeId:aStore.id,rackId:aRack.id,caseId:c.id})} className="glow" style={{ ...card, borderLeft:`3px solid ${sCol(c.status)}`, padding:13, cursor:"pointer" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontFamily:F, fontWeight:600, fontSize:14, color:P.frost, letterSpacing:.5 }}>{c.id} {c.name}</span><Dot s={c.status}/></div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginTop:8 }}><span style={{ fontFamily:FM, fontSize:22, fontWeight:700, color:sCol(c.status) }}>{c.cur}°</span><span style={{ fontSize:11, color:P.dim, fontFamily:FM }}>target {c.target}°</span></div>
          </div>
        ))}
      </div>
    </Wrap>
  );

  const Case = () => {
    const mates=aRack.cases.filter(c=>c.id!==aCase.id);
    return (
      <Wrap>
        <Crumb path={[aStore.name, `Rack ${aRack.id}`, `${aCase.id} ${aCase.name}`]} onBack={back}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14, marginBottom:14 }}>
          <div><div style={{ fontFamily:F, fontWeight:600, fontSize:23, letterSpacing:1, color:P.frost }}>{aCase.id} · {aCase.name}</div>
            <div style={{ fontSize:12.5, color:P.dim, marginTop:3 }}>{aStore.name} · System {aCase.sys} · {aCase.model}</div></div>
          <div style={{ display:"flex", gap:18, alignItems:"flex-end" }}>
            <div style={{ textAlign:"right" }}><div style={{ fontFamily:FM, fontSize:36, fontWeight:700, color:sCol(aCase.status), lineHeight:1, letterSpacing:-1, textShadow:`0 0 18px ${sCol(aCase.status)}66` }}>{aCase.cur}°</div>
              <div style={{ fontSize:11, color:sCol(aCase.status), fontFamily:F, fontWeight:700, letterSpacing:1, marginTop:4 }}>{aCase.status.toUpperCase()}</div></div>
            <div style={{ textAlign:"right" }}><div style={{ fontFamily:FM, fontSize:21, fontWeight:700, color:P.txt }}>{aCase.target}°</div><div style={{ fontSize:11, color:P.dim, fontFamily:F, letterSpacing:1, marginTop:6 }}>TARGET</div></div>
          </div>
        </div>
        {unitTabBar()}
        {unitTab==="overview" && <>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", marginBottom:10 }}>
            {Object.keys(RANGES).map(rk=><button key={rk} onClick={()=>setRange(rk)} style={seg(range===rk)}>{rk}</button>)}
            <div style={{ flex:1 }}/><button onClick={()=>setCompare(c=>!c)} style={seg(compare,P.magenta)}>Compare rack-mates</button>
          </div>
          <div style={{ ...card, padding:"14px 8px 8px", marginBottom:14 }}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={caseData} margin={{ top:6, right:14, left:-8, bottom:0 }}>
                <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={P.blue}/><stop offset="0.5" stopColor={P.violet}/><stop offset="1" stopColor={P.magenta}/></linearGradient></defs>
                <CartesianGrid stroke={P.line} strokeDasharray="3 3" vertical={false}/>
                <ReferenceArea y1={aCase.target+aCase.band} y2={999} fill={P.crit} fillOpacity={0.07}/>
                <ReferenceLine y={aCase.target} stroke={P.dim} strokeDasharray="5 4" label={{ value:`target ${aCase.target}°`, fill:P.dim, fontSize:10, position:"insideTopLeft" }}/>
                <XAxis dataKey="t" tickFormatter={fmtX} tick={{ fill:P.dim, fontSize:10, fontFamily:FM }} stroke={P.line} minTickGap={36}/>
                <YAxis tick={{ fill:P.dim, fontSize:10, fontFamily:FM }} stroke={P.line} width={34} domain={["dataMin-3","dataMax+3"]}/>
                <Tooltip contentStyle={{ background:P.bg0, border:`1px solid ${P.lineLt}`, borderRadius:8, fontFamily:FM, fontSize:12 }} labelFormatter={t=>new Date(t).toLocaleString()} formatter={v=>[`${v}°F`]}/>
                <Line type="monotone" dataKey={aCase.id} stroke={compare?(aCase.color||P.cyan):"url(#lg)"} strokeWidth={2.4} dot={false} isAnimationActive={false}/>
                {compare && mates.map(m=><Line key={m.id} type="monotone" dataKey={m.id} stroke={m.color||P.sky} strokeWidth={1.3} strokeOpacity={0.55} dot={false} isAnimationActive={false}/>)}
              </LineChart>
            </ResponsiveContainer>
            {compare && <div style={{ display:"flex", gap:14, flexWrap:"wrap", padding:"4px 10px 6px", fontSize:11, fontFamily:F }}><span style={{ color:aCase.color||P.cyan }}>● {aCase.id}</span>{mates.map(m=><span key={m.id} style={{ color:m.color||P.sky, opacity:.85 }}>● {m.id} {m.name}</span>)}</div>}
          </div>
          <div style={{ background:P.violet+"18", border:`1px solid ${P.violet}66`, borderLeft:`3px solid ${P.violet}`, borderRadius:R, padding:"12px 15px", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}><CryoMark size={20}/><span style={{ fontFamily:F, fontWeight:600, fontSize:13, color:P.pink }}>Cryo · likely cause</span></div>
            <div style={{ fontSize:13, color:P.txt, lineHeight:1.55 }}>{aCase.remark}</div>
            <button onClick={()=>askCase(aCase.id)} style={{ ...seg(false), marginTop:10 }}>Ask Cryo about this case</button>
          </div>
          <div style={{ background:"#0A0818", border:`1px solid ${P.line}`, borderLeft:`3px solid ${P.green}`, borderRadius:R, padding:"11px 15px", marginBottom:16 }}>
            <div style={{ fontSize:10, color:P.pewter, fontFamily:F, letterSpacing:1.2, marginBottom:3 }}>CASE SUMMARY</div>
            <div style={{ fontSize:13.5, color:P.frost, lineHeight:1.5 }}>{aCase.summary}</div>
          </div>
          <div style={{ ...card, padding:15 }}>{chipsGrid([["Model",aCase.model],["Serial",aCase.serial],["Target",`${aCase.target}°F`],["Refrigerant",aCase.refrig],["Location",aCase.location],["Rack / System",`${aRack.id} · Sys ${aCase.sys}`]])}
            {editMode==="edit" && <div style={{ display:"flex", gap:9, marginTop:14 }}><button onClick={()=>setEditMode("view")} style={{ ...ghost, flex:1 }}>Cancel</button><button onClick={()=>setEditMode("view")} style={{ ...primary, flex:2 }}>Save</button></div>}
          </div>
        </>}
        {unitTab==="parts" && <div style={{ ...card, padding:15 }}>{partsBlock(aCase)}</div>}
        {unitTab==="album" && <div style={{ ...card, padding:15 }}>{albumBlock(aCase)}</div>}
      </Wrap>
    );
  };

  const Rtu = () => (
    <Wrap>
      <Crumb path={[aStore.name, aRtu.name]} onBack={back}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:14, marginBottom:14 }}>
        <div><div style={{ fontFamily:F, fontWeight:600, fontSize:22, letterSpacing:.5, color:P.frost }}>{aRtu.name}</div>
          <div style={{ fontSize:12.5, color:P.dim, marginTop:3 }}>{aRtu.type} · {aRtu.model} · {aRtu.location}</div></div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}><Dot s={aRtu.status}/><span style={{ fontFamily:F, fontWeight:700, fontSize:12, color:sCol(aRtu.status), letterSpacing:1 }}>{aRtu.status.toUpperCase()}</span></div>
      </div>
      {unitTabBar()}
      {unitTab==="overview" && <>
        {aRtu.note && <div style={{ background:P.amber+"14", border:`1px solid ${P.amber}55`, borderLeft:`3px solid ${P.amber}`, borderRadius:R, padding:"11px 15px", marginBottom:14, fontSize:13, color:P.frost }}>{aRtu.note}</div>}
        <div style={{ ...card, padding:15 }}>{chipsGrid([["Model",aRtu.model],["Serial",aRtu.serial],["Type",aRtu.type],["Location",aRtu.location],["Status",aRtu.status]])}
          {editMode==="edit" && <div style={{ display:"flex", gap:9, marginTop:14 }}><button onClick={()=>setEditMode("view")} style={{ ...ghost, flex:1 }}>Cancel</button><button onClick={()=>setEditMode("view")} style={{ ...primary, flex:2 }}>Save</button></div>}
        </div>
      </>}
      {unitTab==="parts" && <div style={{ ...card, padding:15 }}>{partsBlock(aRtu)}</div>}
      {unitTab==="album" && <div style={{ ...card, padding:15 }}>{albumBlock(aRtu)}</div>}
    </Wrap>
  );

  const Notifications = () => {
    const isA=notifTab==="alarms"; const src=isA?alarms:msgs;
    const acked=src.filter(n=>n.ack), list=ackView?acked:src.filter(n=>!n.ack);
    const ackOne=id=>isA?setAlarms(a=>a.map(x=>x.id===id?{...x,ack:true}:x)):setMsgs(m=>m.map(x=>x.id===id?{...x,ack:true}:x));
    const openTarget=n=>{ if(isA){ go({screen:"case",storeId:n.storeId,rackId:n.rackId,caseId:n.caseId}); } else if(n.storeId){ go({screen:"store",storeId:n.storeId}); } };
    return (
      <Wrap>
        <div style={{ fontFamily:F, fontWeight:600, fontSize:20, letterSpacing:1, color:P.frost, marginBottom:14 }}>Notifications</div>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <button onClick={()=>{setNotifTab("alarms");setAckView(false);}} style={{ ...seg(isA,P.crit), flex:1 }}>Alarms {alarms.filter(a=>!a.ack).length?`(${alarms.filter(a=>!a.ack).length})`:""}</button>
          <button onClick={()=>{setNotifTab("messages");setAckView(false);}} style={{ ...seg(!isA,P.cyan), flex:1 }}>Tech messages {msgs.filter(m=>!m.ack).length?`(${msgs.filter(m=>!m.ack).length})`:""}</button>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontSize:12, color:P.dim, fontFamily:F, letterSpacing:.5 }}>{ackView?"ACKNOWLEDGED":"ACTIVE & UNREAD"}</span>
          <button onClick={()=>setAckView(v=>!v)} style={seg(false)}>{ackView?"← Back to active":`Acknowledged (${acked.length})`}</button>
        </div>
        {list.map(n=>{ const col=isA?sCol(n.sev):P.cyan;
          return (
            <div key={n.id} onClick={()=>openTarget(n)} className="glow" style={{ ...card, borderLeft:`3px solid ${n.ack?P.line:col}`, opacity:n.ack?.6:1, padding:"12px 15px", marginBottom:10, cursor:"pointer" }}>
              <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:4, alignItems:"center" }}>
                <span style={{ fontFamily:F, fontWeight:600, fontSize:13, color:n.ack?P.dim:col, letterSpacing:.3 }}>{isA?n.store:n.who}</span>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {isA && <span style={{ fontSize:10, fontWeight:700, fontFamily:F, letterSpacing:.8, padding:"1px 7px", borderRadius:6, color:n.state==="active"?P.crit:P.green, background:(n.state==="active"?P.crit:P.green)+"1A", border:`1px solid ${(n.state==="active"?P.crit:P.green)}55` }}>{n.state==="active"?"ACTIVE":"CLEARED"}</span>}
                  <span style={{ fontSize:11, color:P.pewter, fontFamily:FM }}>{n.time}</span>
                </div>
              </div>
              <div style={{ fontSize:13, color:P.txt, lineHeight:1.5 }}>{n.text}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:9 }}>
                <span style={{ fontSize:11, color:P.dim }}>{isA?"Tap to open case":n.storeId?"Tap to open store":""}</span>
                {!n.ack && <button onClick={e=>{ e.stopPropagation(); ackOne(n.id); }} style={seg(false)}>Acknowledge</button>}
                {n.ack && <span style={{ fontSize:11, color:P.green, fontFamily:F, letterSpacing:.5 }}>Acknowledged</span>}
              </div>
            </div>
          ); })}
        {list.length===0 && <div style={{ textAlign:"center", color:P.dim, padding:"40px 0" }}>{ackView?"No acknowledged items.":"Nothing active — you're clear."}</div>}
      </Wrap>
    );
  };

  const TruckStock = () => (
    <Wrap>
      <div style={{ fontFamily:F, fontWeight:600, fontSize:20, letterSpacing:1, color:P.frost, marginBottom:6 }}>Truck Stock</div>
      <div style={{ fontSize:12.5, color:P.dim, marginBottom:16 }}>What you're carrying. Update as you use and restock.</div>
      <div style={{ ...card, padding:15 }}>
        {truck.map(t=>(
          <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderTop:`1px solid ${P.line}` }}>
            <span style={{ flex:1, fontSize:13.5, color:P.frost }}>{t.part}</span>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <button onClick={()=>setTruck(p=>p.map(x=>x.id===t.id?{...x,qty:Math.max(0,x.qty-1)}:x))} style={{ ...ghost, padding:"4px 11px" }}>−</button>
              <span style={{ fontFamily:FM, fontWeight:700, color:t.qty<=1?P.amber:P.cyan, minWidth:24, textAlign:"center" }}>{t.qty}</span>
              <button onClick={()=>setTruck(p=>p.map(x=>x.id===t.id?{...x,qty:x.qty+1}:x))} style={{ ...ghost, padding:"4px 11px" }}>+</button>
              <button onClick={()=>setTruck(p=>p.filter(x=>x.id!==t.id))} style={{ ...ghost, padding:"4px 10px", color:P.crit }}>×</button>
            </div>
          </div>
        ))}
        <div style={{ display:"flex", gap:8, marginTop:16, alignItems:"flex-end" }}>
          <div style={{ flex:1 }}><label style={lbl}>Add part</label><input value={newPart.part} onChange={e=>setNewPart(f=>({...f,part:e.target.value}))} placeholder="e.g. 16x20x2 filter" style={inp}/></div>
          <div style={{ width:64 }}><label style={lbl}>Qty</label><input value={newPart.qty} onChange={e=>setNewPart(f=>({...f,qty:e.target.value}))} style={inp}/></div>
          <button onClick={()=>{ if(!newPart.part.trim()) return; setTruck(p=>[...p,{id:Date.now(),part:newPart.part.trim(),qty:Number(newPart.qty)||1}]); setNewPart({part:"",qty:"1"}); }} style={{ ...primary, height:38 }}>Add</button>
        </div>
      </div>
    </Wrap>
  );

  const Setup = () => (
    <Wrap>
      <div style={{ fontFamily:F, fontWeight:600, fontSize:20, letterSpacing:1, color:P.frost, marginBottom:6 }}>Setup · Address Book</div>
      <div style={{ fontSize:12.5, color:P.dim, marginBottom:18 }}>Technicians on your team and the stores they cover — the universal list everything else pulls from.</div>
      <div style={{ ...card, padding:15, marginBottom:16 }}>
        <div style={{ fontFamily:F, fontWeight:600, fontSize:13, color:P.frost, letterSpacing:1, marginBottom:12 }}>TECHNICIANS · {techs.length}</div>
        {techs.map(t=>(
          <div key={t.id} style={{ display:"flex", alignItems:"center", gap:11, padding:"8px 0", borderTop:`1px solid ${P.line}` }}>
            <div style={{ width:34, height:34, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F, fontWeight:600, color:P.bg0, background:`linear-gradient(135deg, ${t.tint}, ${P.pink})` }}>{t.initials}</div>
            <div style={{ flex:1, minWidth:0 }}><div style={{ fontFamily:F, fontWeight:600, color:P.frost }}>{t.name}</div><div style={{ fontSize:11.5, color:P.dim }}>{t.role} · {t.email}</div></div>
          </div>
        ))}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginTop:14 }}>
          <div><label style={lbl}>Name</label><input value={newTech.name} onChange={e=>setNewTech(f=>({...f,name:e.target.value}))} style={inp}/></div>
          <div><label style={lbl}>Role</label><input value={newTech.role} onChange={e=>setNewTech(f=>({...f,role:e.target.value}))} style={inp}/></div>
          <div style={{ gridColumn:"1 / -1" }}><label style={lbl}>Email</label><input value={newTech.email} onChange={e=>setNewTech(f=>({...f,email:e.target.value}))} style={inp}/></div>
        </div>
        <button onClick={()=>{ if(!newTech.name.trim()) return; const init=newTech.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(); setTechs(p=>[...p,{ id:"t"+Date.now(), ...newTech, initials:init, tint:[P.cyan,P.violet,P.magenta,P.sky][p.length%4] }]); setNewTech({name:"",role:"",email:""}); }} style={{ ...primary, marginTop:12, width:"100%" }}>+ Add technician</button>
      </div>
      <div style={{ ...card, padding:15 }}>
        <div style={{ fontFamily:F, fontWeight:600, fontSize:13, color:P.frost, letterSpacing:1, marginBottom:12 }}>STORES · {stores.length}</div>
        {stores.map(s=>(
          <div key={s.id} style={{ padding:"8px 0", borderTop:`1px solid ${P.line}` }}>
            <div style={{ fontFamily:F, fontWeight:600, color:P.frost }}>{s.name} <span style={{ color:P.dim, fontSize:12 }}>{s.number}</span></div>
            <div style={{ fontSize:11.5, color:P.dim }}>{s.address}{s.phone?` · ${s.phone}`:""}</div>
          </div>
        ))}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginTop:14 }}>
          <div><label style={lbl}>Store #</label><input value={newStore.number} onChange={e=>setNewStore(f=>({...f,number:e.target.value}))} placeholder="#0312" style={inp}/></div>
          <div><label style={lbl}>Name</label><input value={newStore.name} onChange={e=>setNewStore(f=>({...f,name:e.target.value}))} style={inp}/></div>
          <div style={{ gridColumn:"1 / -1" }}><label style={lbl}>Address</label><input value={newStore.address} onChange={e=>setNewStore(f=>({...f,address:e.target.value}))} style={inp}/></div>
          <div style={{ gridColumn:"1 / -1" }}><label style={lbl}>Phone</label><input value={newStore.phone} onChange={e=>setNewStore(f=>({...f,phone:e.target.value}))} placeholder="(303) 555-0000" style={inp}/></div>
        </div>
        <button onClick={()=>{ if(!newStore.name.trim()) return; setStores(p=>[...p,{ id:Date.now(), number:newStore.number||"#—", name:newStore.name, address:newStore.address, phone:newStore.phone, overnight:0, racks:[], rtus:[] }]); setNewStore({number:"",name:"",address:"",phone:""}); }} style={{ ...primary, marginTop:12, width:"100%" }}>+ Add store</button>
      </div>
    </Wrap>
  );

  const screen = node.screen==="home" ? Home() : node.screen==="store" ? Store() : node.screen==="rack" ? Rack() : node.screen==="case" ? Case() : node.screen==="rtu" ? Rtu() : node.screen==="notifications" ? Notifications() : node.screen==="truck" ? TruckStock() : node.screen==="setup" ? Setup() : Home();

  return (
    <div style={{ minHeight:"100vh", background:`radial-gradient(130% 90% at 80% -10%, #1A0E2E 0%, ${P.bg1} 45%, ${P.bg0} 100%)`, color:P.txt, fontFamily:FB, position:"relative", overflow:"hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .glow{ transition:transform .16s, box-shadow .16s; } .glow:hover{ transform:translateY(-2px); box-shadow:0 0 0 1px ${P.violet}88, 0 10px 26px -10px ${P.magenta}66; }
        ::-webkit-scrollbar{ width:9px; } ::-webkit-scrollbar-thumb{ background:${P.line}; border-radius:8px; }
        @keyframes orbpulse{ 0%,100%{ box-shadow:0 0 0 0 ${P.magenta}55, 0 8px 30px -6px ${P.magenta}; } 50%{ box-shadow:0 0 0 10px ${P.magenta}00, 0 8px 30px -6px ${P.magenta}; } }
        @keyframes blink{ 0%,80%,100%{ opacity:.25; } 40%{ opacity:1; } }
        .tdot{ width:6px; height:6px; border-radius:50%; background:${P.pink}; display:inline-block; margin-right:4px; animation:blink 1.2s infinite; }`}</style>
      <DotWave/>
      <div style={{ position:"relative", zIndex:1 }}>
        <div style={{ position:"sticky", top:0, zIndex:20, height:54, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", background:"rgba(10,8,22,.72)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${P.line}` }}>
          <div style={{ position:"absolute", left:0, right:0, top:0, height:2, background:`linear-gradient(90deg, ${P.blue}, ${P.violet}, ${P.magenta})` }}/>
          <button onClick={()=>setDrawer(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:8, display:"flex", flexDirection:"column", gap:4 }}>{[0,1,2].map(i=><div key={i} style={{ width:20, height:2, background:P.dim, borderRadius:2 }}/>)}</button>
          <div onClick={goHome} style={{ cursor:"pointer", fontFamily:F, fontWeight:600, fontSize:15, letterSpacing:2 }}><span style={{ color:P.frost }}>CRYO</span><span style={{ color:P.magenta }}>WATCH</span></div>
          <button onClick={()=>go({screen:"notifications"})} style={{ background:"none", border:"none", cursor:"pointer", position:"relative", padding:8 }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={P.dim} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {unread>0 && <span style={{ position:"absolute", top:3, right:3, background:P.magenta, color:"#fff", borderRadius:"50%", width:16, height:16, fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F, boxShadow:`0 0 8px ${P.magenta}` }}>{unread}</span>}
          </button>
        </div>
        {screen}
      </div>

      {/* drawer */}
      {drawer && (<>
        <div onClick={()=>setDrawer(false)} style={{ position:"fixed", inset:0, background:"rgba(4,2,10,.6)", zIndex:40 }}/>
        <div style={{ position:"fixed", top:0, left:0, bottom:0, width:"90%", maxWidth:460, background:P.bg1, borderRight:`1px solid ${P.lineLt}`, zIndex:50, padding:"18px 16px", overflowY:"auto", boxShadow:`0 0 60px ${P.magenta}22` }}>
          <div style={{ display:"flex", alignItems:"center", gap:11, paddingBottom:16, borderBottom:`1px solid ${P.line}`, marginBottom:14 }}>
            <div style={{ width:42, height:42, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F, fontWeight:600, fontSize:15, color:P.bg0, background:`linear-gradient(135deg, ${user.tint}, ${P.pink})` }}>{user.initials}</div>
            <div style={{ flex:1, minWidth:0 }}><div style={{ fontFamily:F, fontWeight:600, color:P.frost }}>{user.name}</div><div style={{ fontSize:11.5, color:P.dim }}>{user.role}</div></div>
            <button onClick={()=>{ setUser(null); setDrawer(false); }} style={seg(false)}>Switch</button>
          </div>
          {[["All stores", goHome],["Ask Cryo", ()=>{ setCryoOpen(true); setDrawer(false); }],["Notifications", ()=>{ go({screen:"notifications"}); setDrawer(false); }],["Truck stock", ()=>{ go({screen:"truck"}); setDrawer(false); }],["Setup · Techs & stores", ()=>{ go({screen:"setup"}); setDrawer(false); }]].map(([t,fn])=>(
            <button key={t} onClick={fn} style={{ ...ghost, width:"100%", textAlign:"left", marginBottom:8, padding:"12px 14px" }}>{t}</button>
          ))}
          <div style={{ fontFamily:F, fontSize:11, letterSpacing:2, color:P.pewter, margin:"16px 4px 10px" }}>JUMP TO STORE</div>
          {stores.map(s=>(
            <button key={s.id} onClick={()=>{ setStack([{screen:"home"},{screen:"store",storeId:s.id}]); setDrawer(false); }} style={{ ...ghost, width:"100%", textAlign:"left", marginBottom:7, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span>{s.name} <span style={{ color:P.dim, fontSize:11 }}>{s.number}</span></span>{flags(s).crit>0 && <Dot s="crit"/>}
            </button>
          ))}
        </div>
      </>)}

      {/* Cryo floating orb */}
      {!cryoOpen && (
        <button onClick={()=>setCryoOpen(true)} aria-label="Ask Cryo" style={{ position:"fixed", right:18, bottom:20, zIndex:35, display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer" }}>
          <span style={{ fontFamily:F, fontWeight:600, letterSpacing:.5, fontSize:13, color:P.frost, background:"rgba(10,8,22,.7)", border:`1px solid ${P.line}`, borderRadius:999, padding:"7px 13px", backdropFilter:"blur(8px)" }}>Ask&nbsp;Cryo</span>
          <span style={{ width:58, height:58, borderRadius:"50%", background:`conic-gradient(from 0deg, ${P.blue}, ${P.violet}, ${P.magenta}, ${P.cyan}, ${P.blue})`, display:"flex", alignItems:"center", justifyContent:"center", animation:"orbpulse 2.4s ease-in-out infinite" }}>
            <span style={{ width:24, height:24, borderRadius:"50%", background:P.bg0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F, color:P.frost, fontWeight:700, fontSize:13 }}>C</span>
          </span>
        </button>
      )}

      {/* Cryo panel */}
      {cryoOpen && (<>
        <div onClick={()=>setCryoOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(4,2,10,.55)", zIndex:60 }}/>
        <div style={{ position:"fixed", right:0, left:0, bottom:0, zIndex:70, margin:"0 auto", maxWidth:520, background:P.bg1, borderTop:`1px solid ${P.lineLt}`, borderRadius:"18px 18px 0 0", boxShadow:`0 -20px 60px -20px #000`, display:"flex", flexDirection:"column", maxHeight:"80vh" }}>
          <div style={{ height:3, background:`linear-gradient(90deg, ${P.blue}, ${P.violet}, ${P.magenta})`, borderRadius:"18px 18px 0 0" }}/>
          <div style={{ display:"flex", alignItems:"center", gap:11, padding:"14px 16px", borderBottom:`1px solid ${P.line}` }}>
            <CryoMark size={32}/>
            <div style={{ flex:1 }}><div style={{ fontFamily:F, fontWeight:600, fontSize:15, letterSpacing:1, color:P.frost }}>CRYO</div><div style={{ fontSize:11, color:P.cyan }}>AI tech assistant · refrigeration expert</div></div>
            <button onClick={()=>setCryoOpen(false)} style={seg(false)}>Close</button>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
            {chat.map((m,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                <div style={{ maxWidth:"82%" }}>
                  <div style={{ whiteSpace:"pre-line", fontSize:13.5, lineHeight:1.5, padding:"10px 13px", borderRadius:13, background:m.role==="user"?P.panel2:`linear-gradient(180deg, ${P.violet}1F, ${P.panel})`, border:`1px solid ${m.role==="user"?P.line:P.violet+"55"}`, color:P.txt }}>{m.text}</div>
                  {m.action && <button onClick={()=>{ go(m.action.node); setCryoOpen(false); }} style={{ ...primary, marginTop:7 }}>{m.action.label} →</button>}
                </div>
              </div>
            ))}
            {thinking && <div style={{ fontSize:13, color:P.pink, padding:"4px 2px" }}><span className="tdot"/><span className="tdot" style={{ animationDelay:".2s" }}/><span className="tdot" style={{ animationDelay:".4s" }}/> Cryo is thinking…</div>}
          </div>
          <div style={{ padding:"10px 12px", borderTop:`1px solid ${P.line}` }}>
            <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:9 }}>
              {SUGGEST.map(s=><button key={s} onClick={()=>send(s)} style={{ ...seg(false), whiteSpace:"nowrap", flexShrink:0 }}>{s}</button>)}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button onClick={mic} aria-label="Voice" style={{ ...ghost, padding:"9px 11px", display:"flex", alignItems:"center" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.cyan} strokeWidth="2" strokeLinecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>
              <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") send(); }} placeholder="Ask Cryo anything…" style={{ ...inp, flex:1 }}/>
              <button onClick={()=>send()} style={primary}>Send</button>
            </div>
          </div>
        </div>
      </>)}
    </div>
  );
}

function Wrap({ children }){ return <div style={{ maxWidth:860, margin:"0 auto", padding:"14px 14px 48px" }}>{children}</div>; }
function Crumb({ path, onBack }){ return (
  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
    <button onClick={onBack} style={{ background:P.panel, border:`1px solid ${P.line}`, color:P.txt, borderRadius:RB, padding:"6px 11px", cursor:"pointer", fontFamily:F }}>←</button>
    <div style={{ fontSize:11.5, color:P.dim, fontFamily:F, letterSpacing:.5 }}>{path.map((p,i)=><span key={i}>{i>0&&<span style={{ color:P.line }}> › </span>}<span style={{ color:i===path.length-1?P.magenta:P.cyan }}>{p}</span></span>)}</div>
  </div>
); }

function Login({ techs, onPick }){
  return (
    <div style={{ minHeight:"100vh", background:`radial-gradient(130% 90% at 80% -10%, #1A0E2E 0%, ${P.bg1} 45%, ${P.bg0} 100%)`, color:P.txt, fontFamily:FB, position:"relative", overflow:"hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');`}</style>
      <DotWave/>
      <div style={{ position:"relative", zIndex:1, maxWidth:560, margin:"0 auto", padding:"clamp(50px,12vh,120px) 20px 0", textAlign:"center" }}>
        <div style={{ fontFamily:F, fontWeight:600, fontSize:42, letterSpacing:3, marginBottom:8 }}><span style={{ color:P.frost }}>CRYO</span><span style={{ color:P.magenta }}>WATCH</span></div>
        <p style={{ color:P.dim, fontSize:15, marginBottom:34 }}>Sign in to load your stores. <span style={{ color:P.pewter }}>(Demo — pick a profile; real email/password comes with the backend.)</span></p>
        <div style={{ display:"grid", gap:12 }}>
          {techs.map(t=>(
            <button key={t.id} onClick={()=>onPick(t)} className="glow" style={{ ...card, display:"flex", alignItems:"center", gap:14, padding:"15px 16px", cursor:"pointer", textAlign:"left", color:P.txt }}>
              <div style={{ width:46, height:46, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F, fontWeight:600, fontSize:17, color:P.bg0, background:`linear-gradient(135deg, ${t.tint}, ${P.pink})` }}>{t.initials}</div>
              <div><div style={{ fontFamily:F, fontWeight:600, fontSize:17, color:P.frost, letterSpacing:.5 }}>{t.name}</div><div style={{ fontSize:12, color:P.dim }}>{t.role}</div></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
