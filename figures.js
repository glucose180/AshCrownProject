import * as THREE from './vendor/three.module.min.js';

// Small, texture-free figurines modeled after the user's five reference images.
// Every model stands at y=0. Its face and costume details point along local +z.
const materials=new Map();
function material(color,metalness=0){
  const key=color+metalness;
  if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({
    color,roughness:metalness?.7:1,metalness,side:THREE.DoubleSide
  }));
  return materials.get(key);
}
function part(parent,geometry,color,x=0,y=0,z=0,metalness=0){
  const mesh=new THREE.Mesh(geometry,material(color,metalness));
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;
  parent.add(mesh);return mesh;
}
function sphere(parent,r,color,x,y,z,sx=1,sy=1,sz=1){
  const mesh=part(parent,new THREE.SphereGeometry(r,16,10),color,x,y,z);
  mesh.scale.set(sx,sy,sz);return mesh;
}
function box(parent,w,h,d,color,x,y,z){return part(parent,new THREE.BoxGeometry(w,h,d),color,x,y,z);}
function cylinder(parent,top,bottom,height,color,x,y,z){return part(parent,new THREE.CylinderGeometry(top,bottom,height,16),color,x,y,z);}
function torso(parent,color){cylinder(parent,.165,.235,.8,color,0,.4,0);}
function head(parent,color){
  cylinder(parent,.076,.078,.1,color,0,.82,0);
  sphere(parent,.218,color,0,1.057,.012);
}
function belt(parent,color){cylinder(parent,.204,.211,.067,color,0,.382,0);}
function cloak(parent,color){
  part(parent,new THREE.CylinderGeometry(.181,.254,.79,18,1,true,.66,Math.PI*2-1.32),color,0,.395,0);
}
function clasp(parent,color,r=.025){sphere(parent,r,color,0,.765,.183,1,1,.45);}
function hair(parent,color,long=false){
  part(parent,new THREE.SphereGeometry(.238,14,7,0,Math.PI*2,0,Math.PI*.51),color,0,1.066,.002);
  part(parent,new THREE.SphereGeometry(.236,14,6,Math.PI,Math.PI,Math.PI*.5,Math.PI*.41),color,0,1.066,-.005);
  if(long){
    for(const side of [-1,1]){
      const lock=part(parent,new THREE.IcosahedronGeometry(.104,0),color,side*.184,.947,-.06);
      lock.scale.set(.75,1.65,.82);lock.rotation.z=side*.12;
    }
  }
}
function shoulderFur(parent){
  for(let i=0;i<10;i++){
    const angle=i*Math.PI*2/10;
    const tuft=part(parent,new THREE.IcosahedronGeometry(.093,0),i%2?'#887869':'#9b8976',Math.sin(angle)*.187,.755,Math.cos(angle)*.175);
    tuft.scale.set(.95,1.1,1.2);tuft.rotation.y=angle;
  }
}
function sword(parent){
  const sword=new THREE.Group();sword.position.set(.307,0,.038);parent.add(sword);
  const outline=new THREE.Shape();outline.moveTo(0,.035);outline.lineTo(-.043,.14);outline.lineTo(-.043,.685);
  outline.lineTo(.043,.685);outline.lineTo(.043,.14);outline.closePath();
  part(sword,new THREE.ExtrudeGeometry(outline,{depth:.026,bevelEnabled:false}), '#adb0ad',0,0,0,.35);
  box(sword,.19,.039,.065,'#777b7a',0,.701,.012);
  cylinder(sword,.023,.025,.16,'#4a352a',0,.803,.012);
  part(sword,new THREE.IcosahedronGeometry(.041,0),'#a5a6a1',0,.918,.012,.25);
}
function compass(parent){
  box(parent,.024,.15,.013,'#9a7951',-.09,.52,.193);
  const disk=cylinder(parent,.064,.064,.018,'#ae8548',-.09,.395,.213);disk.rotation.x=Math.PI/2;
  part(parent,new THREE.TorusGeometry(.06,.009,6,16),'#d8b471',-.09,.395,.23,.3);
  const needle=box(parent,.012,.091,.009,'#e1c280',-.09,.395,.235);needle.rotation.z=-.48;
  const across=box(parent,.06,.008,.008,'#d1b179',-.09,.395,.235);across.rotation.z=-.48;
}
function satchel(parent){
  const bag=new THREE.Group();bag.position.set(.16,.355,.151);bag.rotation.y=.28;bag.rotation.z=.08;parent.add(bag);
  box(bag,.145,.18,.075,'#775a46',0,0,0);
  box(bag,.154,.065,.015,'#8b6c53',0,.057,.043);
  sphere(bag,.014,'#c1a57b',0,.035,.055,1,1,.35);
  cylinder(bag,.031,.028,.18,'#dcc5a0',0,.175,0);
  cylinder(bag,.036,.036,.012,'#eddbb8',0,.27,0);
  cylinder(bag,.018,.018,.014,'#806c4d',0,.272,0);
  cylinder(bag,.033,.033,.012,'#72543b',0,.185,0);
}
function hood(parent){
  const profile=[[.173,.835],[.248,.91],[.283,1.07],[.233,1.238],[.125,1.32],[.018,1.348]];
  const points=profile.map(([r,y])=>new THREE.Vector2(r,y));
  part(parent,new THREE.LatheGeometry(points,18,.68,Math.PI*2-1.36),'#484440');
  for(const angle of [.68,Math.PI*2-.68]){
    const curve=new THREE.CatmullRomCurve3(profile.map(([r,y])=>new THREE.Vector3(Math.sin(angle)*r,y,Math.cos(angle)*r)));
    part(parent,new THREE.TubeGeometry(curve,10,.012,5,false),'#554e47');
  }
}
function stitches(parent){
  const patch=new THREE.Group();patch.position.set(.068,.248,.206);patch.rotation.y=.31;patch.rotation.z=-.12;parent.add(patch);
  for(const x of [-.025,.025])box(patch,.012,.135,.009,'#58412c',x,0,.001);
  for(const y of [-.029,.029])box(patch,.105,.012,.01,'#58412c',0,y,.002);
}

export function createFigure(id){
  const figure=new THREE.Group();figure.name='figure-'+id;
  switch(id){
    case 'player':
      torso(figure,'#b2aaa0');head(figure,'#c5bdb0');
      cylinder(figure,.172,.181,.052,'#645f56',0,.79,0);
      belt(figure,'#74614f');satchel(figure);break;
    case 'sanjay':
      torso(figure,'#414342');cloak(figure,'#363b3a');head(figure,'#a47550');
      belt(figure,'#71523d');box(figure,.044,.075,.019,'#a59d87',.012,.383,.21);
      shoulderFur(figure);hair(figure,'#302d2b',true);
      part(figure,new THREE.SphereGeometry(.223,14,5,.16,Math.PI-.32,Math.PI*.61,Math.PI*.24),'#4b3830',0,1.057,.017);
      sword(figure);break;
    case 'sharman':
      torso(figure,'#685440');cloak(figure,'#4b4441');head(figure,'#c09972');hair(figure,'#54433a');
      belt(figure,'#94724f');clasp(figure,'#c7a368',.032);compass(figure);break;
    case 'bandit':
      torso(figure,'#4a4743');head(figure,'#b0aaa1');hood(figure);break;
    case 'poet':
      torso(figure,'#90704e');head(figure,'#bdb3a6');
      cylinder(figure,.17,.182,.045,'#64513e',0,.795,0);stitches(figure);break;
    default:throw new Error('Unknown figure: '+id);
  }
  return figure;
}
