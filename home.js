(function(){
  "use strict";
  var doc=document, body=doc.body;
  body.classList.remove("js-off");

  /* ---- Nav: scrolled state + mobile menu ---- */
  var nav=doc.getElementById("nav");
  var toggle=doc.querySelector(".nav-toggle");
  var wasScrolled=null;
  function onScroll(){ var s=window.scrollY>20; if(nav && s!==wasScrolled){ nav.classList.toggle("scrolled",s); wasScrolled=s; } }
  var navTick=false; window.addEventListener("scroll",function(){ if(!navTick){ navTick=true; requestAnimationFrame(function(){ navTick=false; onScroll(); }); } },{passive:true}); onScroll();
  if(toggle){
    toggle.addEventListener("click",function(){
      var open=nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded",open?"true":"false");
    });
    doc.querySelectorAll(".nav-links a").forEach(function(a){
      a.addEventListener("click",function(){nav.classList.remove("open");toggle.setAttribute("aria-expanded","false");});
    });
  }

  /* ---- Reveal on scroll ---- */
  var io=("IntersectionObserver" in window)?new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} });
  },{threshold:0,rootMargin:"0px 0px -6% 0px"}):null;
  function revealOnScreen(scope){
    var vh=window.innerHeight||doc.documentElement.clientHeight;
    (scope||doc).querySelectorAll(".reveal:not(.in)").forEach(function(el){
      var r=el.getBoundingClientRect(); if(r.top<vh && r.bottom>0) el.classList.add("in");
    });
  }
  function observeReveals(scope){
    revealOnScreen(scope);
    (scope||doc).querySelectorAll(".reveal:not(.in)").forEach(function(el){
      if(io) io.observe(el); else el.classList.add("in");
    });
  }

  /* ---- Cursor spotlight on cards ---- */
  var spotEv=null, spotRaf=0;
  doc.addEventListener("pointermove",function(e){
    if(e.pointerType==="touch") return;
    spotEv=e;
    if(spotRaf) return;
    spotRaf=requestAnimationFrame(function(){
      spotRaf=0;
      var card=spotEv.target.closest && spotEv.target.closest(".spot");
      if(!card) return;
      var r=card.getBoundingClientRect();
      card.style.setProperty("--x",(spotEv.clientX-r.left)+"px");
      card.style.setProperty("--y",(spotEv.clientY-r.top)+"px");
    });
  },{passive:true});

  /* ---- Pause looping animations while off-screen ---- */
  if("IntersectionObserver" in window){
    var pio=new IntersectionObserver(function(entries){
      entries.forEach(function(e){ e.target.classList.toggle("offscreen",!e.isIntersecting); });
    });
    doc.querySelectorAll(".orbit,.marquee,.nodes,.cta-band,.visual,.map-card,.bar-track").forEach(function(el){pio.observe(el);});
  }

  /* ---- Smooth in-page scroll buttons (services sub-nav) ---- */
  doc.addEventListener("click",function(e){
    var b=e.target.closest && e.target.closest("[data-scroll]");
    if(!b) return;
    var t=doc.getElementById(b.getAttribute("data-scroll"));
    if(t){ e.preventDefault(); if(window.__svScrollTo) window.__svScrollTo(t.getBoundingClientRect().top+window.scrollY-150); else t.scrollIntoView({behavior:"smooth",block:"start"}); }
  });

  /* ---- Careers filter ---- */
  doc.querySelectorAll(".filters").forEach(function(group){
    group.addEventListener("click",function(e){
      var f=e.target.closest(".filter"); if(!f) return;
      group.querySelectorAll(".filter").forEach(function(x){x.classList.toggle("on",x===f);x.setAttribute("aria-pressed",x===f?"true":"false");});
      var cat=f.getAttribute("data-cat");
      doc.querySelectorAll(".role").forEach(function(r){
        r.classList.toggle("hide", cat!=="all" && r.getAttribute("data-cat")!==cat);
      });
    });
  });

  /* ---- Contact form -> opens email / WhatsApp with the enquiry ---- */
  doc.querySelectorAll("form[data-contact]").forEach(function(form){
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var ok=true;
      form.querySelectorAll("[required]").forEach(function(inp){
        var bad=!inp.value.trim() || (inp.type==="email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value));
        inp.closest(".field").classList.toggle("err",bad); if(bad) ok=false;
      });
      if(!ok){ var first=form.querySelector(".field.err input,.field.err textarea"); if(first) first.focus(); return; }
      var fd=new FormData(form);
      var lines=[
        "Name: "+(fd.get("name")||""),
        "Email: "+(fd.get("email")||""),
        "Phone: "+(fd.get("phone")||""),
        "Company: "+(fd.get("company")||""),
        "Service: "+(fd.get("service")||""),
        "Budget: "+(fd.get("budget")||""),
        "",
        (fd.get("message")||"")
      ];
      var subject="New project enquiry — "+(fd.get("name")||"Website");
      var via=e.submitter && e.submitter.getAttribute("data-via");
      if(via==="wa"){
        window.open("https://wa.me/"+form.getAttribute("data-wa")+"?text="+encodeURIComponent(subject+"\n\n"+lines.join("\n")),"_blank","noopener");
      }else{
        window.location.href="mailto:"+form.getAttribute("data-email")+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(lines.join("\n"));
      }
      form.closest(".form-card").classList.add("sent");
    });
    form.querySelectorAll("input,textarea").forEach(function(inp){
      inp.addEventListener("input",function(){var f=inp.closest(".field"); if(f) f.classList.remove("err");});
    });
  });
  doc.querySelectorAll("[data-reset-form]").forEach(function(b){
    b.addEventListener("click",function(){var c=b.closest(".form-card");c.classList.remove("sent");c.querySelector("form").reset();});
  });

  /* ---- Year ---- */
  doc.querySelectorAll("[data-year]").forEach(function(el){el.textContent=new Date().getFullYear();});


  /* =================== Cinematic scroll story (home) =================== */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Split headings into words for a masked reveal */
  function splitWords(el){
    var idx=0, nodes=[].slice.call(el.childNodes);
    el.textContent="";
    nodes.forEach(function(n){
      if(n.nodeType===3){
        n.textContent.split(/(\s+)/).forEach(function(part){
          if(!part) return;
          if(/^\s+$/.test(part)){ el.appendChild(doc.createTextNode(" ")); return; }
          var w=doc.createElement("span"); w.className="w";
          var inner=doc.createElement("span"); inner.textContent=part; inner.style.setProperty("--wi",idx++);
          w.appendChild(inner); el.appendChild(w);
        });
      }else if(n.nodeType===1 && n.tagName!=="BR"){
        n.textContent.split(/(\s+)/).forEach(function(part){
          if(!part) return;
          if(/^\s+$/.test(part)){ el.appendChild(doc.createTextNode(" ")); return; }
          var w=doc.createElement("span"); w.className="w";
          var inner=n.cloneNode(false); inner.textContent=part; inner.style.setProperty("--wi",idx++);
          w.appendChild(inner); el.appendChild(w);
        });
      }else{ el.appendChild(n); }
    });
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g," ").trim());
  }
  var splits=doc.querySelectorAll("[data-split]");
  splits.forEach(splitWords);
  var sio=("IntersectionObserver" in window)?new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("split-in"); sio.unobserve(e.target);} });
  },{threshold:.25}):null;
  var nowSplits=[];
  splits.forEach(function(el){
    if(el.hasAttribute("data-split-now") || !sio){ el.style.setProperty("--wd",".15s"); nowSplits.push(el); }
    else sio.observe(el);
  });

  /* 2. Hero entrance */
  var hero=doc.querySelector(".hero");
  function startHero(){
    setTimeout(function(){ if(hero) hero.classList.add("hero-in"); nowSplits.forEach(function(el){ el.classList.add("split-in"); }); },300);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      if(hero) hero.classList.add("hero-in");
      nowSplits.forEach(function(el){ el.classList.add("split-in"); });
    }); });
  }

  startHero();

  /* 3. Count-up numbers */
  var cio=("IntersectionObserver" in window)?new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return; cio.unobserve(e.target);
      var el=e.target, end=+el.getAttribute("data-count"), t0=null, dur=reduce?1:1600;
      function tick(t){ if(!t0) t0=t; var k=Math.min(1,(t-t0)/dur); k=1-Math.pow(1-k,4); el.textContent=Math.round(end*k); if(k<1) requestAnimationFrame(tick); }
      requestAnimationFrame(tick);
    });
  },{threshold:.6}):null;
  doc.querySelectorAll("[data-count]").forEach(function(el){ if(cio) cio.observe(el); else el.textContent=el.getAttribute("data-count"); });

  /* 4. Scroll-linked motion — one rAF loop, transforms only */
  var bar=doc.querySelector(".scroll-progress span");
  var hint=doc.querySelector(".scroll-hint");
  var parallax=[].slice.call(doc.querySelectorAll("[data-parallax]"));
  var hlines=[].slice.call(doc.querySelectorAll("[data-hscroll]"));
  var stackCards=[].slice.call(doc.querySelectorAll(".stack-card"));
  var procs=[].slice.call(doc.querySelectorAll("[data-process]"));
  var scrubs=[].slice.call(doc.querySelectorAll("[data-scrub]"));
  var hasScroll = bar||hint||parallax.length||hlines.length||stackCards.length||procs.length||scrubs.length;
  var ticking=false;
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  var docH=0; function measure(){ docH=doc.documentElement.scrollHeight; }
  function frame(){
    ticking=false;
    var vh=window.innerHeight, y=window.scrollY||window.pageYOffset, i;
    if(!docH) measure();
    /* ---- read phase (no style writes before this point) ---- */
    var hR=hlines.map(function(el){return el.getBoundingClientRect();});
    var sR=stackCards.map(function(el){return el.getBoundingClientRect();});
    var pR=procs.map(function(el){return el.getBoundingClientRect();});
    var cR=scrubs.map(function(el){return el.getBoundingClientRect();});
    /* ---- write phase ---- */
    if(bar){ var max=docH-vh; bar.style.transform="scaleX("+(max>0?clamp(y/max,0,1):0).toFixed(4)+")"; }
    if(hint) hint.classList.toggle("gone", y>40);
    if(reduce) return;
    parallax.forEach(function(el){ el.style.transform="translate3d(0,"+(y*parseFloat(el.getAttribute("data-parallax"))).toFixed(1)+"px,0)"; });
    hlines.forEach(function(el,j){ var r=hR[j]; if(!r.height) return; var p=(vh-r.top)/(vh+r.height); var dir=parseFloat(el.getAttribute("data-hscroll")); el.style.transform="translate3d("+(dir<0?-p*35:-35+p*35).toFixed(2)+"%,0,0)"; });
    for(i=0;i<stackCards.length;i++){ var c=stackCards[i]; if(!sR[i+1]){ c.style.transform=""; c.style.setProperty("--dim",0); continue; } var k=clamp((sR[i].bottom-sR[i+1].top)/(sR[i].height||1),0,1); c.style.transform="scale("+(1-k*0.06).toFixed(4)+")"; c.style.setProperty("--dim",(k*0.55).toFixed(3)); }
    procs.forEach(function(el,j){ var r=pR[j]; if(!r.height) return; var p=clamp((vh*0.85-r.top)/(vh*0.5),0,1); el.style.setProperty("--p",p.toFixed(3)); var steps=el.querySelectorAll(".step"); steps.forEach(function(s2,n){ var on=p>=n/(steps.length-1)-0.02; if(s2.classList.contains("lit")!==on) s2.classList.toggle("lit",on); }); });
    scrubs.forEach(function(el,j){ var r=cR[j]; if(!r.height) return; var p=clamp((vh-r.top)/(vh*0.7),0,1); el.style.setProperty("--s",(0.95+p*0.05).toFixed(4)); });
  }
  function requestFrame(){ if(!ticking){ ticking=true; requestAnimationFrame(frame); } }
  if(hasScroll){
    window.addEventListener("scroll",requestFrame,{passive:true});
    window.addEventListener("resize",function(){ measure(); requestFrame(); },{passive:true});
    window.addEventListener("load",measure);
    window.addEventListener("hashchange",function(){ setTimeout(requestFrame,50); });
    frame();
  }


  /* =================== Premium interaction layer =================== */
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;


  /* Smooth wheel scrolling — notched mouse wheels only (touchpads keep native), time-based, snappy */
  if(finePointer && !reduce){
    var root=doc.documentElement, sTarget=0, sCur=0, sRun=false, sLast=0;
    function sMax(){ return root.scrollHeight - window.innerHeight; }
    function sLoop(now){
      var dt=Math.min(64, now - (sLast||now)); sLast=now;
      var k=1-Math.pow(1-0.2, dt/16.667);          // ~90% of the way in ~170ms
      sCur += (sTarget - sCur) * k;
      if(Math.abs(sTarget - sCur) < 0.6){ sCur=sTarget; sRun=false; }
      window.scrollTo(0, sCur);
      if(sRun) requestAnimationFrame(sLoop); else sLast=0;
    }
    window.addEventListener("wheel",function(e){
      if(e.ctrlKey || e.shiftKey || e.deltaX) return;
      var notched = e.deltaMode===1 || (Math.abs(e.deltaY)>=50 && Math.abs(e.deltaY)%1===0);
      if(!notched) return;                          // trackpad / precision scroll: leave native
      for(var el=(e.target && e.target.nodeType===1)?e.target:null; el && el!==doc.body; el=el.parentElement){
        var ov=getComputedStyle(el).overflowY; if((ov==="auto"||ov==="scroll") && el.scrollHeight>el.clientHeight) return;
      }
      e.preventDefault();
      if(!sRun){ sTarget=sCur=window.scrollY; }
      var d = e.deltaMode===1 ? e.deltaY*40 : e.deltaY;
      sTarget = Math.max(0, Math.min(sMax(), sTarget + d));
      if(!sRun){ sRun=true; requestAnimationFrame(sLoop); }
    },{passive:false});
    // keyboard / scrollbar / links move the page natively: stop gliding so we never fight them
    ["keydown","mousedown","touchstart"].forEach(function(t){ window.addEventListener(t,function(){ sRun=false; },{passive:true}); });
    root.classList.add("smooth");
  }

  if(finePointer && !reduce){
    /* Magnetic buttons */
    doc.querySelectorAll(".btn-primary,.nav-cta,.btn-wa,.btn-ghost").forEach(function(b){
      b.classList.add("magnetic");
      b.addEventListener("pointermove",function(e){ var r=b.getBoundingClientRect(); var x=e.clientX-r.left-r.width/2, y=e.clientY-r.top-r.height/2; b.classList.add("is-mag"); b.style.transform="translate3d("+(x*0.22).toFixed(1)+"px,"+(y*0.32).toFixed(1)+"px,0)"; });
      b.addEventListener("pointerleave",function(){ b.classList.remove("is-mag"); b.style.transform=""; });
    });

    /* 3D tilt + glare on cards */
    doc.querySelectorAll(".card.lift,.work-card,.stack-card,.plan").forEach(function(c){
      var g=doc.createElement("span"); g.className="glare"; c.appendChild(g);
      c.addEventListener("pointermove",function(e){ if(c.classList.contains("reveal") && !c.classList.contains("in")) return; c.classList.add("tilt"); var r=c.getBoundingClientRect(); var px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
        c.classList.add("is-tilt");
        c.style.transform="perspective(900px) rotateX("+((0.5-py)*7).toFixed(2)+"deg) rotateY("+((px-0.5)*9).toFixed(2)+"deg) translate3d(0,-6px,0)";
        c.style.setProperty("--gx",(px*100).toFixed(0)+"%"); c.style.setProperty("--gy",(py*100).toFixed(0)+"%"); });
      c.addEventListener("pointerleave",function(){ c.classList.remove("is-tilt"); c.style.transform=""; });
    });
  }

  /* ---- Single-file mode: hash router ---- */
  if(body.classList.contains("spa")){
    var pages=doc.querySelectorAll(".page");
    var titles={home:"Senveora — Technology that moves your tomorrow",about:"About — Senveora",services:"Services — Senveora",work:"Our Work — Senveora",contact:"Contact — Senveora"};
    function route(){
      var name=(location.hash.replace(/^#\/?/,"")||"home").split("/")[0];
      if(!doc.querySelector('.page[data-page="'+name+'"]')) name="home";
      pages.forEach(function(p){p.classList.toggle("is-current",p.getAttribute("data-page")===name);});
      doc.querySelectorAll(".nav-links a[data-nav]").forEach(function(a){a.classList.toggle("is-active",a.getAttribute("data-nav")===name);});
      doc.title=titles[name]||titles.home;
      try{ window.scrollTo({top:0,left:0,behavior:"instant"}); }catch(_){ window.scrollTo(0,0); }
      observeReveals(doc.querySelector('.page[data-page="'+name+'"]'));
    }
    window.addEventListener("hashchange",route);
    route();
  }else{
    observeReveals();
  }
})();

