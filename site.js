(function(){
  "use strict";
  var doc=document, body=doc.body;
  body.classList.remove("js-off");

  /* ---- Nav: scrolled state + mobile menu ---- */
  var nav=doc.getElementById("nav");
  var toggle=doc.querySelector(".nav-toggle");
  var wasScrolled=null;
  function onScroll(){ var s=window.scrollY>20; if(nav && s!==wasScrolled){ nav.classList.toggle("scrolled",s); wasScrolled=s; } }
  window.addEventListener("scroll",onScroll,{passive:true}); onScroll();
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
  },{threshold:.12,rootMargin:"0px 0px -40px 0px"}):null;
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
    if(t){ e.preventDefault(); t.scrollIntoView({behavior:"smooth",block:"start"}); }
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
        var card=form.closest(".form-card"), btn=e.submitter, endpoint=form.getAttribute("data-endpoint");
        var mailto="mailto:"+form.getAttribute("data-email")+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(lines.join("\n"));
        if(!endpoint || !window.fetch){ window.location.href=mailto; card.classList.add("sent"); return; }
        if(btn){ btn.disabled=true; btn.setAttribute("aria-busy","true"); }
        var payload={_subject:subject,_template:"table",_captcha:"false"};
        fd.forEach(function(v,k){ payload[k]=v; });
        fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload)})
          .then(function(r){ if(!r.ok) throw new Error(r.status); card.classList.add("sent"); })
          .catch(function(){ window.location.href=mailto; card.classList.add("sent"); })
          .then(function(){ if(btn){ btn.disabled=false; btn.removeAttribute("aria-busy"); } });
        return;
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

