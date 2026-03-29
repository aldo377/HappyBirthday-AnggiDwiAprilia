var debugmode = false;

var states = Object.freeze({
   SplashScreen: 0,
   GameScreen: 1,
   ScoreScreen: 2
});

var currentstate;

var gravity = 0.25;
var velocity = 0;
var position = 180;
var rotation = 0;
var jump = -4.6;

// Tinggi area terbang (harus sama dengan #flyarea height di CSS = 420px)
var flyArea = 420;

var score = 0;
var highscore = 0;

var pipeheight = 90;
var pipewidth = 52;
var pipes = new Array();

var replayclickable = false;

// =============================================
// RESPONSIVE SCALING
// Game dirancang untuk 320×568px.
// Fungsi ini men-scale game agar memenuhi layar.
// =============================================
var gameScale = 1;

function scaleGame() {
   var gameW = 320;
   var gameH = 568;

   // Hitung skala agar muat di layar tanpa memotong
   var scaleX = window.innerWidth  / gameW;
   var scaleY = window.innerHeight / gameH;
   gameScale = Math.min(scaleX, scaleY);

   var container = document.getElementById('gamecontainer');
   if (container) {
      container.style.transform = 'scale(' + gameScale + ')';
   }
}

// =============================================
// SOUNDS
// =============================================
var volume = 30;
var soundJump   = new buzz.sound("assets/sounds/sfx_wing.ogg");
var soundScore  = new buzz.sound("assets/sounds/sfx_point.ogg");
var soundHit    = new buzz.sound("assets/sounds/sfx_hit.ogg");
var soundDie    = new buzz.sound("assets/sounds/sfx_die.ogg");
var soundSwoosh = new buzz.sound("assets/sounds/sfx_swooshing.ogg");
buzz.all().setVolume(volume);

// =============================================
// GAME LOOPS
// =============================================
var loopGameloop;
var loopPipeloop;

// =============================================
// INIT
// =============================================
$(document).ready(function() {
   if (window.location.search == "?debug")
      debugmode = true;
   if (window.location.search == "?easy")
      pipeheight = 200;

   // Scale saat load pertama dan setiap resize
   scaleGame();
   $(window).on('resize orientationchange', function() {
      scaleGame();
   });

   // Ambil highscore dari cookie
   var savedscore = getCookie("highscore");
   if (savedscore != "")
      highscore = parseInt(savedscore);

   showSplash();
});

// =============================================
// COOKIE HELPERS
// =============================================
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
   var expires = "expires=" + d.toGMTString();
   document.cookie = cname + "=" + cvalue + "; " + expires;
}

// =============================================
// GAME STATE FUNCTIONS
// =============================================
function showSplash() {
   currentstate = states.SplashScreen;

   velocity = 0;
   position = 180;
   rotation = 0;
   score = 0;

   $("#player").css({ y: 0, x: 0 });
   updatePlayer($("#player"));

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

   if (debugmode) {
      $(".boundingbox").show();
   }

   var updaterate = 1000.0 / 60.0; // 60 fps
   loopGameloop  = setInterval(gameloop, updaterate);
   loopPipeloop  = setInterval(updatePipes, 1400);

   playerJump();
}

function updatePlayer(player) {
   rotation = Math.min((velocity / 10) * 90, 90);
   $(player).css({ rotate: rotation, top: position });
}

// =============================================
// GAME LOOP — Collision detection menggunakan
// koordinat game (relatif terhadap #flyarea),
// BUKAN koordinat layar (getBoundingClientRect).
// Ini penting agar tidak kacau saat game di-scale.
// =============================================
function gameloop() {
   var player = $("#player");

   // Update fisika
   velocity += gravity;
   position += velocity;

   updatePlayer(player);

   // ---- Hitung bounding box burung (dalam koordinat game) ----
   var origWidth  = 34.0; // lebar burung dari CSS
   var origHeight = 24.0; // tinggi burung dari CSS

   // Lebar bounding box menyempit saat miring
   var boxWidth  = origWidth - (Math.sin(Math.abs(rotation) / 90) * 8);
   var boxHeight = origHeight;

   // Posisi burung dari CSS: left: 60px (tetap), top: position (dinamis)
   var playerLeft = 60;
   var boxLeft   = playerLeft + (origWidth  - boxWidth)  / 2;
   var boxTop    = position   + (origHeight - boxHeight) / 2; // = position
   var boxRight  = boxLeft  + boxWidth;
   var boxBottom = boxTop   + boxHeight;

   // ---- Cek tabrakan dengan tanah ----
   // flyArea = 420px = batas bawah area terbang
   if (boxBottom >= flyArea) {
      playerDead();
      return;
   }

   // ---- Cek tabrakan dengan langit-langit ----
   // ceiling setinggi 16px, berada 16px di atas flyarea
   if (boxTop <= -16) {
      position = 0;
   }

   // Tidak ada pipa? Keluar dulu
   if (pipes[0] == null) return;

   // ---- Hitung posisi pipa (dalam koordinat game, relatif #flyarea) ----
   var nextpipe      = pipes[0];
   var nextpipeupper = nextpipe.children(".pipe_upper");

   // upper pipe height = jarak dari atas flyarea ke celah
   var pipetop    = nextpipeupper.height();
   // left pipa dari parent (#flyarea) — CSS animation update .left secara langsung
   var pipeleft   = parseInt(nextpipe.css('left'));
   var piperight  = pipeleft + pipewidth;
   var pipebottom = pipetop  + pipeheight;

   // Debug boxes (hanya jika ?debug di URL)
   if (debugmode) {
      $("#pipebox").css({
         left: pipeleft, top: pipetop,
         height: pipeheight, width: pipewidth
      });
      $("#playerbox").css({
         left: boxLeft, top: boxTop,
         height: boxHeight, width: boxWidth
      });
   }

   // ---- Cek apakah burung sudah masuk area pipa ----
   if (boxRight > pipeleft) {
      // Apakah burung ada di celah aman?
      if (boxTop > pipetop && boxBottom < pipebottom) {
         // Aman, lewat celah!
      } else {
         // Kena pipa!
         playerDead();
         return;
      }
   }

   // ---- Cek apakah sudah melewati pipa (skor) ----
   if (boxLeft > piperight) {
      pipes.splice(0, 1);
      playerScore();
   }
}

// =============================================
// INPUT HANDLING
// =============================================
$(document).keydown(function(e) {
   if (e.keyCode == 32) {
      if (currentstate == states.ScoreScreen)
         $("#replay").click();
      else
         screenClick();
   }
});

// Dukung touch DAN mouse
$(document).on("touchstart mousedown", function(e) {
   e.preventDefault(); // Cegah double-trigger di mobile
   screenClick();
});

function screenClick() {
   if (currentstate == states.GameScreen) {
      playerJump();
   } else if (currentstate == states.SplashScreen) {
      startGame();
   }
}

function playerJump() {
   velocity = jump;
   soundJump.stop();
   soundJump.play();
}

// =============================================
// SCORE DISPLAY
// =============================================
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
   if (score < 10) return false;
   var medal = "bronze";
   if (score >= 20) medal = "silver";
   if (score >= 30) medal = "gold";
   if (score >= 40) medal = "platinum";
   elemmedal.append('<img src="assets/medal_' + medal + '.png" alt="' + medal + '">');
   return true;
}

// =============================================
// PLAYER DEAD & SCORE SCREEN
// =============================================
function playerDead() {
   $(".animated").css('animation-play-state', 'paused');
   $(".animated").css('-webkit-animation-play-state', 'paused');

   // Jatuhkan burung ke lantai (dalam koordinat game)
   var playerbottom = $("#player").position().top + $("#player").width(); // width karena rotasi 90°
   var movey = Math.max(0, flyArea - playerbottom);
   $("#player").transition({ y: movey + 'px', rotate: 90 }, 1000, 'easeInOutCubic');

   currentstate = states.ScoreScreen;

   clearInterval(loopGameloop);
   clearInterval(loopPipeloop);
   loopGameloop = null;
   loopPipeloop = null;

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

// =============================================
// SCORE
// =============================================
function playerScore() {
   score += 1;
   soundScore.stop();
   soundScore.play();
   setBigScore();
}

// =============================================
// PIPE GENERATION
// =============================================
function updatePipes() {
   // Hapus pipa yang sudah keluar layar (left <= -100)
   $(".pipe").filter(function() {
      return parseInt($(this).css('left')) <= -100;
   }).remove();

   // Buat pipa baru
   var padding      = 80; // jarak minimum dari atas/bawah
   var constraint   = flyArea - pipeheight - (padding * 2);
   var topheight    = Math.floor((Math.random() * constraint) + padding);
   var bottomheight = (flyArea - pipeheight) - topheight;

   var newpipe = $(
      '<div class="pipe animated">' +
         '<div class="pipe_upper" style="height: ' + topheight + 'px;"></div>' +
         '<div class="pipe_lower" style="height: ' + bottomheight + 'px;"></div>' +
      '</div>'
   );
   $("#flyarea").append(newpipe);
   pipes.push(newpipe);
}

// =============================================
// DETEKSI BROWSER TIDAK KOMPATIBEL
// =============================================
var isIncompatible = {
   Android:     function() { return navigator.userAgent.match(/Android/i); },
   BlackBerry:  function() { return navigator.userAgent.match(/BlackBerry/i); },
   iOS:         function() { return navigator.userAgent.match(/iPhone|iPad|iPod/i); },
   Opera:       function() { return navigator.userAgent.match(/Opera Mini/i); },
   Safari:      function() {
      return (navigator.userAgent.match(/OS X.*Safari/) && !navigator.userAgent.match(/Chrome/));
   },
   Windows:     function() { return navigator.userAgent.match(/IEMobile/i); },
   any:         function() {
      return (isIncompatible.Android() || isIncompatible.BlackBerry() ||
              isIncompatible.iOS()     || isIncompatible.Opera()       ||
              isIncompatible.Safari()  || isIncompatible.Windows());
   }
};
