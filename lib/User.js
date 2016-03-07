import {addTo} from './util';

let id = 0;

export class User {
  constructor({siteVersion = 0, students = [], coaches = []} = {}) {
    this.siteVersion = siteVersion;
    this.students = students;
    this.coaches = coaches;

    this.id = this.constructor.id;
  }

  static get id() {
    return id++;
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

  getConnectedCoaches() {
    const studentsThatAreCoaches = this.students.filter(student => student.isCoach());

    const studentsOtherCoaches = [];
    this.students.forEach(student => addTo(studentsOtherCoaches, student.coaches));

    return this.coaches.concat(studentsThatAreCoaches).concat(studentsOtherCoaches);
  }
};