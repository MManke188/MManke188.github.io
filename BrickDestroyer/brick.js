import { detectCollision } from './collisionDetection.js'

export default class Brick {
  constructor(game, position) {
    this.image = document.getElementById('image_brick')

    this.game = game

    this.position = position
    this.width = 80
    this.height = 24

    this.markedForDeletion = false;
  }

  update() {
    if (detectCollision(this.game.ball, this)) {
      let top = this.position.y
      let bottom = this.position.y + this.height
      let topOfBall = this.game.ball.position.y
      let bottomOfBall = this.game.ball.position.y + this.game.ball.size
      let speed = this.game.ball.speed.y

      if (topOfBall - speed >= bottom || bottomOfBall - speed <= top) {
        this.game.ball.speed.y = -this.game.ball.speed.y
      } else {
        this.game.ball.speed.x = -this.game.ball.speed.x
      }

      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}