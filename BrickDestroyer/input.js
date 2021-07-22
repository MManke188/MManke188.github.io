export default class InputHandler{
  constructor(paddle, game) {
    document.addEventListener('keydown', (event) => {
      switch(event.keyCode) {
        // enter
        case 13:
          game.togglePause();
          break;
        // spacebar
        case 32:
          game.start()
          break;
        case 37:
          paddle.moveLeft();
          break;
        case 39:
          paddle.moveRight();
          break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch(event.keyCode) {
        case 37:
          if(paddle.speed < 0) paddle.stop();
          break;
        case 39:
          if(paddle.speed > 0) paddle.stop();
          break;
      }
    });
  }
}