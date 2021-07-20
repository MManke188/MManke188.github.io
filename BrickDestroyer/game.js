import Paddle from './paddle.js '
import InputHandler from './input.js'
import Ball from './ball.js'
import Brick from './brick.js'
import { buildLevel, level1, level2, level3 } from './levels.js'

const GAMESTATE = {
  PAUSED: 0,
  RUNNING: 1,
  MENU: 2,
  GAMEOVER: 3,
  NEWLEVEL: 4,
  VICTORY: 5
}

export default class Game {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth
    this.gameHeight = gameHeight
    this.gamestate = GAMESTATE.MENU;
    this.paddle = new Paddle(this);
    this.ball = new Ball(this);
    this.gameObjects = [];
    this.bricks = [];
    this.lives = 1

    this.levels = [level1, level2, level3]
    this.currentLevel = 0

    new InputHandler(this.paddle, this)
  }

  start() {
    // The game should only be running if you are paused, or running
    if (this.gamestate !== GAMESTATE.MENU && this.gamestate !== GAMESTATE.NEWLEVEL && this.gamestate !== GAMESTATE.GAMEOVER && this.gamestate !== GAMESTATE.VICTORY) return

    this.bricks = buildLevel(this, this.levels[this.currentLevel]);
    this.ball.reset();

    this.gameObjects = [
      this.ball,
      this.paddle
    ];

    // when we start the game, the game should be running
    this.gamestate = GAMESTATE.RUNNING
  }

  update(deltaTime) {
    if (this.lives === 0) {
      this.gamestate = GAMESTATE.GAMEOVER
      this.currentLevel = 0
      this.lives = 1
    }

    // we don't want to update anthing in these cases:
    if (this.gamestate === GAMESTATE.PAUSED || this.gamestate === GAMESTATE.MENU || this.gamestate === GAMESTATE.GAMEOVER || this.gamestate === GAMESTATE.VICTORY) return;

    if (this.bricks.length === 0) {
      this.currentLevel++

      if (this.currentLevel > this.levels.length - 1) {
        this.gamestate = GAMESTATE.VICTORY
        this.currentLevel = 0
      } else {
        this.gamestate = GAMESTATE.NEWLEVEL
        this.start()
      }
    }

    [...this.gameObjects, ...this.bricks].forEach((object) => object.update(deltaTime))

    let deleteBricks = this.bricks.filter(brick => brick.markedForDeletion)

    this.bricks = this.bricks.filter(brick => !brick.markedForDeletion)

    if (deleteBricks.length == 2) {
      this.ball.speed.x = -this.ball.speed.x
    }
  }

  draw(ctx) {
    [...this.gameObjects, ...this.bricks].forEach((object) => object.draw(ctx))

    if (this.gamestate === GAMESTATE.PAUSED) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight)
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fill();
      ctx.font = '30px Arial'
      ctx.fillStyle = 'white '
      ctx.textAlign = 'center'
      ctx.fillText("Paused", this.gameWidth / 2, this.gameHeight / 2)
    }

    if (this.gamestate === GAMESTATE.MENU) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight)
      ctx.fillStyle = 'rgba(0,0,0,1)'
      ctx.fill();
      ctx.font = '30px Arial'
      ctx.fillStyle = 'white '
      ctx.textAlign = 'center'
      ctx.fillText("Press SPACEBAR to start playing!", this.gameWidth / 2, this.gameHeight / 2)
    }

    if (this.gamestate === GAMESTATE.GAMEOVER) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight)
      ctx.fillStyle = 'rgba(0,0,0,1)'
      ctx.fill();
      ctx.font = '30px Arial'
      ctx.fillStyle = 'darkred '
      ctx.textAlign = 'center'
      ctx.fillText("GAME OVER", this.gameWidth / 2, this.gameHeight / 2)
    }

    if (this.gamestate === GAMESTATE.VICTORY) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight)
      ctx.fillStyle = 'rgba(0,0,0,1)'
      ctx.fill();
      ctx.font = '30px Arial'
      ctx.fillStyle = 'gold '
      ctx.textAlign = 'center'
      ctx.fillText("VICTORY", this.gameWidth / 2, this.gameHeight / 2)
    }
  }

  togglePause() {
    if (this.gamestate === GAMESTATE.PAUSED) {
      this.gamestate = GAMESTATE.RUNNING;
    } else {
      if (this.gamestate !== GAMESTATE.GAMEOVER && this.gamestate !== GAMESTATE.VICTORY && this.gamestate !== GAMESTATE.MENU) {
        this.gamestate = GAMESTATE.PAUSED;
      }
    }
  }

}