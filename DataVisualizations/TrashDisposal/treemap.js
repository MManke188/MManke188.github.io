// storing all of the original data in one array
let originalData = []
d3.csv('Processed_Data/2016-2017-Table.csv', (err, data) => {
  if (!err) {
    originalData.push(data)
  }
})
d3.csv('Processed_Data/2017-2018-Table.csv', (err, data) => {
  if (!err) {
    originalData.push(data)
  }
})
d3.csv('Processed_Data/2018-2019-Table.csv', (err, data) => {
  if (!err) {
    originalData.push(data)
  }
})

// setting up scales
let yearScale = d3.scale.ordinal().domain(["2016-2017", "2017-2018", "2018-2019"]).range([[1, 2], [0, 2], [0, 1]])

let inverseYearScale = d3.scale.ordinal().domain(["2016-2017", "2017-2018", "2018-2019"]).range([["2017-2018", "2018-2019"], ["2016-2017", "2018-2019"], ["2016-2017", "2017-2018"]])

// settinng up the tooltip
const tip = d3.tip()
  .attr('id', 'tooltip')
  .style('border', '1px solid red')
  .style('background', 'lightgrey')
  .style('padding', '5px')
  .offset([-10, 0])

function load(year) {
  if (window.location.hash === "") {
    d3.csv(year, function (err, res) {
      if (!err) {
        // removing dots from the numbers
        res.forEach((ele) => {
          ele.value = Number(ele.Amount.replace('.', ''))
          delete ele.Amount
        })

        // removing existing elements
        d3.selectAll('svg').transition().duration(500).style('opacity', '0').remove()
        d3.selectAll('p').remove()

        // setting up the data
        var data = d3.nest().key(function (d) { return d.Jurisdiction; }).key(function (d) { return d.Fate; }).key(function (d) { return d.value }).entries(res);
        main({ title: "All Waste Generation in Australia by Jurisdiction" }, { key: "Total", values: data })

        // smooth transition
        d3.selectAll('g').transition().duration(1500).style('opacity', '1')
      }
    });
  }
}

window.addEventListener('message', function (e) {
  var opts = e.data.opts,
    data = e.data.data;

  return main(opts, data);
});

// some additional variables
var defaults = {
  margin: { top: 24, right: 0, bottom: 0, left: 0 },
  rootname: "TOP",
  format: ",d",
  title: "",
  width: 1360,
  height: 800
};

function main(o, data) {
  // Setting up the chart
  var root,
    opts = $.extend(true, {}, defaults, o),
    formatNumber = d3.format(opts.format),
    rname = opts.rootname,
    margin = opts.margin,
    theight = 36 + 16;

  $('#chart').width(opts.width).height(opts.height);
  var width = opts.width - margin.left - margin.right,
    height = opts.height - margin.top - margin.bottom - theight,
    transitioning;

  var x = d3.scale.linear()
    .domain([0, width])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([0, height])
    .range([0, height]);

  var treemap = d3.layout.treemap()
    .children(function (d, depth) { return depth ? null : d._children; })
    .sort(function (a, b) { return a.value - b.value; })
    .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
    .round(false);

  var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .style("margin-left", -margin.left + "px")
    .style("margin.right", -margin.right + "px")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style('opacity', '0')

  var grandparent = svg.append("g")
    .attr("class", "grandparent")

  grandparent.append("rect")
    .attr("y", -margin.top)
    .attr("width", width)
    .attr("height", margin.top)

  grandparent.append("text")
    .attr("x", 6)
    .attr("y", 6 - margin.top)
    .attr("dy", ".75em");

  if (opts.title) {
    $("#chart").prepend("<p class='title'>" + opts.title + "</p>");
  }
  if (data instanceof Array) {
    root = { key: rname, values: data };
  } else {
    root = data;
  }

  initialize(root);
  accumulate(root);
  layout(root);
  display(root);

  if (window.parent !== window) {
    var myheight = document.documentElement.scrollHeight || document.body.scrollHeight;
    window.parent.postMessage({ height: myheight }, '*');
  }

  function initialize(root) {
    root.x = root.y = 0;
    root.dx = width;
    root.dy = height;
    root.depth = 0;
  }

  function accumulate(d) {
    return (d._children = d.values)
      ? d.value = d.values.reduce(function (p, v) { return p + accumulate(v); }, 0)
      : d.value;
  }

  function layout(d) {
    if (d._children) {
      treemap.nodes({ _children: d._children });
      d._children.forEach(function (c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }

  function display(d) {
    // set up rectangles for transition
    grandparent
      .datum(d.parent)
      .on("click", transition)
      .select("text")
      .text(name(d));

    var g1 = svg.insert("g", ".grandparent")
      .datum(d)
      .attr("class", "depth")

    var g = g1.selectAll("g")
      .data(d._children)
      .enter().append("g")

    g.filter(function (d) { return d._children; })
      .classed("children", true)
      .on("click", transition)

    var children = g.selectAll(".child")
      .data(function (d) { return d._children || [d]; })
      .enter().append("g")

    children.append("rect")
      .attr("class", "child")
      .call(rect)

    // Adding a label to the rectangle
    children.append("text")
      .attr("class", "ctext")
      .text(function (d) {
        if (d.key == Number(d.key)) {
          return
        } else {
          return d.key + ' ' + formatNumber(d.value)
        }
      })
      .call(text2);

    // Setting up the tooltip
    tip.html(function (d) {
      let text = ''

      // first case for the initial level of the treemap
      if (!Number(d.key) && d.key !== undefined) {
        let total = d.parent.value
        let disposed
        let recycled
        let recycledPercentage
        if (d.parent.values[0].key == 'Recycled') {
          recycledPercentage = d.parent.values[0].values[0].values[0]['Percentage of plastic recovered']
          recycled = d.parent.values[0].value
          disposed = d.parent.values[1].value
        } else if (d.parent.values[0].key == 'Disposed') {
          disposed = d.parent.values[0].value
          recycled = d.parent.values[1].value
          recycledPercentage = d.parent.values[1].values[0].values[0]['Percentage of plastic recovered']
        } else {
          disposed = d.parent.values[2].value
          recycled = d.parent.values[1].value
          recycledPercentage = d.parent.values[1].values[0].values[0]['Percentage of plastic recovered']
        }


        // Creating the innerHTML of the tooltip
        text = '<strong>Total plastic generated: </strong>' + formatNumber(total) + '<br><strong>Disposed: </strong>' + formatNumber(disposed) + '<br><strong>% Disposed: </strong>' + Math.round((Number(disposed) / Number(total) * 100)) + '%<br><strong>Recycled: </strong>' + formatNumber(recycled) + '<br><strong>% Recycled: </strong>' + recycledPercentage

        if (d.parent.key == 'SA') {
          d.parent.values.forEach((value) => {
            if (value.key == 'Energy recovery') {
              text += '<br><strong>Energy recovered: </strong>' + formatNumber(value.value) + '<br>'

              text += '<strong>% Energy recovered: </strong>' + value.values[0].values[0]['Percentage of plastic recovered'] + '<br>'
            }
          })
        }
      } else {
        // This is the tooltip for when a jurisdiction is selected
        if (d.key !== undefined) {
          let otherYears = yearScale(d.values[0]['Year'])
          let category = d.parent.key
          let area = d.parent.parent.key
          if (category == 'Recycled') {
            text += '<strong>% Recycled in ' + d.values[0]['Year'] + ': </strong>' + d.values[0]['Percentage of plastic recovered'] + '<br>'
          } else if (category == 'Energy recovery') {
            text += '<strong>% Energy recovered in ' + d.values[0]['Year'] + ': </strong>' + d.values[0]['Percentage of plastic recovered'] + '<br>'
          }
          otherYears.forEach((year) => {
            originalData[year].forEach((val) => {
              if (val['Jurisdiction'] == area && val['Fate'] == category) {
                if (category == 'Recycled') {
                  text += '<strong>% Recycled in ' + val['Year'] + ': </strong>' + val['Percentage of plastic recovered'] + '<br>'
                } else if (category == 'Disposed') {
                  text += '<strong>Disposed in ' + val['Year'] + ': </strong>' + formatNumber(val['Amount']) + '<br>'
                } else {
                  text += '<strong>% Energy recovered in ' + val['Year'] + ': </strong>' + val['Percentage of plastic recovered'] + '<br>'
                }
              }
            })
          })
        }
      }
      return text;
    })

    svg.append('circle')
      .attr('id', 'tipfollowscursor')
    svg.call(tip);

    children
      .on('mouseover', function (d) {
        let target = d3.select('#tipfollowscursor')
          .attr('cx', d3.event.offsetX)
          .attr('cy', d3.event.offsetY - 25) // 25 pixels above the cursor
          .node();
        tip.show(d, target);
      })
      .on('mousemove', function (d) {
        var target = d3.select('#tipfollowscursor')
          .attr('cx', d3.event.offsetX)
          .attr('cy', d3.event.offsetY - 25) // 25 pixels above the cursor
          .node();
        tip.show(d, target);
      })

      .on('mouseout', tip.hide)

    g.append("rect")
      .attr("class", "parent")
      .call(rect);

    var t = g.append("text")
      .attr("class", "ptext")
      .attr("dy", ".75em")

    t.append("tspan")
      .text(function (d) {
        return d.key;
      });
    t.append("tspan")
      .attr("dy", "1.0em")
      .text(function (d) { return formatNumber(d.value); });
    t.call(text);

    g.selectAll("rect.child")
      .style("fill", (d) => {
        return colorRect(d)
      })
      .style('opacity', '0.8')

    d3.selectAll('.children')
      .on('mouseenter', () => {
        // change the color when hovering over a rectangle
        this.event.srcElement.childNodes.forEach((node) => {
          if (node.attributes.class !== undefined) {
            if (node.attributes.class.value == 'parent') {
              node.style.fill = 'yellow'
              node.style.opacity = '1'
            }
          }
        })
      })
      .on('mouseleave', (d) => {
        // ensure the color gets reset to its correct value
        this.event.srcElement.childNodes.forEach((node) => {
          if (node.attributes.class !== undefined) {
            if (node.attributes.class.value == 'parent') {
              node.style.fill = colorRect(d)
              node.style.opacity = '0'
            }
          }
        })
      })

    function transition(d) {
      // Don't allow transitions beyond the second level. (remove last three conditions if unwanted)
      if (transitioning || !d || d.key == 'Disposed' || d.key == 'Recycled' || d.key == 'Energy recovery') return;
      transitioning = true;

      var g2 = display(d),
        t1 = g1.transition().duration(750),
        t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function (a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
      t1.selectAll(".ctext").call(text2).style("fill-opacity", 0);
      t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
      t2.selectAll(".ctext").call(text2).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function () {
        transitioning = false;
      });

      console.log(d.key)
      if (d.key === "Total") {
        document.querySelectorAll('.children rect').forEach((ele) => {
          ele.style.cursor = 'zoom-in'
        })
        document.querySelectorAll('.grandparent rect').forEach((ele) => {
          ele.style.cursor = ''
        })

      } else {
        document.querySelectorAll('.children rect').forEach((ele) => {
          ele.style.cursor = 'default'
        })
        document.querySelectorAll('.grandparent rect').forEach((ele) => {
          ele.style.cursor = 'zoom-out'
        })
      }
    }
    return g;
  }

  function text(text) {
    text.selectAll("tspan")
      .attr("x", function (d) { return x(d.x) + 6; })
    text.attr("x", function (d) { return x(d.x) + 6; })
      .attr("y", function (d) {
        if (d.dy > 16) {
          return y(d.y) + 6;
        } else {
          if (this.childNodes[1] !== undefined) {
            this.childNodes[0].innerHTML = this.childNodes[0].innerHTML + ' ' + this.childNodes[1].innerHTML
            this.childNodes[1].remove()
          }
          return y(d.y) + (y(d.y) + 1) / y(d.y)
        }
      })
      .style("opacity", function (d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; })
      .style('font-size', (d) => {
        if (d.dy < 5) {
          return 8 * d.dy
        }
      })
  }

  function text2(text) {
    text.attr("x", function (d) { return x(d.x + d.dx) - this.getComputedTextLength() - 6; })
      .attr("y", function (d) { return y(d.y + d.dy) - 6; })
      .style("opacity", function (d) {
        if (y(d.dy) < 16) {
          return 0
        }
        return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0;
      })
      .style('font-size', () => {
        return 16
      })
  }

  function rect(rect) {
    rect.attr("x", function (d) { return x(d.x); })
      .attr("y", function (d) { return y(d.y); })
      .attr("width", function (d) { return x(d.x + d.dx) - x(d.x); })
      .attr("height", function (d) { return y(d.y + d.dy) - y(d.y); })
  }

  function name(d) {
    return d.parent
      ? name(d.parent) + " / " + d.key + " (" + formatNumber(d.value) + ")"
      : d.key + " (" + formatNumber(d.value) + ")";
  }
}

// color each rect according to region and category
function colorRect(d) {
  let reg
  let cat
  reg = d.parent.key
  cat = d.key

  if (reg == 'NSW') {
    if (cat == 'Disposed') {
      return '#0063B2FF'
    }
    else if (cat == 'Recycled') {
      return '#9CC3D5FF'
    }
  }
  else if (reg == 'SA') {
    if (cat == 'Disposed') {
      return 'rgb(51, 110, 123)'
    }
    else if (cat == 'Recycled') {
      return 'rgb(78, 205, 196)'
    }
    else if (cat == 'Energy recovery') {
      return 'rgb(162, 222, 208)'
    }
  }
  else if (reg == 'VIC') {
    if (cat == 'Disposed') {
      return '#9E1030FF'
    }
    else if (cat == 'Recycled') {
      return '#DD4132FF'
    }
  }
  else if (reg == 'WA') {
    if (cat == 'Disposed') {
      return 'rgb(108,122,137)'
    }
    else if (cat == 'Recycled') {
      return 'rgb(210,215,211)'
    }
  }
  else if (reg == 'QLD') {
    if (cat == 'Disposed') {
      return 'rgb(148,124,176)'
    }
    else if (cat == 'Recycled') {
      return 'rgb(220,198,224)'
    }
  }
  else if (reg == 'TAS') {
    if (cat == 'Disposed') {
      return '#755139FF'
    }
    else if (cat == 'Recycled') {
      return '#F2EDD7FF'
    }
  }
  else if (reg == 'NT') {
    if (cat == 'Disposed') {
      return '#343148FF'
    }
    else if (cat == 'Recycled') {
      return '#D7C49EFF'
    }
  }
  else if (reg == 'ACT') {
    if (cat == 'Disposed') {
      return '#3C1053FF'
    }
    else if (cat == 'Recycled') {
      return '#DF6589FF'
    }
  }
  else if (d.key == Number(d.key) && d.key !== '') {
    return colorRect(d.parent)
  }
  else {
    return 'transparent'
  }
}

// call the initial function
load("Processed_Data/2016-2017-Table.csv")
