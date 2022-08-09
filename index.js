let projects = document.getElementsByClassName('project');

for (let project of projects) {
  project.addEventListener('click', projectRedirect);
}

const covid = 'DataVisualizations/CovidVisualization/index.html';
const game_ratings = 'DataVisualizations/GameRatings/Q5/choropleth.html';
const pomodoro_clock = 'PomodoroClock/index.html';
const brick_destroyer = 'BrickDestroyer/index.html';
const chatroom = 'https://Chatroom.battlekingcoder.repl.co';
const american_education = 'DataVisualizations/AmericanEducation/index.html';
const library = 'https://Personal-Library.battlekingcoder.repl.co';
const stockprice_checker = 'https://Stockprice-Checker.battlekingcoder.repl.co';
const sudoku_solver = 'https://Sudoku-Solver.battlekingcoder.repl.co';
const treemap = 'DataVisualizations/TrashDisposal/treemap.html';
const tooth = 'DataVisualizations/volume-rendering/index.html';
const vector_visualization =
  'DataVisualizations/vector-visualization/index.html';
const github = 'https://github.com/MManke188';
const fiverr = 'https://www.fiverr.com/m_manke';
const mail = 'mailto:michaelmanke00@gmail.com';
const freeCodeCamp = 'https://www.freecodecamp.org/mmanke';
const replit = 'https://replit.com/@BattleKingCoder';
const lebenslauf = 'Images/CV_img.png';
const freecell = 'FreeCell/FreeCell.html';
const minesweeper = 'Minesweeper/index.html';
const shopping_list = 'ShoppingList/index.html';

function projectRedirect(event) {
  let project;
  if (event.srcElement !== undefined) {
    project = event.srcElement.id;
  } else {
    project = event.id;
  }
  switch (project) {
    case 'brick-destroyer':
      window.open(brick_destroyer, '_blank');
      break;
    case 'chatroom':
      window.open(chatroom, '_blank');
      break;
    case 'line-chart':
      window.open(covid, '_blank');
      break;
    case 'choropleth-map':
      window.open(american_education, '_blank');
      break;
    case 'messageboard':
      window.open(
        'https://Anonymous-Messageboard.battlekingcoder.repl.co',
        '_blank'
      );
      break;
    case 'library':
      window.open(library, '_blank');
      break;
    case 'pomodoro':
      window.open(pomodoro_clock, '_blank');
      break;
    case 'stockprice-checker':
      window.open(stockprice_checker, '_blank');
      break;
    case 'sudoku-solver':
      window.open(sudoku_solver, '_blank');
      break;
    case 'game-ratings':
      window.open(game_ratings, '_blank');
      break;
    case 'treemap':
      window.open(treemap, '_blank');
      break;
    case 'tooth':
      window.open(tooth, '_blank');
      break;
    case 'vector-visualization':
      window.open(vector_visualization, '_blank');
      break;
    case 'github':
      window.open(github, '_blank');
      break;
    case 'fiverr':
      window.open(fiverr, '_blank');
      break;
    case 'mail':
      window.open(mail, '_blank');
      break;
    case 'fCC':
      window.open(freeCodeCamp, '_blank');
      break;
    case 'replit':
      window.open(replit, '_blank');
      break;
    case 'lebenslauf':
      window.open(lebenslauf, '_blank');
      break;
    case 'freecell':
      window.open(freecell, '_blank');
      break;
    case 'minesweeper':
      window.open(minesweeper, '_blank');
      break;
    case 'shopping_list':
      window.open(shopping_list, '_blank');
      break;
  }
}

document.addEventListener('keydown', handleKeyPress);
document.addEventListener('keyup', handleKeyPress);

function handleKeyPress(event) {
  if (event.repeat) {
    return;
  }
  if (event.type === 'keydown') {
    switch (event.keyCode) {
      case 37:
        previous(document.getElementById('arrow1'));
        break;
      case 39:
        next(document.getElementById('arrow2'));
        break;
      case 13:
        document.querySelector('#example iframe').click();
        break;
    }
  } else if (event.type === 'keyup') {
    switch (event.keyCode) {
      case 37:
        size(document.getElementById('arrow1'));
        break;
      case 39:
        size(document.getElementById('arrow2'));
        break;
    }
  }
}

const images = [
  '<iframe src=' +
    shopping_list +
    ' id="shopping_list" style="opacity: 0"</iframe>',
  '<iframe src=' + covid + ' id="line-chart" style="opacity: 0""></iframe>',
  '<iframe src=' +
    brick_destroyer +
    ' id="brick-destroyer" style="opacity: 0""></iframe>',
  '<iframe src=' + freecell + ' id="freecell" style="opacity: 0"</iframe>',
  '<iframe src=' +
    game_ratings +
    ' id="game-ratings" style="opacity: 0""></iframe>',
  '<iframe src=' +
    pomodoro_clock +
    ' id="pomodoro" style="opacity: 0""></iframe>',
];

let index = 0;
function next(ele) {
  ele.style.width = '8%';
  ele.style.right = '2%';
  ele.style.top = '41%';

  if (index >= images.length - 1) {
    index = -1;
  }

  index++;
  document.querySelector('#example iframe').style.opacity = 0;
}

function previous(ele) {
  ele.style.width = '8%';
  ele.style.left = '2%';
  ele.style.top = '41%';

  if (index <= 0) {
    index = images.length;
  }
  index--;

  document.querySelector('#example').childNodes[0].style.opacity = 0;
}

function size(ele) {
  ele.style.width = '10%';
  ele.style.top = '40%';
  ele.style.left = '';
  ele.style.right = '';

  setTimeout(() => {
    document.getElementById('example').innerHTML = images[index];
  }, 200);
  setTimeout(() => {
    document.querySelector('#example').childNodes[0].style.opacity = 1;
  }, 220);
}

let condition = 'show';
function toggle(ele) {
  let cv = document.getElementById('cv');
  if (condition == 'show') {
    condition = 'hide';
    ele.src = 'Images/plus-icon.png';
    cv.style.height = '1.38vw';
  } else {
    condition = 'show';
    ele.src = 'Images/minus-icon.png';
    cv.style.height = '';
  }
}
toggle(document.getElementById('toggle'));

let header = document.getElementsByTagName('header')[0];
header.innerHTML =
  '<h1 id="title">Michael Manke</h1><p>Welcome to my website where I showcase my projects</p>';
header.style.opacity = 1;

let reviews = [
  {
    text: 'Solid guy! Quality work! Helped me with my doubts and queries very patiently.',
    author: 'okokok7',
  },
  {
    text: 'Great work as usual!',
    author: 'jordanhuang948',
  },
  {
    text: 'Perfect',
    author: 'jordanhuang948',
  },
  {
    text: 'Great communication, careful about details. Delivered my work in time and was friendly all along the way.',
    author: 'djamsf',
  },
  {
    text: 'Delivered everything I asked for.',
    author: 'streamlineninja',
  },
  {
    text: 'm_manke delivered just what I asked and went the extra mile with this graph, very pleased with his work.',
    author: 'angelante',
  },
];
let i = 0;
function reviewShuffle() {
  let newIndex = Math.floor(Math.random() * reviews.length);
  while (newIndex == i) {
    newIndex = Math.floor(Math.random() * reviews.length);
  }
  i = newIndex;
  let review = reviews[i];
  document.getElementById('text').innerHTML = '"' + review.text + '"';
  document.getElementById('author').innerHTML = '- ' + review.author;
}
window.setInterval(function () {
  reviewShuffle();
}, 10000);
