import {addTo} from './util';

export function limitedInfection({user: host, numToInfect, siteVersion}) {
  if (numToInfect < 1) {
    throw new Error('too few users to infect');
  }

  const queue = [host];
  const visited = {};
  const infected = [];

  while (queue.length) {
    const [user] = queue.splice(0, 1);

    if (visited[user.id]) { continue; }

    const uninfectedStudents = user.students.filter(function(student) {
      return student.siteVersion !== siteVersion;
    });

    const isUserInfected = user.siteVersion === siteVersion;
    const willYouAndYourClassFit = (isUserInfected ? 0 : 1) + uninfectedStudents.length + infected.length <= numToInfect;

    if (user.isCoach() && willYouAndYourClassFit) {
      infect(uninfectedStudents, infected, siteVersion);

      if (user.siteVersion !== siteVersion) {
        infect([user], infected, siteVersion);
      }
    }

    visited[user.id] = true;

    const coaches = user.getConnectedCoaches();
    addTo(queue, coaches);
  }

  return infected.length;
};

function infect(students, infected, infectionVersion) {
  students.forEach(function(student) {
    student.siteVersion = infectionVersion;
    infected.push(student);
  });
}