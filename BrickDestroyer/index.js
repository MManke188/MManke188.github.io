import Game from './game.js'

let canvas = document.getElementById('gameScreen')
let ctx = canvas.getContext('2d')

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

let game = new Game(GAME_WIDTH, GAME_HEIGHT)


let lastTime = 0
// this function runs every single frame
function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime
  lastTime = timestamp

  //this is to ensure, that the canvas is cleared before it is updated. Remove this if you want to understand what it does.
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  game.update(deltaTime)

  game.draw(ctx)

  //this is where the function gets every single frame from: request from the browser
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);