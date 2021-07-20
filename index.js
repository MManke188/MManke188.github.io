let projects = document.getElementsByClassName('project')

for (let project of projects) {
  project.addEventListener('click', projectRedirect)
}

function projectRedirect(event) {
  let project
  if (event.srcElement !== undefined) {
    project = event.srcElement.id
  } else {
    project = event.id
  }
  console.log(event)
  switch (project) {
    case 'brick-destroyer':
      location.href = 'BrickDestroyer/index.html'
      break;
    case 'calculator':
      location.href = 'Calculator/public/index.html'
      break;
    case 'chatroom':
      location.href = 'Chatroom/views/pug/index.pug'
      break;
    case 'line-chart':
      location.href = 'Data Visualizations/Covid Visualization/covid3.html'
      break;
    case 'choropleth-map':
      location.href = 'Data Visualizations/American Education/index.html'
      break;
    case 'messageboard':
      location.href = 'Messageboard/views/index.html'
      break;
    case 'library':
      location.href = 'Personal Library/views/index.html'
      break;
    case 'pomodoro':
      location.href = 'Pomodoro Clock/index.html'
      break;
    case 'stockprice-checker':
      location.href = 'Stock Price Checker/views/index.html'
      break;
    case 'sudoku-solver':
      location.href = 'Sudoku Solver/views/index.html'
      break;
    case 'game-ratings':
      location.href = 'Data Visualizations/Game Ratings/Q5/choropleth.html'
      break;
    case 'brick-destroyer.png':
      location.href = 'BrickDestroyer/index.html'
      break;
  }
}

document.addEventListener('keydown', handleKeyPress)
function handleKeyPress() {
  switch (window.event.keyCode) {
    case 37:
      previous()
      break;
    case 39:
      next()
      break;
    case 13:
      document.querySelector('#example img').click()
  }
}

const images = [
  '<img src="Images/covid.png" id="line-chart" style="opacity: 0" onclick="projectRedirect(this)">',
  '<img src="Images/messageboard.png" id="messageboard" style="opacity: 0" onclick="projectRedirect(this)">',
  '<img src="Images/worldMap.png" id="game-ratings" style="opacity: 0" onclick="projectRedirect(this)">',
  '<img src="Images/pomodoro-clock.png" id="pomodoro" style="opacity: 0" onclick="projectRedirect(this)">',
  '<img src="Images/brick-destroyer.png" id="brick-destroyer" style="opacity: 0" onclick="projectRedirect(this)">'
]

let index = 0
function next() {
  if (index >= images.length - 1) {
    index = -1
  }

  index++;

  document.querySelector('#example img').style.opacity = 0
  setTimeout(() => {
    document.getElementById('example').innerHTML = images[index]
  }, 200);
  setTimeout(() => {
    document.querySelector('#example img').style.opacity = 1
  }, 220);
}

function previous() {
  if (index <= 0) {
    index = images.length
  }
  index--;

  document.querySelector('#example img').style.opacity = 0
  setTimeout(() => {
    document.getElementById('example').innerHTML = images[index]
  }, 200);
  setTimeout(() => {
    document.querySelector('#example img').style.opacity = 1
  }, 220);
}