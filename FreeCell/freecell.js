const order = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King']

const cardDistance = 40

let board = []
// This function generates the board
function generate() {
  const cards = generateCards()
  // Shuffle the cards
  let shuffled = shuffle(cards)

  // Generate the board array
  board = []
  for (let i = 0; i < 28; i += 7) {
    board.push(shuffled.slice(i, i + 7))
  }
  for (let i = 28; i < 47; i += 6) {
    board.push(shuffled.slice(i, i + 6))
  }

  // Start the game
  startGame()
}


// This function generates all 52 cards combined with their suit, color and number
function generateCards() {
  let cards = []
  let suits = ['Spade', 'Heart', 'Diamond', 'Club']
  order.forEach((number) => {
    for (let i = 0; i < suits.length; i++) {
      let suit = suits[i]
      let color
      if (suit == 'Diamond' || suit == 'Heart') {
        color = 'red'
      } else {
        color = 'black'
      }
      cards.push({
        number: number,
        suit: suit,
        color: color
      })
    }
  })
  return cards
}


// This function shuffles a deck of cards
function shuffle(array) {
  var currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}


// This function starts the game
function startGame() {
  // First we remove the victory picture if there is any
  if (document.getElementById('hurra') !== null) {
    document.getElementById('hurra').remove()
  }

  // Remove all the cards from the board
  Array.from(document.getElementsByClassName('card')).forEach((card) => {
    card.remove()
  })

  // We generate the board from the board array
  board.forEach((column, index) => {
    column.forEach((card, i) => {
      document.getElementById('column' + (index + 1)).innerHTML += '<img src="bilder/' + card.suit + '/' + card.number + '.png" id="' + card.number + '_' + card.suit + '-' + card.color + '" class="card" style="left: ' + index * 180 + 'px; top:' + i * cardDistance + 'px;"></img>'
    })
  })


  // Make each card element movable:
  document.querySelectorAll('.card').forEach((card) => {
    moveElement(card)
  })
}


// This function gets called whenever you click a card
function moveElement(cardEle) {
  cardEle.onclick = move;

  function move() {
    let cardIndex = Array.from(cardEle.parentNode.children).indexOf(cardEle)
    let columnLength = cardEle.parentNode.childElementCount

    // We generate the array for the stack the user selected
    let stack = []
    for (let i = cardIndex; i < columnLength; i++) {
      stack.push(getCard(cardEle.parentNode.children[i]))
    }
    // If the stack is a valid stack we find the desired destination of it
    if (checkstack(stack)) {
      findDestination(cardEle)
    }
  }
}

// This function checks wether or not a stack is valid or not
function checkstack(stack) {
  stack = stack.reverse()
  let condition = true
  // If there is only one card it is a valid stack
  if (stack.length == 1) {
    return true
  }

  let number = stack[0].number
  let index = order.indexOf(number)

  stack.some((card, i) => {
    console.log(card)
    let color = card.color
    let currentNum = card.number

    // First check the order of the numbers
    if (order.indexOf(currentNum) != index + i) {
      condition = false
      return true
    }
    // Then check the order of the numbers
    if (i > 0 && color == stack[i - 1].color) {
      condition = false
      return true
    }
  })
  return condition
}


// This function should find the desired location of the cards and move them there
function findDestination(e) {
  let movedACard = false
  let currentCol = Array.from(document.getElementsByClassName('column')).indexOf(e.parentNode)

  let card = getCard(e)
  let col = Array.from(e.parentNode.children)
  let stack = col.slice(col.indexOf(e),)

  // First check wether the card fits to the goal:
  // If there is only one card and all the previous cards are already in the goal, move the card to the goal
  let foundACard = false
  if (stack.length == 1) {
    movedACard = goalCheck(card, e, movedACard)
    if (movedACard) {
      foundACard = true
    }
  }

  // Afterwards check for available columns
  // This checks for an available column:
  // This should be transformed into a some loop
  Array.from(document.getElementsByClassName('column')).some((column, index) => {
    // If we aren't checking the current column and the card wasn't move to the goal yet
    if (index !== currentCol && (!movedACard || !foundACard)) {
      let top = column.childElementCount * 40 + 'px'
      if (column.childElementCount >= 10) {
        top = 400 + (column.childElementCount - 10) * 35 + 'px'
      }
      let destination = {
        left: index * 180 + 'px',
        top: top
      }

      let destinationCard
      if (column.lastChild == null) {
        destinationCard = 'empty'
      } else {
        destinationCard = getCard(column.lastChild)
      }

      let cardLocation = {
        left: e.style.left,
        top: e.style.top
      }
      let buffer = Array.from(document.getElementsByClassName('buffer'))
      buffer.forEach((field, i) => {
        if (field.childElementCount == 0) {
          buffer[i] = ''
        } else {
          buffer[i] = getCard(field.lastChild)
        }
      })

      if (validate(stack, buffer, destination, destinationCard, cardLocation) != cardLocation) {
        document.getElementById('column' + column.id.slice(-1,)).appendChild(e)
        e.style.left = destination.left
        e.style.top = destination.top

        stack.forEach((e, i) => {
          if (i > 0) {
            document.getElementById('column' + column.id.slice(-1,)).appendChild(e)
            e.style.left = destination.left
            let top = (column.childElementCount - 1) * 40 + 'px'
            if (column.childElementCount - 1 >= 10) {
              top = 400 + (column.childElementCount - 1 - 10) * 35 + 'px'
            }
            e.style.top = top
          }
        })

        movedACard = true
        if (destinationCard !== 'empty') {
          foundACard = true
          return movedACard
        }
      }
    }
  })


  // Here you move the card to the buffer:
  if (stack.length == 1 && !movedACard) {
    let buffer = Array.from(document.getElementsByClassName('buffer'))
    buffer.some((field) => {
      if (field.childElementCount == 0) {
        field.appendChild(e)
        e.classList += ' buffered'
        e.style.left = '-8px'
        e.style.top = '-8px'
        movedACard = true
        return movedACard
      }
    })
  }

  // If a card was moved we check wether there are any cards that can be automatically moved to the goal
  if (movedACard) {
    // Every 100 ms we attempt to automatically move a card to the goal
    let autoPlace = setInterval(autoMove, 100)

    // After each move we check wether or not any cards can and therefore should be placed to the goal
    let movedToGoal
    function autoMove() {
      movedToGoal = false
      let cardsToCheck = []

      // We check every last card of each column
      let columns = Array.from(document.getElementsByClassName('column'))
      columns.forEach((col) => {
        if (col.lastChild != null) {
          cardsToCheck.push(col.lastChild)
        }
      })
      let buffer = Array.from(document.getElementsByClassName('buffer'))
      buffer.forEach((field) => {
        if (field.lastChild != null) {
          cardsToCheck.push(field.lastChild)
        }
      })


      cardsToCheck.forEach((e) => {
        let card = getCard(e)
        goal = Array.from(document.getElementsByClassName('goal'))
        move = true
        // If the card isn't an ace and there is a goal field that has less cards than the index of the card being moved, don't move it
        if (card.number != 'Ace') {
          goal.forEach((field) => {
            if (order.indexOf(card.number) > field.childElementCount) {
              move = false
            }
          })
        }

        if (move) {
          // we move the card to the goal
          movedToGoal = goalCheck(card, e, movedToGoal)
        }
      })

      // we check if the game was won
      let finalCondition = true
      Array.from(document.getElementsByClassName('goal')).some((goal) => {
        // If there is a card in the goal field we check if it's a king
        if (goal.lastChild !== null) {
          // If it isn't a king, the game wasn't won
          if (getCard(goal.lastChild).number != 'King') {
            finalCondition = false
            return finalCondition
          }
        } else {
          // If there isn't a card in a goal field, the game wasn't won
          finalCondition = false
          return finalCondition
        }
      })

      // If the game was won and the final card was moved to the goal we display the winning image
      if (finalCondition && movedToGoal) {
        document.getElementById('field').innerHTML += '<p id="hurra" class="hurra">Victory!</p>'
      }
      // If no card was moved, we stop the interval
      if (movedToGoal == false) {
        clearInterval(autoPlace)
      }
    }
  }
}



//This function checks wether a card fits to the goal
function goalCheck(card, e, movedACard) {
  let goal = Array.from(document.getElementsByClassName('goal'))

  // this acts like a forEach loop that stops execution as soon as it returns true. This is used to move the card to the first available spot
  // You could also use a for loop here to allow "break"
  goal.some((field) => {
    if (field.childElementCount == 0) {
      if (card.number == 'Ace') {
        field.appendChild(e)
        e.classList += ' arrived'
        e.style.left = '-8px'
        e.style.top = '-8px'
        e.onclick = null
        movedACard = true
        return movedACard
      }
    } else if (getCard(field.lastChild).suit == getCard(e).suit && order.indexOf(getCard(field.lastChild).number) + 1 == order.indexOf(card.number)) {
      field.appendChild(e)
      e.classList += ' arrived'
      e.style.left = '-8px'
      e.style.top = '-8px'
      e.onclick = null
      movedACard = true
      return movedACard
    }
  })
  return movedACard
}

// This function returns a card object from a html element
function getCard(element) {
  let card = {}
  card.number = element.id.match(/.*_/)[0].slice(0, -1)
  card.suit = element.id.match(/(?=_).*(?=-)/g)[0].slice(1,)
  card.color = element.id.match(/-.*/g)[0].slice(1,)
  return card
}


// This function gets called when the mouse is released. It checks wether the desired move is a valid one
function validate(stack = [], buffer = [], destination = {}, destinationCard, cardLocation = {}) {
  let backStackCard = getCard(stack[0])

  // Formula to calculate buffer length.
  let bufferLength = 0
  buffer.forEach((d) => {
    if (d != '') {
      bufferLength++;
    }
  })

  let emptyCols = 0
  Array.from(document.getElementsByClassName('column')).forEach((d) => {
    if (d.childElementCount == 0) {
      emptyCols++
    }
  })
  if (destinationCard == 'empty') {
    emptyCols--;
  }

  // If the number of cards in the buffer doesn't allow the move: return
  if ((5 - bufferLength) * Math.pow(2, emptyCols) < stack.length) {
    return cardLocation
  }


  // If there is no card at the destination move the card
  if (destinationCard == 'empty') {
    cardLocation = destination
  } else {
    // We check wether or not the back card of the stack fits on the front card of the destination
    // This means checking for order and color

    // First we check for color:
    if (backStackCard.color == 'red' && destinationCard.color == 'red' || backStackCard.color == 'black' && destinationCard.color == 'black') {
      return cardLocation;
    } else {
      // Now we check the number
      if (backStackCard.number == Number(backStackCard.number)) {
        if (backStackCard.number != 10) {
          if (Number(backStackCard.number) + 1 == destinationCard.number) {
            cardLocation = destination
          } else {
            return cardLocation;
          }
        } else {
          if (destinationCard.number == 'Jack') {
            cardLocation = destination
          } else {
            return cardLocation;
          }
        }
      } else {
        switch (backStackCard.number) {
          case 'Ace':
            if (destinationCard.number == '2') {
              cardLocation = destination
            } else {
              return cardLocation;
            }
            break;
          case 'Jack':
            if (destinationCard.number == 'Queen') {
              cardLocation = destination
            } else {
              return cardLocation;
            }
            break;
          case 'Queen':
            if (destinationCard.number == 'King') {
              cardLocation = destination
            } else {
              return cardLocation;
            }
            break;
          case 'King':
            return cardLocation;
            break;
        }
      }
    }

  }
  return cardLocation
}


// We generate the playing field
generate()

document.addEventListener('mousemove', picture)
// This function deals with flipping the picture of the observer
function picture(e) {
  let picture = document.getElementById('picture')
  if (e.clientX < Number(picture.offsetLeft) + Number(picture.width / 2)) {
    picture.style.transform = 'scaleX(-1)'
    picture.style['-webkit-transform'] = 'scaleX(-1)'
  } else {
    picture.style.transform = ''
    picture.style['-webkit-transform'] = ''
  }
}
