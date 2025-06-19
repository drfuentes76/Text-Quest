/* Minimal stable core just for UI testing */
const KEY='tq7_save';
function base(){return{name:'Hero',cls:'warrior',zone:'Gate',gold:10};}
function load(){return JSON.parse(localStorage[KEY]||'null')||setup();}
function setup(){const tmp=localStorage.tq7_setup?JSON.parse(localStorage.tq7_setup):{name:'Hero',cls:'warrior'};
localStorage.removeItem('tq7_setup'); const s=base();s.name=tmp.name;s.cls=tmp.cls;save(s);return s;}
function save(x){localStorage[KEY]=JSON.stringify(x);}
let S=load();

const zones={Gate:{d:'You are at the Gate',ex:{e:'Hills'}},Hills:{d:'Grassy hills',ex:{w:'Gate'}}};

function hud(){const h=document.getElementById('hud');if(h)h.textContent=`${S.name} the ${S.cls} | Gold ${S.gold}`;}

function look(){const d=document.getElementById('desc');if(d)d.textContent=zones[S.zone].d;}

function cheatsExec(cmd){alert('Cheat entered: '+cmd);}

document.addEventListener('DOMContentLoaded',()=>{
 hud();
 const pg=document.body.dataset.page;
 if(pg==='world'){look();['n','s','e','w'].forEach(dir=>{
  const btn=document.getElementById(dir);
  if(btn)btn.onclick=()=>{const nx=zones[S.zone].ex[dir];if(nx){S.zone=nx;save(S);look();}};
 });}
});
