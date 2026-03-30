var debugmode = false;

var states = Object.freeze({
   SplashScreen: 0,
   GameScreen: 1,
   ScoreScreen: 2,
   WelcomeScreen: 3
});

var currentstate;

var gravity = 0.25;
var velocity = 0;
var position = 180;
var rotation = 0;
var jump = -4.6;
var flyArea = 420;

var score = 0;
var highscore = 0;

// Gap pipa diperbesar dari 90 → 160 biar lebih enak
var pipeheight = 160;
var pipewidth = 52;
var pipes = new Array();

var replayclickable = false;

// =============================================
// RESPONSIVE SCALING
// =============================================
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

var loopGameloop;
var loopPipeloop;

// =============================================
// INIT
// =============================================
$(document).ready(function() {
   if (window.location.search == "?debug") debugmode = true;
   if (window.location.search == "?easy")  pipeheight = 220;

   scaleGame();
   $(window).on('resize orientationchange', scaleGame);

   var savedscore = getCookie("highscore");
   if (savedscore != "") highscore = parseInt(savedscore);

   // Mulai dari welcome screen
   showWelcome();
});

// =============================================
// WELCOME SCREEN
// =============================================
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

// =============================================
// COOKIE
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
   document.cookie = cname + "=" + cvalue + "; expires=" + d.toGMTString();
}

// =============================================
// SPLASH & GAME
// =============================================
function showSplash() {
   currentstate = states.SplashScreen;
   velocity = 0;
   position = 180;
   rotation = 0;
   score    = 0;

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

// =============================================
// GAME LOOP — koordinat game, bukan layar
// =============================================
function gameloop() {
   var player = $("#player");

   velocity += gravity;
   position += velocity;

   updatePlayer(player);

   var origWidth  = 34.0;
   var origHeight = 24.0;

   var boxWidth  = origWidth - (Math.sin(Math.abs(rotation) / 90) * 8);
   var boxHeight = origHeight;

   var playerLeft = 60;
   var boxLeft    = playerLeft + (origWidth  - boxWidth)  / 2;
   var boxTop     = position   + (origHeight - boxHeight) / 2;
   var boxRight   = boxLeft  + boxWidth;
   var boxBottom  = boxTop   + boxHeight;

   if (boxBottom >= flyArea) { playerDead(); return; }
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

   if (boxRight > pipeleft) {
      if (boxTop > pipetop && boxBottom < pipebottom) {
         // Aman!
      } else {
         playerDead(); return;
      }
   }

   if (boxLeft > piperight) {
      pipes.splice(0, 1);
      playerScore();
   }
}

// =============================================
// INPUT — FIX: touchstart ATAU mousedown,
//         tidak keduanya. Ini cegah double-fire.
// =============================================
$(document).keydown(function(e) {
   if (e.keyCode == 32) {
      if      (currentstate == states.WelcomeScreen) dismissWelcome();
      else if (currentstate == states.ScoreScreen)   $("#replay").click();
      else                                            screenClick();
   }
});

if ("ontouchstart" in window) {
   // Mobile: hanya touchstart
   $(document).on("touchstart", function() {
      if      (currentstate == states.WelcomeScreen) dismissWelcome();
      else                                            screenClick();
   });
} else {
   // Desktop: hanya mousedown
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
}

// =============================================
// SCORE
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
// MENANG — 10 POIN → TAMPILKAN CLUE (TIDAK AUTO REDIRECT)
// =============================================
function playerWin() {
   clearInterval(loopGameloop);
   clearInterval(loopPipeloop);
   loopGameloop = null;
   loopPipeloop = null;

   $(".animated").css('animation-play-state', 'paused');
   $(".animated").css('-webkit-animation-play-state', 'paused');

   currentstate = states.ScoreScreen;

   if (score > highscore) {
      highscore = score;
      setCookie("highscore", highscore, 999);
   }

   // Tampilkan win popup (Clue Username)
   $('#winOverlay').css('display', 'flex').hide().fadeIn(500);
}

// =============================================
// PLAYER DEAD
// =============================================
function playerDead() {
   $(".animated").css('animation-play-state', 'paused');
   $(".animated").css('-webkit-animation-play-state', 'paused');

   var playerbottom = $("#player").position().top + $("#player").width();
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
// PLAYER SCORE — cek menang di sini
// =============================================
function playerScore() {
   score += 1;
   soundScore.stop();
   soundScore.play();
   setBigScore();

   // 10 poin = menang!
   if (score >= 10) {
      playerWin();
   }
}

// =============================================
// PIPES
// =============================================
function updatePipes() {
   $(".pipe").filter(function() {
      return parseInt($(this).css('left')) <= -100;
   }).remove();

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

// =============================================
// BROWSER COMPATIBILITY
// =============================================
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
