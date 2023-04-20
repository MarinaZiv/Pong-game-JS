const audio = document.getElementById('audio') as HTMLAudioElement;
// Canvas
const { body } = document;
const canvas = document.createElement("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;
const width = 500;
const height = 700;
const screenWidth = window.screen.width;
const canvasPosition = screenWidth / 2 - width / 2;
const isMobile = window.matchMedia("(max-width: 600px)");
const gameOverEl = document.createElement("div");

// Paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleBottomX = 225;
let paddleTopX = 225;
let playerMoved = false;
let paddleContact = false;

// Ball
let ballX = 250;
let ballY = 350;
const ballRadius = 5;

// Speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

// Time
let sec = 0;
let min = 0;

// Change Mobile Settings
if (isMobile.matches) {
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -1;
  speedX = speedY;
  computerSpeed = 3;
}

// Score
let playerScore = 0;
let computerScore = 0;
const winningScore = 7;
let isGameOver = true;
let isNewGame = true;

function handleLoad() {
  try {
    startGame();
    greeting();
    audio.volume = 0.4;
  } catch (error) {
    console.error(error);
  }
}

// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background
  context.fillStyle = "#101522";
  context.fillRect(0, 0, width, height);

  // Paddle Color
  context.fillStyle = "#ffffffad";

  // Player Paddle (Bottom)
  context.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);

  // Computer Paddle (Top)
  context.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

  // Dashed Center Line
  context.beginPath();
  context.setLineDash([10, 4]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = "grey";
  context.lineWidth = 0.4;
  context.stroke();

  // Ball
  context.beginPath();
  //@ts-ignore
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false); 
  context.fill();

  // Score
  context.font = "30px Montserrat";
  context.fillStyle = "#ffffff43";
  //@ts-ignore
  context.fillText(playerScore, 20, canvas.height / 2 + 50);
  //@ts-ignore
  context.fillText(computerScore, 20, canvas.height / 2 - 30);

  // Time
  context.font = "normal 22px Montserrat";
  context.fillStyle = "#ffffff43";
  //@ts-ignore
  context.fillText(min, 420, canvas.height / 2 - 30);
  //@ts-ignore
  context.fillText(sec, 450, canvas.height / 2 - 30);
}

// Create Canvas Element
function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  body.appendChild(canvas);
  renderCanvas();
}

// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -3;
  paddleContact = false;
}

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += -speedY;
  // Horizontal Speed
  if (playerMoved && paddleContact) {
    ballX += speedX;
  }
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
      paddleContact = true;
      // Add Speed on Hit
      if (playerMoved) {
        speedY -= 1;
        // Max Speed
        if (speedY < -5) {
          speedY = -5;
          computerSpeed = 6;
        }
      }
      speedY = -speedY;
      trajectoryX = ballX - (paddleBottomX + paddleDiff);
      speedX = trajectoryX * 0.3;
    } else if (ballY > height) {
      // Reset Ball, add to Computer Score
      ballReset();
      computerScore++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      speedY = -speedY;
    } else if (ballY < 0) {
      // Reset Ball, add to Player Score
      ballReset();
      playerScore++;
    }
  }
}

// Computer Movement
function computerAI() {
  if (playerMoved) {
    if (paddleTopX + paddleDiff < ballX) {
      paddleTopX += computerSpeed;
    } else {
      paddleTopX -= computerSpeed;
    }
  }
}

function showGameOverEl(winner) {
  // Hide Canvas
  canvas.hidden = true;
  // Container
  gameOverEl.textContent = "";
  gameOverEl.classList.add("game-over-container");
  // Title
  const title = document.createElement("h1");
  title.textContent = `${winner} Wins`;
  // Button
  const playAgainBtn = document.createElement("button");
  playAgainBtn.setAttribute("onclick", "startGame()");
  playAgainBtn.textContent = "Play Again";
  // Append
  gameOverEl.append(title, playAgainBtn);
  body.appendChild(gameOverEl);
}

// Check If One Player Has Winning Score, If They Do, End Game
function gameOver() {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true;
    // Set Winner
    const winner = playerScore === winningScore ? "Player" : "Computer";
    showGameOverEl(winner);
  }
}

// Called Every Frame
function animate() {
  renderCanvas();
  ballMove();
  ballBoundaries();
  computerAI();
  gameOver();
  if (!isGameOver) {
    window.requestAnimationFrame(animate);
  }
}

// Start Game, Reset Everything
function startGame() {
  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverEl);
    canvas.hidden = false;
  }
  isGameOver = false;
  isNewGame = false;
  playerScore = 0;
  computerScore = 0;
  ballReset();
  createCanvas();
  animate();
  showTime();
  canvas.addEventListener("mousemove", (e) => {
    playerMoved = true;
    // Compensate for canvas being centered
    paddleBottomX = e.clientX - canvasPosition - paddleDiff;
    if (paddleBottomX < paddleDiff) {
      paddleBottomX = 0;
    }
    if (paddleBottomX > width - paddleWidth) {
      paddleBottomX = width - paddleWidth;
    }
    // Hide Cursor
    canvas.style.cursor = "none";
  });
}


function timeOfDay() {
  let realtoday = new Date();
  let realtime = realtoday.getHours();

  if ((realtime >= 0 && realtime <= 5) || (realtime >= 22 && realtime <= 24)) {
    return "night";
  }
  if (realtime >= 6 && realtime <= 11) {
    return "morning";
  }
  if (realtime >= 12 && realtime <= 17) {
    return "afternoon";
  }
  if (realtime >= 18 && realtime <= 21) {
    return "evening";
  }

}

function greeting() {
  const greeting = document.querySelector(".greeting") as HTMLTitleElement;
  const greetingFunc = timeOfDay();
  const html = `<p>Good ${greetingFunc}</p>`;
  greeting.innerHTML = html;
}

function showTime() { 
  if (min < 10) {
    // @ts-ignore
    min = `0${min}`;
  }
  
  setInterval(() => {
    sec++;
    if (sec < 10) {
      // @ts-ignore
      sec = `0${sec}`;
    }
    if (sec === 60) {
      min++;
      if (min < 10) {
        // @ts-ignore
        min = `0${min}`;
      }
       sec = 0;
    }
  }, 1000);
}
