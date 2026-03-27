// ===================================================
// Birthday Page Scripts — Spesial Buat Anggie 🎂
// ===================================================

window.addEventListener("load", () => {
  Swal.fire({
    title: "Nyalain musiknya ya? 🎵",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Iya, mau!",
    cancelButtonText: "Nggak usah deh",
  }).then((result) => {
    if (result.isConfirmed) {
      document.querySelector(".song").play();
    }
    animationTimeline();
  });
});

const animationTimeline = () => {

  // === Split chars for individual letter animation ===
  const textBoxChars = document.getElementsByClassName("hbd-chatbox")[0];
  const hbd          = document.getElementsByClassName("wish-hbd")[0];

  textBoxChars.innerHTML = `<span>${textBoxChars.innerHTML
    .split("").join("</span><span>")}</span>`;

  hbd.innerHTML = `<span>${hbd.innerHTML
    .split("").join("</span><span>")}</span>`;

  // === Reusable transitions ===
  const fadeIn = {
    duration  : 0.7,
    opacity   : 0,
    y         : -20,
    rotationX : 5,
    skewX     : "15deg",
  };

  const fadeOut = {
    duration  : 0.7,
    opacity   : 0,
    y         : 20,
    rotationY : 5,
    skewY     : "-15deg",
  };

  // Slide in dari bawah
  const slideUp = {
    duration : 0.8,
    autoAlpha: 0,
    y        : 40,
    ease     : "power2.out",
  };

  // Slide out ke atas
  const slideUpOut = {
    duration : 0.6,
    autoAlpha: 0,
    y        : -40,
    ease     : "power2.in",
  };

  // === Counter object untuk maafan ===
  const countObj = { aldo: 0, gigiek: 0 };

  // === Main Timeline ===
  const tl = gsap.timeline();

  tl

  // ─────────────────────────────────────────────────────────
  //  SECTION 1 — Greeting: "Hi Anggie"
  // ─────────────────────────────────────────────────────────
  .to(".container", { duration: 0.6, visibility: "visible" })
  .from(".one",  { duration: 0.7, opacity: 0, y: 10 })
  .from(".two",  { duration: 0.4, opacity: 0, y: 10 })
  .to(".one",    { duration: 0.7, opacity: 0, y: 10 }, "+=3.5")
  .to(".two",    { duration: 0.7, opacity: 0, y: 10 }, "-=0.7")

  // ─────────────────────────────────────────────────────────
  //  SECTION 2 — "Hari ini ulang tahun kamu!!"
  // ─────────────────────────────────────────────────────────
  .from(".three", { duration: 0.7, opacity: 0, y: 10 })
  .to(".three",   { duration: 0.7, opacity: 0, y: 10 }, "+=3")

  // ─────────────────────────────────────────────────────────
  //  SECTION 3 — Chat Box
  // ─────────────────────────────────────────────────────────
  .from(".four",     { duration: 0.7, scale: 0.2, opacity: 0 })
  .from(".fake-btn", { duration: 0.3, scale: 0.2, opacity: 0 })
  .to(".hbd-chatbox span", {
    duration  : 1.5,
    visibility: "visible",
    stagger   : 0.05,
  })
  .to(".fake-btn", {
    duration        : 0.1,
    backgroundColor : "rgb(127, 206, 248)",
  }, "+=4")
  .to(".four", {
    duration : 0.5,
    scale    : 0.2,
    opacity  : 0,
    y        : -150,
  }, "+=1")

  // ─────────────────────────────────────────────────────────
  //  SECTION 4 — Idea Sequence (idea-1 to idea-6)
  // ─────────────────────────────────────────────────────────
  .from(".idea-1", fadeIn)
  .to(".idea-1",   fadeOut, "+=2.5")
  .from(".idea-2", fadeIn)
  .to(".idea-2",   fadeOut, "+=2.5")
  .from(".idea-3", fadeIn)
  .to(".idea-3 strong", {
    duration        : 0.5,
    scale           : 1.1,
    x               : 10,
    backgroundColor : "rgb(21, 161, 237)",
    color           : "#fff",
  })
  .to(".idea-3",   fadeOut, "+=2.5")
  .from(".idea-4", fadeIn)
  .to(".idea-4",   fadeOut, "+=2.5")
  .from(".idea-5", {
    duration  : 0.7,
    rotationX : 15,
    rotationZ : -10,
    skewY     : "-5deg",
    y         : 50,
    z         : 10,
    opacity   : 0,
  }, "+=1.5")
  .to(".idea-5 span", { duration: 0.7, rotation: 90, x: 8 }, "+=1.4")
  .to(".idea-5",      { duration: 0.7, scale: 0.2, opacity: 0 }, "+=2")
  .from(".idea-6 span", {
    duration : 0.8,
    scale    : 3,
    opacity  : 0,
    rotation : 15,
    ease     : "expo.out",
    stagger  : 0.2,
  })
  .to(".idea-6 span", {
    duration : 0.8,
    scale    : 3,
    opacity  : 0,
    rotation : -15,
    ease     : "expo.out",
    stagger  : 0.2,
  }, "+=1.5")

  // ─────────────────────────────────────────────────────────
  //  SECTION 5 — Gift Story
  //  Cardigan → TWS → Silverqueen & Oreo
  // ─────────────────────────────────────────────────────────
  .to(".gift-story", { duration: 0.3, visibility: "visible" })

  // Cardigan
  .from(".gift-1", { ...fadeIn })
  .from(".gift-2", { ...fadeIn, duration: 0.6 }, "+=0.2")
  .to(".gift-1",   { ...fadeOut, duration: 0.5 }, "+=3")
  .to(".gift-2",   { ...fadeOut, duration: 0.5 }, "-=0.3")

  // TWS
  .from(".gift-3", { ...fadeIn })
  .from(".gift-4", { ...fadeIn, duration: 0.6 }, "+=0.2")
  .to(".gift-3",   { ...fadeOut, duration: 0.5 }, "+=3.5")
  .to(".gift-4",   { ...fadeOut, duration: 0.5 }, "-=0.3")

  // Silverqueen & Oreo
  .from(".gift-5", { ...fadeIn })
  .from(".gift-6", { ...fadeIn, duration: 0.6 }, "+=0.2")
  .to(".gift-5",   { ...fadeOut, duration: 0.5 }, "+=2.5")
  .to(".gift-6",   { ...fadeOut, duration: 0.5 }, "-=0.3")

  // ─────────────────────────────────────────────────────────
  //  SECTION 6 — Full Screen Photo Scroll
  //  FIX: pakai autoAlpha langsung, tanpa .call() supaya tidak ada jeda/lag
  // ─────────────────────────────────────────────────────────
  .to("#fullscreenScroll", { duration: 0.6, autoAlpha: 1 })
  .to("#scrollTrack",      { duration: 13,  y: "-900vh", ease: "none" })
  .to("#fullscreenScroll", { duration: 0.8, autoAlpha: 0 })
  // Reset scroll position setelah tersembunyi
  .set("#scrollTrack", { y: 0 })

  // ─────────────────────────────────────────────────────────
  //  SECTION 7 — Balloons + Profile Photo + HBD Title
  // ─────────────────────────────────────────────────────────
  .fromTo(".ballons img",
    { opacity: 0.9, y: 1400 },
    { duration: 2.5, opacity: 1, y: -1000, stagger: 0.2 }
  )
  .from(".profile-picture", {
    duration  : 0.5,
    scale     : 3.5,
    opacity   : 0,
    x         : 25,
    y         : -25,
    rotationZ : -45,
  }, "-=2")
  .from(".hat", {
    duration : 0.5,
    x        : -100,
    y        : 350,
    rotation : -180,
    opacity  : 0,
  })
  .from(".wish-name", { duration: 0.4, opacity: 0, y: 10 })
  .from(".wish-hbd span", {
    duration : 0.7,
    opacity  : 0,
    y        : -50,
    rotation : 150,
    skewX    : "30deg",
    ease     : "elastic.out(1, 0.5)",
    stagger  : 0.1,
  })
  .fromTo(".wish-hbd span",
    { scale: 1.4, rotationY: 150 },
    {
      duration  : 0.7,
      scale     : 1,
      rotationY : 0,
      color     : "#ff69b4",
      ease      : "expo.out",
      stagger   : 0.1,
    },
    "party"
  )

  // ─────────────────────────────────────────────────────────
  //  SECTION 7b — Wish Slides (masing-masing slide masuk satu-satu)
  // ─────────────────────────────────────────────────────────

  // Slide 1: Ucapan HBD
  .to("#wish-1",  slideUp,    "+=1")
  .to("#wish-1",  slideUpOut, "+=3")

  // Slide 2: Cardigan
  .to("#wish-2",  slideUp)
  .to("#wish-2",  slideUpOut, "+=3.5")

  // Slide 3: TWS
  .to("#wish-3",  slideUp)
  .to("#wish-3",  slideUpOut, "+=3.5")

  // Slide 4: Doa
  .to("#wish-4",  slideUp)
  .to("#wish-4",  slideUpOut, "+=3.5")

  // Slide 5: Penutup
  .to("#wish-5",  slideUp)
  .to("#wish-5",  slideUpOut, "+=3.5")

  // ─────────────────────────────────────────────────────────
  //  SECTION 8 — Burst Effect
  // ─────────────────────────────────────────────────────────
  .to(".eight svg", {
    duration    : 1.5,
    visibility  : "visible",
    opacity     : 0,
    scale       : 80,
    repeat      : 3,
    repeatDelay : 1.4,
    stagger     : 0.3,
  })
  .to(".six", {
    duration : 0.5,
    opacity  : 0,
    y        : 30,
    zIndex   : -1,
  })

  // ─────────────────────────────────────────────────────────
  //  SECTION 9 — Maafan Stats
  //  FIX: pakai autoAlpha supaya tidak ada visibility bug
  // ─────────────────────────────────────────────────────────
  .to(".stats-container", { duration: 0.6, autoAlpha: 1 })
  .to(countObj, {
    duration : 3,
    aldo     : 212,
    gigiek   : 93,
    ease     : "power1.out",
    onUpdate() {
      document.getElementById("count-aldo").textContent
        = Math.floor(countObj.aldo);
      document.getElementById("count-gigiek").textContent
        = Math.floor(countObj.gigiek);
      document.getElementById("bar-aldo").style.width
        = (countObj.aldo / 212 * 100).toFixed(1) + "%";
      document.getElementById("bar-gigiek").style.width
        = (countObj.gigiek / 212 * 100).toFixed(1) + "%";
    },
  })
  .to(".stats-container", { duration: 0.8, autoAlpha: 0 }, "+=2.5")

  // ─────────────────────────────────────────────────────────
  //  SECTION 10 — Ending
  // ─────────────────────────────────────────────────────────
  .from(".nine p", { duration: 1, ...fadeIn, stagger: 1.2 })
  .to(".last-smile", { duration: 0.5, rotation: 90 }, "+=1");


  // ─────────────────────────────────────────────────────────
  //  REPLAY BUTTON — Reset semua state & mulai ulang
  // ─────────────────────────────────────────────────────────
  document.getElementById("replay").addEventListener("click", () => {
    // Reset counter angka
    countObj.aldo   = 0;
    countObj.gigiek = 0;
    document.getElementById("count-aldo").textContent   = "0";
    document.getElementById("count-gigiek").textContent = "0";
    document.getElementById("bar-aldo").style.width     = "0%";
    document.getElementById("bar-gigiek").style.width   = "0%";

    // Reset scroll foto
    gsap.set("#scrollTrack",      { y: 0 });
    gsap.set("#fullscreenScroll", { autoAlpha: 0 });

    // Reset wish slides
    gsap.set(".wish-slide", { autoAlpha: 0, y: 40 });

    tl.restart();
  });

};
