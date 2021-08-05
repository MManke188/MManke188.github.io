// Predefine styling/size (margins, borders, padding)

// Setting up the graph, axis, scales,...
graph = d3.select('#graph').style('margin', '30px').style('width', '800px')
total_width = graph.style('width').slice(0, -2)
total_height = total_width * 0.5625
margins = {
  top: 50,
  left: 100,
  right: 20,
  bottom: 40
}
width = total_width - margins.left - margins.right
height = total_height - margins.top - margins.bottom

svg = graph.append('svg')
  .style('width', `${total_width}px`)
  .style('height', `${total_height}px`)
  .style('background-color', 'rgb(245, 245, 245)')
  .style('border', '1px solid #888')

g = svg.append('g')
  .attr('transform', `translate(${margins.left}, ${margins.top})`)
  .attr('width', width + 'px')
  .attr('height', height + 'px')

let tooltip = d3.select('#tooltip').style('position', 'relative').style('left', '30px')

x = d3.scaleTime().range([0, width])
y = d3.scaleLinear().range([height, 0])

xAxisCall = d3.axisBottom().tickFormat(d3.timeFormat("%b' %y")).ticks(d3.timeMonth.every(1))
xAxis = g.append('g')
  .attr('transform', `translate(0, ${height})`)
yAxisCall = d3.axisLeft()
yAxis = g.append('g')

parser = d3.timeParse(d3.timeParse('%Y-%m-%d'))

// Global variables (countries, colors, scales)

const numberOfCountries = 14

/*
Allow the user to change the number of Countries:

function amount(num) {
  numberOfCountries = num
  //Inefficient:
  load()
}
*/

const options = {
  categories: ['Deaths', 'New Deaths', 'New Deaths per million', 'Cases', 'New Cases', 'New Cases per million', 'People Vaccinated', 'People Vaccinated per hundred', 'People Fully Vaccinated', 'People Fully Vaccinated per hundred'],
  names: ['total_deaths', 'new_deaths_smoothed', 'new_deaths_smoothed_per_million', 'total_cases', 'new_cases_smoothed', 'new_cases_smoothed_per_million', 'people_vaccinated', 'people_vaccinated_per_hundred', 'people_fully_vaccinated', 'people_fully_vaccinated_per_hundred'],
  colors: ['black', 'lightgrey', 'darkgrey', 'red', 'pink', 'orange', 'lightblue', 'blue', 'lightgreen', 'green'],
  backgroundColors: []
}

for (let i = 0; i < options.colors.length; i++) {
  let c = d3.rgb(options.colors[i])
  c.opacity = 0.1
  options.backgroundColors[i] = c
}

color = d3.scaleOrdinal()
  .domain(options.names)
  .range(options.colors)

backgroundColor = d3.scaleOrdinal()
  .domain(options.names)
  .range(options.backgroundColors)

symbolScale = d3.scaleOrdinal()
  .domain(options.names)
  .range(options.categories)


// Get, sort, filter and set up the data correctly
function load() {
  // Getting the covid data:
  let covidData = 'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.json'

  d3.json(covidData)
    .then((data, error) => {
      if (error) {
        console.log(error)
      } else {
        console.log('This is the original data:')
        console.log(data)

        let category = options.names[0]

        let modified = modify(data)

        let filtered = filter(modified)

        let sorted = sort(filtered, category)

        setUpCategories()
        setUpCountries(sorted, category)
        eventListeners(sorted, category)

        let country = sorted[0][0]
        let finalData = setUp(sorted, country)

        display(finalData, category)
      }
    })
}

function modify(data) {
  data = Object.entries(data)

  data.forEach((country) => country.push({}))

  for (let i = 0; i < options.names.length; i++) {
    symbol = options.names[i]
    data.forEach((country) => {
      country[0] = country[1].location
      let arr = []
      country[1].data.forEach((day) => {
        if (day[symbol] !== undefined) {
          arr.push(Number(day[symbol]))
        }
      })

      if (arr.length > 0) {
        country[2][options.names[i]] = arr[arr.length - 1]
      } else {
        country[2][options.names[i]] = 0
      }

    })
  }
  return data
}

function sort(data, category) {
  let sorted = data.sort((a, b) => {
    return b[2][category] - a[2][category]
  }).slice(0, numberOfCountries)
  return sorted
}

function filter(data) {
  data = data.filter((country) => {
    return country[1].hasOwnProperty('continent')
  })
  return data
}

function setUp(data, country) {
  data.forEach((location) => {
    if (location[0] == country) {
      data = location
    }
  })
  return data
}

function categoryFilter(data, category) {
  return data[1].data.filter((day) => {
    return day[category] !== undefined
  })
}

// Set up dropdown
function setUpCountries(data, category) {
  let dropdown = document.getElementById('country')
  dropdown.innerHTML = ''

  for (let i = 0; i < data.length; i++) {
    let number = numberWithCommas(data[i][2][category])
    dropdown.innerHTML += '<option class="selection" value="' + data[i][0] + '">' + `${i + 1}. ` + data[i][0] + ' (' + number + ' ' + symbolScale(category) + ')' + '</option>'
  }

}

function setUpCategories() {
  let dropdown = document.getElementById('category')
  for (let i = 0; i < options.categories.length; i++) {
    dropdown.innerHTML += `{<option value="${options.names[i]}">${options.categories[i]}</option>}`
  }
}

function eventListeners(data, category) {

  // Country changes:
  let dropdown = document.getElementById('country')
  dropdown.addEventListener('change', function (event) {
    country = event.target.value
    let finalData = setUp(data, country)
    display(finalData, category);
  })

  // Category changes:
  let dropdown2 = document.getElementById('category')
  dropdown2.addEventListener('change', function (event) {
    category = event.target.value
    country = dropdown.value

    data = sort(data, category)
    let finalData = setUp(data, country, category)
    display(finalData, category)
    setUpCountries(data, category)
    // Make sure the previously selected country stays selected
    dropdown.value = country
  })
}

// Set up the axis: adjust height and width dynamically to the data
function setUpAxis(data, category) {
  x.domain(d3.extent(data, d => parser(d.date)))

  y.domain([0, d3.max(data, d => {
    return d[category]
  })])

  xAxis.transition()
    .duration(500)
    .call(xAxisCall.scale(x))
  yAxis.transition()
    .duration(500)
    .call(yAxisCall.scale(y))
}

// Display data: Line, circles, tooltip
function display(data, category) {
  data = categoryFilter(data, category)
  setUpAxis(data, category)

  svg.style('background-color', backgroundColor(category))

  g.selectAll('.line').remove()

  g.append('path')
    .datum(data)
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke-width', 2)
    .transition()
    .duration(250)
    // Adding a smoother transition:
    .style('opacity', 0)
    .transition()
    .duration(10)
    .attr('stroke', color(category))
    .attr('d', d3.line()
      .x(d => x(parser(d.date)))
      .y(d => y(d[category])))
    // Finishing the smooth transition:
    .transition()
    .duration(250)
    .style('opacity', 1)

  g
    .append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr('class', 'line dot')
    .attr('id', d => d.date)
    .attr("cx", function (d) { return x(parser(d.date)) })
    .attr("cy", function (d) { return y(d[category]) })
    .attr("r", 1.5)
    .attr("fill", color(category))

  g
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr('class', 'line')
    .attr("x", (d) => x(parser(d.date)))
    .attr("y", 0)
    .attr("height", height)
    .attr("width", width / data.length)
    .attr("fill", 'transparent')
    .on('mouseover', function (event, element) {
      d3.selectAll('.dot').attr('r', 1.5)
      d3.select('[id="' + element.date + '"]')
        .attr("r", 8)

      tooltip.transition()
        .duration(100)
        .style('opacity', 1)
    })
    .on('mousemove', function (event, d) {
      let date = String(d.date).slice(0, 15)
      let number = numberWithCommas(d[category])
      let cat = symbolScale(category)

      show = number + ' ' + cat + '<br/>' + date
      tooltip.select('text').html(show)
      tooltip.append('text')
        .attr('information', show)
        .attr('class', 'tooltip_text')
        .style('font-size', '25px')
    })

}

function numberWithCommas(x) {
  x = Math.round(x)
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

load()