//My script
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
let game;
const box = 20;
const rows = canvas.height / box;
const cols = canvas.width / box;

// Snake
let snake = {
    width: [{ x: 10 * box, y: 10 * box, dir: 'RIGHT' }],
    direction: 'RIGHT',
    speed: 200
};
 //Snake look
const snakeHeadImg = new Image();
snakeHeadImg.src = "images/snakeHead.png"; // Adjust paths as needed

const snakeBodyImg = new Image();
snakeBodyImg.src = 'images/snakeBody.png';

const snakeTailImg = new Image();
snakeTailImg.src = 'images/snakeTail.png';

const bgImg = new Image();
bgImg.src = '/images/bgGround.png';

const appleImg = new Image();
appleImg.src = 'images/apple.png';

const eggImg = new Image();
eggImg.src = 'images/egg.png';

const mouseImg = new Image();
mouseImg.src = 'images/mouse.png';
//Generating background
const tileMap = [];

for (let row = 0; row < rows; row++) {
    tileMap[row] = [];
    for (let col = 0; col < cols; col++) {
        tileMap[row][col] = { type: 'ground' };
    }
}

function placeDecorations() {
    let placedRocks = 0;
    let placedBushes = 0;

    while (placedRocks < 5) {
        const x = Math.floor(Math.random() * cols);
        const y = Math.floor(Math.random() * rows);
        if (tileMap[y][x].type === 'ground') {
            tileMap[y][x].type = 'rock';
            placedRocks++;
        }
    }

    while (placedBushes < 3) {
        const x = Math.floor(Math.random() * cols);
        const y = Math.floor(Math.random() * rows);
        if (tileMap[y][x].type === 'ground') {
            tileMap[y][x].type = 'bush';
            placedBushes++;
        }
    }
}

placeDecorations();

// Food
const foodTypes = [
    { color: 'red', points: 10, image: appleImg },
    { color: 'blue', points: 20, image: eggImg },
    { color: 'yellow', points: 30, image: mouseImg }
  ];

let food = null;
let foodTimer = null;

function generateFood() {
    let newFood;
    let collision = true;
  
    while (collision) {
      const type = foodTypes[Math.floor(Math.random() * foodTypes.length)];
  
      // Ensure food spawns at least 20px (1 box) from each border
      const min = 1; // 1 box = 20px
      const maxCols = cols - 2;
      const maxRows = rows - 2;
  
      newFood = {
        x: Math.floor(Math.random() * (maxCols - min + 1) + min) * box,
        y: Math.floor(Math.random() * (maxRows - min + 1) + min) * box,
        type: type
      };
  
      collision = snake.width.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
  
    return newFood;
  }

function spawnFood() {
    food = generateFood();
    if (foodTimer) clearTimeout(foodTimer);
    foodTimer = setTimeout(() => {
        food = generateFood();
        spawnFood();
    }, 5000);
}

// Score
const nameEntryDiv = document.getElementById("nameEntry");
const playerNameInput = document.getElementById("playerNameInput");
const startGameBtn = document.getElementById("startGameBtn");

let playerName = "";

startGameBtn.addEventListener("click", () => {
  const name = playerNameInput.value.trim();
  if (name !== "") {
    playerName = name;
    nameEntryDiv.style.display = "none";
    startGame();
  } else {
    alert("Please enter your name.");
  }
});
let score = 0;
let highScores = JSON.parse(localStorage.getItem("highScores")) || [];

// Collision detection
function collision(head, body) {
    return body.some(segment => head.x === segment.x && head.y === segment.y);
}
function drawRotatedImage(img, x, y, direction) {
    const angleMap = {
      'RIGHT': 0,
      'DOWN': 90,
      'LEFT': 180,
      'UP': 270
    };
  
    const angle = angleMap[direction] * Math.PI / 180;
  
    ctx.save();
    ctx.translate(x + box / 2, y + box / 2); // center
    ctx.rotate(angle);
    ctx.drawImage(img, -box / 2, -box / 2, box, box);
    ctx.restore();
  }
// Drawing and logic
function draw() {
    if (bgImg.complete) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    }

    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    for (let i = 0; i < snake.width.length; i++) {
  const segment = snake.width[i];

  if (i === 0) {
    drawRotatedImage(snakeHeadImg, segment.x, segment.y, segment.dir);
  } else if (i === snake.width.length - 1) {
    drawRotatedImage(snakeTailImg, segment.x, segment.y, segment.dir);
  } else {
    drawRotatedImage(snakeBodyImg, segment.x, segment.y, segment.dir);
  }
}

    // Draw food
    if (food && food.type && food.type.image.complete) {
        ctx.drawImage(food.type.image, food.x, food.y, box, box);
    }

    // Move snake
    const head = { ...snake.width[0] };
    switch (snake.direction) {
        case 'UP': head.y -= box; break;
        case 'DOWN': head.y += box; break;
        case 'LEFT': head.x -= box; break;
        case 'RIGHT': head.x += box; break;
    }
    head.dir = snake.direction;
    // snake.width.unshift(head);

    if (food && head.x === food.x && head.y === food.y) {
        score += food.type.points;
        snake.width.unshift(head);
        snake.speed = Math.max(snake.speed - 2, 50);
        clearInterval(game);
        game = setInterval(draw, snake.speed);
        spawnFood();
    } else {
        snake.width.pop();
        snake.width.unshift(head);
    }

    if (
        head.x < 0 || head.x >= canvas.width ||
        head.y < 0 || head.y >= canvas.height ||
        collision(head, snake.width.slice(1))
    ) {
        handleGameOver();
    }

    document.getElementById("score").textContent = score;
}

// Game over
function handleGameOver() {
    highScores.push({ name: playerName, score: score });
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 5);
    localStorage.setItem("highScores", JSON.stringify(highScores));

    document.getElementById("finalScore").textContent = score;
    const highScoresList = document.getElementById("highScoresList");
    highScoresList.innerHTML = highScores
        .map(entry => `<li>${entry.name}: ${entry.score}</li>`)
        .join('');
    document.getElementById("highScoreOverlay").classList.add("visible");

    clearInterval(game);
}

// Controls
function enableControls() {
    document.addEventListener('keydown', handleKeyControls);
  }

//Mobile Controls
document.body.addEventListener("touchmove", function (e) {
  e.preventDefault();
}, { passive: false });

function enableTouchControls() {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  document.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
  }, false);

  document.addEventListener("touchend", function (e) {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipeGesture();
  }, false);

  function handleSwipeGesture() {
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 30 && snake.direction !== 'LEFT') {
              snake.direction = 'RIGHT';
          } else if (dx < -30 && snake.direction !== 'RIGHT') {
              snake.direction = 'LEFT';
          }
      } else {
          if (dy > 30 && snake.direction !== 'UP') {
              snake.direction = 'DOWN';
          } else if (dy < -30 && snake.direction !== 'DOWN') {
              snake.direction = 'UP';
          }
      }
  }
}
  
  function handleKeyControls(event) {
    switch (event.key) {
      case 'ArrowUp':
        if (snake.direction !== 'DOWN') snake.direction = 'UP';
        break;
      case 'ArrowDown':
        if (snake.direction !== 'UP') snake.direction = 'DOWN';
        break;
      case 'ArrowLeft':
        if (snake.direction !== 'RIGHT') snake.direction = 'LEFT';
        break;
      case 'ArrowRight':
        if (snake.direction !== 'LEFT') snake.direction = 'RIGHT';
        break;
    }
    event.preventDefault();
  }

// Play again
document.getElementById("playAgainBtn").addEventListener("click", () => {
    snake = {
        width: [{ x: 10 * box, y: 10 * box }],
        direction: 'RIGHT',
        speed: 200
    };
    score = 0;
    document.getElementById("score").textContent = score;
    document.getElementById("highScoreOverlay").classList.remove("visible");

    clearInterval(game);
    startGame();
});

// Start game
function startGame() {
    document.getElementById("gameCanvas").style.display = "block";
    document.getElementById("scoreContainer").style.display = "inline-block";
    enableControls();
    enableTouchControls()
    spawnFood();    
    game = setInterval(draw, snake.speed);
}
