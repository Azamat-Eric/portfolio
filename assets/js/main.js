/* === Portfolio site runtime === */
(function(){
  var data = window.__SITE_DATA__ || { i18n:{kk:{},ru:{},en:{}}, projects:[] };

  // Detect language: localStorage > browser > 'en'
  function detectLang() {
    try {
      var saved = localStorage.getItem('site-lang');
      if (saved && data.i18n[saved]) return saved;
    } catch(e){}
    var nav = (navigator.language || 'en').slice(0,2).toLowerCase();
    if (data.i18n[nav]) return nav;
    return 'en';
  }

  var currentLang = detectLang();

  function applyLang(lang) {
    currentLang = lang;
    try { localStorage.setItem('site-lang', lang); } catch(e){}
    document.documentElement.lang = lang;

    // Plain text bindings
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      var val = (data.i18n[lang] && data.i18n[lang][key]) || '';
      el.textContent = val;
    });

    // role pill
    document.querySelectorAll('[data-i18n-role]').forEach(function(el){
      el.textContent = (data.i18n[lang] && data.i18n[lang].role) || '';
    });

    // HTML/multiline (paragraphs)
    document.querySelectorAll('[data-i18n-html]').forEach(function(el){
      var key = el.getAttribute('data-i18n-html');
      var raw = '';
      if (key === 'about') raw = (data.i18n[lang] && data.i18n[lang].about_text) || '';
      else if (key.indexOf('proj_') === 0) {
        var pid = key.replace(/^proj_/, '').replace(/_full$/, '');
        var p = data.projects.find(function(x){ return x.id === pid; });
        if (p) raw = (p.fullDesc && p.fullDesc[lang]) || '';
      }
      el.innerHTML = raw.split(/\n\n+/).map(function(par){
        return '<p>' + escape(par).replace(/\n/g, '<br>') + '</p>';
      }).join('');
    });

    // Project i18n on cards & project pages
    document.querySelectorAll('[data-i18n-proj]').forEach(function(el){
      var ref = el.getAttribute('data-i18n-proj').split('.');
      var p = data.projects.find(function(x){ return x.id === ref[0]; });
      if (!p) return;
      var bag = p[ref[1]];
      el.textContent = (bag && bag[lang]) || (bag && bag.en) || '';
    });

    // Media captions
    document.querySelectorAll('[data-i18n-media]').forEach(function(el){
      var mid = el.getAttribute('data-i18n-media');
      // find media by id across projects
      for (var i=0; i<data.projects.length; i++) {
        var m = (data.projects[i].media || []).find(function(x){ return x.id === mid; });
        if (m) {
          el.textContent = (m.title && m.title[lang]) || (m.title && m.title.en) || '';
          if (!el.textContent) el.style.display = 'none';
          else el.style.display = '';
          break;
        }
      }
    });

    // Update lang switch buttons
    document.querySelectorAll('#langSwitch button').forEach(function(b){
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  function escape(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  // Lang switcher
  var ls = document.getElementById('langSwitch');
  if (ls) ls.addEventListener('click', function(e){
    var b = e.target.closest('button[data-lang]');
    if (b) applyLang(b.dataset.lang);
  });

  // Burger menu
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function(){ nav.classList.toggle('open'); });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ nav.classList.remove('open'); });
    });
  }

  // Header scroll state
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function(){ header.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }

  // Lightbox for project gallery images
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = document.getElementById('lightbox-img');
    document.querySelectorAll('img[data-zoom]').forEach(function(img){
      img.addEventListener('click', function(){
        lbImg.src = img.src;
        lb.classList.add('open');
      });
    });
    lb.addEventListener('click', function(){ lb.classList.remove('open'); lbImg.src = ''; });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') { lb.classList.remove('open'); lbImg.src = ''; }
    });
  }

  applyLang(currentLang);
})();
