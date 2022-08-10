export default class Paddle {
  constructor(game) {
    this.image = document.getElementById('image_paddle')

    this.gameWidth = game.gameWidth
    this.gameHeight = game.gameHeight
    this.width = 150;
    this.height = 20;

    this.maxSpeed = 9;
    this.speed = 0;

    this.position = {
      x: game.gameWidth / 2 - this.width / 2,
      y: game.gameHeight - this.height - 10
    };

  };

  reset() {
    this.position = {
      x: game.gameWidth / 2 - this.width / 2,
      y: game.gameHeight - this.height - 10
    };
    this.speed = 0;
  }

  moveLeft() {
    this.speed = -this.maxSpeed
  }

  moveRight() {
    this.speed = this.maxSpeed
  }

  stop() {
    this.speed = 0
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

  update() {
    this.position.x += this.speed

    if (this.position.x < 0) {
      this.position.x = 0
    } else if (this.position.x > this.gameWidth - this.width) {
      this.position.x = this.gameWidth - this.width
    }
  }

}