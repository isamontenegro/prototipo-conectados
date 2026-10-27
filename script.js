(function(){
var d=document,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
d.documentElement.classList.add('js');
/* topo */
var topo=d.querySelector('.topo');
function rolou(){topo.classList.toggle('rolou',scrollY>8)}rolou();addEventListener('scroll',rolou,{passive:true});
/* cubo 3D nas capas */
d.querySelectorAll('.capa .container').forEach(function(c){
  var w=d.createElement('div');w.className='cubo-cena';w.setAttribute('aria-hidden','true');
  w.innerHTML='<div class="cubo">'+['variável =','if','for','&lt;/&gt;','{ }','01'].map(function(t){return'<span>'+t+'</span>'}).join('')+'</div>';
  c.appendChild(w);
});
/* rede de pontos conectados */
d.querySelectorAll('canvas.rede').forEach(function(cv){
  var ctx=cv.getContext('2d'),host=cv.parentElement,W,H,P=[],mx=-999,my=-999,vis=true,raf;
  function size(){var r=host.getBoundingClientRect(),k=devicePixelRatio||1;W=r.width;H=r.height;cv.width=W*k;cv.height=H*k;ctx.setTransform(k,0,0,k,0,0);
    P=Array.from({length:Math.round(W*H/15000)},function(){return{x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4}})}
  function draw(){ctx.clearRect(0,0,W,H);
    for(var i=0;i<P.length;i++){var a=P[i];
      if(!reduce){a.x+=a.vx;a.y+=a.vy}if(a.x<0||a.x>W)a.vx*=-1;if(a.y<0||a.y>H)a.vy*=-1;
      ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.arc(a.x,a.y,1.7,0,6.283);ctx.fill();
      for(var j=i+1;j<P.length;j++){var b=P[j],dx=a.x-b.x,dy=a.y-b.y,q=dx*dx+dy*dy;
        if(q<14400){ctx.strokeStyle='rgba(255,70,100,'+.4*(1-q/14400)+')';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}
      var ex=a.x-mx,ey=a.y-my,m=ex*ex+ey*ey;
      if(m<27000){ctx.strokeStyle='rgba(255,255,255,'+.6*(1-m/27000)+')';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(mx,my);ctx.stroke()}}}
  function loop(){draw();if(vis&&!reduce)raf=requestAnimationFrame(loop)}
  size();loop();
  addEventListener('resize',function(){size();draw()});
  host.addEventListener('mousemove',function(e){var r=host.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top});
  host.addEventListener('mouseleave',function(){mx=my=-999});
  new IntersectionObserver(function(e){vis=e[0].isIntersecting;cancelAnimationFrame(raf);if(vis)loop()}).observe(host);
});
/* cena 3D da abertura segue o mouse */
var cena=d.querySelector('.cena-in'),ab=d.querySelector('.abertura');
if(cena&&fine&&!reduce)ab.addEventListener('mousemove',function(e){var r=ab.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  cena.style.setProperty('--ry',(-12+x*18)+'deg');cena.style.setProperty('--rx',(4-y*14)+'deg')});
/* cartões inclinam em 3D */
if(fine&&!reduce)d.querySelectorAll('.pilar,.equipe li,.quadro,.regras,.faixa-imagem').forEach(function(el){
  el.classList.add('tilt');
  el.addEventListener('mousemove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    el.style.transform='perspective(900px) rotateX('+-y*9+'deg) rotateY('+x*11+'deg) translateZ(6px)';
    el.style.setProperty('--gx',(x+.5)*100+'%');el.style.setProperty('--gy',(y+.5)*100+'%')});
  el.addEventListener('mouseleave',function(){el.style.transform=''});
});
/* revelar ao rolar */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
d.querySelectorAll('.pilares,.equipe,.duas-colunas').forEach(function(el){el.classList.add('rv-f');io.observe(el)});
d.querySelectorAll('.faixa,.bloco-grade,.intro-secao,.demo,.observacoes').forEach(function(el){el.classList.add('rv');io.observe(el)});
/* linha do passo a passo */
d.querySelectorAll('.passos').forEach(function(ol){
  var li=ol.querySelectorAll('li');
  function up(){var r=ol.getBoundingClientRect(),m=innerHeight*.6,p=Math.min(1,Math.max(0,(m-r.top)/r.height));
    ol.style.setProperty('--p',p);li.forEach(function(l){l.classList.toggle('on',l.getBoundingClientRect().top<m)})}
  up();addEventListener('scroll',up,{passive:true});addEventListener('resize',up);
});

/* números: grandes nos cartões, pílula nos rótulos */
d.querySelectorAll('.numero').forEach(function(n){if(n.textContent.trim().length>3)n.classList.add('numero-txt')});
/* contagem animada */
var cn=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;cn.unobserve(e.target);
  var el=e.target,fim=+el.dataset.n,suf=el.dataset.suf||'',t0=performance.now();
  if(reduce){el.textContent=fim+suf;return}
  (function f(t){var p=Math.min(1,(t-t0)/1400),v=Math.round(fim*(1-Math.pow(1-p,3)));el.textContent=v+suf;if(p<1)requestAnimationFrame(f)})(t0)})},{threshold:.6});
d.querySelectorAll('[data-n]').forEach(function(el){if(!reduce)el.textContent='0'+(el.dataset.suf||'');cn.observe(el)});
/* barra de progresso e luz que segue o mouse */
var bar=d.createElement('div');bar.className='progresso';d.body.appendChild(bar);
function prog(){var m=d.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(m>0?scrollY/m:0)+')'}prog();addEventListener('scroll',prog,{passive:true});
if(fine)d.querySelectorAll('.abertura,.capa').forEach(function(h){h.addEventListener('mousemove',function(e){var r=h.getBoundingClientRect();h.style.setProperty('--mx',e.clientX-r.left+'px');h.style.setProperty('--my',e.clientY-r.top+'px')})});
})();
