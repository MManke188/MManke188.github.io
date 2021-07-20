// Setting up the graph, axis, scales,...
graph = d3.select('#graph')
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


x = d3.scaleTime().range([0, width])
y = d3.scaleLinear().range([height, 0])
color = d3.scaleOrdinal()
  .domain(['Deaths', 'Cases', 'Vaccinations', 'People Fully Vaccinated'])
  .range(['black', 'red', 'blue', 'green'])

backgroundColor = d3.scaleOrdinal()
  .domain(['Deaths', 'Cases', 'Vaccinations', 'People Fully Vaccinated'])
  .range(['rgb(245, 245, 245)', 'rgb(255, 245, 245)', 'rgb(245, 245, 255)', 'rgb(245, 255, 245)'])

symbolScale = d3.scaleOrdinal()
  .domain(['Deaths', 'Cases', 'Vaccinations', 'People Fully Vaccinated'])
  .range(['total_deaths', 'total_cases', 'total_vaccinations', 'people_fully_vaccinated'])

// The country scale will later be used to deal with e.g.: USA and United States
countryScale = d3.scaleOrdinal()

xAxisCall = d3.axisBottom().tickFormat(d3.timeFormat("%b' %y"))
xAxis = g.append('g')
  .attr('transform', `translate(0, ${height})`)
yAxisCall = d3.axisLeft()
yAxis = g.append('g')

parser = d3.timeParse(d3.timeParse('%Y-%m-%d'))

const numberOfCountries = 10


function load() {
  // Getting the covid data:
  let covidData = 'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.json'

  d3.json(covidData)
    .then((data, error) => {
      if (error) {
        console.log(error)
      } else {
        console.log('This is the data:')
        console.log(data)
        let sorted = sort(data)

        let countries = {}
        let dropdown = document.getElementById('country')
        let dropdown2 = document.getElementById('category')
        let country = sorted[0][0]
        let symbol = "Deaths"
        let domain = []
        let range = []
        sorted.forEach((c) => {
          countries[c[0]] = c[1].data
          domain.push(c[0])
          dropdown.innerHTML += '<option class="selection" value="' + c[0] + '">' + c[1].location + '</option>'
          range.push(c[1].location)
        })

        countryScale.domain(domain).range(range)

        dropdown.addEventListener('change', function (event) {
          country = event.target.value
          load2(country, symbol, countries);
        })

        dropdown2.addEventListener('change', function (event) {
          symbol = event.target.value
          let sorted = sort2(countries, symbol)
          dropdown.innerHTML = ''
          sorted.forEach((c) => {
            if (c[1][c[1].length - 1][symbol] !== undefined) {
              total = numberWithCommas(c[1][c[1].length - 1][symbol])
            } else {
              total = numberWithCommas(c[1][c[1].length - 1][symbolScale(symbol)])
            }

            dropdown.innerHTML += '<option class="selection" value="' + c[0] + '">' + countryScale(c[0]) + " (Total " + symbol + ": " + total + ")" + '</option>'
          })
          load2(country, symbol, countries);
        })
        load2(country, symbol, countries);
      }
    })
}

function sort(data) {
  let entries = Object.entries(data);

  // This filters out all the continents
  entries = entries.filter((e) => {
    return e[1].continent !== undefined
  })

  let sorted = entries.sort((a, b) => {
    let i = 1
    let j = 1

    while (a[1].data[a[1].data.length - i].total_deaths == undefined && i < a[1].data.length) {
      i++;
      if (i == a[1].data.length) {
        a[1].data[a[1].data.length - i].total_deaths = 0
      }
    }
    while (b[1].data[b[1].data.length - j].total_deaths == undefined && j < b[1].data.length) {
      j++;
      if (j == a[1].data.length) {
        b[1].data[b[1].data.length - j].total_deaths = 0
      }
    }

    return a[1].data[a[1].data.length - i].total_deaths - b[1].data[b[1].data.length - j].total_deaths
  }).reverse().slice(0, numberOfCountries)

  return sorted
}

function sort2(data, symbol) {
  data = Object.entries(data)
  let i = 1

  data.forEach((e, j) => {
    while (e[1][e[1].length - i][symbolScale(symbol)] == undefined && e[1][e[1].length - i][symbol] == undefined && i < e[1].length) {
      i++;
    }
    if (e[1][e[1].length - i][symbolScale(symbol)] !== undefined) {
      e[1][e[1].length - 1][symbol] = e[1][e[1].length - i][symbolScale(symbol)]
    } else {
      e[1][e[1].length - 1][symbol] = e[1][e[1].length - i][symbol]
    }
    i = 1
  })


  let sorted = data.sort((a, b) => {
    return b[1][b[1].length - 1][symbolScale(symbol)] - a[1][a[1].length - 1][symbolScale(symbol)]
  })
  return sorted
}

function load2(country, symbol, data) {

  data = data[country]

  let value1 = 0
  let value2 = 0
  for (let i = 0; i < data.length; i++) {
    let d = data[i]
    // Getting rid of the vaccination bug, that created weird looking graphs
    let fvacc = d.people_fully_vaccinated
    if (fvacc) {
      value1 = fvacc
    }

    let vacc = d.total_vaccinations
    if (vacc) {
      value2 = vacc
    }

    // Now we declare an object with all the data that could be relevant for the selected country
    let result = {
      "date": d.date,
      "Cases": d.total_cases || d['Cases'] || 0,
      "Deaths": d.total_deaths || d['Deaths'] || 0,
      "Vaccinations": d.total_vaccinations || d['Vaccinations'] || value2,
      "People Fully Vaccinated": d.people_fully_vaccinated || d['People Fully Vaccinated'] || value1
    }
    data[i] = result
  }

  // Filter out the data, where the values are 0 for a long time.
  // Note: This makes it easier to inspect interesting parts of the data for the selected country.
  // A downside is, that the comparison between countries is harder.
  data = data.filter((d, i) => {
    if (data[i + 10] == undefined || data[i + 10][symbol] > 0) {
      return true
    }
  })

  let start = {
    month: data[0].date.slice(5, 7),
    year: data[0].date.slice(0, 4)
  }
  let end = {
    month: data[data.length - 1].date.slice(5, 7),
    year: data[data.length - 1].date.slice(0, 4)
  }
  let duration = (end.year * 12 - start.year * 12) + (end.month - start.month)

  xAxisCall.ticks(duration)

  for (let i = 0; i < data.length; i++) {
    let result = {
      date: parser(data[i].date),
      value: data[i][symbol],
      category: symbol
    }
    data[i] = result
  }

  x.domain(d3.extent(data, d => d.date))

  y.domain(d3.extent(data, d => d.value))

  xAxis.transition()
    .duration(500)
    .call(xAxisCall.scale(x))
  yAxis.transition()
    .duration(500)
    .call(yAxisCall.scale(y))

  render(data, symbol)
}

function render(data, symbol) {
  // Selecting the tooltip
  let tooltip = d3.select('#tooltip').style('position', 'relative').style('left', '30px')

  svg.style('background-color', backgroundColor(symbol))

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
    .attr('stroke', color(symbol))
    .attr('d', d3.line()
      .x(d => x(d.date))
      .y(d => y(d.value)))
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
    .attr('class', 'line')
    .attr("cx", function (d) { return x(d.date) })
    .attr("cy", function (d) { return y(d.value) })
    .attr("r", 2)
    .attr("fill", color(symbol))
    .on('mouseover', function () {
      d3.select(this)
        .transition()
        .duration(100)
        .attr("r", 8)

      tooltip.transition()
        .duration(100)
        .style('opacity', 1)
    })
    .on('mouseout', function () {
      d3.select(this).transition()
        .duration('200')
        .attr("r", 2)
        .attr('fill', color(symbol))

      tooltip.transition()
        .duration(1000)
        .style("opacity", 0);

    })
    .on('mousemove', function (event, d) {

      let date = String(d.date).slice(0, 15)
      let number = numberWithCommas(d.value)
      let cat = d.category

      show = number + ' ' + cat + '<br/>' + date
      tooltip.select('text').html(show)
      tooltip.append('text')
        .attr('information', show)
        .attr('class', 'tooltip_text')
        .style('font-size', '25px')
    })

}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Make the page load before user selection:
load()