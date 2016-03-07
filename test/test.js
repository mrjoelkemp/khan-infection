import {User, totalInfection, limitedInfection} from '../';
import assert from 'assert';

describe('totalInfection', function() {
  beforeEach(function() {
    this.host = new User({
      siteVersion: 1
    });
  });

  it('returns the total number of infections', function() {
    const student = new User();

    this.host.addStudent(student);

    const numInfected = totalInfection(this.host);
    assert.equal(numInfected, 2);
  });

  it('works even if the host if the only user', function() {
    const numInfected = totalInfection(this.host);
    assert.equal(numInfected, 1);
  });

  it('infects all students that a given host coaches', function() {
    const student1 = new User();
    const student2 = new User();

    this.host.addStudents([student1, student2]);

    totalInfection(this.host);
    assert.equal(student1.siteVersion, this.host.siteVersion);
    assert.equal(student2.siteVersion, this.host.siteVersion);
  });

  it('infects the coach of the host', function() {
    const coach = new User();

    coach.addStudent(this.host);

    totalInfection(this.host);
    assert.equal(coach.siteVersion, this.host.siteVersion);
  });

  it('affects all students of coaches that a host is coached by', function() {
    const student1 = new User();
    const coach = new User();

    coach.addStudents([student1, this.host]);

    totalInfection(this.host);
    assert.equal(coach.siteVersion, this.host.siteVersion);
    assert.equal(student1.siteVersion, this.host.siteVersion);
  });

  it('affects the coach of a student in the same class as the host', function() {
    const student1 = new User();
    const coach = new User();

    coach.addStudents([student1, this.host]);

    const anotherCoach = new User();

    anotherCoach.addStudent(student1);

    totalInfection(this.host);
    assert.equal(anotherCoach.siteVersion, this.host.siteVersion);
  });
});

describe('limitedInfection', function() {
  beforeEach(function() {
    this.host = new User({
      siteVersion: 1
    });
  });

  it('throws if the number of users to infect is less than 1', function() {
    assert.throws(() => limitedInfection(new User(), 0));
  });

  it('returns the number of infected users (including the host)', function() {
    const student = new User();

    this.host.addStudent(student);

    const numInfected = limitedInfection(this.host, 1);
    assert.equal(numInfected, 1);
  });

  describe('when the host has a coach that has another student', function() {
    beforeEach(function() {
      this.coach = new User();
      this.student = new User();

      this.coach.addStudents([this.host, this.student]);
    });

    describe('and both the coach and that student cannot fit within the threshold', function() {
      beforeEach(function() {
        this.numInfected = limitedInfection(this.host, 2);
      });

      it('does not infect them', function() {
        assert.equal(this.numInfected, 1);
        assert.notEqual(this.host.siteVersion, this.coach.siteVersion);
        assert.notEqual(this.host.siteVersion, this.student.siteVersion);
      });
    });

    describe('and both can fit', function() {
      beforeEach(function() {
        this.numInfected = limitedInfection(this.host, 3);
      });

      it('infects them', function() {
        assert.equal(this.numInfected, 3);
        assert.equal(this.host.siteVersion, this.coach.siteVersion);
        assert.equal(this.host.siteVersion, this.student.siteVersion);
      });
    });
  });

  describe('when the host has students', function() {
    beforeEach(function() {
      this.student1 = new User();
      this.student2 = new User();

      this.host = new User({
        siteVersion: 1
      });

      this.host.addStudents([this.student1, this.student2]);
    });

    describe('and one of the students is shared with another coach', function() {
      beforeEach(function() {
        this.student3 = new User();
        this.coach = new User();

        this.coach.addStudents([this.student2, this.student3]);
      });

      describe('but there is not enough space for the other coach\'s entire class', function() {
        beforeEach(function() {
          this.numInfected = limitedInfection(this.host, 3);
        });

        it('only infects the host\'s entire class', function() {
          assert.equal(this.numInfected, 3);
          assert.notEqual(this.coach.siteVersion, this.host.siteVersion);
          assert.notEqual(this.student3.siteVersion, this.host.siteVersion);

          assert.equal(this.student1.siteVersion, this.host.siteVersion);
          assert.equal(this.student2.siteVersion, this.host.siteVersion);
        });
      });

      describe('and there is enough space for both classes (host and coach)', function() {
        beforeEach(function() {
          this.numInfected = limitedInfection(this.host, 5);
        });

        it('infects them all', function() {
          assert.equal(this.numInfected, 5);
          assert.equal(this.coach.siteVersion, this.host.siteVersion);
          assert.equal(this.student1.siteVersion, this.host.siteVersion);
          assert.equal(this.student2.siteVersion, this.host.siteVersion);
          assert.equal(this.student3.siteVersion, this.host.siteVersion);
        });
      });
    });

    describe('and one of the students also has a class', function() {
      beforeEach(function() {
        this.student3 = new User();

        this.student1.addStudents([this.student3]);
      });

      describe('and there is space for the host\'s class and the student\'s class', function() {
        beforeEach(function() {
          this.numInfected = limitedInfection(this.host, 4);
        });

        it('infects them all', function() {
          assert.equal(this.numInfected, 4);
        });
      });

      // This test fails due to a "bug" resulting from the assumption that the host
      // should always be infected
      describe('but there is only space for the student\'s class', function() {
        beforeEach(function() {
          this.numInfected = limitedInfection(this.host, 2);
        });

        it('infects the student\'s class', function() {
          assert.equal(this.numInfected, 2);
          assert.equal(this.student1.siteVersion, this.host.siteVersion);
          assert.equal(this.student3.siteVersion, this.host.siteVersion);
        });
      });
    });
  });

  describe('when we have a linear progression of classes', function() {
    beforeEach(function() {
      this.student = new User();
      this.student2 = new User();
      this.student3 = new User();

      this.host.addStudent(this.student);
      this.student.addStudent(this.student2);
      this.student2.addStudent(this.student3);
    });

    describe('and there is space for all nested classes', function() {
      beforeEach(function() {
        this.numInfected = limitedInfection(this.host, 4);
      });

      it('infects them all', function() {
        assert.equal(this.numInfected, 4);
        assert.equal(this.student.siteVersion, this.host.siteVersion);
        assert.equal(this.student2.siteVersion, this.host.siteVersion);
        assert.equal(this.student3.siteVersion, this.host.siteVersion);
      });
    });

    describe('and there is space for all but one student', function() {
      beforeEach(function() {
        this.numInfected = limitedInfection(this.host, 3);
      });

      it('still infects the excluded student\'s coach', function() {
        assert.equal(this.numInfected, 3);
        assert.equal(this.student.siteVersion, this.host.siteVersion);
        assert.equal(this.student2.siteVersion, this.host.siteVersion);

        assert.notEqual(this.student3.siteVersion, this.host.siteVersion);
      });
    });
  });

  describe('when there is a later class that gets closer to the ideal number of infections', function() {
    beforeEach(function() {
      this.student = new User();
      this.student2 = new User();

      this.host.addStudents([this.student, this.student2]);

      this.student3 = new User();
      this.student4 = new User();
      this.student.addStudents([this.student3, this.student4]);

      this.student5 = new User();
      this.student6 = new User();
      this.student7 = new User();
      this.student2.addStudents([this.student5, this.student6, this.student7]);

      this.numInfected = limitedInfection(this.host, 6);
    });

    it('greedily chooses the first class that fits', function() {
      assert.equal(this.numInfected, 5);
      assert.equal(this.student.siteVersion, this.host.siteVersion);
      assert.equal(this.student2.siteVersion, this.host.siteVersion);
      assert.equal(this.student3.siteVersion, this.host.siteVersion);
      assert.equal(this.student4.siteVersion, this.host.siteVersion);

      assert.notEqual(this.student5.siteVersion, this.host.siteVersion);
      assert.notEqual(this.student6.siteVersion, this.host.siteVersion);
      assert.notEqual(this.student7.siteVersion, this.host.siteVersion);
    });
  });

  describe('when the host\'s class won\'t fit, but its coach\'s class will', function() {
    beforeEach(function() {
      this.student = new User();
      this.student2 = new User();
      this.student3 = new User();

      this.host.addStudents([this.student, this.student2, this.student3]);

      this.coach = new User();
      this.student4 = new User();

      this.coach.addStudents([this.host, this.student4]);
      this.numInfected = limitedInfection(this.host, 3);
    });

    it('infects the coach\'s class', function() {
      assert.equal(this.numInfected, 3);
      assert.equal(this.coach.siteVersion, this.host.siteVersion);
      assert.equal(this.student4.siteVersion, this.host.siteVersion);
    });
  });

  describe('when the host has a single student', function() {
    beforeEach(function() {
      this.student = new User();

      this.host.addStudent(this.student);
    });

    describe('that is shared with another coach', function() {
      beforeEach(function() {
        this.coach = new User();
        this.coach.addStudent(this.student);
      });

      describe('and they can all fit', function() {
        beforeEach(function() {
          this.numInfected = limitedInfection(this.host, 3);
        });

        it('infects them all', function() {
          assert.equal(this.numInfected, 3);
          assert.equal(this.coach.siteVersion, this.host.siteVersion);
          assert.equal(this.student.siteVersion, this.host.siteVersion);
        });
      });
    });
  });
});
