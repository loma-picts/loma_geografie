(function () {
  "use strict";

  var DEG2RAD = Math.PI / 180;
  var RAD2DEG = 180 / Math.PI;
  var TEX_W = 720;
  var TEX_H = 360;

  var ICONS = {
    sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/></svg>',
    moon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>',
    calendar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3.5 9.5h17"/></svg>',
    pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11.2a6.5 6.5 0 1 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/></svg>',
    compass: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><polygon points="15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6 15.5 8.5"/></svg>'
  };

  function createEl(tag, className, text) {
    var el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    if (typeof text === "string") {
      el.textContent = text;
    }
    return el;
  }

  function createIconSpan(name, className) {
    var span = createEl("span", className || "");
    span.innerHTML = ICONS[name] || ICONS.compass;
    return span;
  }

  function renderFeaturedTool(tool) {
    var container = document.getElementById("featured-stage");
    if (!container || !tool) {
      return;
    }

    container.textContent = "";
    var isReady = tool.status === "ready";
    var card = createEl("article", "featured-card");

    // Linke Seite: animierte Tag-/Nacht-Erdkugel (klickbar wenn bereit)
    var stageEl = isReady
      ? createEl("a", "globe-stage-link")
      : createEl("div", "globe-stage-link globe-stage-link--static");

    if (isReady) {
      stageEl.href = tool.href;
      stageEl.setAttribute("aria-label", tool.ctaLabel + ": " + tool.title);
    }

    var sunBadge = createIconSpan("sun", "stage-sky-badge stage-sky-badge--sun");
    var moonBadge = createIconSpan("moon", "stage-sky-badge stage-sky-badge--moon");

    var canvas = createEl("canvas", "globe-canvas");
    canvas.width = 340;
    canvas.height = 340;
    canvas.setAttribute("aria-hidden", "true");

    stageEl.appendChild(sunBadge);
    stageEl.appendChild(moonBadge);
    stageEl.appendChild(canvas);

    // Rechte Seite: klare Infos & Startknopf
    var infoEl = createEl("div", "featured-info");

    var pill = createEl(
      "span",
      "status-pill " + (isReady ? "status-pill--ready" : "status-pill--soon")
    );
    pill.appendChild(createEl("span", "status-dot"));
    pill.appendChild(document.createTextNode(tool.statusLabel || (isReady ? "Bereit" : "In Arbeit")));

    var heading = createEl("h2", "featured-title", tool.title);
    var desc = createEl("p", "featured-text", tool.shortText);

    infoEl.appendChild(pill);
    infoEl.appendChild(heading);
    infoEl.appendChild(desc);

    if (Array.isArray(tool.highlights) && tool.highlights.length > 0) {
      var list = createEl("ul", "highlight-list");
      tool.highlights.forEach(function (item) {
        var li = createEl("li", "highlight-chip");
        li.innerHTML = ICONS[item.icon] || "";
        li.appendChild(createEl("span", "", item.label));
        list.appendChild(li);
      });
      infoEl.appendChild(list);
    }

    if (isReady) {
      var cta = createEl("a", "cta-button", tool.ctaLabel || "Tool starten");
      cta.href = tool.href;
      infoEl.appendChild(cta);
    } else {
      infoEl.appendChild(createEl("div", "cta-soon", tool.ctaLabel || "Bald verfügbar"));
    }

    card.appendChild(stageEl);
    card.appendChild(infoEl);
    container.appendChild(card);

    initDayNightPreview(canvas);
  }

  function renderMoreTools(otherTools) {
    var container = document.getElementById("more-tools");
    if (!container) {
      return;
    }

    container.textContent = "";

    if (!otherTools || otherTools.length === 0) {
      var shelf = createEl("div", "upcoming-shelf");
      shelf.innerHTML = ICONS.compass;
      shelf.appendChild(createEl("p", "", "Weitere Lerntools kommen Schritt für Schritt dazu."));
      container.appendChild(shelf);
      return;
    }

    container.appendChild(createEl("h2", "section-heading", "Weitere Lerntools"));
    var grid = createEl("div", "tools-grid");

    otherTools.forEach(function (tool) {
      var isReady = tool.status === "ready";
      var card = createEl("article", "tool-card");

      var preview = createEl("div", "tool-card-preview");
      preview.innerHTML = ICONS[tool.icon] || ICONS.compass;

      var body = createEl("div", "tool-card-body");
      var pill = createEl(
        "span",
        "status-pill " + (isReady ? "status-pill--ready" : "status-pill--soon")
      );
      pill.appendChild(createEl("span", "status-dot"));
      pill.appendChild(document.createTextNode(tool.statusLabel || (isReady ? "Bereit" : "In Arbeit")));

      body.appendChild(pill);
      body.appendChild(createEl("h3", "tool-card-title", tool.title));
      body.appendChild(createEl("p", "tool-card-text", tool.shortText));

      if (isReady) {
        var action = createEl("a", "tool-card-action", tool.ctaLabel || "Tool starten");
        action.href = tool.href;
        body.appendChild(action);
      } else {
        body.appendChild(createEl("div", "tool-card-soon", tool.ctaLabel || "Bald verfügbar"));
      }

      card.appendChild(preview);
      card.appendChild(body);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // ---------------------------------------------------------------------------
  // Tag-/Nacht-Erdkugel Vorschau (orthografische Projektion)
  // ---------------------------------------------------------------------------

  // Vereinfachte Umrisse der Kontinente [Länge, Breite] in Grad
  var CONTINENTS = [
    // Eurasien (zusammenhängende Küstenlinie ohne Selbstüberschneidung)
    [
      [-5.5, 36.0], [-9.2, 38.7], [-9.0, 43.0], [-1.8, 43.4], [-4.6, 48.4],
      [1.5, 51.0], [5.0, 53.2], [8.6, 53.9], [8.1, 57.1], [10.6, 57.7],
      [10.2, 55.8], [10.1, 54.4], [13.5, 54.1], [19.0, 54.4], [21.1, 55.7],
      [24.1, 57.0], [24.7, 59.4], [30.0, 60.0], [25.0, 60.2], [21.6, 61.5],
      [25.4, 65.0], [22.1, 65.6], [18.1, 59.3], [16.5, 56.5], [13.0, 55.5],
      [12.0, 57.7], [10.7, 59.9], [8.0, 58.1], [5.3, 60.4], [10.4, 63.4],
      [14.5, 68.2], [25.8, 71.1], [33.1, 69.0], [40.5, 64.5], [44.0, 68.5],
      [60.0, 69.8], [70.0, 72.8], [85.0, 73.5], [104.0, 77.5], [126.0, 73.0],
      [155.0, 70.5], [178.0, 66.2], [170.0, 62.5], [162.0, 59.8], [156.7, 51.0],
      [155.5, 59.0], [143.0, 59.4], [138.0, 54.0], [132.0, 43.1], [129.0, 35.1],
      [126.5, 37.5], [121.0, 40.0], [118.0, 39.0], [122.0, 37.2], [121.8, 31.2],
      [119.5, 25.0], [114.2, 22.3], [108.5, 21.5], [109.2, 13.0], [105.0, 8.6],
      [100.5, 13.5], [103.8, 1.3], [100.0, 5.5], [98.4, 8.0], [96.2, 16.5],
      [92.2, 21.0], [90.5, 22.2], [85.0, 19.5], [80.3, 13.1], [77.5, 8.1],
      [72.8, 19.0], [69.0, 22.5], [67.0, 24.8], [61.5, 25.2], [56.5, 26.5],
      [50.0, 29.9], [51.5, 25.3], [56.3, 25.3], [59.8, 22.5], [54.0, 17.0],
      [45.0, 12.8], [43.4, 12.7], [39.0, 21.5], [34.9, 29.5], [32.3, 31.3],
      [35.5, 33.9], [36.0, 36.6], [30.7, 36.8], [27.0, 38.4], [26.4, 40.2],
      [29.1, 41.1], [36.0, 41.8], [41.6, 41.7], [39.0, 47.0], [33.5, 44.6],
      [31.0, 46.5], [28.0, 43.2], [28.9, 41.0], [26.0, 40.8], [23.8, 38.0],
      [22.5, 36.5], [20.5, 39.2], [19.5, 41.5], [15.0, 44.5], [13.8, 45.6],
      [12.5, 44.0], [16.0, 41.9], [18.5, 40.1], [15.6, 38.0], [14.0, 40.8],
      [10.3, 43.5], [8.9, 44.4], [5.4, 43.3], [2.2, 41.4], [0.0, 38.5],
      [-4.4, 36.7]
    ],
    // Afrika
    [
      [32.3, 31.2], [34.9, 29.5], [37.2, 21.0], [43.4, 12.6], [51.3, 11.9],
      [45.3, 2.0], [40.5, -10.5], [35.0, -25.0], [28.0, -33.0], [20.0, -34.8],
      [18.4, -34.0], [14.5, -22.5], [12.2, -6.0], [9.4, 0.4], [8.5, 4.5],
      [0.0, 5.5], [-7.5, 4.5], [-13.5, 9.5], [-17.5, 14.7], [-17.0, 21.0],
      [-9.6, 30.4], [-5.8, 35.8], [3.0, 36.8], [10.5, 37.2], [11.0, 33.2],
      [15.0, 32.3], [20.0, 32.8], [25.0, 31.6], [30.0, 31.5]
    ],
    // Madagaskar
    [[49.3, -12.0], [50.4, -15.5], [47.5, -25.0], [44.0, -25.2], [43.5, -20.0], [47.0, -15.0]],
    // Grossbritannien
    [[-5.5, 50.1], [-3.0, 51.4], [-4.8, 55.0], [-5.8, 58.5], [-3.0, 58.6], [-1.8, 57.5], [-1.5, 55.0], [1.7, 52.5], [1.3, 51.1]],
    // Irland
    [[-10.0, 51.8], [-9.8, 54.3], [-6.2, 55.2], [-6.0, 53.3], [-6.4, 52.2]],
    // Island
    [[-24.0, 65.5], [-18.0, 66.2], [-14.0, 65.0], [-19.0, 63.5], [-22.5, 64.0]],
    // Sizilien
    [[12.4, 37.8], [15.6, 38.2], [15.1, 36.7], [13.5, 37.3]],
    // Sri Lanka
    [[80.0, 9.7], [81.8, 7.6], [80.6, 6.0], [79.7, 7.8]],
    // Japan
    [[130.5, 31.5], [132.0, 33.5], [136.5, 34.8], [140.8, 36.0], [141.5, 41.3], [145.5, 43.3], [141.5, 45.4], [139.8, 40.5], [136.5, 36.8], [131.0, 34.2]],
    // Sumatra
    [[95.3, 5.5], [99.5, 3.0], [105.8, -5.8], [103.5, -5.0], [97.5, 1.5]],
    // Borneo
    [[109.0, 1.5], [115.5, 6.5], [118.8, 5.2], [117.5, -3.5], [111.5, -3.2]],
    // Java
    [[105.5, -6.2], [114.5, -7.8], [114.0, -8.7], [106.0, -7.2]],
    // Philippinen (vereinfacht)
    [[120.0, 18.4], [122.4, 16.5], [126.2, 8.2], [122.2, 6.8], [120.2, 14.2]],
    // Nordamerika
    [
      [-168.0, 65.6], [-162.0, 70.5], [-140.0, 70.0], [-115.0, 69.0], [-95.0, 71.0],
      [-82.0, 66.0], [-78.0, 62.5], [-92.0, 58.0], [-82.0, 52.0], [-79.0, 62.0],
      [-65.0, 60.0], [-56.0, 52.0], [-61.0, 46.0], [-70.0, 42.0], [-75.5, 35.5],
      [-80.2, 25.3], [-82.5, 27.5], [-89.0, 30.0], [-97.2, 26.0], [-96.0, 19.2],
      [-90.5, 21.2], [-87.0, 21.3], [-88.2, 15.8], [-83.5, 15.0], [-83.0, 10.0],
      [-78.0, 8.5], [-85.5, 10.5], [-93.0, 15.5], [-105.5, 20.5], [-110.0, 23.0],
      [-114.5, 31.5], [-117.1, 32.5], [-122.5, 37.8], [-124.5, 48.0], [-136.0, 58.0],
      [-152.0, 59.5], [-162.0, 55.0], [-166.0, 60.0]
    ],
    // Grönland (separat leicht heller gezeichnet)
    // Kuba
    [[-84.8, 22.0], [-79.0, 22.8], [-74.2, 20.2], [-77.5, 19.8], [-82.5, 21.7]],
    // Südamerika
    [
      [-78.0, 8.5], [-75.5, 10.8], [-71.5, 12.2], [-62.0, 10.6], [-50.0, 1.5],
      [-35.0, -5.8], [-38.5, -13.0], [-41.0, -22.0], [-48.5, -28.0], [-53.5, -34.0],
      [-58.0, -38.5], [-65.0, -43.0], [-68.5, -52.5], [-67.0, -55.0], [-73.5, -54.0],
      [-75.5, -47.0], [-71.6, -33.0], [-70.5, -18.5], [-77.2, -12.0], [-81.3, -4.8],
      [-80.0, 2.0]
    ],
    // Australien
    [
      [129.0, -14.8], [136.8, -12.2], [142.5, -10.8], [146.0, -18.0], [153.6, -28.2],
      [150.0, -37.5], [144.8, -38.4], [138.5, -35.5], [129.0, -31.8], [115.2, -34.3],
      [113.5, -22.0], [122.2, -18.0]
    ],
    // Neuseeland
    [[172.7, -34.4], [178.5, -37.7], [175.3, -41.4], [166.5, -46.2], [170.5, -43.0], [174.0, -39.0]]
  ];

  var GREENLAND = [
    [-52.0, 60.0], [-43.0, 60.0], [-36.0, 65.5], [-21.0, 70.5], [-18.0, 76.5],
    [-12.0, 81.5], [-34.0, 83.5], [-61.0, 81.5], [-72.0, 77.0], [-56.0, 72.5],
    [-53.5, 66.5]
  ];

  var ANTARCTICA = [
    [-180, -90], [-180, -73], [-145, -75], [-110, -73], [-75, -72], [-60, -64],
    [-55, -66], [-40, -76], [-10, -70], [30, -69], [70, -68], [110, -66],
    [150, -68], [170, -72], [180, -73], [180, -90]
  ];

  // Wichtige Lichtercluster für die Nachtseite [Länge, Breite, Stärke]
  var CITY_LIGHTS = [
    [-0.1, 51.5, 1.0], [2.3, 48.9, 1.0], [4.5, 51.5, 1.0], [7.5, 50.8, 1.0],
    [9.0, 46.5, 0.9], [-3.7, 40.4, 0.9], [2.2, 41.4, 0.85], [12.5, 41.9, 0.9],
    [13.4, 52.5, 0.9], [11.6, 48.1, 0.85], [16.4, 48.2, 0.85], [21.0, 52.2, 0.8],
    [37.6, 55.8, 1.0], [30.3, 59.9, 0.85], [29.0, 41.0, 0.95], [23.7, 38.0, 0.8],
    [30.5, 50.4, 0.8], [31.2, 30.0, 1.0], [31.5, 27.0, 0.75], [32.6, 25.7, 0.7],
    [35.0, 32.5, 0.9], [46.7, 24.7, 0.85], [55.3, 25.3, 0.95], [51.5, 25.3, 0.85],
    [51.4, 35.7, 0.9], [3.4, 6.5, 0.8], [28.0, -26.2, 0.8], [-7.6, 33.6, 0.75],
    [77.2, 28.6, 1.0], [72.9, 19.1, 0.95], [77.6, 13.0, 0.85], [88.4, 22.6, 0.9],
    [67.0, 24.9, 0.85], [90.4, 23.8, 0.85], [100.5, 13.8, 0.9], [103.8, 1.3, 0.9],
    [106.8, -6.2, 0.9], [116.4, 39.9, 1.0], [121.5, 31.2, 1.0], [113.8, 22.6, 1.0],
    [104.1, 30.7, 0.85], [127.0, 37.6, 0.95], [139.7, 35.7, 1.0], [135.5, 34.7, 0.9],
    [-74.0, 40.7, 1.0], [-71.1, 42.4, 0.85], [-87.6, 41.9, 0.95], [-79.4, 43.7, 0.9],
    [-84.4, 33.7, 0.85], [-80.2, 25.8, 0.85], [-96.8, 32.8, 0.85], [-118.2, 34.1, 1.0],
    [-122.4, 37.8, 0.9], [-99.1, 19.4, 0.95], [-74.1, 4.7, 0.75], [-46.6, -23.6, 0.95],
    [-43.2, -22.9, 0.85], [-58.4, -34.6, 0.9], [151.2, -33.9, 0.85], [145.0, -37.8, 0.8]
  ];

  // Ruhige Hintergrundsterne (feste relative Koordinaten im dunklen Bühnenkasten)
  var STARS = [
    [0.10, 0.14, 1.1, 0.45], [0.18, 0.28, 0.9, 0.35], [0.85, 0.16, 1.2, 0.50],
    [0.91, 0.29, 0.8, 0.32], [0.14, 0.78, 1.0, 0.38], [0.22, 0.88, 0.9, 0.30],
    [0.83, 0.81, 1.1, 0.42], [0.90, 0.68, 0.8, 0.34], [0.50, 0.06, 0.9, 0.28],
    [0.07, 0.50, 1.0, 0.30], [0.94, 0.48, 1.0, 0.36], [0.68, 0.92, 0.9, 0.28]
  ];

  function toTexX(lon) {
    return ((lon + 180) / 360) * TEX_W;
  }

  function toTexY(lat) {
    return ((90 - lat) / 180) * TEX_H;
  }

  function drawPolygon(ctx, coords) {
    ctx.beginPath();
    for (var i = 0; i < coords.length; i++) {
      var x = toTexX(coords[i][0]);
      var y = toTexY(coords[i][1]);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
  }

  function buildWorldTextures() {
    var dayCanvas = document.createElement("canvas");
    dayCanvas.width = TEX_W;
    dayCanvas.height = TEX_H;
    var dCtx = dayCanvas.getContext("2d");

    // Ozean-Verlauf für die Tagseite
    var oceanGrad = dCtx.createLinearGradient(0, 0, 0, TEX_H);
    oceanGrad.addColorStop(0, "#358CCB");
    oceanGrad.addColorStop(0.18, "#267CC2");
    oceanGrad.addColorStop(0.5, "#1E72B8");
    oceanGrad.addColorStop(0.82, "#267CC2");
    oceanGrad.addColorStop(1, "#358CCB");
    dCtx.fillStyle = oceanGrad;
    dCtx.fillRect(0, 0, TEX_W, TEX_H);

    // Dezentes Gradnetz (alle 30 Grad)
    dCtx.strokeStyle = "rgba(255, 255, 255, 0.10)";
    dCtx.lineWidth = 0.9;
    for (var lon = -150; lon <= 150; lon += 30) {
      var gx = toTexX(lon);
      dCtx.beginPath();
      dCtx.moveTo(gx, 0);
      dCtx.lineTo(gx, TEX_H);
      dCtx.stroke();
    }
    for (var lat = -60; lat <= 60; lat += 30) {
      var gy = toTexY(lat);
      dCtx.beginPath();
      dCtx.moveTo(0, gy);
      dCtx.lineTo(TEX_W, gy);
      dCtx.stroke();
    }

    // Kontinente (Tagseite)
    dCtx.fillStyle = "#5AAE5D";
    dCtx.strokeStyle = "#3B8648";
    dCtx.lineWidth = 1.2;
    CONTINENTS.forEach(function (poly) {
      drawPolygon(dCtx, poly);
      dCtx.fill();
      dCtx.stroke();
    });

    // Grönland & Antarktis (helleres Eis)
    dCtx.fillStyle = "#9CC7B0";
    dCtx.strokeStyle = "#6CA089";
    drawPolygon(dCtx, GREENLAND);
    dCtx.fill();
    dCtx.stroke();

    dCtx.fillStyle = "#DCEBF4";
    dCtx.strokeStyle = "#B4CEE0";
    drawPolygon(dCtx, ANTARCTICA);
    dCtx.fill();
    dCtx.stroke();

    // Nacht-Textur
    var nightCanvas = document.createElement("canvas");
    nightCanvas.width = TEX_W;
    nightCanvas.height = TEX_H;
    var nCtx = nightCanvas.getContext("2d");

    nCtx.fillStyle = "#0B1D36";
    nCtx.fillRect(0, 0, TEX_W, TEX_H);

    nCtx.fillStyle = "#142742";
    nCtx.strokeStyle = "#1F395C";
    nCtx.lineWidth = 1.0;
    CONTINENTS.forEach(function (poly) {
      drawPolygon(nCtx, poly);
      nCtx.fill();
      nCtx.stroke();
    });

    nCtx.fillStyle = "#1A324D";
    drawPolygon(nCtx, GREENLAND);
    nCtx.fill();
    drawPolygon(nCtx, ANTARCTICA);
    nCtx.fill();

    // Warme Stadtlichter auf der Nachtseite
    CITY_LIGHTS.forEach(function (city) {
      var cx = toTexX(city[0]);
      var cy = toTexY(city[1]);
      var strength = city[2];
      var radius = 3.4 * strength + 1.8;
      var glow = nCtx.createRadialGradient(cx, cy, 0.25, cx, cy, radius);
      glow.addColorStop(0, "rgba(255, 232, 165, " + (0.98 * strength) + ")");
      glow.addColorStop(0.32, "rgba(255, 195, 95, " + (0.55 * strength) + ")");
      glow.addColorStop(1, "rgba(255, 165, 60, 0)");
      nCtx.fillStyle = glow;
      nCtx.beginPath();
      nCtx.arc(cx, cy, radius, 0, Math.PI * 2);
      nCtx.fill();
    });

    return {
      dayData: dCtx.getImageData(0, 0, TEX_W, TEX_H).data,
      nightData: nCtx.getImageData(0, 0, TEX_W, TEX_H).data
    };
  }

  function smoothstep(edge0, edge1, x) {
    var t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function initDayNightPreview(canvas) {
    if (!canvas || !canvas.getContext) {
      return;
    }

    var ctx = canvas.getContext("2d");
    var size = canvas.width;
    var half = size * 0.5;
    var radius = size * 0.41;

    var textures = buildWorldTextures();
    var dayData = textures.dayData;
    var nightData = textures.nightData;

    // Hintergrund-Layer mit Sternen + zarter Atmosphäre einmalig vorbereiten
    var bgCanvas = document.createElement("canvas");
    bgCanvas.width = size;
    bgCanvas.height = size;
    var bgCtx = bgCanvas.getContext("2d");

    STARS.forEach(function (star) {
      bgCtx.fillStyle = "rgba(235, 244, 255, " + star[3] + ")";
      bgCtx.beginPath();
      bgCtx.arc(star[0] * size, star[1] * size, star[2], 0, Math.PI * 2);
      bgCtx.fill();
    });

    var haloGrad = bgCtx.createRadialGradient(
      half - radius * 0.25,
      half - radius * 0.15,
      radius * 0.85,
      half,
      half,
      radius * 1.18
    );
    haloGrad.addColorStop(0, "rgba(110, 185, 255, 0.30)");
    haloGrad.addColorStop(0.55, "rgba(65, 145, 235, 0.11)");
    haloGrad.addColorStop(1, "rgba(14, 34, 61, 0)");
    bgCtx.fillStyle = haloGrad;
    bgCtx.beginPath();
    bgCtx.arc(half, half, radius * 1.18, 0, Math.PI * 2);
    bgCtx.fill();

    // Arbeits-Canvas & ImageData für die Erdkugel (ohne Readback pro Frame)
    var globeCanvas = document.createElement("canvas");
    globeCanvas.width = size;
    globeCanvas.height = size;
    var globeCtx = globeCanvas.getContext("2d");
    var globeImg = globeCtx.createImageData(size, size);
    var pixels = globeImg.data;

    // Blickpunkt auf Europa & Afrika (für Schweizer Sekundarschülerinnen sofort vertraut)
    var viewLon = 14 * DEG2RAD;
    var viewLat = 20 * DEG2RAD;
    var cosVLat = Math.cos(viewLat);
    var sinVLat = Math.sin(viewLat);
    var cosVLon = Math.cos(viewLon);
    var sinVLon = Math.sin(viewLon);

    // Deklination +12° Nord (natürliche Tag/Nacht-Geometrie für Europa)
    var sunLatRad = 12 * DEG2RAD;
    var cosSunLat = Math.cos(sunLatRad);
    var sinSunLat = Math.sin(sunLatRad);

    function renderFrame(mezHour) {
      var utcHour = mezHour - 1;
      var sunLonRad = (12 - utcHour) * 15 * DEG2RAD;
      var sunX = cosSunLat * Math.sin(sunLonRad);
      var sunY = sinSunLat;
      var sunZ = cosSunLat * Math.cos(sunLonRad);

      var minP = Math.max(0, Math.floor(half - radius - 2));
      var maxP = Math.min(size - 1, Math.ceil(half + radius + 2));

      for (var py = minP; py <= maxP; py++) {
        var yCam = (half - py) / radius;
        var ySq = yCam * yCam;
        var rowOffset = py * size;

        for (var px = minP; px <= maxP; px++) {
          var xCam = (px - half) / radius;
          var distSq = xCam * xCam + ySq;

          if (distSq > 1.015) {
            continue;
          }

          var idx = (rowOffset + px) * 4;
          var edgeAlpha = distSq <= 1.0 ? 1.0 : Math.max(0, 1.0 - (distSq - 1.0) / 0.015);
          var zCam = distSq < 1.0 ? Math.sqrt(1.0 - distSq) : 0.0;

          // Rückdrehung von Kamera-Raum in Erd-Koordinaten
          var x1 = xCam;
          var y1 = yCam * cosVLat + zCam * sinVLat;
          var z1 = -yCam * sinVLat + zCam * cosVLat;

          var ex = x1 * cosVLon + z1 * sinVLon;
          var ey = y1;
          var ez = -x1 * sinVLon + z1 * cosVLon;

          var latDeg = Math.asin(Math.max(-1, Math.min(1, ey))) * RAD2DEG;
          var lonDeg = Math.atan2(ex, ez) * RAD2DEG;

          var u = ((lonDeg + 180) / 360) * TEX_W;
          var v = ((90 - latDeg) / 180) * TEX_H;

          var tx = Math.floor(u) % TEX_W;
          if (tx < 0) {
            tx += TEX_W;
          }
          var ty = Math.min(TEX_H - 1, Math.max(0, Math.floor(v)));
          var tIdx = (ty * TEX_W + tx) * 4;

          var dot = ex * sunX + ey * sunY + ez * sunZ;
          var dayMix = smoothstep(-0.14, 0.16, dot);
          var twilight = Math.exp(-Math.pow((dot + 0.01) / 0.085, 2));

          var shade = 0.68 + 0.36 * Math.max(0, dot);
          var dayR = Math.min(255, dayData[tIdx] * shade);
          var dayG = Math.min(255, dayData[tIdx + 1] * shade);
          var dayB = Math.min(255, dayData[tIdx + 2] * shade);

          var nightR = nightData[tIdx];
          var nightG = nightData[tIdx + 1];
          var nightB = nightData[tIdx + 2];

          var r = nightR + (dayR - nightR) * dayMix + twilight * 92;
          var g = nightG + (dayG - nightG) * dayMix + twilight * 46;
          var b = nightB + (dayB - nightB) * dayMix + twilight * 12;

          // Dezenter blauer Atmosphären-Rand auf der beleuchteten Kugelkante
          var rim = Math.pow(1 - zCam, 3) * (0.18 + 0.65 * dayMix);
          r += (115 - r) * rim * 0.45;
          g += (195 - g) * rim * 0.45;
          b += (255 - b) * rim * 0.55;

          pixels[idx] = Math.min(255, Math.max(0, r));
          pixels[idx + 1] = Math.min(255, Math.max(0, g));
          pixels[idx + 2] = Math.min(255, Math.max(0, b));
          pixels[idx + 3] = Math.round(edgeAlpha * 255);
        }
      }

      globeCtx.putImageData(globeImg, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(bgCanvas, 0, 0);
      ctx.drawImage(globeCanvas, 0, 0);
    }

    // Start bei 17:30 Uhr MEZ: goldene Dämmerung quer durch Europa & Afrika
    var currentHour = 17.5;
    renderFrame(currentHour);

    var reducedMotionQuery = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;

    if (reducedMotionQuery && reducedMotionQuery.matches) {
      return;
    }

    var lastTime = null;
    var rafId = null;

    function tick(now) {
      if (document.hidden) {
        lastTime = null;
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      if (lastTime !== null) {
        var dt = Math.min(0.1, (now - lastTime) / 1000);
        currentHour = (currentHour + dt * 0.45) % 24;
        renderFrame(currentHour);
      }
      lastTime = now;
      rafId = window.requestAnimationFrame(tick);
    }

    if (reducedMotionQuery && reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener("change", function (event) {
        if (event.matches && rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
          renderFrame(17.5);
        } else if (!event.matches && rafId === null) {
          lastTime = null;
          rafId = window.requestAnimationFrame(tick);
        }
      });
    }

    rafId = window.requestAnimationFrame(tick);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var tools = Array.isArray(window.GEO_TOOLS) ? window.GEO_TOOLS : [];
    if (tools.length === 0) {
      return;
    }

    var featured = tools.find(function (t) { return t.featured; }) || tools[0];
    var others = tools.filter(function (t) { return t !== featured; });

    renderFeaturedTool(featured);
    renderMoreTools(others);
  });
})();
