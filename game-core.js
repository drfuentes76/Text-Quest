/*=============================================
  TextQuest v7 – game-core.js  (single file)
  Drop in repo root. All HTML pages include:
  <script src="game-core.js"></script>
=============================================*/

/* ---------- 1. Persistent State ---------- */
const KEY = "tq7_save";
function defState () {
  return {
    name: "Hero",
    cls: "warrior",
    zone: "Gate",
    hp: 40, maxHp: 40,
    mp: 20, maxMp: 20,
    atk: 5, def: 0,
    gold: 50,
    xp: 0, lvl: 1, turn: 0,
    inv: ["Potion"],
    spells: {
      boost: { lvl: 1, cd: 0, casts: 0 },
      shield: { lvl: 1, cd: 0, casts: 0 }
    },
    quests: {},          // id → {stage, done}
    companion: null      // {name, mode, hp,maxHp,lvl,xp}
  };
}
function load() { try { return JSON.parse(localStorage[KEY]); } catch { return defState(); } }
function save(s) { localStorage[KEY] = JSON.stringify(s); }
let S = load();            // live state object (mutated)

/* ---------- 2. Static Data ---------- */
const DATA = {
  zones: {
    Gate   : { desc: "You stand at the city gate.", ex:{e:"Hills"}, npcs:["Guard"] },
    Hills  : { desc: "Rolling green hills.",        ex:{w:"Gate"} , npcs:["Wolf"]  }
  },
  npcs: {
    Guard : { name:"City Guard", hp:25, atk:4, gold:6, loot:["Iron Ingot"] },
    Wolf  : { name:"Rabid Wolf", hp:18, atk:3, gold:3, loot:["Potion"]     }
  },
  items: {
    Potion      : { t:"potion", hp:15, price: 10 },
    "Iron Ingot": { t:"mat", price:  6 },
    Sword       : { t:"weapon", atk:6, price: 35 },
    Shield      : { t:"armor" , def:2, price: 25 }
  },
  shopStock : ["Potion","Sword","Shield"],
  spells: {
    boost  : { n:"Boost Aggression", cost:5, base:85, inc:3, cd:3,
               effect:(lvl)=>{ S.atk += 2*lvl; } },
    shield : { n:"Holy Shield",      cost:5, base:90, inc:2, cd:4,
               effect:(lvl)=>{ S.def += 1*lvl; S.hp = Math.min(S.maxHp, S.hp+5*lvl);} }
  },
  quests: {
    wolf1 : { n:"Cull the Wolves", need:"Wolf", goal:2, reward:{xp:20,gold:15} }
  },
  companionPool:[
    { name:"Wolf Pup", hp:12, atk:2 },
    { name:"Forest Owl", hp:10, atk:1 }
  ]
};

/* ---------- 3. Helpers ---------- */
const $ = (q) => document.querySelector(q);
function uiHUD(){
  const hud=$("#hud"); if(!hud) return;
  hud.textContent=`HP ${S.hp}/${S.maxHp}  MP ${S.mp}/${S.maxMp}  XP ${S.xp}  Gold ${S.gold}`;
  if(S.companion) hud.textContent+="  Pet:"+S.companion.name;
}
function rand(a){ return Math.floor(Math.random()*a); }
function gainXP(v){
  S.xp += v;
  const need = 50 + S.lvl*25;
  if (S.xp >= need){ S.xp-=need; S.lvl++; S.maxHp+=5; S.hp=S.maxHp; S.atk++; }
}

/* ---------- 4. Inventory ---------- */
function addItem(id){ S.inv.push(id); }
function hasItem(id){ return S.inv.includes(id); }
function removeItem(id){ const i=S.inv.indexOf(id); if(i>-1)S.inv.splice(i,1); }

/* ---------- 5. Spells ---------- */
function cast(key){
  const spec=DATA.spells[key], st=S.spells[key];
  if(!spec){ alert("No such spell."); return; }
  if(st.cd){ alert("Cooldown!"); return; }
  if(S.mp<spec.cost){ alert("Not enough MP"); return; }
  const chance=Math.min(99,spec.base+spec.inc*st.lvl);
  if(Math.random()*100>chance){ alert("The spell fizzles."); st.cd=1; return; }
  S.mp-=spec.cost; spec.effect(st.lvl);
  st.casts++; if(st.casts%3===0 && st.lvl<5) st.lvl++;
  st.cd=spec.cd; tick(); uiHUD(); alert(spec.n+" cast!");
}

/* ---------- 6. Turn / Time ---------- */
function tick(){
  S.turn++; Object.values(S.spells).forEach(s=>{ if(s.cd) s.cd--; });
  save(S);
}

/* ---------- 7. Shop ---------- */
function buildShop(){
  uiHUD();
  const list=$("#shop"); if(!list) return;
  DATA.shopStock.forEach(id=>{
    const it=DATA.items[id], row=document.createElement("div");
    row.textContent=`${id} – ${it.price}g`;
    const b=document.createElement("button"); b.textContent="Buy";
    b.onclick=()=>{ if(S.gold<it.price)return alert("Need more gold");
      S.gold-=it.price; addItem(id); uiHUD(); save(S); };
    row.appendChild(b); list.appendChild(row);
  });
  /* Sell table */
  const sell=$("#sell"); if(!sell) return;
  [...new Set(S.inv)].forEach(id=>{
    const count=S.inv.filter(x=>x===id).length, it=DATA.items[id]||{};
    const row=document.createElement("div");
    row.textContent=`${id} ×${count} – sell ${Math.floor((it.price||2)/2)}g`;
    const b=document.createElement("button"); b.textContent="Sell";
    b.onclick=()=>{ removeItem(id); S.gold+=Math.floor((it.price||2)/2); uiHUD(); save(S); location.reload(); };
    row.appendChild(b); sell.appendChild(row);
  });
}

/* ---------- 8. Forge ---------- */
function forgeSword(){
  if(!hasItem("Iron Ingot")) return alert("Need an Iron Ingot");
  removeItem("Iron Ingot"); addItem("Sword"); alert("You forged a Sword!");
  save(S);
}

/* ---------- 9. Battle Engine (single enemy) ---------- */
function startBattle(npcKey){
  const foe = JSON.parse(JSON.stringify(DATA.npcs[npcKey]));
  $("#enemy").textContent=`${foe.name} HP ${foe.hp}`;
  uiHUD();
  $("#btnAtk").onclick=()=>turn("atk");
  $("#btnSpell").onclick=()=>turn("spell");
  function turn(action){
    if(action==="spell") cast("boost");
    foe.hp-=S.atk;  $("#enemy").textContent=`${foe.name} HP ${foe.hp}`;
    if(foe.hp<=0){ victory(); return; }
    S.hp-=foe.atk; alert(`${foe.name} hits you for ${foe.atk}`);
    if(S.hp<=0){ defeat(); return; }
    tick(); uiHUD();
  }
  function victory(){
    alert("Victory!"); S.gold+=foe.gold; foe.loot.forEach(addItem);
    gainXP(10); save(S); location.href="index.html";
  }
  function defeat(){ alert("You have died..."); S=defState(); save(S); location.href="index.html"; }
}

/* ---------- 10. Quest System ---------- */
function listQuests(){
  uiHUD(); const qDiv=$("#qList");
  Object.entries(DATA.quests).forEach(([id,q])=>{
    const st=S.quests[id]||{stage:0,done:false};
    const row=document.createElement("div");
    row.textContent=q.n+" – "+ (st.done?"✓":"Stage "+st.stage+"/"+q.goal);
    if(!st.done){
      const b=document.createElement("button"); b.textContent=st.stage? "Progress":"Accept";
      b.onclick=()=>{ if(!st.stage){ S.quests[id]={stage:0,done:false}; }
        else if(st.stage>=q.goal-1){ S.quests[id].done=true; S.gold+=q.reward.gold; gainXP(q.reward.xp); }
        else S.quests[id].stage++;
        save(S); location.reload(); };
      row.appendChild(b);
    }
    qDiv.appendChild(row);
  });
}

/* ---------- 11. Companion ---------- */
function obtainCompanion(){
  if(S.companion) return;
  S.companion=JSON.parse(JSON.stringify(DATA.companionPool[rand(DATA.companionPool.length)]));
  alert("Companion "+S.companion.name+" has joined you!");
  save(S); uiHUD();
}
function companionPage(){
  uiHUD(); if(!S.companion) return $("#comp").textContent="No companion yet.";
  $("#comp").textContent=`${S.companion.name} – Mode:${S.companion.mode||'attack'}`;
  $("#toAtk").onclick=()=>{S.companion.mode='attack';save(S);location.reload();};
  $("#toDef").onclick=()=>{S.companion.mode='defend';save(S);location.reload();};
}

/* ---------- Cheats ---------- */
function cheatsExec(cmd){
  switch(cmd){
    case"god":S.hp=S.maxHp=999;S.mp=S.maxMp=999;S.gold=999;break;
    case"reset":S=defState();break;
    case"xp":gainXP(100);break;
  }
  save(S);
}

/* ---------- Auto-run HUD on every page ---------- */
document.addEventListener("DOMContentLoaded", uiHUD);
