let projects = document.getElementsByClassName('project')

for (let project of projects) {
  project.addEventListener('click', projectRedirect)
}

function projectRedirect(event) {
  let project
  console.log(event)
  if (event.srcElement !== undefined) {
    project = event.srcElement.id
  } else {
    project = event.id
  }
  switch (project) {
    case 'brick-destroyer':
      window.open('BrickDestroyer/index.html', '_blank')
      break;
    case 'calculator':
      window.open('Calculator/public/index.html', '_blank')
      break;
    case 'chatroom':
      window.open('Chatroom/views/pug/index.pug', '_blank')
      break;
    case 'line-chart':
      window.open('Data Visualizations/Covid Visualization/covid3.html', '_blank')
      break;
    case 'choropleth-map':
      window.open('Data Visualizations/American Education/index.html', '_blank')
      break;
    case 'messageboard':
      window.open('Messageboard/views/index.html', '_blank')
      break;
    case 'library':
      window.open('Personal Library/views/index.html', '_blank')
      break;
    case 'pomodoro':
      window.open('Pomodoro Clock/index.html', '_blank')
      break;
    case 'stockprice-checker':
      window.open('Stock Price Checker/views/index.html', '_blank')
      break;
    case 'sudoku-solver':
      window.open('Sudoku Solver/views/index.html', '_blank')
      break;
    case 'game-ratings':
      window.open('Data Visualizations/Game Ratings/Q5/choropleth.html', '_blank')
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
  '<iframe src="Data Visualizations/Covid Visualization/covid3.html" id="line-chart" style="opacity: 0" onclick="projectRedirect(this)"></iframe>',
  '<iframe src="Messageboard/views/index.html" id="messageboard" style="opacity: 0" onclick="projectRedirect(this)"></iframe>',
  '<iframe src="Data Visualizations/Game Ratings/Q5/choropleth.html" id="game-ratings" style="opacity: 0" onclick="projectRedirect(this)"></iframe>',
  '<iframe src="Pomodoro Clock/index.html" id="pomodoro" style="opacity: 0" onclick="projectRedirect(this)"></iframe>',
  '<iframe src="BrickDestroyer/index.html" id="brick-destroyer" style="opacity: 0" onclick="projectRedirect(this)"></iframe>'
]

let index = 0
function next(ele) {
  ele.style.width = '100px'
  ele.style.right = '25px'
  ele.style.top = '250px'

  if (index >= images.length - 1) {
    index = -1
  }

  index++;

  document.querySelector('#example iframe').style.opacity = 0
}

function previous(ele) {
  ele.style.width = '100px'
  ele.style.left = '25px'
  ele.style.top = '250px'

  if (index <= 0) {
    index = images.length
  }
  index--;

  document.querySelector('#example iframe').style.opacity = 0
}

function size(ele) {
  ele.style.width = '130px'
  ele.style.top = '235px'
  ele.style.left = ''
  ele.style.right = ''

  setTimeout(() => {
    document.getElementById('example').innerHTML = images[index]
  }, 200);
  setTimeout(() => {
    document.querySelector('#example iframe').style.opacity = 1
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

let header = document.getElementsByTagName('header')[0]
header.innerHTML = '<h1 id="title">Michael Manke</h1><p>This is the go-to website for anything that I have worked on.</p>'
header.style.opacity = 1