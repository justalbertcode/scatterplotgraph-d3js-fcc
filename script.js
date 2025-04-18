const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

const margin = { top: 60, right: 40, bottom: 60, left: 60 };
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#scatterplot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip");

fetch(url)
  .then(response => response.json())
  .then(data => {
    const parseTime = d3.timeParse("%M:%S");

    data.forEach(d => {
      d.ParsedTime = parseTime(d.Time);
    });

    const x = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.Year) - 1,
        d3.max(data, d => d.Year) + 1
      ])
      .range([0, width]);

    const y = d3.scaleTime()
      .domain(d3.extent(data, d => d.ParsedTime))
      .range([0, height]);

    // Оси
    const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(y).tickFormat(d3.timeFormat("%M:%S"));

    svg.append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    svg.append("g")
      .attr("id", "y-axis")
      .call(yAxis);

    // Точки
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.Year))
      .attr("cy", d => y(d.ParsedTime))
      .attr("r", 6)
      .attr("data-xvalue", d => d.Year)
      .attr("data-yvalue", d => d.ParsedTime.toISOString())
      .attr("fill", d => d.Doping ? "red" : "green")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 0.9)
          .html(`${d.Name} (${d.Nationality})<br>Year: ${d.Year}, Time: ${d.Time}<br>${d.Doping || "No Doping"}`)
          .attr("data-year", d.Year)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // Легенда
    const legend = svg.append("g")
      .attr("id", "legend");

    legend.append("rect")
      .attr("x", width - 200)
      .attr("y", 0)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", "red");

    legend.append("text")
      .attr("x", width - 180)
      .attr("y", 10)
      .text("With doping allegations");

    legend.append("rect")
      .attr("x", width - 200)
      .attr("y", 20)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", "green");

    legend.append("text")
      .attr("x", width - 180)
      .attr("y", 30)
      .text("No doping allegations");
  });