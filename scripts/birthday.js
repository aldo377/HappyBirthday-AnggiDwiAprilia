window.addEventListener("load", () => {
  Swal.fire({
    title: "Nyalain musiknya ya sayang?",
    icon: "heart",
    showCancelButton: true,
    confirmButtonText: "Iya, mau!",
    cancelButtonText: "Gak usah",
  }).then((result) => {
    if (result.isConfirmed) document.querySelector(".song").play();
    startAnimation();
  });
});

function startAnimation() {
  const tl = gsap.timeline();

  tl.to(".container", { visibility: "visible" })
    .from(".one", { opacity: 0, y: 20, duration: 1 })
    .to(".one", { opacity: 0, y: -20, delay: 3 })
    
    // Scene Kado
    .to(".gift-story", { display: "block" })
    .from(".gift-story p", { opacity: 0, y: 20, stagger: 2 })
    .to(".gift-story", { opacity: 0, delay: 2 })

    // Scene Portal SNBP (Biru)
    .to("#portal", { display: "flex", backgroundColor: "#003366" })
    .to("#portal-title", { text: "SELAMAT! ANDA DINYATAKAN LOLOS..." })
    .to("#portal-msg", { text: "Lolos jadi yang tercantik di hati aku selamanya." })
    .to("#portal", { opacity: 0, delay: 3, display: "none" })

    // Scene Portal UTBK (Merah)
    .to("#portal", { display: "flex", backgroundColor: "#b30000", opacity: 1 })
    .to("#portal-title", { text: "SEMANGAT UTBK 2026!" })
    .to("#portal-msg", { text: "Mau merah atau biru, Allah pasti kasih yang terbaik buat kamu." })
    .to("#portal", { opacity: 0, delay: 3, display: "none" })

    // Full Screen Scroll Foto
    .to(".full-screen-scroll", { display: "block", opacity: 1 })
    .to(".scroll-track", { y: "-900vh", duration: 15, ease: "none" })
    .to(".full-screen-scroll", { opacity: 0, display: "none" })

    // Final Wish
    .from(".six", { opacity: 0, scale: 0.8 })
    .to(".six", { opacity: 0, delay: 5, display: "none" })

    // Animasi Maafan (Data Aldo & Gigiek)
    .to(".stats-container", { display: "block", opacity: 1 })
    .to({}, { 
      duration: 2, 
      onUpdate: function() {
        const progress = this.progress();
        const aldoVal = Math.floor(progress * 212);
        const gigiekVal = Math.floor(progress * 93);
        document.getElementById("count-aldo").innerText = aldoVal + "+";
        document.getElementById("count-gigiek").innerText = "~" + gigiekVal;
        document.getElementById("bar-aldo").style.width = (progress * 100) + "%";
        document.getElementById("bar-gigiek").style.width = (progress * 44) + "%"; // Skala relatif
      }
    })

    .from(".nine", { opacity: 0, y: 20 });

  document.getElementById("replay").addEventListener("click", () => tl.restart());
}
