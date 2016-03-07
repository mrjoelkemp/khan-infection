var User = window.KhanInfection.User;

var host = new User();
var student1 = new User();
var student2 = new User();

host.addStudents([student1, student2]);

var student3 = new User();
var coach = new User();

coach.addStudents([student2, student3]);

var infectionSiteVersion = 1;

window.KhanInfection.limitedInfection({
  user: this.host,
  numToInfect: 3,
  siteVersion: infectionSiteVersion
});

var data = window.KhanInfection.getPlotData({user: host, siteVersion: infectionSiteVersion});

var nodes = new vis.DataSet(data.nodes);
var edges = new vis.DataSet(data.edges);

var container = document.getElementById('mynetwork');
var data = {
  nodes: nodes,
  edges: edges
};

var options = {};
var network = new vis.Network(container, data, options);