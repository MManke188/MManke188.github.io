import { detectCollision } from './collisionDetection.js'

export default class Ball {
  constructor(game) {
    this.image = document.getElementById('image_ball')

    this.gameWidth = game.gameWidth;
    this.gameHeight = game.gameHeight;
    this.game = game
    this.maxSpeed = Math.sqrt(116)
    this.size = 16
    this.reset();
  }

  reset() {
    this.position = { x: 10, y: 400 };
    this.speed = { x: 10, y: -4 };
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.size,
      this.size
    );
  }

  update(deltaTime) {
    this.position.x += this.speed.x
    this.position.y += this.speed.y

    // checks for walls on the left and right
    if (this.position.x + this.size > this.gameWidth || this.position.x < 0) {
      this.speed.x = -this.speed.x
      if (this.position.x < 0) {
        this.position.x = 0
      } else {
        this.position.x = this.gameWidth - this.size
      }
    }

    // checks for walls on the top and on the bottom
    if (this.position.y < 0) {
      this.speed.y = -this.speed.y
    }

    if (this.position.y + this.size > this.gameHeight) {
      this.game.lives--;
      this.reset();
    }

    if (detectCollision(this, this.game.paddle)) {
      /* The position of the ball is considered the center of the width   
        of the ball.
        To get the factor by which the x-speed should be multiplied by 
        (this factors absolute value should be <1), we have to ensure the paddleWidth is extened so to include partial collusions of the ball on the edges.
        Otherwise the ball glitches into the paddle.
      */

      let pos = this.position.x + this.size / 2
      let paddleWidth = this.game.paddle.width


      let center = this.game.paddle.position.x + paddleWidth / 2
      let factor = (pos - center) / (paddleWidth / 2 + this.size)

      this.speed.x = this.maxSpeed * factor

      if (this.position.y + this.size - this.speed.y < this.game.paddle.position.y) {
        this.speed.y = - (Math.sqrt(this.maxSpeed * this.maxSpeed - this.speed.x * this.speed.x))
      }

    }


  }
}