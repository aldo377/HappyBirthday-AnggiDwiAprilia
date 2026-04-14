/* =========================================================================================
   👑 KING VEO V4 - ULTIMATE FLAPPY BIRD ENGINE (GOD MODE + TROLL EDITION)
   =========================================================================================
   - Fake WhatsApp Notification Injector
   - Sistem Partikel Asap & Teks Melayang
   - Day/Night Cycle & Screen Shake
   - BGM Auto-Play Manager
   ========================================================================================= */

var debugmode = false;

var states = Object.freeze({
   SplashScreen: 0,
   GameScreen: 1,
   ScoreScreen: 2,
   WelcomeScreen: 3
});
var currentstate;

// --- FISIKA GAME ---
var gravity = 0.25;      
var velocity = 0;        
var position = 180;      
var rotation = 0;        
var jump = -4.6;         
var flyArea = 420;       

var score = 0;
var highscore = 0;

// Jarak celah pipa (160 biar lebih ramah buat Anggi)
var pipeheight = 160;    
var pipewidth = 52;
var pipes = new Array();

var replayclickable = false;
var loopGameloop;
var loopPipeloop;

// --- SCALING (BIAR PAS DI SEMUA HP) ---
var gameScale = 1;
function scaleGame() {
   var gameW = 320;
   var gameH = 568;
   var scaleX = window.innerWidth  / gameW;
   var scaleY = window.innerHeight / gameH;
   gameScale = Math.min(scaleX, scaleY);
   var container = document.getElementById('gamecontainer');
   if (container) container.style.transform = 'scale(' + gameScale + ')';
}

// --- AUDIO MANAGER ---
var volume = 40;
var soundJump   = new buzz.sound("assets/sounds/sfx_wing.ogg");
var soundScore  = new buzz.sound("assets/sounds/sfx_point.ogg");
var soundHit    = new buzz.sound("assets/sounds/sfx_hit.ogg");
var soundDie    = new buzz.sound("assets/sounds/sfx_die.ogg");
var soundSwoosh = new buzz.sound("assets/sounds/sfx_swooshing.ogg");

// BGM Pakai Lagu Menang (Muter saat main)
var bgmMusic    = new buzz.sound("music/menang.mp3", { loop: true });
buzz.all().setVolume(volume);

function playBGM() {
    bgmMusic.setVolume(50);
    bgmMusic.play();
}
function stopBGM() {
    bgmMusic.stop();
}

// =========================================================================================
// FITUR TROLL: FAKE WHATSAPP NOTIFICATION
// =========================================================================================
function injectFakeWA() {
    var waHtml = `
    <div id="fake-wa" style="position:fixed; top:-120px; left:50%; transform:translateX(-50%); width:90%; max-width:350px; background:rgba(255,255,255,0.95); backdrop-filter:blur(10px); border-radius:15px; box-shadow:0 10px 25px rgba(0,0,0,0.2); display:flex; align-items:center; padding:12px 15px; z-index:9999999; transition:top 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
       <div style="width:45px; height:45px; background:#25D366; border-radius:50%; display:flex; justify-content:center; align-items:center; margin-right:12px; font-size:24px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1);">👦🏻</div>
       <div style="flex:1;">
          <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
             <span style="font-family:'Segoe UI', sans-serif; font-weight:700; font-size:14px; color:#111;">Orang Ganteng ❤️</span>
             <span style="font-family:'Segoe UI', sans-serif; font-size:11px; color:#888;">Sekarang</span>
          </div>
          <div style="font-family:'Segoe UI', sans-serif; font-size:13px; color:#444; line-height:1.3; font-weight: 500;">Semangat sayang mainnya! Jangan cemberut gitu mukanya 😘</div>
       </div>
    </div>`;
    $("body").append(waHtml);
}

function showFakeWA() {
    // Turunkan notif dari atas layar
    $("#fake-wa").css("top", "20px");
    // Mainkan suara koin biar dia sadar ada notif
    soundScore.play();
    
    // Sembunyikan lagi setelah 4 detik
    setTimeout(function() {
       $("#fake-wa").css("top", "-120px");
    }, 4000);
}

// =========================================================================================
// EFEK VISUAL GELO (ASAP, GETAR, SIANG-MALAM)
// =========================================================================================
function spawnPuff() {
    var player = $("#player");
    var puff = $('<div class="jump-puff"></div>').css({
        position: 'absolute', top: player.position().top + 10 + 'px', left: player.position().left - 10 + 'px',
        width: '15px', height: '15px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%',
        pointerEvents: 'none', zIndex: 5
    });
    $("#flyarea").append(puff);
    puff.transition({ x: '-25px', y: '15px', scale: 2.5, opacity: 0 }, 400, 'linear', function() { $(this).remove(); });
}

function spawnFloatingScore() {
    var floatText = $('<div class="float-score">+1</div>').css({
        position: 'absolute', top: '200px', left: '50%', transform: 'translateX(-50%)',
        color: '#ffc107', fontSize: '28px', fontWeight: '900', textShadow: '2px 2px 0px #000',
        pointerEvents: 'none', zIndex: 100
    });
    $("#flyarea").append(floatText);
    floatText.transition({ y: '-60px', opacity: 0, scale: 1.5 }, 800, 'easeOutSine', function() { $(this).remove(); });
}

function shakeScreen() {
    $("#gamecontainer").transition({ x: '-10px', y: '5px' }, 50)
           .transition({ x: '10px', y: '-5px' }, 50)
           .transition({ x: '-10px', y: '5px' }, 50)
           .transition({ x: '10px', y: '-5px' }, 50)
           .transition({ x: '0px', y: '0px' }, 50);
}

function updateSkyColor() {
    var sky = $("#sky");
    if (score < 5) sky.css('background-color', '#71c5cf'); 
    else if (score < 10) sky.css('background-color', '#ff9a9e'); 
    else if (score < 15) sky.css('background-color', '#4a69bd'); 
    else sky.css('background-color', '#1e272e'); 
    sky.css('transition', 'background-color 2s ease');
}

// =========================================================================================
// INISIALISASI GAME
// =========================================================================================
$(document).ready(function() {
   if (window.location.search == "?debug") debugmode = true;
   if (window.location.search == "?easy")  pipeheight = 220;

   scaleGame();
   $(window).on('resize orientationchange', scaleGame);

   var savedscore = getCookie("highscore");
   if (savedscore != "") highscore = parseInt(savedscore);

   injectFakeWA(); // Pasang kode Fake WA ke dalam HTML
   showWelcome();
});

function showWelcome() {
   currentstate = states.WelcomeScreen;
   $('#welcomeOverlay').fadeIn(700);
}

function dismissWelcome() {
   if (currentstate !== states.WelcomeScreen) return;
   $('#welcomeOverlay').fadeOut(400, function() { showSplash(); });
}

function getCookie(cname) {
   var name = cname + "="; var ca = document.cookie.split(';');
   for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
   }
   return "";
}

function setCookie(cname, cvalue, exdays) {
   var d = new Date(); d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
   document.cookie = cname + "=" + cvalue + "; expires=" + d.toGMTString();
}

// =========================================================================================
// SIKLUS GAME
// =========================================================================================
function showSplash() {
   currentstate = states.SplashScreen;
   velocity = 0; position = 180; rotation = 0; score = 0;

   $("#player").css({ y: 0, x: 0 }); updatePlayer($("#player"));
   updateSkyColor(); 

   soundSwoosh.stop(); soundSwoosh.play();
   $(".pipe").remove(); pipes = new Array();

   $(".animated").css('animation-play-state', 'running');
   $(".animated").css('-webkit-animation-play-state', 'running');

   $("#splash").transition({ opacity: 1 }, 2000, 'ease');
}

function startGame() {
   currentstate = states.GameScreen;

   $("#splash").stop(); $("#splash").transition({ opacity: 0 }, 500, 'ease');
   setBigScore();
   
   playBGM(); // PUTAR LAGU BGM

   if (debugmode) $(".boundingbox").show();

   var updaterate = 1000.0 / 60.0; 
   loopGameloop = setInterval(gameloop, updaterate);
   loopPipeloop = setInterval(updatePipes, 1400);

   playerJump();
}

function updatePlayer(player) {
   rotation = Math.min((velocity / 10) * 90, 90);
   $(player).css({ rotate: rotation, top: position });
}

// =========================================================================================
// ENGINE FISIKA INTI & HITBOX
// =========================================================================================
function gameloop() {
   var player = $("#player");

   velocity += gravity;
   position += velocity;
   updatePlayer(player);

   var origWidth = 34.0; var origHeight = 24.0;
   var boxWidth = origWidth - (Math.sin(Math.abs(rotation) / 90) * 8); var boxHeight = origHeight;

   var playerLeft = 60;
   var boxLeft = playerLeft + (origWidth - boxWidth) / 2;
   var boxTop = position + (origHeight - boxHeight) / 2;
   var boxRight = boxLeft + boxWidth;
   var boxBottom = boxTop + boxHeight;

   // 1. Cek nabrak tanah
   if (boxBottom >= flyArea) { playerDead(); return; }
   // 2. Mentok atap
   if (boxTop <= -16) position = 0;
   
   if (pipes[0] == null) return;

   var nextpipe = pipes[0];
   var nextpipeupper = nextpipe.children(".pipe_upper");

   var pipetop = nextpipeupper.height();
   var pipeleft = parseInt(nextpipe.css('left'));
   var piperight = pipeleft + pipewidth;
   var pipebottom = pipetop + pipeheight;

   if (debugmode) {
      $("#pipebox").css({ left: pipeleft, top: pipetop, height: pipeheight, width: pipewidth });
      $("#playerbox").css({ left: boxLeft, top: boxTop, height: boxHeight, width: boxWidth });
   }

   // 3. Cek nabrak pipa
   if (boxRight > pipeleft) {
      if (boxTop > pipetop && boxBottom < pipebottom) {
         // Lolos gap
      } else {
         playerDead(); return;
      }
   }

   // 4. Berhasil melewati pipa
   if (boxLeft > piperight) {
      pipes.splice(0, 1);
      playerScore();
   }
}

// =========================================================================================
// KONTROL INPUT
// =========================================================================================
$(document).keydown(function(e) {
   if (e.keyCode == 32) { 
      if (currentstate == states.WelcomeScreen) dismissWelcome();
      else if (currentstate == states.ScoreScreen) $("#replay").click();
      else screenClick();
   }
});

if ("ontouchstart" in window) {
   $(document).on("touchstart", function() {
      if (currentstate == states.WelcomeScreen) dismissWelcome();
      else screenClick();
   });
} else {
   $(document).on("mousedown", function() {
      if (currentstate == states.WelcomeScreen) dismissWelcome();
      else screenClick();
   });
}

function screenClick() {
   if (currentstate == states.GameScreen) playerJump();
   else if (currentstate == states.SplashScreen) startGame();
}

function playerJump() {
   velocity = jump;
   soundJump.stop(); soundJump.play();
   spawnPuff(); 
}

// =========================================================================================
// PENGELOLAAN SKOR & TROLL TRIGGER
// =========================================================================================
function setBigScore(erase) {
   var elemscore = $("#bigscore"); elemscore.empty();
   if (erase) return;
   var digits = score.toString().split('');
   for (var i = 0; i < digits.length; i++) elemscore.append("<img src='assets/font_big_" + digits[i] + ".png'>");
}

function setSmallScore() {
   var elemscore = $("#currentscore"); elemscore.empty();
   var digits = score.toString().split('');
   for (var i = 0; i < digits.length; i++) elemscore.append("<img src='assets/font_small_" + digits[i] + ".png'>");
}

function setHighScore() {
   var elemscore = $("#highscore"); elemscore.empty();
   var digits = highscore.toString().split('');
   for (var i = 0; i < digits.length; i++) elemscore.append("<img src='assets/font_small_" + digits[i] + ".png'>");
}

function setMedal() {
   var elemmedal = $("#medal"); elemmedal.empty();
   if (score < 1) return false;
   var medal = "bronze";
   if (score >= 5) medal = "silver";
   if (score >= 10) medal = "gold";
   if (score >= 15) medal = "platinum";
   elemmedal.append('<img src="assets/medal_' + medal + '.png">');
   return true;
}

function playerScore() {
   score += 1;
   soundScore.stop(); soundScore.play();
   
   setBigScore();
   spawnFloatingScore(); 
   updateSkyColor();     

   // Animasi Skor Mentul
   $("#bigscore").css({ scale: 1.4 }).transition({ scale: 1 }, 300, 'ease');

   // ---> TRIGGER TROLL WA: Muncul pas skor mencapai 3 <---
   if (score === 3) {
       showFakeWA();
   }

   // Menang di skor 20
   if (score >= 20) {
      playerWin();
   }
}

// =========================================================================================
// KONDISI MENANG / KALAH
// =========================================================================================
function playerWin() {
   clearInterval(loopGameloop); clearInterval(loopPipeloop);
   loopGameloop = null; loopPipeloop = null;

   stopBGM(); 

   $(".animated").css('animation-play-state', 'paused');
   $(".animated").css('-webkit-animation-play-state', 'paused');

   currentstate = states.ScoreScreen;

   if (score > highscore) { highscore = score; setCookie("highscore", highscore, 999); }

   // Kedip Putih
   $("body").append('<div id="flash-win" style="position:fixed; top:0; left:0; width:100%; height:100%; background:#fff; z-index:99998;"></div>');
   $("#flash-win").fadeOut(1500, function(){ $(this).remove(); });

   $('#winOverlay').css('display', 'flex').hide().fadeIn(500);
}

function playerDead() {
   $(".animated").css('animation-play-state', 'paused');
   $(".animated").css('-webkit-animation-play-state', 'paused');

   stopBGM(); 

   var playerbottom = $("#player").position().top + $("#player").width();
   var movey = Math.max(0, flyArea - playerbottom);
   $("#player").transition({ y: movey + 'px', rotate: 90 }, 1000, 'easeInOutCubic');

   currentstate = states.ScoreScreen;

   clearInterval(loopGameloop); clearInterval(loopPipeloop);
   loopGameloop = null; loopPipeloop = null;

   // Getar & Kedip Merah
   shakeScreen();
   $("body").append('<div id="flash-dead" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255, 71, 87, 0.6); z-index:99999; pointer-events: none;"></div>');
   $("#flash-dead").fadeOut(400, function(){ $(this).remove(); });

   if (isIncompatible.any()) {
      showScore();
   } else {
      soundHit.play().bindOnce("ended", function() {
         soundDie.play().bindOnce("ended", function() { showScore(); });
      });
   }
}

// =========================================================================================
// SCOREBOARD & REPLAY
// =========================================================================================
function showScore() {
   $("#scoreboard").css("display", "block"); setBigScore(true);
   if (score > highscore) { highscore = score; setCookie("highscore", highscore, 999); }

   setSmallScore(); setHighScore(); var wonmedal = setMedal();

   soundSwoosh.stop(); soundSwoosh.play();

   $("#scoreboard").css({ y: '40px', opacity: 0 }); $("#replay").css({ y: '40px', opacity: 0 });
   $("#scoreboard").transition({ y: '0px', opacity: 1 }, 600, 'ease', function() {
      soundSwoosh.stop(); soundSwoosh.play();
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

   soundSwoosh.stop(); soundSwoosh.play();

   $("#scoreboard").transition({ y: '-40px', opacity: 0 }, 1000, 'ease', function() {
      $("#scoreboard").css("display", "none");
      showSplash();
   });
});

// =========================================================================================
// PEMBUATAN PIPA
// =========================================================================================
function updatePipes() {
   $(".pipe").filter(function() { return parseInt($(this).css('left')) <= -100; }).remove();

   var padding      = 80;
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

// =========================================================================================
// BROWSER COMPATIBILITY
// =========================================================================================
var isIncompatible = {
   Android:    function() { return navigator.userAgent.match(/Android/i); },
   BlackBerry: function() { return navigator.userAgent.match(/BlackBerry/i); },
   iOS:        function() { return navigator.userAgent.match(/iPhone|iPad|iPod/i); },
   Opera:      function() { return navigator.userAgent.match(/Opera Mini/i); },
   Safari:     function() { return (navigator.userAgent.match(/OS X.*Safari/) && !navigator.userAgent.match(/Chrome/)); },
   Windows:    function() { return navigator.userAgent.match(/IEMobile/i); },
   any:        function() { return (isIncompatible.Android() || isIncompatible.BlackBerry() || isIncompatible.iOS() || isIncompatible.Opera() || isIncompatible.Safari() || isIncompatible.Windows()); }
};
