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
  .domain(['Deaths', 'Total Cases', 'Total Vaccinations', 'People Fully Vaccinated'])
  .range(['black', 'red', 'blue', 'green'])

backgroundColor = d3.scaleOrdinal()
  .domain(['Deaths', 'Total Cases', 'Total Vaccinations', 'People Fully Vaccinated'])
  .range(['rgb(245, 245, 245)', 'rgb(255, 245, 245)', 'rgb(245, 245, 255)', 'rgb(245, 255, 245)'])

xAxisCall = d3.axisBottom().tickFormat(d3.timeFormat("%b' %y"))
xAxis = g.append('g')
  .attr('transform', `translate(0, ${height})`)
yAxisCall = d3.axisLeft()
yAxis = g.append('g')

// This will create the line:
lineGen = d3.line()
  .x(d => x(d.date))
  .y(d => y(d.value))

// Adding the tooltip
let tooltip = d3.select('#tooltip')
// The tooltip needs to be shown, when the cursor hovers over the line
line = g.append('path')
  .on('mouseover', function () {
    tooltip.transition()
      .duration(500)
      .style('opacity', .9)
  })
  .on('mouseout', function () {
    tooltip.transition()
      .duration(1000)
      .style("opacity", 0);

  })
  .on('mousemove', function (d) {

    // Below we are extracting the data from the string that generates the line
    // (let it be noted that this seems wrong, however for now it does work correctly)
    // It could be done with a simple inveresion of the x value and assigning the amount accordingly, but for that we need access to the data
    let regex = /[ML](\d+\.*\d*),/g
    let str = d.srcElement.attributes.d.value
    let cat = d.srcElement.attributes.category.value
    let arr = str.match(regex)
    arr.forEach((d, i) => {
      arr[i] = d.slice(1, d.length - 1)
    })
    let values = d.srcElement.attributes.info.value.split(',')
    let dates = d.srcElement.attributes.date.value.split(',')

    for (let i = 0; i < arr.length; i++) {
      // We are looking for the correct data from the string to display
      if (arr[i] > d.x - margins.left - 16.82396039604 && arr[i] <= d.x - margins.left - 15.82396039604) {
        // This ensures, that large numbers have commas every 3 digits.
        let number = ''
        for (let j = 3; values[i].length > j; j += 4) {
          values[i] = values[i].slice(0, -j) + ',' + values[i].slice(-j)
        }
        number = values[i]
        date = dates[i].slice(0, 15)


        show = number + ' ' + cat + '<br/>' + date
        tooltip.select('text').html(show)
        tooltip.append('text')
          .attr('information', show)
          .attr('class', 'tooltip_text')
          .style('font-size', '25px')
        break
      }
    }
  })

parser = d3.timeParse(d3.timeParse('%Y-%m-%d'))


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

        const countries = {}
        let dropdown = document.getElementById('country')
        let dropdown2 = document.getElementById('category')
        let country = sorted[0][0]
        let symbol = "Deaths"
        sorted.forEach((c) => {
          countries[c[0]] = c[1].data
          dropdown.innerHTML += '<option value="' + c[0] + '">' + c[1].location + '</option>'
        })

        dropdown.addEventListener('change', function (event) {
          country = event.target.value
          load2(country, symbol, countries);
        })

        dropdown2.addEventListener('change', function (event) {
          symbol = event.target.value
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
  }).reverse().slice(0, 10)

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
      "Total Cases": d.total_cases || d['Total Cases'] || 0,
      "Deaths": d.total_deaths || d['Deaths'] || 0,
      "Total Vaccinations": d.total_vaccinations || d['Total Vaccinations'] || value2,
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
      value: data[i][symbol]
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
  svg.style('background-color', backgroundColor(symbol))
  line.attr('fill', 'none')
    .attr('stroke-width', 4)
    .transition()
    .duration(250)
    // Adding a smoother transition:
    .style('opacity', 0)
    .transition()
    .duration(10)
    .attr('stroke', color(symbol))
    .attr('d', lineGen(data))
    // Adding some info for the tooltip:
    .attr('info', data.map((d) => d.value))
    .attr('date', data.map(d => d.date))
    .attr('category', symbol)
    // Finishing the smooth transition:
    .transition()
    .duration(250)
    .style('opacity', 1)

}

// Make the page load before user selection:
load()