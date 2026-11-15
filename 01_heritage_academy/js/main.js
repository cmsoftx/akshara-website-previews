/* Akshara Interactive Engine — Pure Vanilla JS */
(function () {
  // 1. Central WhatsApp & Institutional Configuration Variable
  window.AKSHARA_CONFIG = {
    institutionName: "Akshara Coaching Classes, Dharwad",
    whatsappNumber: "919535818800", // Confirm with management if primary desk 95358 18800 backs wa.link/keq81z
    whatsappShortlink: "https://wa.link/keq81z"
  };

  // Build contextual WhatsApp URL cleanly
  window.buildWaUrl = function (msg) {
    return "https://wa.me/" + window.AKSHARA_CONFIG.whatsappNumber + "?text=" + encodeURIComponent(msg);
  };

  // 2. Navigation All-Pages Drawer
  var drawer = document.getElementById("siteDrawer");
  document.querySelectorAll("[data-drawer-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (drawer) {
        drawer.classList.add("open");
        drawer.setAttribute("aria-hidden", "false");
      }
    });
  });
  document.querySelectorAll("[data-drawer-close]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (drawer) {
        drawer.classList.remove("open");
        drawer.setAttribute("aria-hidden", "true");
      }
    });
  });

  // 3. Zero-Lag Scroll Reveal Observer
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "60px 0px", threshold: 0.04 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in-view"); });
  }

  // 4. Design 03 Collapsible Compact Rail Toggle + Interactive Pathways Directory + Course Category Rail Filter
  var sbToggle = document.getElementById("sidebarToggleBtn");
  if (sbToggle) {
    sbToggle.addEventListener("click", function () {
      var collapsed = document.body.classList.toggle("sb-collapsed");
      sbToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      sbToggle.innerHTML = collapsed ? "&#8250;" : "&#8249;";
    });
  }

  document.querySelectorAll("[data-inst-pick]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pid = btn.getAttribute("data-inst-pick");
      document.querySelectorAll("[data-inst-pick]").forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      document.querySelectorAll("[data-inst-panel]").forEach(function (p) {
        p.style.display = (p.getAttribute("data-inst-panel") === pid) ? "flex" : "none";
      });
    });
  });

  document.querySelectorAll("[data-track-cat]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-track-cat");
      document.querySelectorAll("[data-track-cat]").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var rail = document.getElementById("studioCourseRail");
      if (!rail) return;
      rail.querySelectorAll("[data-course-cat]").forEach(function (card) {
        var c = card.getAttribute("data-course-cat") || "";
        card.style.display = (cat === "all" || c === cat) ? "" : "none";
      });
      rail.dispatchEvent(new CustomEvent("akshara:reset-rail"));
      rail.scrollTo({ left: 0, behavior: "smooth" });
    });
  });

  // Scroll-Linked Right-to-Left Course Track Slide for Design 03 (#studio-courses)
  var studioSection = document.getElementById("studio-courses");
  var studioSticky = document.getElementById("studioCoursesSticky");
  var studioRail = document.getElementById("studioCourseRail");
  var studioProgressBar = document.getElementById("studioRailProgress");

  if (studioRail) {
    studioRail.classList.add("d3-auto-rail");
    var manualPauseUntil = 0;
    var rafPending = false;
    var glideRaf = 0;
    var targetScroll = 0;

    function getMaxScroll() {
      return Math.max(0, studioRail.scrollWidth - studioRail.clientWidth);
    }

    function updateRailProgressBar() {
      if (!studioProgressBar) return;
      var max = getMaxScroll();
      var ratio = max > 0 ? Math.min(1, Math.max(0, studioRail.scrollLeft / max)) : 1;
      var visual = 0.12 + ratio * 0.88;
      studioProgressBar.style.transform = "scaleX(" + visual.toFixed(3) + ")";
    }

    function pauseAutoSlide(ms) {
      manualPauseUntil = Date.now() + (ms || 2000);
      if (glideRaf) {
        cancelAnimationFrame(glideRaf);
        glideRaf = 0;
      }
    }

    studioRail.addEventListener("akshara:manual-rail", function () {
      pauseAutoSlide(2400);
    });
    studioRail.addEventListener("akshara:reset-rail", function () {
      targetScroll = 0;
      pauseAutoSlide(1400);
      requestAnimationFrame(updateRailProgressBar);
    });

    ["pointerdown", "touchstart"].forEach(function (evName) {
      studioRail.addEventListener(evName, function () { pauseAutoSlide(2400); }, { passive: true });
    });
    studioRail.addEventListener("wheel", function (ev) {
      if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) pauseAutoSlide(2000);
    }, { passive: true });
    studioRail.addEventListener("scroll", updateRailProgressBar, { passive: true });

    function stepGlide() {
      glideRaf = 0;
      if (Date.now() < manualPauseUntil) return;
      var diff = targetScroll - studioRail.scrollLeft;
      if (Math.abs(diff) <= 0.75) {
        studioRail.scrollLeft = targetScroll;
        updateRailProgressBar();
        return;
      }
      studioRail.scrollLeft += diff * 0.18;
      updateRailProgressBar();
      glideRaf = requestAnimationFrame(stepGlide);
    }

    function syncCourseScrollFromPage() {
      rafPending = false;
      if (!studioSection || Date.now() < manualPauseUntil) return;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var maxScroll = getMaxScroll();
      if (maxScroll <= 4) {
        updateRailProgressBar();
        return;
      }
      var secRect = studioSection.getBoundingClientRect();
      var stickyH = studioSticky ? studioSticky.offsetHeight : secRect.height;
      var runwayTravel = Math.max(0, studioSection.offsetHeight - stickyH);
      var progress = 0;

      if (runwayTravel > 120) {
        var startY = 120;
        var totalSpan = runwayTravel + startY;
        progress = (startY - secRect.top) / totalSpan;
      } else {
        var enterTop = window.innerHeight * 0.78;
        var exitTop = -Math.max(120, secRect.height * 0.35);
        progress = (enterTop - secRect.top) / (enterTop - exitTop);
      }
      progress = Math.min(1, Math.max(0, progress));
      targetScroll = progress * maxScroll;
      if (!glideRaf) glideRaf = requestAnimationFrame(stepGlide);
    }

    window.addEventListener("scroll", function () {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(syncCourseScrollFromPage);
      }
    }, { passive: true });
    window.addEventListener("resize", updateRailProgressBar, { passive: true });
    updateRailProgressBar();
  }

  // 5. Segmented Tabs (Syllabi, Exam Comparator, Methodology Steppers, Gallery Categories)
  document.querySelectorAll("[data-tab-group]").forEach(function (group) {
    var buttons = group.querySelectorAll("[data-tab-target]");
    var containerId = group.getAttribute("data-tab-group");
    var container = document.getElementById(containerId);
    if (!container) return;
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetId = btn.getAttribute("data-tab-target");
        buttons.forEach(function (b) { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        container.querySelectorAll(".tab-panel").forEach(function (p) {
          p.classList.toggle("active", p.id === targetId);
        });
      });
    });
  });

  // 6. Gallery Filter Buttons (Photo + Video Cards)
  document.querySelectorAll("[data-filter-group]").forEach(function (bar) {
    var grid = document.getElementById(bar.getAttribute("data-filter-group"));
    if (!grid) return;
    bar.querySelectorAll("[data-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-filter");
        bar.querySelectorAll("[data-filter]").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        grid.querySelectorAll("[data-cat]").forEach(function (item) {
          var itemCat = item.getAttribute("data-cat") || "";
          item.style.display = (cat === "all" || itemCat.indexOf(cat) !== -1) ? "" : "none";
        });
      });
    });
  });

  // 7. Interactive Vertical Course Explorer (Concept 01 / 06 style)
  document.querySelectorAll("[data-explorer-list]").forEach(function (list) {
    var stageId = list.getAttribute("data-explorer-list");
    var stage = document.getElementById(stageId);
    if (!stage) return;
    list.querySelectorAll("[data-preview-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        list.querySelectorAll("[data-preview-id]").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var pid = btn.getAttribute("data-preview-id");
        stage.querySelectorAll("[data-stage-panel]").forEach(function (panel) {
          panel.style.display = (panel.getAttribute("data-stage-panel") === pid) ? "block" : "none";
        });
      });
    });
  });

  // 8. 3-Dropdown Programme Finder (Concept 02 Scholar Atlas Hero)
  var finderBtn = document.getElementById("atlasFinderGo");
  if (finderBtn) {
    finderBtn.addEventListener("click", function () {
      var cls = (document.getElementById("finderClass") || {}).value || "";
      var goal = (document.getElementById("finderGoal") || {}).value || "navodaya-jnvst.html";
      var med = (document.getElementById("finderMedium") || {}).value || "English / Kannada Bilingual";
      var out = document.getElementById("atlasFinderResult");
      if (out) {
        out.innerHTML = "Matched Wing: <strong>" + goal.replace(".html", "").replace(/-/g, " ") +
          "</strong> (" + cls + " · " + med + ") &mdash; <a href='" + goal + "' style='color:#FDE68A;font-weight:700;'>Open Dedicated Course Page &rarr;</a>";
        out.style.display = "block";
      }
    });
  }

  // 9. Horizontal Rail Scroller (Concept 02, 03 & 06) + Concept 02 Continuous Institutional Wayfinder Marquee
  document.querySelectorAll("[data-rail-scroll]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("data-rail-scroll"));
      var dir = Number(btn.getAttribute("data-dir") || "1");
      if (target) {
        target.dispatchEvent(new CustomEvent("akshara:manual-rail"));
        target.scrollBy({ left: dir * 340, behavior: "smooth" });
      }
    });
  });

  var wayfinderViewport = document.getElementById("atlasWayfinderViewport");
  var wayfinderTrack = document.getElementById("atlasWayfinderTrack");
  if (wayfinderViewport && wayfinderTrack) {
    var reduceMotionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var baseCards = Array.prototype.slice.call(wayfinderTrack.querySelectorAll("[data-wayfinder-original='1']"));
    var baseCount = baseCards.length;

    if (baseCount > 0) {
      // Ensure ultra-wide displays have enough cloned items to wrap cleanly
      while (wayfinderTrack.scrollWidth < wayfinderViewport.offsetWidth * 2.4 && wayfinderTrack.children.length < baseCount * 4) {
        baseCards.forEach(function (orig) {
          var dup = orig.cloneNode(true);
          dup.removeAttribute("data-wayfinder-original");
          dup.setAttribute("aria-hidden", "true");
          dup.querySelectorAll("a, button").forEach(function (el) { el.setAttribute("tabindex", "-1"); });
          wayfinderTrack.appendChild(dup);
        });
      }

      var wfOffset = 0;
      var wfLastTs = 0;
      var wfHovered = false;
      var wfFocusWithin = false;
      var wfDragging = false;
      var wfPointerDown = false;
      var wfWasDragged = false;
      var wfStartX = 0;
      var wfStartOffset = 0;
      var wfResumeAt = 0;
      var wfTween = null;
      var wfInView = true;
      var wfSpeedPxPerSec = 36;

      function getLoopWidth() {
        var first = wayfinderTrack.children[0];
        var nextLoop = wayfinderTrack.children[baseCount];
        if (first && nextLoop) {
          var w = nextLoop.offsetLeft - first.offsetLeft;
          if (w > 0) return w;
        }
        return Math.max(1, wayfinderTrack.scrollWidth / 2);
      }

      function getStepWidth() {
        var c0 = wayfinderTrack.children[0];
        var c1 = wayfinderTrack.children[1];
        if (c0 && c1) {
          var s = c1.offsetLeft - c0.offsetLeft;
          if (s > 0) return s;
        }
        return 300;
      }

      function normalizeOffset(val) {
        var lw = getLoopWidth();
        var m = val % lw;
        return m < 0 ? m + lw : m;
      }

      function applyTransform() {
        wayfinderTrack.style.transform = "translate3d(" + (-wfOffset).toFixed(2) + "px, 0, 0)";
      }

      function pauseAutoFor(ms) {
        wfResumeAt = Math.max(wfResumeAt, Date.now() + ms);
      }

      function nudgeMarquee(dir) {
        var step = getStepWidth();
        var start = wfOffset;
        var delta = dir * step;
        wfTween = {
          start: start,
          delta: delta,
          beginTs: performance.now(),
          duration: 420
        };
        pauseAutoFor(1800);
      }

      document.querySelectorAll("[data-marquee-prev='atlasWayfinderViewport']").forEach(function (btn) {
        btn.addEventListener("click", function () { nudgeMarquee(-1); });
      });
      document.querySelectorAll("[data-marquee-next='atlasWayfinderViewport']").forEach(function (btn) {
        btn.addEventListener("click", function () { nudgeMarquee(1); });
      });

      wayfinderViewport.addEventListener("mouseenter", function () { wfHovered = true; });
      wayfinderViewport.addEventListener("mouseleave", function () { wfHovered = false; });
      wayfinderViewport.addEventListener("focusin", function () { wfFocusWithin = true; });
      wayfinderViewport.addEventListener("focusout", function () {
        setTimeout(function () {
          wfFocusWithin = wayfinderViewport.contains(document.activeElement);
        }, 0);
      });

      wayfinderViewport.addEventListener("pointerdown", function (ev) {
        if (ev.pointerType === "mouse" && ev.button !== 0) return;
        wfPointerDown = true;
        wfDragging = true;
        wfWasDragged = false;
        wfTween = null;
        wfStartX = ev.clientX;
        wfStartOffset = wfOffset;
        wayfinderViewport.classList.add("is-dragging");
        pauseAutoFor(1600);
      });

      window.addEventListener("pointermove", function (ev) {
        if (!wfPointerDown || !wfDragging) return;
        var dx = ev.clientX - wfStartX;
        if (Math.abs(dx) > 6) wfWasDragged = true;
        wfOffset = normalizeOffset(wfStartOffset - dx);
        applyTransform();
        pauseAutoFor(1500);
      });

      function endDrag() {
        if (!wfPointerDown) return;
        wfPointerDown = false;
        wfDragging = false;
        wayfinderViewport.classList.remove("is-dragging");
        pauseAutoFor(1400);
        setTimeout(function () { wfWasDragged = false; }, 80);
      }
      window.addEventListener("pointerup", endDrag);
      window.addEventListener("pointercancel", endDrag);

      wayfinderViewport.addEventListener("click", function (ev) {
        if (wfWasDragged) {
          ev.preventDefault();
          ev.stopPropagation();
        }
      }, true);

      wayfinderViewport.addEventListener("wheel", function (ev) {
        if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY) && Math.abs(ev.deltaX) > 2) {
          wfTween = null;
          wfOffset = normalizeOffset(wfOffset + ev.deltaX);
          applyTransform();
          pauseAutoFor(1400);
        }
      }, { passive: true });

      if ("IntersectionObserver" in window) {
        var wfIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) { wfInView = entry.isIntersecting; });
        }, { threshold: 0.02 });
        wfIo.observe(wayfinderViewport);
      }

      window.addEventListener("resize", function () {
        wfOffset = normalizeOffset(wfOffset);
        applyTransform();
      }, { passive: true });

      function tickWayfinder(ts) {
        if (!wfLastTs) wfLastTs = ts;
        var dt = Math.min(0.05, Math.max(0, (ts - wfLastTs) / 1000));
        wfLastTs = ts;

        if (wfTween) {
          var elapsed = ts - wfTween.beginTs;
          var t = Math.min(1, elapsed / wfTween.duration);
          var ease = 1 - Math.pow(1 - t, 3);
          wfOffset = normalizeOffset(wfTween.start + wfTween.delta * ease);
          applyTransform();
          if (t >= 1) wfTween = null;
        } else {
          var reduced = reduceMotionQuery && reduceMotionQuery.matches;
          var paused = reduced || !wfInView || wfHovered || wfFocusWithin || wfDragging || (Date.now() < wfResumeAt);
          if (!paused) {
            wfOffset = normalizeOffset(wfOffset + wfSpeedPxPerSec * dt);
            applyTransform();
          }
        }
        requestAnimationFrame(tickWayfinder);
      }

      requestAnimationFrame(tickWayfinder);
    }
  }

  // 10. Parent Compass Stage Switcher (Concept 05)
  document.querySelectorAll("[data-stage-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("[data-stage-filter]").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var val = btn.getAttribute("data-stage-filter");
      document.querySelectorAll("[data-course-stage]").forEach(function (card) {
        var stages = card.getAttribute("data-course-stage") || "";
        card.style.display = (val === "all" || stages.indexOf(val) !== -1) ? "" : "none";
      });
    });
  });

  // 11. FAQ Accordions
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      if (!item) return;
      var open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  // 12. Lightbox & Video Player Modal (Photos + H.264 MP4 Videos)
  var modal = document.getElementById("mediaModal");
  var modalTitle = document.getElementById("mediaModalTitle");
  var modalStage = document.getElementById("mediaModalStage");
  var modalCap = document.getElementById("mediaModalCap");

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    if (modalStage) modalStage.innerHTML = "";
  }
  document.querySelectorAll("[data-modal-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
      if (drawer) drawer.classList.remove("open");
    }
  });

  document.querySelectorAll("[data-lightbox-src]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      if (!modal || !modalStage) return;
      var kind = trigger.getAttribute("data-lightbox-kind") || "image";
      var src = trigger.getAttribute("data-lightbox-src") || "";
      var title = trigger.getAttribute("data-lightbox-title") || "";
      var cap = trigger.getAttribute("data-lightbox-cap") || "";
      var poster = trigger.getAttribute("data-lightbox-poster") || "";

      if (modalTitle) modalTitle.textContent = title;
      if (modalCap) modalCap.textContent = cap;
      modalStage.innerHTML = "";

      if (kind === "video") {
        var vid = document.createElement("video");
        vid.src = src;
        if (poster) vid.poster = poster;
        vid.controls = true;
        vid.autoplay = true;
        vid.playsInline = true;
        vid.style.width = "100%";
        modalStage.appendChild(vid);
      } else {
        var img = document.createElement("img");
        img.src = src;
        img.alt = title;
        modalStage.appendChild(img);
      }
      modal.classList.add("open");
    });
  });

  // 13. Honest Enquiry Form Validation & Optional Pre-Filled WhatsApp Launch + Interactive Campus Map View Switcher
  document.querySelectorAll("[data-enquiry-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fb = form.querySelector(".form-feedback");
      var student = (form.querySelector("[name='studentName']") || {}).value || "";
      var phone = (form.querySelector("[name='parentPhone']") || {}).value || "";
      var prog = (form.querySelector("[name='programme']") || {}).value || "Admission Enquiry";
      var stdCls = (form.querySelector("[name='studentClass']") || {}).value || "Classes 4–10";
      var cleanDigits = phone.replace(/\D/g, "");
      if (student.trim().length < 2 || cleanDigits.length < 10) {
        if (fb) {
          fb.className = "form-feedback show";
          fb.textContent = "Please enter the student name and a valid 10-digit parent mobile number.";
        }
        return;
      }
      var msg = "Hello Akshara Classes Dharwad, Admission Enquiry from website. Student: " +
        student.trim() + " (" + stdCls + ") | Programme: " + prog + " | Campus: Tapovan Ashram, Kelgeri, Dharwad (580001) | Parent Phone: " + phone.trim();
      var waHref = window.buildWaUrl(msg);
      if (fb) {
        fb.className = "form-feedback show";
        fb.innerHTML = "<strong>Validated Locally:</strong> Static HTML pages do not transmit directly to a database without a live backend API. " +
          "Click below to send this pre-filled enquiry directly via official WhatsApp or call +91 95358 18800:<br/><br/>" +
          "<a class='btn btn-wa' href='" + waHref + "' target='_blank' rel='noopener'>Send Enquiry on WhatsApp &rarr;</a>";
      }
    });
  });

  document.querySelectorAll("[data-map-switcher]").forEach(function (group) {
    var iframeId = group.getAttribute("data-map-switcher");
    var iframe = document.getElementById(iframeId);
    if (!iframe) return;
    group.querySelectorAll("[data-map-src]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var newSrc = btn.getAttribute("data-map-src");
        if (newSrc && iframe.getAttribute("src") !== newSrc) {
          iframe.setAttribute("src", newSrc);
        }
        group.querySelectorAll("[data-map-src]").forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
      });
    });
  });

  // 14. Design 01 & 04 Classic Dropdowns (Keyboard + Click + Outside Close)
  document.querySelectorAll("[data-nav-dd]").forEach(function (dd) {
    var link = dd.querySelector("a.nav-top-link");
    if (!link) return;
    link.addEventListener("click", function (ev) {
      if (window.innerWidth > 1120 && dd.querySelector(".nav-dd-menu")) {
        if (!dd.classList.contains("open")) {
          ev.preventDefault();
          document.querySelectorAll("[data-nav-dd].open").forEach(function (o) {
            o.classList.remove("open");
            var oa = o.querySelector("a.nav-top-link");
            if (oa) oa.setAttribute("aria-expanded", "false");
          });
          dd.classList.add("open");
          link.setAttribute("aria-expanded", "true");
        }
      }
    });
  });

  // 15. Design 02 Mega-Menu Toggle + Dynamic Course Image Preview
  document.querySelectorAll("[data-mega-open]").forEach(function (btn) {
    btn.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var targetId = btn.getAttribute("data-mega-open");
      var panel = document.getElementById(targetId);
      var wasOpen = panel && panel.classList.contains("open");
      document.querySelectorAll(".mega-panel.open").forEach(function (p) {
        p.classList.remove("open");
        p.setAttribute("aria-hidden", "true");
      });
      document.querySelectorAll("[data-mega-open]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
      if (panel && !wasOpen) {
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
  document.querySelectorAll("[data-mega-preview-img]").forEach(function (item) {
    function updatePreview() {
      var img = document.getElementById("megaPreviewImg");
      var ttl = document.getElementById("megaPreviewTitle");
      var note = document.getElementById("megaPreviewNote");
      var exp = document.getElementById("megaPreviewExplore");
      var syl = document.getElementById("megaPreviewSyl");
      if (img) img.src = item.getAttribute("data-mega-preview-img");
      if (ttl) ttl.textContent = item.getAttribute("data-mega-preview-title");
      if (note) note.textContent = item.getAttribute("data-mega-preview-note");
      var href = item.getAttribute("data-mega-preview-href");
      if (exp) exp.href = href;
      if (syl) syl.href = href + "#syllabus";
    }
    item.addEventListener("mouseenter", updatePreview);
    item.addEventListener("focus", updatePreview);
  });

  // 16. Design 03 Vertical Sidebar Submenu Accordions
  document.querySelectorAll("[data-sb-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var sub = document.getElementById(btn.getAttribute("data-sb-toggle"));
      if (!sub) return;
      var open = sub.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  // 17. Design 04 Smart Scroll-Hide & Condensing Header
  var smartHeader = document.getElementById("smartHeader");
  if (smartHeader) {
    var lastY = window.scrollY;
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var y = window.scrollY;
          if (y > 90) {
            smartHeader.classList.add("nav-condensed");
            if (y > lastY + 8 && y > 240) {
              smartHeader.classList.add("nav-hidden");
            } else if (y < lastY - 4) {
              smartHeader.classList.remove("nav-hidden");
            }
          } else {
            smartHeader.classList.remove("nav-condensed", "nav-hidden");
          }
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    smartHeader.addEventListener("mouseenter", function () {
      smartHeader.classList.remove("nav-hidden");
    });
  }

  // 18. Design 05 & 06 Expanding Directory Panels / Monograph Sheets
  document.querySelectorAll("[data-expand-panel]").forEach(function (btn) {
    btn.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var targetId = btn.getAttribute("data-expand-panel");
      var panel = document.getElementById(targetId);
      var wasOpen = panel && panel.classList.contains("open");
      document.querySelectorAll(".expand-drawer.open").forEach(function (p) {
        p.classList.remove("open");
        p.setAttribute("aria-hidden", "true");
      });
      document.querySelectorAll("[data-expand-panel]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
      if (panel && !wasOpen) {
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  // 19. Design 06 Expandable Curriculum Ledger Preview Toggle
  document.querySelectorAll("[data-ledger-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("data-ledger-toggle"));
      if (!target) return;
      var open = target.classList.toggle("open");
      btn.textContent = open ? "Hide Quick Syllabus" : "Quick Syllabus";
    });
  });

  // Global outside-click & Escape close for all dropdowns/mega-menus/sheets
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest("header")) {
      document.querySelectorAll(".nav-dd.open, .mega-panel.open, .expand-drawer.open").forEach(function (el) {
        el.classList.remove("open");
      });
    }
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") {
      document.querySelectorAll(".nav-dd.open, .mega-panel.open, .expand-drawer.open").forEach(function (el) {
        el.classList.remove("open");
      });
    }
  });
})();
