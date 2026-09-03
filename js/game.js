'use strict';

const STATES = Object.freeze({ MENU: 'MENU', PLAYING: 'PLAYING', GAME_OVER: 'GAME_OVER' });
const BOARD_SIZE = 20;
const CELL_SIZE = 600 / BOARD_SIZE;
const POINTS_PER_FOOD = 10;
const INITIAL_DELAY = 170;
const MIN_DELAY = 75;

const board = document.querySelector('#game-board');
const context = board.getContext('2d');
const screens = {
  menu: document.querySelector('#menu-screen'),
  game: document.querySelector('#game-screen'),
  gameOver: document.querySelector('#game-over-screen')
};
const scoreElement = document.querySelector('#score');
const highScoreElement = document.querySelector('#high-score');
const levelElement = document.querySelector('#level');
const finalScoreElement = document.querySelector('#final-score');
const finalHighScoreElement = document.querySelector('#final-high-score');

let state = STATES.MENU;
let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = 0;
let level = 1;
let gameTimer = null;
let isPaused = false;

function showScreen(screenToShow) {
  Object.values(screens).forEach((screen) => screen.classList.remove('screen--active'));
  screenToShow.classList.add('screen--active');
}

function resetGame() {
  stopGameLoop();
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  level = 1;
  isPaused = false;
  food = generateFood();
  updateScoreboard();
  drawGame();
}

function startGame() {
  resetGame();
  state = STATES.PLAYING;
  showScreen(screens.game);
  startGameLoop();
}

function startGameLoop() {
  stopGameLoop();
  gameTimer = setInterval(updateGame, getMoveDelay());
}

function stopGameLoop() {
  if (gameTimer !== null) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

function getMoveDelay() {
  return Math.max(MIN_DELAY, INITIAL_DELAY - (level - 1) * 12);
}

function updateGame() {
  if (state !== STATES.PLAYING || isPaused) return;
  direction = nextDirection;
  const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const ateFood = newHead.x === food.x && newHead.y === food.y;

  if (checkCollision(newHead, ateFood)) {
    endGame();
    return;
  }

  snake.unshift(newHead);
  if (ateFood) {
    score += POINTS_PER_FOOD;
    level = Math.floor(score / 50) + 1;
    highScore = Math.max(highScore, score);
    food = generateFood();
    updateScoreboard();
    startGameLoop();
  } else {
    snake.pop();
  }
  drawGame();
}

function checkCollision(head, willGrow) {
  const hitWall = head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE;
  if (hitWall) return true;
  const bodyToCheck = willGrow ? snake : snake.slice(0, -1);
  return bodyToCheck.some((part) => part.x === head.x && part.y === head.y);
}

function generateFood() {
  let candidate;
  do {
    candidate = { x: Math.floor(Math.random() * BOARD_SIZE), y: Math.floor(Math.random() * BOARD_SIZE) };
  } while (snake.some((part) => part.x === candidate.x && part.y === candidate.y));
  return candidate;
}

function drawGame() {
  context.fillStyle = '#071310';
  context.fillRect(0, 0, board.width, board.height);
  drawGrid();
  drawFood();
  snake.forEach((part, index) => drawSnakePart(part, index === 0));
}

function drawGrid() {
  context.strokeStyle = 'rgba(84, 242, 154, 0.07)';
  context.lineWidth = 1;
  for (let position = 0; position <= BOARD_SIZE; position += 1) {
    const pixel = position * CELL_SIZE;
    context.beginPath();
    context.moveTo(pixel, 0);
    context.lineTo(pixel, board.height);
    context.stroke();
    context.beginPath();
    context.moveTo(0, pixel);
    context.lineTo(board.width, pixel);
    context.stroke();
  }
}

function drawSnakePart(part, isHead) {
  const padding = 2;
  context.fillStyle = isHead ? '#5de4e8' : '#54f29a';
  context.fillRect(part.x * CELL_SIZE + padding, part.y * CELL_SIZE + padding, CELL_SIZE - padding * 2, CELL_SIZE - padding * 2);
  if (isHead) {
    context.fillStyle = '#071310';
    context.font = 'bold 13px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(getHeadSymbol(), part.x * CELL_SIZE + CELL_SIZE / 2, part.y * CELL_SIZE + CELL_SIZE / 2);
  }
}

function getHeadSymbol() {
  if (direction.x === 1) return '>';
  if (direction.x === -1) return '<';
  if (direction.y === -1) return '^';
  return 'v';
}

function drawFood() {
  context.fillStyle = '#ffcf5d';
  context.fillRect(food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
  context.fillStyle = '#352b0d';
  context.font = 'bold 11px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('</>', food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2);
}

function updateScoreboard() {
  scoreElement.textContent = score;
  highScoreElement.textContent = highScore;
  levelElement.textContent = level;
}

function endGame() {
  stopGameLoop();
  state = STATES.GAME_OVER;
  finalScoreElement.textContent = score;
  finalHighScoreElement.textContent = highScore;
  showScreen(screens.gameOver);
}

function changeDirection(newDirection) {
  const isOpposite = newDirection.x === -direction.x && newDirection.y === -direction.y;
  if (!isOpposite) nextDirection = newDirection;
}

document.querySelector('#start-button').addEventListener('click', startGame);
document.querySelector('#restart-button').addEventListener('click', startGame);
document.querySelector('#menu-button').addEventListener('click', () => {
  stopGameLoop();
  state = STATES.MENU;
  showScreen(screens.menu);
});

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  const directions = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };
  if (directions[key]) {
    event.preventDefault();
    changeDirection(directions[key]);
  }
  if (key === ' ' || key === 'spacebar') {
    event.preventDefault();
    if (state === STATES.PLAYING) isPaused = !isPaused;
  }
});

resetGame();
