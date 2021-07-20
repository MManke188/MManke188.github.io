export function detectCollision(ball, gameObject) {
  
  let topOfBall = ball.position.y
  let bottomOfBall = ball.position.y + ball.size
  let leftSideOfBall = ball.position.x
  let rightSideOfBall = ball.position.x + ball.size

  let topOfObject = gameObject.position.y;
  let bottomOfObject = gameObject.position.y + gameObject.height
  let leftSideOfObject = gameObject.position.x
  let rightSideOfObject = gameObject.position.x + gameObject.width

  if(
    bottomOfBall >= topOfObject &&
    topOfBall <= bottomOfObject &&
    leftSideOfBall <= rightSideOfObject
    && rightSideOfBall >= leftSideOfObject
    ) {
    return true;
  } else {
    return false;
  }
}