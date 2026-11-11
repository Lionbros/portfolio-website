/* i18n-install.js — Installation page strings (Starlink & TV).
   Same contract as i18n-software.js: deep-merge into window.I18N,
   never overwriting shared keys from i18n.js.
   Natural translations, not literal. HU uses informal te-form.
   Brand names (Starlink) are never translated. */
(function () {
  var extra = {
    en: {
      "inst.hero.kicker": "Kiskunhalas & surroundings",
      "inst.hero.titleHtml": "<span class=\"inst-hero__l1\">Starlink &amp; TV,</span><span class=\"inst-hero__l2\">installed <em>properly.</em></span>",
      "inst.hero.descHtml": "Satellite internet and television, mounted at your home. I come to you, bring the right gear and leave <em>everything working.</em>",
      "inst.hero.cardStarlink": "Fast satellite internet, aimed and tested on-site.",
      "inst.hero.cardTv": "A big, bright TV with no cables in sight.",
      "inst.hero.cardCta": "Book a slot →",
      "inst.hero.tagS1": "Starlink",
      "inst.hero.tagS2": "Roof & wall mount",
      "inst.hero.tagS3": "Full Wi-Fi setup",
      "inst.hero.tagT1": "TV mounting",
      "inst.hero.tagT2": "Hidden cables",
      "inst.hero.tagT3": "Smart TV setup",
      "inst.svc.title": "Services",
      "inst.svc.starlink.title": "Starlink installation",
      "inst.svc.starlink.desc": "Dish mounted on roof, wall or mast, cable run indoors and the router set up and tested. I aim the dish properly so you get the speed your subscription allows.",
      "inst.svc.tv.title": "TV installation",
      "inst.svc.tv.desc": "TV mounted on the wall or set up on furniture, cables hidden, channels and apps configured. You only grab the remote.",
      "inst.svc.other.title": "Something else",
      "inst.svc.other.desc": "Antenna points, extra outlets, cabling or a Wi-Fi dead zone at home — describe what you need and I will tell you whether I can help.",
      "inst.form.opt.starlink": "Starlink installation",
      "inst.form.opt.tv": "TV installation",
      "inst.form.opt.both": "Both",
      "inst.hero.altStarlink": "Starlink dish above a woodland roof",
      "inst.hero.altTv": "Mounted smart TV in a living room"
    },
    nl: {
      "inst.hero.kicker": "Kiskunhalas en omgeving",
      "inst.hero.titleHtml": "<span class=\"inst-hero__l1\">Starlink en tv,</span><span class=\"inst-hero__l2\"><em>vakkundig</em> gemonteerd.</span>",
      "inst.hero.descHtml": "Satellietinternet en televisie, gemonteerd bij je thuis. Ik kom naar je toe, breng het juiste gereedschap mee en laat <em>alles werkend achter.</em>",
      "inst.hero.cardStarlink": "Snel satellietinternet, gericht en getest op locatie.",
      "inst.hero.cardTv": "Een grote, heldere tv zonder kabels in zicht.",
      "inst.hero.cardCta": "Plan een moment →",
      "inst.hero.tagS1": "Starlink",
      "inst.hero.tagS2": "Dak- & muurmontage",
      "inst.hero.tagS3": "Wi-Fi volledig ingericht",
      "inst.hero.tagT1": "Tv-montage",
      "inst.hero.tagT2": "Weggewerkte kabels",
      "inst.hero.tagT3": "Smart-tv ingesteld",
      "inst.svc.title": "Diensten",
      "inst.svc.starlink.title": "Starlink-montage",
      "inst.svc.starlink.desc": "Schotel gemonteerd op dak, muur of mast, kabel naar binnen geleid en de router ingesteld en getest. Ik richt de schotel goed zodat je de snelheid krijgt die je abonnement toestaat.",
      "inst.svc.tv.title": "Tv-montage",
      "inst.svc.tv.desc": "Tv aan de muur gemonteerd of op het meubel ingericht, kabels weggewerkt, zenders en apps geconfigureerd. Jij hoeft alleen de afstandsbediening te pakken.",
      "inst.svc.other.title": "Iets anders",
      "inst.svc.other.desc": "Antenne-aansluitingen, extra punten, bekabeling of een wifi-dode hoek thuis — beschrijf wat je nodig hebt en ik zeg eerlijk of ik je kan helpen.",
      "inst.form.opt.starlink": "Starlink-montage",
      "inst.form.opt.tv": "Tv-montage",
      "inst.form.opt.both": "Beide",
      "inst.hero.altStarlink": "Starlink-schotel boven een bosrijke dak",
      "inst.hero.altTv": "Gemonteerde smart-tv in een woonkamer"
    },
    hu: {
      "inst.hero.kicker": "Kiskunhalas és környéke",
      "inst.hero.titleHtml": "<span class=\"inst-hero__l1\">Starlink és TV,</span><span class=\"inst-hero__l2\"><em>szakszerűen</em> felszerelve.</span>",
      "inst.hero.descHtml": "Műholdas internet és televízió, felszerelve az otthonodban. Kimegyek hozzád, elhozom a megfelelő szerszámokat, és <em>minden működve</em> hagyok.",
      "inst.hero.cardStarlink": "Gyors műholdas internet, a helyszínen beállítva és letesztelve.",
      "inst.hero.cardTv": "Nagy, fényes TV láthatatlan kábelekkel.",
      "inst.hero.cardCta": "Időpont kérése →",
      "inst.hero.tagS1": "Starlink",
      "inst.hero.tagS2": "Tető- & falmontázs",
      "inst.hero.tagS3": "Teljes wifi beállítás",
      "inst.hero.tagT1": "TV szerelés",
      "inst.hero.tagT2": "Rejtett kábelek",
      "inst.hero.tagT3": "Okostévé beállítás",
      "inst.svc.title": "Szolgáltatások",
      "inst.svc.starlink.title": "Starlink telepítés",
      "inst.svc.starlink.desc": "Az antenna tetőre, falra vagy árbocra szerelve, a kábelt befuttatom, a routert beállítom és letesztellem. Úgy irányítom az antennát, hogy megkapd az előfizetésedhez járó sebességet.",
      "inst.svc.tv.title": "TV felszerelés",
      "inst.svc.tv.desc": "A TV fali rögzítése vagy bútorra helyezése, kábelek elrejtése, adások és alkalmazások beállítása. Neked csak a távirányítót kell megfognod.",
      "inst.svc.other.title": "Valami más",
      "inst.svc.other.desc": "Antenna-csatlakozások, extra pontok, kábelezés vagy wifi-holtzóna otthon — írd le, mire van szükséged, és őszintén elmondom, tudok-e segíteni.",
      "inst.form.opt.starlink": "Starlink telepítés",
      "inst.form.opt.tv": "TV felszerelés",
      "inst.form.opt.both": "Mindkettő",
      "inst.hero.altStarlink": "Starlink antennája egy erdős tető felett",
      "inst.hero.altTv": "Falszerelt okostévé a nappaliban"
    }
  };

  window.I18N = window.I18N || { en: {}, nl: {}, hu: {} };
  ["en", "nl", "hu"].forEach(function (lang) {
    window.I18N[lang] = window.I18N[lang] || {};
    var src = extra[lang] || {};
    for (var k in src) {
      if (Object.prototype.hasOwnProperty.call(src, k)) window.I18N[lang][k] = src[k];
    }
  });
})();
