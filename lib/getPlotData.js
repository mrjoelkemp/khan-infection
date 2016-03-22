import {addTo} from './util';

export const infectedColor = '#FF2525';
export const uninfectedColor = '#97C2FC';

export function getPlotData({user: host, siteVersion}) {
  const queue = [host];
  const visited = {};
  const nodes = [];
  const edges = [];

  while (queue.length) {
    const [user] = queue.splice(0, 1);

    if (visited[user.id]) { continue; }

    if (user.isCoach()) {
      generatePlotData(user, nodes, edges, siteVersion, visited);
    }

    visited[user.id] = true;

    addTo(queue, user.getConnectedCoaches());
  }

  return {
    nodes,
    edges
  };
};

function generatePlotData(coach, nodes, edges, siteVersion, visited) {
  nodes.push({
    id: coach.id,
    label: `Coach ${coach.id}`,
    color: coach.siteVersion === siteVersion ? infectedColor : uninfectedColor,
  });

  coach.students.forEach(student => {
    if (!visited[student.id]) {
      visited[student.id] = true;

      nodes.push({
        id: student.id,
        label: `Student ${student.id}`,
        color: student.siteVersion === siteVersion ? infectedColor : uninfectedColor,
      });
    }

    edges.push({
      from: coach.id,
      to: student.id
    });
  });
}