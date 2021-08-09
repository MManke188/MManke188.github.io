let projects = document.getElementsByClassName('project')

for (let project of projects) {
  project.addEventListener('click', projectRedirect)
}

const covid = "DataVisualizations/CovidVisualization/index.html"
const messageboard = "Images/messageboard.png"
const game_ratings = "DataVisualizations/GameRatings/Q5/choropleth.html"
const pomodoro_clock = "PomodoroClock/index.html"
const brick_destroyer = "BrickDestroyer/index.html"
const chatroom = "https://Chatroom.battlekingcoder.repl.co"
const american_education = 'DataVisualizations/AmericanEducation/index.html'
const library = "https://Personal-Library.battlekingcoder.repl.co"
const stockprice_checker = "https://Stockprice-Checker.battlekingcoder.repl.co"
const sudoku_solver = "https://Sudoku-Solver.battlekingcoder.repl.co"
const treemap = 'DataVisualizations/TrashDisposal/treemap.html'
const tooth = 'DataVisualizations/volume-rendering/index.html'
const vector_visualization = 'DataVisualizations/vector-visualization/index.html'


function projectRedirect(event) {
  let project
  if (event.srcElement !== undefined) {
    project = event.srcElement.id
  } else {
    project = event.id
  }
  switch (project) {
    case 'brick-destroyer':
      window.open(brick_destroyer, '_blank')
      break;
    case 'chatroom':
      window.open(chatroom, '_blank')
      break;
    case 'line-chart':
      window.open(covid, '_blank')
      break;
    case 'choropleth-map':
      window.open(american_education, '_blank')
      break;
    case 'messageboard':
      window.open("https://Anonymous-Messageboard.battlekingcoder.repl.co", '_blank')
      break;
    case 'library':
      window.open(library, '_blank')
      break;
    case 'pomodoro':
      window.open(pomodoro_clock, '_blank')
      break;
    case 'stockprice-checker':
      window.open(stockprice_checker, '_blank')
      break;
    case 'sudoku-solver':
      window.open(sudoku_solver, '_blank')
      break;
    case 'game-ratings':
      window.open(game_ratings, '_blank')
      break;
    case 'treemap':
      window.open(treemap, '_blank')
      break;
    case 'tooth':
      window.open(tooth, '_blank')
      break;
    case 'vector-visualization':
      window.open(vector_visualization, '_blank')
      break;
  }
}

document.addEventListener('keydown', handleKeyPress)
document.addEventListener('keyup', handleKeyPress)

function handleKeyPress(event) {
  if (event.repeat) { return }
  if (event.type === 'keydown') {
    switch (event.keyCode) {
      case 37:
        previous(document.getElementById('arrow1'))
        break;
      case 39:
        next(document.getElementById('arrow2'))
        break;
      case 13:
        document.querySelector('#example iframe').click()
        break;
    }
  } else if (event.type === 'keyup') {
    switch (event.keyCode) {
      case 37:
        size(document.getElementById('arrow1'))
        break;
      case 39:
        size(document.getElementById('arrow2'))
        break;
    }
  }

}

const images = [
  '<iframe src=' + covid + ' id="line-chart" style="opacity: 0""></iframe>',
  '<img src=' + messageboard + ' id="messageboard" style="opacity: 0""></img>',
  '<iframe src=' + game_ratings + ' id="game-ratings" style="opacity: 0""></iframe>',
  '<iframe src=' + pomodoro_clock + ' id="pomodoro" style="opacity: 0""></iframe>',
  '<iframe src=' + brick_destroyer + ' id="brick-destroyer" style="opacity: 0""></iframe>',
]

let index = 0
function next(ele) {
  ele.style.width = '100px'
  ele.style.right = '25px'
  ele.style.top = '275px'

  if (index >= images.length - 1) {
    index = -1
  }

  index++;

  document.querySelector('#example').childNodes[0].style.opacity = 0
}

function previous(ele) {
  ele.style.width = '100px'
  ele.style.left = '25px'
  ele.style.top = '275px'

  if (index <= 0) {
    index = images.length
  }
  index--;

  document.querySelector('#example').childNodes[0].style.opacity = 0
}

function size(ele) {
  ele.style.width = '130px'
  ele.style.top = '260px'
  ele.style.left = ''
  ele.style.right = ''

  setTimeout(() => {
    document.getElementById('example').innerHTML = images[index]
  }, 200);
  setTimeout(() => {
    document.querySelector('#example').childNodes[0].style.opacity = 1
  }, 220);
}

let condition = 'show'
function toggle(ele) {
  let cv = document.getElementById('cv')
  if (condition == 'show') {
    condition = 'hide'
    ele.src = 'Images/plus-icon.png'
    cv.style.height = '20px'
  } else {
    condition = 'show'
    ele.src = 'Images/minus-icon.png'
    cv.style.height = ''
  }
}
toggle(document.getElementById('toggle'))

let header = document.getElementsByTagName('header')[0]
header.innerHTML = '<h1 id="title">Michael Manke</h1><p>Welcome to my website where I showcase my projects</p>'
header.style.opacity = 1