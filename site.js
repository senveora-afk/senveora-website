(function(){
  "use strict";
  var doc=document, body=doc.body;
  body.classList.remove("js-off");

  /* ---- Mobile menu ---- */
  var nav=doc.getElementById("nav");
  var toggle=doc.querySelector(".nav-toggle");
  if(nav && toggle){
    toggle.addEventListener("click",function(){
      var open=nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded",open?"true":"false");
    });
    doc.querySelectorAll(".nav-links a").forEach(function(a){
      a.addEventListener("click",function(){nav.classList.remove("open");toggle.setAttribute("aria-expanded","false");});
    });
  }

  /* ---- Reveal on scroll (anything already on screen shows at once) ---- */
  /* Anything at or above the bottom of the viewport is shown, so fast scrolls
     and anchor jumps never leave content hidden. */
  var pending=[].slice.call(doc.querySelectorAll(".reveal")), revTick=false;
  function reveal(){
    revTick=false;
    var edge=(window.innerHeight||doc.documentElement.clientHeight)*0.94;
    pending=pending.filter(function(el){
      if(el.getBoundingClientRect().top<edge){ el.classList.add("in"); return false; }
      return true;
    });
    if(!pending.length) window.removeEventListener("scroll",onRevealScroll);
  }
  function onRevealScroll(){ if(!revTick){ revTick=true; requestAnimationFrame(reveal); } }
  window.addEventListener("scroll",onRevealScroll,{passive:true});
  window.addEventListener("resize",onRevealScroll,{passive:true});
  reveal();

  /* ---- Pause looping animations while off-screen ---- */
  if("IntersectionObserver" in window){
    var pio=new IntersectionObserver(function(entries){
      entries.forEach(function(e){ e.target.classList.toggle("offscreen",!e.isIntersecting); });
    });
    doc.querySelectorAll(".nodes,.visual,.map-card,.ledger-meter").forEach(function(el){pio.observe(el);});
  }

  /* ---- In-page scroll buttons (services sub-nav) ---- */
  doc.addEventListener("click",function(e){
    var b=e.target.closest && e.target.closest("[data-scroll]");
    if(!b) return;
    var t=doc.getElementById(b.getAttribute("data-scroll"));
    if(t){ e.preventDefault(); t.scrollIntoView({behavior:"smooth",block:"start"}); }
  });

  /* ---- Contact form: FormSubmit, falling back to email; or WhatsApp ---- */
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
      var card=form.closest(".form-card");
      var via=e.submitter && e.submitter.getAttribute("data-via");
      if(via==="wa"){
        window.open("https://wa.me/"+form.getAttribute("data-wa")+"?text="+encodeURIComponent(subject+"\n\n"+lines.join("\n")),"_blank","noopener");
        card.classList.add("sent");
        return;
      }
      var btn=e.submitter, endpoint=form.getAttribute("data-endpoint");
      var mailto="mailto:"+form.getAttribute("data-email")+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(lines.join("\n"));
      if(!endpoint || !window.fetch){ window.location.href=mailto; card.classList.add("sent"); return; }
      if(btn){ btn.disabled=true; btn.setAttribute("aria-busy","true"); }
      var payload={_subject:subject,_template:"table",_captcha:"false"};
      fd.forEach(function(v,k){ payload[k]=v; });
      fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload)})
        .then(function(r){ if(!r.ok) throw new Error(r.status); card.classList.add("sent"); })
        .catch(function(){ window.location.href=mailto; card.classList.add("sent"); })
        .then(function(){ if(btn){ btn.disabled=false; btn.removeAttribute("aria-busy"); } });
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
})();
