/* =========================================================================================
   👑 KING VEO V3 - ULTIMATE FLAPPY BIRD ENGINE (GOD MODE EDITION)
   =========================================================================================
   - Ditulis ulang dengan struktur kelas studio game
   - Tambahan Sistem Partikel DOM, Siklus Siang-Malam, dan Audio Manager
   - Peringatan: Kode ini sangat panjang karena menggunakan efek visual tingkat lanjut!
   ========================================================================================= */

var debugmode = false;

// -----------------------------------------------------------------------------------------
// 1. STATE MACHINE (PENGATUR STATUS GAME)
// -----------------------------------------------------------------------------------------
var states = Object.freeze({
   SplashScreen: 0,
   GameScreen: 1,
   ScoreScreen: 2,
   WelcomeScreen: 3
});
var currentstate;

// -----------------------------------------------------------------------------------------
// 2. PHYSICS ENGINE & VARIABEL GLOBAL
// -----------------------------------------------------------------------------------------
var gravity = 0.25;      // Daya tarik bumi
var velocity = 0;        // Kecepatan jatuh
var position = 180;      // Posisi Y awal burung
var rotation = 0;        // Rotasi burung saat menukik/naik
var jump = -4.6;         // Kekuatan lompatan
var flyArea = 420;       // Batas tanah (Ground)

var score = 0;
var highscore = 0;

// Pengaturan Pipa (Lebih Lebar Biar Gampang)
var pipeheight = 160;    // Jarak celah atas dan bawah
var pipewidth = 52;
var pipes = new Array();

var replayclickable = false;
var loopGameloop;
var loopPipeloop;

// -----------------------------------------------------------------------------------------
// 3. RESPONSIVE SCALING (AUTO-FIT LAYAR HP)
// -----------------------------------------------------------------------------------------
var gameScale = 1;
function scaleGame() {
   var gameW = 320;
   var gameH = 568;
   var scaleX = window.innerWidth  / gameW;
   var scaleY = window.innerHeight / gameH;
   gameScale = Math.min(scaleX, scaleY);
   var container = document.getElementById('gamecontainer');
   if (container) {
      container.style.transform = 'scale(' + gameScale + ')';
   }
}

// -----------------------------------------------------------------------------------------
// 4. ULTIMATE AUDIO MANAGER (BGM & SFX)
// -----------------------------------------------------------------------------------------
var volume = 40;

// Sound Effects Bawaan
var soundJump   = new buzz.sound("assets/sounds/sfx_wing.ogg");
var soundScore  = new buzz.sound("assets/sounds/sfx_point.ogg");
var soundHit    = new buzz.sound("assets/sounds/sfx_hit.ogg");
var soundDie    = new buzz.sound("assets/sounds/sfx_die.ogg");
var soundSwoosh = new buzz.sound("assets/sounds/sfx_swooshing.ogg");

// BGM (Background Music) - MENGGUNAKAN LAGU OPENING
var bgmMusic    = new buzz.sound("music/opening.mp3", { loop: true });

buzz.all().setVolume(volume);

function playBGM() {
    bgmMusic.setVolume(20); // Volume lagu latar dikecilin dikit biar gak nutupin SFX
    bgmMusic.play();
}

function stopBGM() {
    bgmMusic.stop();
}

// -----------------------------------------------------------------------------------------
// 5. VISUAL EFFECTS ENGINE (PARTIKEL, SHAKE, DAY/NIGHT CYCLE)
// -----------------------------------------------------------------------------------------

// A. Efek Asap saat Lompat (Jump Puff)
function spawnPuff() {
    var player = $("#player");
    var pTop = player.position().top;
    var pLeft = player.position().left;

    var puff = $('<div class="jump-puff"></div>').css({
        position: 'absolute',
        top: pTop + 10 + 'px',
        left: pLeft - 10 + 'px',
        width: '15px', height: '15px',
        background: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 5
    });

    $("#flyarea").append(puff);

    puff.transition({
        x: '-20px', y: '10px',
        scale: 2, opacity: 0
    }, 400, 'linear', function() {
        $(this).remove();
    });
}

// B. Efek Teks Melayang (+1) saat Cetak Skor
function spawnFloatingScore() {
    var floatText = $('<div class="float-score">+1</div>').css({
        position: 'absolute',
        top: '200px', left: '50%',
        transform: 'translateX(-50%)',
        color: '#ffc107', fontSize: '24px',
        fontWeight: '900', textShadow: '2px 2px 0px #000',
        pointerEvents: 'none', zIndex: 100
    });

    $("#flyarea").append(floatText);

    floatText.transition({
        y: '-50px', opacity: 0, scale: 1.5
    }, 800, 'easeOutSine', function() {
        $(this).remove();
    });
}

// C. Efek Getar Layar (Screen Shake) saat Nabrak
function shakeScreen() {
    var gameBox = $("#gamecontainer");
    gameBox.transition({ x: '-10px', y: '5px' }, 50)
           .transition({ x: '10px', y: '-5px' }, 50)
           .transition({ x: '-10px', y: '5px' }, 50)
           .transition({ x: '10px', y: '-5px' }, 50)
           .transition({ x: '0px', y: '0px' }, 50);
}

// D. Siklus Siang-Malam (Warna Langit Berubah Berdasarkan Skor)
function updateSkyColor() {
    var sky = $("#sky");
    if (score < 5) {
        sky.css('background-color', '#71c5cf'); // Siang Biru
    } else if (score < 10) {
        sky.css('background-color', '#ff9a9e'); // Sore Pink
    } else if (score < 15) {
        sky.css('background-color', '#4a69bd'); // Maghrib Biru Gelap
    } else {
        sky.css('background-color', '#1e272e'); // Malam Hitam
    }
    sky.css('transition', 'background-color 2s ease');
}

// -----------------------------------------------------------------------------------------
// 6. INISIALISASI AWAL (SAAT HALAMAN DIMUAT)
// -----------------------------------------------------------------------------------------
$(document).ready(function() {
   if (window.location.search == "?debug") debugmode = true;
   if (window.location.search == "?easy")  pipeheight = 220;

   scaleGame();
   $(window).on('resize orientationchange', scaleGame);

   var savedscore = getCookie("highscore");
   if (savedscore != "") highscore = parseInt(savedscore);

   // Tampilkan layar sambutan
   showWelcome();
});

function showWelcome() {
   currentstate = states.WelcomeScreen;
   $('#welcomeOverlay').fadeIn(700);
}

function dismissWelcome() {
   if (currentstate !== states.WelcomeScreen) return;
   $('#welcomeOverlay').fadeOut(400, function() {
      showSplash();
   });
}

// -----------------------------------------------------------------------------------------
// 7. MANAJEMEN COOKIE (SIMPAN SKOR TERTINGGI)
// -----------------------------------------------------------------------------------------
function getCookie(cname) {
   var name = cname + "=";
   var ca = document.cookie.split(';');
   for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
   }
   return "";
}

function setCookie(cname, cvalue, exdays) {
   var d = new Date();
   d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
   document.cookie = cname + "=" + cvalue + "; expires=" + d.toGMTString();
}

// -----------------------------------------------------------------------------------------
// 8. SPLASH SCREEN & MEMULAI GAME
// -----------------------------------------------------------------------------------------
function showSplash() {
   currentstate = states.SplashScreen;
   velocity = 0;
   position = 180;
   rotation = 0;
   score    = 0;

   $("#player").css({ y: 0, x: 0 });
   updatePlayer($("#player"));
   updateSkyColor(); // Reset langit ke siang

   soundSwoosh.stop();
   soundSwoosh.play();

   $(".pipe").remove();
   pipes = new Array();

   $(".animated").css('animation-play-state', 'running');
   $(".animated").css('-webkit-animation-play-state', 'running');

   $("#splash").transition({ opacity: 1 }, 2000, 'ease');
}

function startGame() {
   currentstate = states.GameScreen;

   $("#splash").stop();
   $("#splash").transition({ opacity: 0 }, 500, 'ease');

   setBigScore();
   
   // PUTAR LAGU BGM SAAT GAME MULAI
   playBGM();

   if (debugmode) $(".boundingbox").show();

   var updaterate = 1000.0 / 60.0; // 60 FPS
   loopGameloop = setInterval(gameloop, updaterate);
   loopPipeloop = setInterval(updatePipes, 1400);

   playerJump();
}

function updatePlayer(player) {
   // Fisika Rotasi Burung
   rotation = Math.min((velocity / 10) * 90, 90);
   $(player).css({ rotate: rotation, top: position });
}

// -----------------------------------------------------------------------------------------
// 9. GAME ENGINE LOOP (HITBOX & FISIKA INTI)
// -----------------------------------------------------------------------------------------
function gameloop() {
   var player = $("#player");

   // Gravitasi menarik burung ke bawah
   velocity += gravity;
   position += velocity;

   updatePlayer(player);

   var origWidth  = 34.0;
   var origHeight = 24.0;

   // Hitung Bounding Box (Kotak Tabrakan) berdasarkan rotasi
   var boxWidth  = origWidth - (Math.sin(Math.abs(rotation) / 90) * 8);
   var boxHeight = origHeight;

   var playerLeft = 60;
   var boxLeft    = playerLeft + (origWidth  - boxWidth)  / 2;
   var boxTop     = position   + (origHeight - boxHeight) / 2;
   var boxRight   = boxLeft  + boxWidth;
   var boxBottom  = boxTop   + boxHeight;

   // 1. CEK MATI: Jatuh ke tanah
   if (boxBottom >= flyArea) { playerDead(); return; }
   
   // 2. CEK MENTOK ATAP: Tahan di atas agar tidak hilang
   if (boxTop <= -16) position = 0;
   
   if (pipes[0] == null) return;

   var nextpipe      = pipes[0];
   var nextpipeupper = nextpipe.children(".pipe_upper");

   var pipetop    = nextpipeupper.height();
   var pipeleft   = parseInt(nextpipe.css('left'));
   var piperight  = pipeleft + pipewidth;
   var pipebottom = pipetop  + pipeheight;

   if (debugmode) {
      $("#pipebox").css({ left: pipeleft, top: pipetop, height: pipeheight, width: pipewidth });
      $("#playerbox").css({ left: boxLeft, top: boxTop, height: boxHeight, width: boxWidth });
   }

   // 3. CEK MATI: Nabrak Pipa
   if (boxRight > pipeleft) {
      if (boxTop > pipetop && boxBottom < pipebottom) {
         // Lolos (Berada di dalam gap)
      } else {
         playerDead(); return;
      }
   }

   // 4. CEK SKOR: Berhasil melewati pipa
   if (boxLeft > piperight) {
      pipes.splice(0, 1);
      playerScore();
   }
}

// -----------------------------------------------------------------------------------------
// 10. KONTROL INPUT (SENTUH, KLIK, SPASI)
// -----------------------------------------------------------------------------------------
$(document).keydown(function(e) {
   if (e.keyCode == 32) { // Tombol Spasi
      if      (currentstate == states.WelcomeScreen) dismissWelcome();
      else if (currentstate == states.ScoreScreen)   $("#replay").click();
      else                                            screenClick();
   }
});

// Penanganan Sentuhan Layar atau Mouse Klik
if ("ontouchstart" in window) {
   $(document).on("touchstart", function() {
      if      (currentstate == states.WelcomeScreen) dismissWelcome();
      else                                            screenClick();
   });
} else {
   $(document).on("mousedown", function() {
      if      (currentstate == states.WelcomeScreen) dismissWelcome();
      else                                            screenClick();
   });
}

function screenClick() {
   if      (currentstate == states.GameScreen)   playerJump();
   else if (currentstate == states.SplashScreen) startGame();
}

function playerJump() {
   velocity = jump;
   soundJump.stop();
   soundJump.play();
   spawnPuff(); // Mengeluarkan efek asap tiap lompat
}

// -----------------------------------------------------------------------------------------
// 11. SISTEM SKOR & MEDALI
// -----------------------------------------------------------------------------------------
function setBigScore(erase) {
   var elemscore = $("#bigscore");
   elemscore.empty();
   if (erase) return;
   var digits = score.toString().split('');
   for (var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_big_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setSmallScore() {
   var elemscore = $("#currentscore");
   elemscore.empty();
   var digits = score.toString().split('');
   for (var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setHighScore() {
   var elemscore = $("#highscore");
   elemscore.empty();
   var digits = highscore.toString().split('');
   for (var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setMedal() {
   var elemmedal = $("#medal");
   elemmedal.empty();
   if (score < 1) return false;
   var medal = "bronze";
   if (score >= 5) medal = "silver";
   if (score >= 10) medal = "gold";
   if (score >= 15) medal = "platinum";
   elemmedal.append('<img src="assets/medal_' + medal + '.png" alt="' + medal + '">');
   return true;
}

// -----------------------------------------------------------------------------------------
// 12. PENGELOLAAN SKOR BERTAMBAH & CEK KEMENANGAN (20 POIN)
// -----------------------------------------------------------------------------------------
function playerScore() {
   score += 1;
   soundScore.stop();
   soundScore.play();
   
   setBigScore();
   spawnFloatingScore(); // Munculkan teks +1 melayang
   updateSkyColor();     // Ubah warna langit secara dinamis

   // Animasi Mentul pada Big Score
   $("#bigscore").css({ scale: 1.4 }).transition({ scale: 1 }, 300, 'ease');

   // LOGIKA KEMENANGAN: Tembus Skor 20
   if (score >= 20) {
      playerWin();
   }
}

// -----------------------------------------------------------------------------------------
// 13. KONDISI MENANG & KALAH
// -----------------------------------------------------------------------------------------
function playerWin() {
   clearInterval(loopGameloop);
   clearInterval(loopPipeloop);
   loopGameloop = null;
   loopPipeloop = null;

   stopBGM(); // Matikan lagu saat menang

   $(".animated").css('animation-play-state', 'paused');
   $(".animated").css('-webkit-animation-play-state', 'paused');

   currentstate = states.ScoreScreen;

   if (score > highscore) {
      highscore = score;
      setCookie("highscore", highscore, 999);
   }

   // EFEK GELO: Layar Kedip Putih Terang
   $("body").append('<div id="flash-win" style="position:fixed; top:0; left:0; width:100%; height:100%; background:#fff; z-index:99998;"></div>');
   $("#flash-win").fadeOut(1500, function(){ $(this).remove(); });

   // Tampilkan Pop Up Clue Username
   $('#winOverlay').css('display', 'flex').hide().fadeIn(500);
}

function playerDead() {
   $(".animated").css('animation-play-state', 'paused');
   $(".animated").css('-webkit-animation-play-state', 'paused');

   stopBGM(); // Matikan BGM saat mati

   // Animasi burung jatuh menukik
   var playerbottom = $("#player").position().top + $("#player").width();
   var movey = Math.max(0, flyArea - playerbottom);
   $("#player").transition({ y: movey + 'px', rotate: 90 }, 1000, 'easeInOutCubic');

   currentstate = states.ScoreScreen;

   clearInterval(loopGameloop);
   clearInterval(loopPipeloop);
   loopGameloop = null;
   loopPipeloop = null;

   // EFEK GELO: Layar Bergetar & Berkedip Merah
   shakeScreen();
   $("body").append('<div id="flash-dead" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255, 71, 87, 0.6); z-index:99999; pointer-events: none;"></div>');
   $("#flash-dead").fadeOut(400, function(){ $(this).remove(); });

   if (isIncompatible.any()) {
      showScore();
   } else {
      soundHit.play().bindOnce("ended", function() {
         soundDie.play().bindOnce("ended", function() {
            showScore();
         });
      });
   }
}

// -----------------------------------------------------------------------------------------
// 14. LAYAR SCORE & REPLAY
// -----------------------------------------------------------------------------------------
function showScore() {
   $("#scoreboard").css("display", "block");
   setBigScore(true);

   if (score > highscore) {
      highscore = score;
      setCookie("highscore", highscore, 999);
   }

   setSmallScore();
   setHighScore();
   var wonmedal = setMedal();

   soundSwoosh.stop();
   soundSwoosh.play();

   $("#scoreboard").css({ y: '40px', opacity: 0 });
   $("#replay").css({ y: '40px', opacity: 0 });
   $("#scoreboard").transition({ y: '0px', opacity: 1 }, 600, 'ease', function() {
      soundSwoosh.stop();
      soundSwoosh.play();
      $("#replay").transition({ y: '0px', opacity: 1 }, 600, 'ease');
      if (wonmedal) {
         $("#medal").css({ scale: 2, opacity: 0 });
         $("#medal").transition({ opacity: 1, scale: 1 }, 1200, 'ease');
      }
   });

   replayclickable = true;
}

$("#replay").click(function() {
   if (!replayclickable) return;
   replayclickable = false;

   soundSwoosh.stop();
   soundSwoosh.play();

   $("#scoreboard").transition({ y: '-40px', opacity: 0 }, 1000, 'ease', function() {
      $("#scoreboard").css("display", "none");
      showSplash();
   });
});

// -----------------------------------------------------------------------------------------
// 15. PENGELOLAAN MUNCULNYA PIPA SECARA ACAK
// -----------------------------------------------------------------------------------------
function updatePipes() {
   // Hapus pipa yang sudah keluar layar kiri
   $(".pipe").filter(function() {
      return parseInt($(this).css('left')) <= -100;
   }).remove();

   var padding      = 80;
   var constraint   = flyArea - pipeheight - (padding * 2);
   var topheight    = Math.floor((Math.random() * constraint) + padding);
   var bottomheight = (flyArea - pipeheight) - topheight;

   // Buat elemen pipa baru
   var newpipe = $(
      '<div class="pipe animated">' +
         '<div class="pipe_upper" style="height: ' + topheight + 'px;"></div>' +
         '<div class="pipe_lower" style="height: ' + bottomheight + 'px;"></div>' +
      '</div>'
   );
   $("#flyarea").append(newpipe);
   pipes.push(newpipe);
}

// -----------------------------------------------------------------------------------------
// 16. BROWSER COMPATIBILITY CHECKER
// -----------------------------------------------------------------------------------------
var isIncompatible = {
   Android:    function() { return navigator.userAgent.match(/Android/i); },
   BlackBerry: function() { return navigator.userAgent.match(/BlackBerry/i); },
   iOS:        function() { return navigator.userAgent.match(/iPhone|iPad|iPod/i); },
   Opera:      function() { return navigator.userAgent.match(/Opera Mini/i); },
   Safari:     function() {
      return (navigator.userAgent.match(/OS X.*Safari/) && !navigator.userAgent.match(/Chrome/));
   },
   Windows:    function() { return navigator.userAgent.match(/IEMobile/i); },
   any:        function() {
      return (isIncompatible.Android()    || isIncompatible.BlackBerry() ||
              isIncompatible.iOS()        || isIncompatible.Opera()      ||
              isIncompatible.Safari()     || isIncompatible.Windows());
   }
};

/* ========================== AKHIR DARI KODE ENGINE ========================== */
