/* TextQuest v7 - full game logic single file */
const KEY="tq7_save";
function defState(){return{name:"Hero",cls:"warrior",zone:"Gate",hp:40,maxHp:40,mp:20,maxMp:20,atk:5,def:0,gold:30,xp:0,lvl:1,turn:0,inv:["Potion"],spells:{boost:{lvl:1,cd:0,casts:0}},quests:{},companion:null};}
function load(){try{return JSON.parse(localStorage[KEY])||defState();}catch{return defState();}}
function save(s){localStorage[KEY]=JSON.stringify(s);}
let S=load();

const DATA={
 zones:{Gate:{d:"You stand at the city gate.",ex:{e:"Hills"},n:["Guard"]},
        Hills:{d:"Rolling hills.",ex:{w:"Gate"},n:["Wolf"]}},
 npcs:{Guard:{n:"City Guard",hp:25,atk:4,gold:6,loot:["Iron Ingot"]},
       Wolf:{n:"Rabid Wolf",hp:18,atk:3,gold:3,loot:["Potion"]}},
 items:{Potion:{t:"potion",hp:15,price:10},
        "Iron Ingot":{t:"mat",price:6},
        Sword:{t:"weapon",atk:6,price:35},
        Shield:{t:"armor",def:2,price:25}},
 shop:["Potion","Sword","Shield"],
 spells:{boost:{n:"Boost",cost:5,base:85,inc:3,cd:3,e:(lvl)=>S.atk+=2*lvl}},
 quests:{wolf1:{n:"Cull the Wolves",need:"Wolf",goal:2,reward:{xp:20,gold:15}}},
 companions:[{name:"Wolf Pup",hp:15,atk:2},{name:"Forest Owl",hp:12,atk:1}]
};

/* Helpers */
const $=q=>document.querySelector(q);
function hud(){const h=$("#hud");if(h)h.textContent=`HP ${S.hp}/${S.maxHp}  MP ${S.mp}/${S.maxMp}  XP ${S.xp}  Gold ${S.gold}`+(S.companion?`  Pet:${S.companion.name}`:"");}
function rand(a){return Math.floor(Math.random()*a);}
function addItem(id){S.inv.push(id);}
function hasItem(id){return S.inv.includes(id);}
function remItem(id){const i=S.inv.indexOf(id);if(i>-1)S.inv.splice(i,1);}
function gainXP(v){S.xp+=v;const need=50+S.lvl*25;if(S.xp>=need){S.xp-=need;S.lvl++;S.maxHp+=5;S.hp=S.maxHp;S.atk++;}}

function tick(){S.turn++;Object.values(S.spells).forEach(s=>{if(s.cd)s.cd--});save(S);}

/* Spell */
function castBoost(){const sp=S.spells.boost,d=DATA.spells.boost;if(sp.cd){alert("CD");return;}if(S.mp<d.cost){alert("No MP");return;}
const ch=d.base+d.inc*sp.lvl;if(Math.random()*100>ch){alert("Fizzle");sp.cd=1;save(S);return;}
S.mp-=d.cost;d.e(sp.lvl);sp.casts++;if(sp.casts%3===0&&sp.lvl<5)sp.lvl++;sp.cd=d.cd;tick();hud();alert("Boosted!");}

/* Shop */
function pageShop(){hud();const list=$("#shop"),sell=$("#sell");DATA.shop.forEach(id=>{const it=DATA.items[id],row=document.createElement("div");row.textContent=`${id} - ${it.price}g`;const b=document.createElement("button");b.textContent="Buy";b.onclick=()=>{if(S.gold<it.price)return alert("Need gold");S.gold-=it.price;addItem(id);save(S);hud();};row.appendChild(b);list.appendChild(row);});const uniq=[...new Set(S.inv)];uniq.forEach(id=>{const qty=S.inv.filter(i=>i===id).length,row=document.createElement("div");row.textContent=`${id} x${qty}`;const price=Math.floor((DATA.items[id]?.price||2)/2);const b=document.createElement("button");b.textContent=`Sell ${price}g`;b.onclick=()=>{remItem(id);S.gold+=price;save(S);location.reload();};row.appendChild(b);sell.appendChild(row);});}

/* Forge */
function pageForge(){hud();$("#forgeBtn").onclick=()=>{if(!hasItem("Iron Ingot"))return alert("Need Ingot");remItem("Iron Ingot");addItem("Sword");save(S);alert("Forged Sword");};}

/* Inventory */
function pageInv(){hud();const ul=$("#inv");S.inv.forEach(i=>{const li=document.createElement("li");li.textContent=i;ul.appendChild(li);});}

/* Companion */
function pageComp(){hud();const div=$("#comp");if(!S.companion){const b=document.createElement("button");b.textContent="Summon Companion";b.onclick=()=>{S.companion=JSON.parse(JSON.stringify(DATA.companions[rand(DATA.companions.length)]));save(S);location.reload();};div.appendChild(b);return;}
div.textContent=`${S.companion.name} Mode:${S.companion.mode||'attack'}`;$("#toAtk").onclick=()=>{S.companion.mode='attack';save(S);location.reload();};$("#toDef").onclick=()=>{S.companion.mode='defend';save(S);location.reload();};}

/* Quests */
function pageQuests(){hud();const qd=$("#qList");Object.entries(DATA.quests).forEach(([id,q])=>{const st=S.quests[id]||{stage:0,done:false};const row=document.createElement("div");row.textContent=`${q.n} – ${st.done?"✓":st.stage+"/"+q.goal}`;const b=document.createElement("button");b.textContent=st.stage? "Progress":"Accept";if(st.done)b.disabled=true; b.onclick=()=>{if(!st.stage)S.quests[id]={stage:0,done:false};else if(st.stage>=q.goal-1){S.quests[id].done=true;gainXP(q.reward.xp);S.gold+=q.reward.gold;}else S.quests[id].stage++;save(S);location.reload();};row.appendChild(b);qd.appendChild(row);});}

/* Battle */
function pageBattle(key="Wolf"){const foe=JSON.parse(JSON.stringify(DATA.npcs[key]));$("#enemy").textContent=`${foe.n||foe.name} ${foe.hp}HP`;hud();
$("#btnAtk").onclick=()=>turn("atk");$("#btnSpell").onclick=()=>turn("spell");
function turn(act){if(act==="spell")castBoost();foe.hp-=S.atk;$("#enemy").textContent=`${foe.name} ${foe.hp}HP`;if(foe.hp<=0){victory();return;}S.hp-=foe.atk;alert(foe.name+" hits "+foe.atk);if(S.hp<=0){defeat();return;}tick();hud();}
function victory(){alert("Win!");S.gold+=foe.gold;foe.loot.forEach(addItem);gainXP(10);save(S);location.href='index.html';}
function defeat(){alert("Dead");S=defState();save(S);location.href='index.html';}}

/* Lookup page initializers */
function initPage(){
 const body=document.body.dataset.page;
 switch(body){case"shop":pageShop();break;case"forge":pageForge();break;
 case"inv":pageInv();break;case"comp":pageComp();break;case"quests":pageQuests();break;
 case"battle":pageBattle();break;}
}
document.addEventListener("DOMContentLoaded",()=>{hud();initPage();});
