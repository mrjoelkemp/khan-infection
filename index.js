require('babel/register');

export class User {
  constructor({siteVersion = 0, students = [], coaches = []} = {}) {
    this.siteVersion = siteVersion;
    this.students = students;
    this.coaches = coaches;

    this.visited = false;
  }

  addStudent(student) {
    this.students.push(student);
    student.coaches.push(this);
  }

  addStudents(students) {
    students.forEach(student => this.addStudent(student));
  }

  isCoach() {
    return !!this.students.length;
  }

  getUnvisitedConnectedCoaches() {
    const myCoaches = this.coaches.filter(coach => !coach.visited);

    const studentsThatAreCoaches = this.students.filter(student => student.isCoach() && !student.visited);

    const studentsOtherCoaches = [];
    this.students.forEach(student => {
      addTo(studentsOtherCoaches, student.coaches.filter(coach => !coach.visited));
    });

    return myCoaches.concat(studentsThatAreCoaches).concat(studentsOtherCoaches);
  }
};

// Helper to add elements of toAdd onto the given list without constructing additional
// intermediate lists (requiring more memory)
function addTo(list, toAdd) {
  for (let i = 0; i < toAdd.length; i++) {
    list.push(toAdd[i]);
  }
}

export function totalInfection({user, siteVersion}) {
  return limitedInfection({
    user,
    numToInfect: Infinity,
    siteVersion
  });
};

export function limitedInfection({user, numToInfect, siteVersion, infected = []} = {}) {
  if (numToInfect < 1) {
    throw new Error('too few users to infect');
  }

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

  user.visited = true;

  const coaches = user.getUnvisitedConnectedCoaches();

  coaches.forEach(coach => limitedInfection({user: coach, numToInfect, siteVersion, infected}));

  return infected.length;
};

function infect(students, infected, infectionVersion) {
  students.forEach(function(student) {
    student.siteVersion = infectionVersion;
    infected.push(student);
  });
}
