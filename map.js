import * as THREE from './vendor/three.module.min.js';
import { createStory, paths, placeNames, endingMessage } from './story.js';
import { createFigure } from './figures.js';
const places={start:{x:-4.8,z:4},forest:{x:-4,z:.4},ridge:{x:-3.5,z:-3},camp:{x:-.3,z:.7},road:{x:-.6,z:3.9},gate:{x:3.43,z:-.5},castle:{x:2.5,z:-2.65}};
const host=document.getElementById('scene'),map=document.getElementById('map'),markers=document.getElementById('markers');
for(const [id,place] of Object.entries(places)){place.links=paths[id];place.name=placeNames[id];}
const story=createStory();
let renderer,webgl=true;
try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});} catch(e){const {SVGRenderer}=await import('./vendor/SVGRenderer.js');renderer=new SVGRenderer();renderer.setQuality('high');webgl=false;}
if(webgl){renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;}
renderer.setClearColor(0x181818);host.appendChild(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-12,12,9,-9,.1,100);camera.position.set(19,22,19);camera.lookAt(0,0,0);camera.zoom=1.155;
scene.add(new THREE.HemisphereLight(0xf4f7ff,0x7e8b5c,2));if(!webgl)scene.add(new THREE.AmbientLight(0xffffff,.65));const sun=new THREE.DirectionalLight(0xfff6df,webgl?3.1:1);sun.position.set(-8,16,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.5,far:45});sun.shadow.normalBias=.035;sun.shadow.bias=-.0003;sun.shadow.radius=2;scene.add(sun);
const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:1,flatShading:true});
const palette={ground:mat('#75945d'),snow:mat('#e3e9e5'),snow2:mat('#cbd6d2'),grass:mat('#4c7949'),meadow:mat('#86a564'),water:mat('#398ba6'),road:mat('#bca777'),rock:mat('#768182'),white:mat('#e9eeed'),trunk:mat('#69533c'),pine:mat('#285c49'),leaves:mat('#4f7e46'),stone:mat('#9caba5'),stoneSide:mat('#758882'),roof:mat('#435e62'),tent:mat('#b7a17b')};
const labelObjects=[];
function mesh(geo,m,x,y,z,shadow=true){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;scene.add(o);if(shadow)labelObjects.push(o);return o;}
function flat(points,m,y=.008){const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const o=mesh(new THREE.ShapeGeometry(shape),m,0,y,0,false);o.rotation.x=-Math.PI/2;o.renderOrder=-100+y*1000;return o;}
// All biomes share the same flat ground plane; only props have height.
flat([[-7,-5.7],[7,-5.7],[7,5.7],[-7,5.7]],palette.ground,0);
flat([[-7,-5.7],[7,-5.7],[7,-1.5],[5.9,-1.8],[4.7,-1.3],[3.3,-1.6],[1.6,-1.3],[.8,-1.7],[-.4,-1.4],[-1.7,-2.1],[-3,-1.5],[-4.6,-1.9],[-5.8,-1.4],[-7,-1.6]],palette.snow,.008);
flat([[-7,-5.7],[7,-5.7],[7,-4.4],[4.9,-4.7],[2.2,-4.2],[.6,-4.6],[-1.5,-4.1],[-3.5,-4.6],[-5.6,-4],[-7,-4.2]],palette.snow2,.011);
flat([[-7,-1.6],[-5.8,-1.4],[-4.6,-1.9],[-3,-1.5],[-2.2,-.7],[-2.4,.7],[-1.5,1.4],[-2,2.4],[-4.3,2.7],[-5.4,3.7],[-7,3.9]],palette.grass,.01);
flat([[-7,3.9],[-5.4,3.7],[-4.3,2.7],[-2,2.4],[.2,2.9],[2.6,4.7],[4.3,4.9],[4.4,5.7],[-7,5.7]],palette.meadow,.011);
flat([[5.5,-5.7],[6.5,-5.7],[6.15,-4.2],[5.4,-3],[5.5,-1.2],[5.95,.6],[5.3,2.3],[5.65,4],[6.6,5.7],[5.4,5.7],[4.55,4.1],[4.45,2.25],[5.1,.55],[4.7,-1.1],[4.7,-3.3]],palette.water,.018);
function strip(a,b,width,m,y=.025){const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),ox=-dz/len*width/2,oz=dx/len*width/2;return flat([[a[0]+ox,a[1]+oz],[b[0]+ox,b[1]+oz],[b[0]-ox,b[1]-oz],[a[0]-ox,a[1]-oz]],m,y);}
const routeMaterial=new THREE.MeshBasicMaterial({color:'#5b8293',side:THREE.DoubleSide});
const routeWaypoints={'gate:castle':[{x:3.43,z:-1.95}],'ridge:gate':[{x:1,z:-.55}]};
function routePoints(from,to){const forward=routeWaypoints[from+':'+to],backward=routeWaypoints[to+':'+from];return [places[from],...(forward||(backward?[...backward].reverse():[])),places[to]];}
function dashedRoute(from,to){
const points=routePoints(from,to),dash=.14,gap=.17;
const segments=[];
for(let i=0;i<points.length-1;i++){
const p=points[i],q=points[i+1],dx=q.x-p.x,dz=q.z-p.z,length=Math.hypot(dx,dz),start=i===0?.37:0,finish=length-(i===points.length-2?.37:0);
for(let d=start;d<finish;d+=dash+gap){
const end=Math.min(d+dash,finish);
segments.push(strip([p.x+dx*d/length,p.z+dz*d/length],[p.x+dx*end/length,p.z+dz*end/length],.045,routeMaterial));
}
}
return segments;
}
const routes=[];for(const [id,p] of Object.entries(places))for(const other of p.links)if(id<other){routes.push({from:id,to:other,segments:dashedRoute(id,other)});}
function box(x,z,w,d,h,m,y=0){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y+h/2,z);}
function pine(x,z,scale=1,snow=false){mesh(new THREE.CylinderGeometry(.065*scale,.08*scale,.45*scale,5),palette.trunk,x,.225*scale,z);for(let i=0;i<2;i++){const h=(.8-i*.16)*scale,base=(.42-i*.09)*scale,cy=(.6+i*.4)*scale;const c=mesh(new THREE.ConeGeometry(base,h,5),snow&&i===1?palette.white:palette.pine,x,cy,z);c.rotation.y=.3;}}
function leafy(x,z,s=1){mesh(new THREE.CylinderGeometry(.055*s,.07*s,.65*s,5),palette.trunk,x,.325*s,z);const o=mesh(new THREE.IcosahedronGeometry(.45*s,0),palette.leaves,x,.94*s,z);o.scale.y=1.15;}
function rock(x,z,s=1,snow=false){const o=mesh(new THREE.DodecahedronGeometry(.48,0),palette.rock,x,.27*s,z);o.scale.set(s,.65*s,.8*s);o.rotation.y=x;if(snow){const cap=mesh(new THREE.IcosahedronGeometry(.42,0),palette.white,x-.02*s,.5*s,z);cap.scale.set(s,.4*s,.78*s);cap.rotation.y=x;}}
function campfire(x,z){
const ash=mat('#514c45');
mesh(new THREE.CylinderGeometry(.35,.35,.035,10),ash,x,.04,z,false);
for(let i=0;i<9;i++){
const a=i*Math.PI*2/9,stone=mesh(new THREE.DodecahedronGeometry(.105,0),palette.rock,x+Math.cos(a)*.4,.075,z+Math.sin(a)*.4);
stone.scale.set(1.1,.65,.85);stone.rotation.y=a;
}
for(const [angle,y] of [[.35,.115],[-1.05,.205]]){
const log=mesh(new THREE.CylinderGeometry(.065,.08,.65,6),palette.trunk,x,y,z);
log.rotation.z=Math.PI/2;log.rotation.y=angle;
}
}
function tower(x,z,h=1.4){box(x,z,.65,.65,h,palette.stone);for(const dx of [-.22,.22])for(const dz of [-.22,.22])box(x+dx,z+dz,.2,.2,.2,palette.stone,h);}
function castle(){tower(3.7,-3.4,1.5);tower(1.8,-3.4,1.5);box(2.75,-3.4,1.3,.43,.85,palette.stone);box(2.75,-4.2,1.2,.9,1.5,palette.stoneSide);// Flat stone roof with a low crenellated parapet.
box(2.75,-4.2,1.28,.98,.10,palette.stone,1.5);
for(const z of [-4.63,-3.77])box(2.75,z,1.28,.12,.13,palette.stone,1.6);
for(const x of [2.17,3.33])box(x,-4.2,.12,.74,.13,palette.stone,1.6);
for(const x of [2.19,2.75,3.31])for(const z of [-4.61,-3.79])box(x,z,.2,.2,.16,palette.stone,1.73);}
function castleAnnex(x,z,w,d,h){
box(x,z,w,d,h,palette.stoneSide);
box(x,z,w+.08,d+.08,.07,palette.stone,h);
for(const side of [-1,1]){
box(x,z+side*d/2,w+.08,.09,.1,palette.stone,h+.07);
box(x+side*w/2,z,.09,d,.1,palette.stone,h+.07);
}
for(const dx of [-w/2,w/2])for(const dz of [-d/2,d/2])box(x+dx,z+dz,.14,.14,.11,palette.stone,h+.17);
}
castle();
castleAnnex(.9,-3.9,.8,.8,.7);
castleAnnex(4.02,-4.15,.65,.7,.65);
castleAnnex(2.55,-4.98,1.3,.55,.6);
// A low, chamfered enclosure keeps the buildings visible above the walls.
function wallSegment(a,b){
const length=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=-Math.atan2(b[1]-a[1],b[0]-a[0]);
const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
box(x,z,length,.171,.42,palette.stoneSide).rotation.y=angle;
box(x,z,length+.035,.2185,.075,palette.stone,.42).rotation.y=angle;
}
const enclosure=[[2.98,-1.35],[.75,-1.35],[.15,-1.95],[.15,-4.95],[.6,-5.48],[4.12,-5.48],[4.55,-4.98],[4.55,-1.95],[4.05,-1.35],[3.88,-1.35]];
for(let i=1;i<enclosure.length;i++)wallSegment(enclosure[i-1],enclosure[i]);
// The smaller gate is part of the south wall; the opening follows the path.
for(const x of [2.98,3.88]){
box(x,-1.35,.42,.44,.79,palette.stone);
box(x,-1.35,.47,.49,.065,palette.stone,.79);
for(const dx of [-.155,.155])for(const dz of [-.165,.165])box(x+dx,-1.35+dz,.13,.13,.1,palette.stone,.855);
}
box(3.43,-1.35,.51,.3,.1,palette.stone,.77);
campfire(-1.75,0);box(-.7,-.45,.26,.27,.25,palette.trunk);box(-.35,-.43,.2,.23,.2,palette.trunk);
const props=[[-6,-4.6,.8,1],[-5.5,-3.8,.75,1],[-4.9,-4.4,1,1],[-2.6,-4.4,.9,1],[-1.4,-4.8,.7,1],[-.7,-3.8,1.15,1],[.7,-4.9,.65,1],[1.3,-2.5,.8,1],[6.1,-4.8,.8,1],[-6.4,-2.1,.75,1],[-5.4,-2.7,.5,1],[-2.7,-2.6,.6,1],[6.6,-1,.7,0],[6.5,2.1,.8,0],[4.4,4.8,.55,0],[-6.3,4.6,.75,0],[1.4,4.7,.5,0]];for(const [x,z,s,snow] of props)rock(x,z,s,!!snow);
const trees=[[-6.3,-.7,.9],[-5.5,-.2,.85],[-6.1,.7,1],[-5.4,1.4,.75],[-6.5,2,.8],[-4.7,2,1],[-3.5,1.4,.75],[-3,-.5,.85],[-2.8,-1.2,.72],[-6.2,3,.7],[-1.7,2.5,.65],[.8,2,.65],[1.9,2.7,.75],[2.5,4.5,.8],[6.4,4.5,.75],[-5.4,4.8,.65]];trees.forEach(([x,z,s],i)=>i%4===0?leafy(x,z,s):pine(x,z,s));pine(-4.3,-4.5,.72,true);pine(-1.7,-3.5,.73,true);pine(.4,-2.8,.75,true);
// Genuine scene meshes share the map's lighting, depth and ground contact.
const pawn=createFigure('player');
const companionPawns={'산제이':createFigure('sanjay'),'샤르만':createFigure('sharman')};
const banditPawn=createFigure('bandit'),poetPawn=createFigure('poet');
const characterLayer=document.getElementById('character-layer');
const characterPieces=[
  {id:'player',name:'플레이어',anchor:pawn},
  {id:'sanjay',name:'산제이',anchor:companionPawns['산제이']},
  {id:'sharman',name:'샤르만',anchor:companionPawns['샤르만']},
  {id:'bandit',name:'도적',anchor:banditPawn},
  {id:'poet',name:'모닥불 곁의 남자',anchor:poetPawn}
];
for(const piece of characterPieces){
  piece.bounds=new THREE.Box3().setFromObject(piece.anchor);
  piece.anchor.rotation.y=.3;scene.add(piece.anchor);
  const element=document.createElement('span');
  element.dataset.character=piece.id;element.setAttribute('role','img');element.setAttribute('aria-label',piece.name);
  element.hidden=piece.id!=='player';piece.anchor.visible=!element.hidden;
  characterLayer.appendChild(element);piece.element=element;
}
const rings={},buttons={};let current='start',moving=false,travel=null;
// Borderless raised pads use one gray palette and shaded sides.
const platformHeightScale=.8,platformTop=.18*platformHeightScale,groundFoot=.026;
for(const [id,p] of Object.entries(places)){
const group=new THREE.Group();group.position.set(p.x,0,p.z);scene.add(group);rings[id]=group;
const side=new THREE.MeshStandardMaterial({color:'#737873',roughness:.4,metalness:0});
const surface=new THREE.MeshPhysicalMaterial({color:'#949894',roughness:.32,metalness:0,clearcoat:.3,clearcoatRoughness:.25});
const pad=new THREE.Mesh(new THREE.CylinderGeometry(.333,.348,.158825,48),[side,surface,side]);
pad.position.y=.0944125;pad.renderOrder=-5;pad.receiveShadow=true;group.add(pad);
group.userData.surface=surface;group.userData.side=side;
const b=document.createElement('button');b.type='button';b.className='node';b.dataset.id=id;const label=document.createElement('span');label.textContent=p.name;b.appendChild(label);b.onclick=()=>move(id);markers.appendChild(b);buttons[id]=b;
}
pawn.position.set(places.start.x,platformTop,places.start.z);
const passageSegmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('ko',{granularity:'sentence'}):null;
function formatPassage(passage){
const formatted=passage.split(/\r?\n/).map(line=>passageSegmenter
?Array.from(passageSegmenter.segment(line),item=>item.segment.trim()).filter(Boolean).join('\n')
:line.replace(/([.!?。！？][”’"'」』)]*)[ \t]+/g,'$1\n')).join('\n');
return formatted
.replaceAll('“성으로 가나?\n나도 그쪽인데.”','“성으로 가나? 나도 그쪽인데.”')
.replaceAll('“뛰지 마.\n내 뒤로 와.”','“뛰지 마. 내 뒤로 와.”');
}
function showPassage(){
const view=story.view,state=story.state;
document.getElementById('desc').textContent=formatPassage(view.text);
document.getElementById('name-form').hidden=!view.input;
const status=document.getElementById('journey-status');
status.classList.toggle('success',state.delivered);
status.textContent=!state.started?'':state.delivered?'서신 전달 완료 · 임무 성공':state.ended?'여정 종료 · 서신을 전달하지 못했다':`목표 · 정복왕에게 보낼 서신 전달\n소지품 · 봉인된 서신, 은화 몇 푼${state.food?', 마른 빵':''}`;
const party=document.getElementById('party');party.replaceChildren();
if(state.started){
const player=document.createElement('span');player.textContent=state.name;party.appendChild(player);
for(const name of state.allies){const tag=document.createElement('span');tag.className=name==='산제이'?'sanjay':'sharman';tag.textContent=name+(name==='샤르만'&&state.injured?' · 팔 부상':'');party.appendChild(tag);}
}
}
function showEnding(){
const overlay=document.getElementById('ending-overlay');
const visible=story.view.id==='ending'&&story.state.delivered;
const opening=visible&&overlay.hidden;
overlay.hidden=!visible;
if(opening){
document.getElementById('ending-title').textContent=endingMessage.title;
document.getElementById('ending-anniversary').textContent=endingMessage.anniversary;
document.getElementById('ending-dedication').textContent=endingMessage.dedication;
if(matchMedia('(max-width:750px) and (orientation:portrait)').matches){
overlay.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
}
}
}
function formationOffset(name,location){
  const side=name==='산제이'?-1:1;
  if(location==='castle')return name==='산제이'?[-1.35,.8]:[1.15,.45];
  return [side*.73-.24,-side*.73+(location==='gate'?.55:-.24)];
}
function pointAlongTravel(distance){
  let remaining=Math.max(0,Math.min(travel.distance,distance)),segment=0;
  while(segment<travel.lengths.length-1&&remaining>travel.lengths[segment]){remaining-=travel.lengths[segment];segment++;}
  return new THREE.Vector3().lerpVectors(travel.points[segment],travel.points[segment+1],Math.min(1,remaining/travel.lengths[segment]));
}
function syncCharacters(){
  const state=story.state,view=story.view;
  const meeting=view.id.startsWith('meet-')?view.id.slice(5):view.id==='declined'?state.met.at(-1):null;
  for(const [name,token] of Object.entries(companionPawns)){
    token.visible=state.allies.includes(name)||(!moving&&(meeting===name||state.location==='castle'));
    const from=formationOffset(name,state.location),to=formationOffset(name,travel?.id||state.location),progress=travel?.progress||0;
    if(travel&&((current==='gate'&&travel.id==='castle')||(current==='castle'&&travel.id==='gate'))){
      // Through the narrow gate, companions follow the same path in single file.
      const target=places[travel.id],origin=places[current];
      const foot=pointAlongTravel(travel.distance*progress-(name==='산제이'?.56:1.12));foot.y=groundFoot;
      foot.lerp(new THREE.Vector3(origin.x+from[0],groundFoot,origin.z+from[1]),1-Math.min(1,progress*4));
      foot.lerp(new THREE.Vector3(target.x+to[0],groundFoot,target.z+to[1]),Math.max(0,(progress-.7)/.3));
      token.position.copy(foot);
    }else{
      token.position.set(pawn.position.x+from[0]+(to[0]-from[0])*progress,groundFoot,pawn.position.z+from[1]+(to[1]-from[1])*progress);
    }
  }
  banditPawn.visible=!moving&&state.banditMet&&!state.banditResolved&&
    ['bandit','bandit-other','bandit-help','lament','last-chance','failure'].includes(view.id);
  banditPawn.position.set(pawn.position.x+1.55,groundFoot,pawn.position.z-1.55);
  poetPawn.visible=state.visited.includes('camp');poetPawn.position.set(-1.95,groundFoot,-.65);
  characterPieces[0].element.setAttribute('aria-label',state.started?state.name:'플레이어');
  characterPieces[4].element.setAttribute('aria-label',state.poetHeard?'시인':'모닥불 곁의 남자');
}
function positionCharacters(w,h){
  const bounds=[],point=new THREE.Vector3();
  for(const piece of characterPieces){
    const {element,anchor}=piece;element.hidden=!anchor.visible;if(!anchor.visible)continue;
    anchor.updateWorldMatrix(true,false);
    const rect={left:Infinity,top:Infinity,right:-Infinity,bottom:-Infinity};
    for(const x of [piece.bounds.min.x,piece.bounds.max.x])for(const y of [piece.bounds.min.y,piece.bounds.max.y])for(const z of [piece.bounds.min.z,piece.bounds.max.z]){
      point.set(x,y,z).applyMatrix4(anchor.matrixWorld).project(camera);
      const sx=(point.x*.5+.5)*w,sy=(-point.y*.5+.5)*h;
      rect.left=Math.min(rect.left,sx-2);rect.right=Math.max(rect.right,sx+2);
      rect.top=Math.min(rect.top,sy-2);rect.bottom=Math.max(rect.bottom,sy+2);
    }
    bounds.push(rect);
  }
  return bounds;
}
function refreshScene(){
update();document.querySelector('.panel').scrollTop=0;
document.getElementById('place').focus({preventScroll:true});
}
function chooseAction(id,revision){
if(moving)return;
const value=document.getElementById('player-name').value;
if(!story.choose(id,value,revision))return;
if(story.view.id==='name')resetMap();else refreshScene();
}
function renderActions(){
const container=document.getElementById('actions'),view=story.view,fragment=document.createDocumentFragment();
for(const action of view.choices){
const button=document.createElement('button');button.type='button';button.className='action';const mark=document.createElement('span');mark.className='action-mark';mark.textContent='▸';mark.setAttribute('aria-hidden','true');const text=document.createElement('span');text.className='action-text';text.textContent=action.label;button.append(mark,text);button.dataset.action=action.id;button.disabled=moving;
if(action.id==='begin'){button.type='submit';button.setAttribute('form','name-form');}
else button.onclick=()=>chooseAction(action.id,view.revision);
fragment.appendChild(button);
}
container.replaceChildren(fragment);container.hidden=view.choices.length===0;
}
function update(){
const p=places[current],state=story.state,canMove=state.canMove&&!moving;
document.getElementById('place').textContent=story.view.title;
document.getElementById('map-help').textContent=moving?'길을 따라 이동하는 중…':canMove?'밝은 발판이나 장소명을 선택하여 이동할 수 있습니다.':state.ended?'여정이 끝났습니다. 다른 길로 다시 시작할 수 있습니다.':state.delivered?'서신 전달을 마쳤습니다. 원한다면 성에 잠시 머물 수도 있을 것 같습니다.':story.view.input?'이름을 정하고 여정을 시작해 주세요.':'이야기를 읽고 행동을 선택해 주세요.';
showPassage();renderActions();showEnding();
for(const route of routes){
const visible=canMove&&((route.from===current&&p.links.includes(route.to))||(route.to===current&&p.links.includes(route.from)));
route.segments.forEach(segment=>{segment.visible=visible;});
}
for(const [id,b] of Object.entries(buttons)){
const here=id===current,next=canMove&&p.links.includes(id);
b.className='node'+(here?' here':next?' next':'');b.disabled=here||!next;
b.setAttribute('aria-label',places[id].name+(here?' 현재 위치':next?' 이동 가능':' 이동 불가'));
const faceColor=rings[id].userData.surface.color;
faceColor.set(here?'#505654':next?'#f0f1ee':'#949894');
rings[id].userData.side.color.copy(faceColor).multiplyScalar(.72);
const size=here?1.1:1;rings[id].scale.set(size,platformHeightScale,size);
}
syncCharacters();positionMarkers();renderer.render(scene,camera);
}
function move(id){if(moving||!places[current].links.includes(id))return;if(!story.requestMove(id)){refreshScene();return;}moving=true;const points=routePoints(current,id).map(p=>new THREE.Vector3(p.x,platformTop,p.z));const lengths=points.slice(1).map((p,i)=>p.distanceTo(points[i]));travel={points,lengths,distance:lengths.reduce((sum,n)=>sum+n,0),id,t:performance.now()};update();requestAnimationFrame(animate);}
const v=new THREE.Vector3();
function overlap(a,b){return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));}
function projectedSilhouette(object,w,h){
  const positions=object.geometry.attributes.position,points=[];
  for(let i=0;i<positions.count;i++){
    v.fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld).project(camera);
    points.push({x:(v.x*.5+.5)*w,y:(-v.y*.5+.5)*h});
  }
  points.sort((a,b)=>a.x-b.x||a.y-b.y);
  const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  const half=points=>{const hull=[];for(const p of points){while(hull.length>1&&cross(hull[hull.length-2],hull[hull.length-1],p)<=0)hull.pop();hull.push(p);}return hull;};
  const lower=half(points),upper=half([...points].reverse());lower.pop();upper.pop();const hull=lower.concat(upper);
  hull.bounds={left:Math.min(...hull.map(p=>p.x)),right:Math.max(...hull.map(p=>p.x)),top:Math.min(...hull.map(p=>p.y)),bottom:Math.max(...hull.map(p=>p.y))};return hull;
}
function silhouetteOverlap(rect,polygon){
  // Clip the object's projected silhouette to the label, leaving a small clearance.
  const bounds={left:rect.left-1,top:rect.top-1,right:rect.right+1,bottom:rect.bottom+1};
  if(!overlap(bounds,polygon.bounds))return 0;
  let clipped=polygon;
  for(const [axis,bound,sign] of [['x',bounds.left,1],['x',bounds.right,-1],['y',bounds.top,1],['y',bounds.bottom,-1]]){
    const input=clipped;clipped=[];if(!input.length)return 0;
    let previous=input[input.length-1],previousInside=(previous[axis]-bound)*sign>=0;
    for(const point of input){
      const inside=(point[axis]-bound)*sign>=0;
      if(inside!==previousInside){const t=(bound-previous[axis])/(point[axis]-previous[axis]);clipped.push({x:previous.x+(point.x-previous.x)*t,y:previous.y+(point.y-previous.y)*t});}
      if(inside)clipped.push(point);previous=point;previousInside=inside;
    }
  }
  return Math.abs(clipped.reduce((sum,p,i)=>{const q=clipped[(i+1)%clipped.length];return sum+p.x*q.y-q.x*p.y;},0))/2;
}
function positionDirectionLabels(w,h,objects,ui){
  const frame={left:8,top:8,right:w-8,bottom:h-8},placed=[];
  const labels=[['.north',[-7,5.7],[-7,-5.7],-1,.84],['.south',[-7,5.7],[7,5.7],1,.84]];
  const project=(x,z)=>{v.set(x,0,z).project(camera);return {x:(v.x*.5+.5)*w,y:(-v.y*.5+.5)*h};};
  for(const [selector,start,end,outward,preferred] of labels){
    const label=document.querySelector(selector),lw=label.offsetWidth,lh=label.offsetHeight;
    const a=project(...start),b=project(...end),dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
    const tx=dx/length,ty=dy/length,nx=-ty*outward,ny=tx*outward;
    const angle=Math.atan2(dy,dx),clearance=16+lh/2;
    const halfW=(Math.abs(tx)*lw+Math.abs(ty)*lh)/2,halfH=(Math.abs(ty)*lw+Math.abs(tx)*lh)/2;
    const endMargin=Math.min(.5,(lw/2+8)/length);
    let best=null,bestScore=Infinity;
    // Slide along the edge when space is tight, preserving its angle and 16px gap.
    for(const candidate of [preferred,...Array.from({length:21},(_,i)=>i/20)]){
      const t=Math.max(endMargin,Math.min(1-endMargin,candidate));
      const cx=a.x+dx*t+nx*clearance,cy=a.y+dy*t+ny*clearance;
      const r={left:cx-halfW,top:cy-halfH,right:cx+halfW,bottom:cy+halfH};
      const score=(4*halfW*halfH-overlap(r,frame))*1000+ui.reduce((sum,o)=>sum+overlap(r,o),0)*100+objects.reduce((sum,o)=>sum+silhouetteOverlap(r,o),0)*20+placed.reduce((sum,o)=>sum+overlap(r,o),0)*100+Math.abs(t-preferred)*100;
      if(score<bestScore){bestScore=score;best={cx,cy,rect:r};}
    }
    label.style.left=best.cx+'px';label.style.top=best.cy+'px';
    label.style.transform=`translate(-50%,-50%) rotate(${angle}rad)`;
    placed.push(best.rect);
  }
  return placed;
}
function positionMarkers(){
  const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  camera.updateMatrixWorld();
  scene.updateMatrixWorld(true);
  const centers={},pads={};
  for(const [id,p] of Object.entries(places)){
    v.set(p.x,.175*platformHeightScale,p.z).project(camera);
    const x=(v.x*.5+.5)*w,y=(-v.y*.5+.5)*h;centers[id]={x,y};
    buttons[id].style.left=x+'px';buttons[id].style.top=y+'px';pads[id]=projectedSilhouette(rings[id].children[0],w,h).bounds;
  }
  const objects=labelObjects.map(object=>projectedSilhouette(object,w,h));
  const pieceBounds=positionCharacters(w,h);
  const blockers=[...Object.values(pads),...pieceBounds],mapBounds=map.getBoundingClientRect(),ui=[];
  for(const element of document.querySelectorAll('header,.map-toolbar,.panel')){
    const r=element.getBoundingClientRect();if(!r.width||!r.height)continue;
    ui.push({left:r.left-mapBounds.left-3,right:r.right-mapBounds.left+3,top:r.top-mapBounds.top-3,bottom:r.bottom-mapBounds.top+3});
  }
  blockers.push(...ui,...positionDirectionLabels(w,h,objects,[...ui,...pieceBounds]));
  const placed=[],frame={left:5,top:5,right:w-5,bottom:h-5};
  for(const id of [current,...places[current].links]){
    const label=buttons[id].firstElementChild,lw=label.offsetWidth,lh=label.offsetHeight,c=centers[id],pad=pads[id];
    let best=null,bestScore=Infinity;
    // Try nearby sides first, then allow a small extra gap if scenery blocks them.
    for(const gap of [2,5,8,12]){
      const candidates=[
        [c.x-lw/2,pad.bottom+gap], [pad.right+gap,c.y-lh/2],
        [pad.left-gap-lw,c.y-lh/2], [c.x-lw/2,pad.top-gap-lh],
        [pad.right+gap,pad.bottom+gap], [pad.left-gap-lw,pad.bottom+gap],
        [pad.right+gap,pad.top-gap-lh], [pad.left-gap-lw,pad.top-gap-lh]
      ];
      candidates.forEach(([left,top],index)=>{
        const r={left,top,right:left+lw,bottom:top+lh};
        const clipped=lw*lh-overlap(r,frame);
        const score=clipped*1000+objects.reduce((sum,o)=>sum+silhouetteOverlap(r,o),0)*20+blockers.reduce((sum,o)=>sum+overlap(r,o),0)*50+placed.reduce((sum,o)=>sum+overlap(r,o),0)*100+gap+index*.15;
        if(score<bestScore){bestScore=score;best=r;}
      });
    }
    label.style.transform='none';label.style.left=(22+best.left-c.x)+'px';label.style.top=(22+best.top-c.y)+'px';
    placed.push({left:best.left-2,top:best.top-2,right:best.right+2,bottom:best.bottom+2});
  }
}
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);const aspect=w/h,compact=matchMedia('(max-width:750px) and (orientation:portrait)').matches;const viewW=compact?15.5:21,viewH=13.2,offsetX=compact?-.4:0;camera.zoom=compact?1.1:1.155;const halfH=Math.max(viewH/2,viewW/(2*aspect));camera.left=-halfH*aspect+offsetX;camera.right=halfH*aspect+offsetX;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();camera.updateMatrixWorld();positionMarkers();renderer.render(scene,camera);}
function animate(now){if(travel){const t=Math.min(1,(now-travel.t)/520),s=t*t*(3-2*t);travel.progress=s;pawn.position.copy(pointAlongTravel(travel.distance*s));
const distance=travel.distance,fromLift=Math.max(0,1-distance*s/.48),toLift=Math.max(0,1-distance*(1-s)/.48);
pawn.position.y=groundFoot+(platformTop-groundFoot)*Math.max(fromLift,toLift);
if(t>=1){current=travel.id;travel=null;moving=false;story.arrive(current);refreshScene();}}syncCharacters();positionCharacters(host.clientWidth,host.clientHeight);renderer.render(scene,camera);if(travel)requestAnimationFrame(animate);}
function resetMap(){travel=null;moving=false;current='start';pawn.position.set(places.start.x,platformTop,places.start.z);document.getElementById('player-name').value='';refreshScene();document.getElementById('player-name').focus({preventScroll:true});}
document.getElementById('name-form').onsubmit=event=>{event.preventDefault();if(story.view.input)chooseAction('begin',story.view.revision);};
document.getElementById('reset').onclick=()=>{story.reset();resetMap();};new ResizeObserver(resize).observe(host);new ResizeObserver(positionMarkers).observe(document.querySelector('.panel'));update();resize();document.fonts.ready.then(positionMarkers);document.fonts.addEventListener('loadingdone',positionMarkers);document.getElementById('loading').remove();
