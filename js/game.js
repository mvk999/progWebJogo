'use strict';

const STATES = { MENU: 'MENU', PLAYING: 'PLAYING', GAME_OVER: 'GAME_OVER' };
const BOARD_SIZE = 20;
const CELL_SIZE = 600 / BOARD_SIZE;
const MOVE_DELAY = 170;

const board = document.querySelector('#game-board');
const context = board.getContext('2d');
const screens = {
  menu: document.querySelector('#menu-screen'),
  game: document.querySelector('#game-screen'),
  gameOver: document.querySelector('#game-over-screen')
};
let state = STATES.MENU;
let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
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
  isPaused = false;
  food = generateFood();
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
  gameTimer = setInterval(updateGame, MOVE_DELAY);
}

function stopGameLoop() {
  if (gameTimer !== null) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
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
    food = generateFood();
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
  context.fillStyle = '#e8f3e9';
  context.fillRect(0, 0, board.width, board.height);
  drawGrid();
  drawFood();
  snake.forEach((part, index) => drawSnakePart(part, index === 0));
}

function drawGrid() {
  context.strokeStyle = '#c8ddca';
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
  context.fillStyle = isHead ? '#1f6b35' : '#4cae63';
  context.fillRect(part.x * CELL_SIZE + padding, part.y * CELL_SIZE + padding, CELL_SIZE - padding * 2, CELL_SIZE - padding * 2);
}

function drawFood() {
  context.fillStyle = '#ffcf5d';
  context.fillRect(food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
  context.fillStyle = '#493a00';
  context.font = 'bold 11px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('</>', food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2);
}

function endGame() {
  stopGameLoop();
  state = STATES.GAME_OVER;
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
