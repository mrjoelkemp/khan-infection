import {User, totalInfection, limitedInfection, getPlotData} from '../';
import {infectedColor, uninfectedColor} from '../lib/getPlotData';

import assert from 'assert';

describe('totalInfection', function() {
  beforeEach(function() {
    this.host = new User();
    this.student1 = new User();
    this.student2 = new User();
  });

  it('returns the total number of infections', function() {
    this.host.addStudent(this.student1);

    const numInfected = totalInfection({user: this.host, siteVersion: 1});

    assert.equal(numInfected, 2);
    assert.equal(1, this.host.siteVersion);
    assert.equal(1, this.student1.siteVersion);
  });

  it('infects all students that a given host coaches', function() {
    this.host.addStudents([this.student1, this.student2]);

    totalInfection({user: this.host, siteVersion: 1});

    assert.equal(this.host.siteVersion, 1);
    assert.equal(this.student1.siteVersion, 1);
    assert.equal(this.student2.siteVersion, 1);
  });

  it('infects the coach of the host', function() {
    const coach = new User();

    coach.addStudent(this.host);

    totalInfection({user: this.host, siteVersion: 1});

    assert.equal(this.host.siteVersion, 1);
    assert.equal(coach.siteVersion, 1);
  });

  it('affects all students of coaches that a host is coached by', function() {
    const coach = new User();

    coach.addStudents([this.student1, this.host]);

    totalInfection({user: this.host, siteVersion: 1});

    assert.equal(this.host.siteVersion, 1);
    assert.equal(coach.siteVersion, 1);
    assert.equal(this.student1.siteVersion, 1);
  });

  it('affects the coach of a student in the same class as the host', function() {
    const coach = new User();

    coach.addStudents([this.student1, this.host]);

    const anotherCoach = new User();

    anotherCoach.addStudent(this.student1);

    totalInfection({user: this.host, siteVersion: 1});

    assert.equal(this.host.siteVersion, 1);
    assert.equal(anotherCoach.siteVersion, 1);
    assert.equal(this.student1.siteVersion, 1);
  });
});

describe('limitedInfection', function() {
  beforeEach(function() {
    this.host = new User();
  });

  it('throws if the number of users to infect is less than 1', function() {
    assert.throws(() => limitedInfection({
      user: new User(),
      numToInfect: 0,
      siteVersion: 1
    }));
  });

  describe('when the host has a coach that has another student', function() {
    beforeEach(function() {
      this.coach = new User();
      this.student = new User();

      this.coach.addStudents([this.host, this.student]);
    });

    describe('and both the coach and that student cannot fit within the threshold', function() {
      beforeEach(function() {
        this.numInfected = limitedInfection({
          user: this.host,
          numToInfect: 2,
          siteVersion: 1
        });
      });

      it('does not infect them', function() {
        assert.equal(this.numInfected, 0);
        assert.notEqual(this.host.siteVersion, 1);
        assert.notEqual(this.coach.siteVersion, 1);
        assert.notEqual(this.student.siteVersion, 1);
      });
    });

    describe('and both can fit', function() {
      beforeEach(function() {
        this.numInfected = limitedInfection({
          user: this.host,
          numToInfect: 3,
          siteVersion: 1
        });
      });

      it('infects them', function() {
        assert.equal(this.numInfected, 3);
        assert.equal(this.host.siteVersion, 1);
        assert.equal(this.coach.siteVersion, 1);
        assert.equal(this.student.siteVersion, 1);
      });
    });
  });

  describe('when the host has students', function() {
    beforeEach(function() {
      this.student1 = new User();
      this.student2 = new User();

      this.host = new User();

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
          this.numInfected = limitedInfection({
            user: this.host,
            numToInfect: 3,
            siteVersion: 1
          });
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
          this.numInfected = limitedInfection({
            user: this.host,
            numToInfect: 5,
            siteVersion: 1
          });
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

        this.student1.addStudent(this.student3);
      });

      describe('and there is space for the host\'s class and the student\'s class', function() {
        beforeEach(function() {
          this.numInfected = limitedInfection({
            user: this.host,
            numToInfect: 4,
            siteVersion: 1
          });
        });

        it('infects them all', function() {
          assert.equal(this.numInfected, 4);

          assert.equal(this.host.siteVersion, 1);
          assert.equal(this.student1.siteVersion, 1);
          assert.equal(this.student2.siteVersion, 1);
          assert.equal(this.student3.siteVersion, 1);
        });
      });

      describe('but there is only space for the student\'s class', function() {
        beforeEach(function() {
          this.numInfected = limitedInfection({
            user: this.host,
            numToInfect: 2,
            siteVersion: 1
          });
        });

        it('infects the student\'s class', function() {
          assert.equal(this.numInfected, 2);

          assert.equal(this.student1.siteVersion, 1);
          assert.equal(this.student3.siteVersion, 1);

          assert.notEqual(this.host.siteVersion, 1);
          assert.notEqual(this.student2.siteVersion, 1);
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
        this.numInfected = limitedInfection({
          user: this.host,
          numToInfect: 4,
          siteVersion: 1
        });
      });

      it('infects them all', function() {
        assert.equal(this.numInfected, 4);

        assert.equal(this.host.siteVersion, 1);
        assert.equal(this.student.siteVersion, 1);
        assert.equal(this.student2.siteVersion, 1);
        assert.equal(this.student3.siteVersion, 1);
      });
    });

    describe('and there is space for all but one student', function() {
      beforeEach(function() {
        this.numInfected = limitedInfection({
          user: this.host,
          numToInfect: 3,
          siteVersion: 1
        });
      });

      it('still infects the excluded student\'s coach', function() {
        assert.equal(this.numInfected, 3);

        assert.equal(this.host.siteVersion, 1);
        assert.equal(this.student.siteVersion, 1);
        assert.equal(this.student2.siteVersion, 1);

        assert.notEqual(this.student3.siteVersion, 1);
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

      this.numInfected = limitedInfection({
        user: this.host,
        numToInfect: 6,
        siteVersion: 1
      });
    });

    it('greedily chooses the first class that fits', function() {
      assert.equal(this.numInfected, 5);

      assert.equal(this.host.siteVersion, 1);
      assert.equal(this.student.siteVersion, 1);
      assert.equal(this.student2.siteVersion, 1);
      assert.equal(this.student3.siteVersion, 1);
      assert.equal(this.student4.siteVersion, 1);

      assert.notEqual(this.student5.siteVersion, 1);
      assert.notEqual(this.student6.siteVersion, 1);
      assert.notEqual(this.student7.siteVersion, 1);
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
      this.numInfected = limitedInfection({
        user: this.host,
        numToInfect: 3,
        siteVersion: 1
      });
    });

    it('infects the coach\'s class', function() {
      assert.equal(this.numInfected, 3);

      assert.equal(this.coach.siteVersion, 1);
      assert.equal(this.host.siteVersion, 1);
      assert.equal(this.student4.siteVersion, 1);

      assert.notEqual(this.student.siteVersion, 1);
      assert.notEqual(this.student2.siteVersion, 1);
      assert.notEqual(this.student3.siteVersion, 1);
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
          this.numInfected = limitedInfection({
            user: this.host,
            numToInfect: 3,
            siteVersion: 1
          });
        });

        it('infects them all', function() {
          assert.equal(this.numInfected, 3);

          assert.equal(this.host.siteVersion, 1);
          assert.equal(this.coach.siteVersion, 1);
          assert.equal(this.student.siteVersion, 1);
        });
      });
    });
  });
});

describe('getPlotData', function() {
  beforeEach(function() {
    this.host = new User();
    this.student1 = new User();
  });

  it('returns the nodes and edges of all node connections', function() {
    this.host.addStudent(this.student1);

    const data = getPlotData({user: this.host});

    assert.equal(data.nodes.length, 2);
    assert.equal(data.edges.length, 1);

    assert.deepEqual(data.nodes[0], {
      id: this.host.id,
      label: `Coach ${this.host.id}`,
      color: uninfectedColor
    });

    assert.deepEqual(data.nodes[1], {
      id: this.student1.id,
      label: `Student ${this.student1.id}`,
      color: uninfectedColor
    });

    assert.deepEqual(data.edges[0], {
      from: this.host.id,
      to: this.student1.id
    });
  });

  it('handles more complex cases',function() {
    this.student2 = new User();

    this.host.addStudents([this.student1, this.student2]);

    this.student3 = new User();
    this.coach = new User();

    this.coach.addStudents([this.student2, this.student3]);

    const data = getPlotData({user: this.host});

    assert.equal(data.nodes.length, 5);
    assert.equal(data.edges.length, 4);
  });
});
