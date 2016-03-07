require('babel/register');

export class User {
  constructor({siteVersion = 0, students = [], coaches = []} = {}) {
    this.siteVersion = siteVersion;
    this.students = students;
    this.coaches = coaches;
  }

  addStudent(student) {
    this.students.push(student);
    student.coaches.push(this);
  }

  addStudents(students) {
    students.forEach(student => this.addStudent(student));
  }
};

// Helper to add elements of toAdd onto the given list without constructing additional
// intermediate lists (requiring more memory)
function addTo(list, toAdd) {
  for (let i = 0; i < toAdd.length; i++) {
    list.push(toAdd[i]);
  }
}

export function totalInfection(user) {
  return limitedInfection(user, Infinity);
};

export function limitedInfection(user, numberOfUsersToInfect, infected, infectionVersion) {
  if (typeof infected === 'undefined') {
    infected = [user];
  }

  if (typeof infectionVersion === 'undefined') {
    infectionVersion = user.siteVersion;
  }

  if (numberOfUsersToInfect < 1) {
    throw new Error('too few users to infect');
  }

  const uninfectedStudents = user.students.filter(function(student) {
    return student.siteVersion !== infectionVersion;
  });

  const isUserInfected = user.siteVersion === infectionVersion;
  const willYouAndYourClassFit = (isUserInfected ? 0 : 1) + uninfectedStudents.length + infected.length <= numberOfUsersToInfect;

  if (willYouAndYourClassFit) {
    infect(uninfectedStudents, infected, infectionVersion);

    if (!isUserInfected) {
      infect([user], infected, infectionVersion);
    }

    uninfectedStudents.forEach(function(student) {
      limitedInfection(student, numberOfUsersToInfect, infected, infectionVersion);
    });
  }

  user.coaches.forEach(function(coach) {
    limitedInfection(coach, numberOfUsersToInfect, infected, infectionVersion);
  });

  return infected.length;
};

function infect(students, infected, infectionVersion) {
  students.forEach(function(student) {
    student.siteVersion = infectionVersion;
    infected.push(student);
  });
}
