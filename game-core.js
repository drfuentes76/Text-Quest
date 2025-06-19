
const KEY='tq7_save';
function defState(){return{name:'Hero',cls:'warrior',zone:'Gate',hp:40,maxHp:40,mp:20,maxMp:20,
 atk:5,def:0,gold:30,xp:0,lvl:1,turn:0,inv:['Potion'],spells:{},quests:{},companion:null};}
}
function load(){return JSON.parse(localStorage[KEY]||'null')||defState();}
function save(x){localStorage[KEY]=JSON.stringify(x);}
let S=load();

/* --- Spell Definitions --- */
const SPELLS={
 boost:{n:'Boost Aggression',cost:5,base:85,inc:3,cd:3,e:l=>S.atk+=2*l},
 fire:{n:'Fireball',cost:8,base:80,inc:4,cd:2,e:l=>{winStack.dmg+=5*l}},
 shield:{n:'Holy Shield',cost:6,base:90,inc:2,cd:4,e:l=>S.def+=1*l},
 lightning:{n:'Lightning',cost:10,base:75,inc:4,cd:3,e:l=>{winStack.dmg+=7*l}},
 incapacitate:{n:'Incapacitate',cost:9,base:65,inc:5,cd:5,e:l=>{S.stunTurns=2}},
 hand:{n:'Hand of God',cost:12,base:80,inc:3,cd:4,e:l=>S.atk+=3*l},
 berserker:{n:'Berserker Queer',cost:5,base:90,inc:2,cd:3,e:l=>S.hp+=5*l},
 bellow:{n:'Battle Yell',cost:6,base:85,inc:2,cd:3,e:l=>{winStack.dmg+=3*l}}
};

/* --- Cheats --- */
function cheatsExec(cmd){
  cmd=cmd.toLowerCase();
  if(cmd==='god'){S.hp=S.maxHp=999;S.mp=S.maxMp=999;S.gold=999;}
  else if(cmd==='reset'){localStorage.removeItem(KEY);S=defState();}
  else if(cmd==='xp'){S.xp+=100;}
  else if(cmd==='duplicate'){openDupUI();return;}
  save(S);
}

/* Duplicate Item Modal */
function openDupUI(){
  const wrap=document.createElement('div');
  Object.assign(wrap.style,{position:'fixed',inset:0,background:'#000c',display:'flex',flexDirection:'column',
    alignItems:'center',padding:'1rem',overflow:'auto',zIndex:9999,color:'#fff'});
  wrap.innerHTML="<h3>Duplicate Items (max 99 each)</h3>";
  const form=document.createElement('form');form.style.display='flex';form.style.flexDirection='column';
  const uniq=[...new Set(S.inv)];
  uniq.forEach(id=>{
    const cnt=S.inv.filter(x=>x===id).length;
    const row=document.createElement('label');
    row.style.margin='.25rem';
    row.innerHTML=`${id} (have ${cnt}) → <input type='number' min='0' max='99' value='0' style='width:60px'>`;
    form.appendChild(row);
  });
  const ok=document.createElement('button');ok.textContent='Duplicate';ok.type='submit';ok.style.marginTop='.5rem';
  form.appendChild(ok);wrap.appendChild(form);
  const close=document.createElement('button');close.textContent='Close';close.style.marginTop='.5rem';
  wrap.appendChild(close);
  close.onclick=()=>wrap.remove();
  form.onsubmit=e=>{
    e.preventDefault();
    const inputs=[...form.querySelectorAll('input')];
    inputs.forEach((inp,i)=>{let n=Math.min(99,Math.max(0,parseInt(inp.value||'0')));
      for(let k=0;k<n;k++)S.inv.push(uniq[i]);});
    save(S);alert('Items duplicated!');wrap.remove();
  };
  document.body.appendChild(wrap);
}

/* Dummy HUD */
document.addEventListener('DOMContentLoaded',()=>{
  const h=document.getElementById('hud');if(h)h.textContent='Demo HUD Loaded';
});
