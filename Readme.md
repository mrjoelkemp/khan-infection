#### khan-infection

Since this is a private module, you need access to the repo
and to use a git url as the module's path in your package.json file.

* This module was written in JavaScript (ES2015 using babel) and Node
 * Your consuming app will need to support ES2015
 * **Alternatively**, you can extend `test/test.js` with your own sample cases to avoid consuming the module.

#### Assumptions

* The host user (the seed user for the infection algorithms) is infected
* A coach can be a student of another coach
* A coach cannot coach themself. i.e., a student cannot be coached by themself
* A student can be coached by multiple coaches

#### Usage

```js
import {totalInfection, limitedInfection, User} from 'khan-infection';

// assuming user is an instance of a khan-infection User
totalInfection(user);

limitedInfection(user, 2);
```

* Both `totalInfection` and `limitedInfection` return a count of the number of infected users

You can create `User` instances via:

```js
import {User} from 'khan-infection';

const host = new User({
  siteVersion: 1
})
```

To set up coaching relationships:

```js
const host = new User({
  siteVersion: 1
});

const student1 = new User();
const student2 = new User();

const coach = new User();

host.addStudents([student1, student2]);
coach.addStudent(student2);
```

* Students will automatically have their `isCoachedBy` relation populated

#### Running the tests

* Fork, clone, or download the repo
* `npm install` within the repo
* `npm test` to run the tests located in `test/test.js`

#### Implementation Notes

###### totalInfection

Originally, I opted for a straightforward, breadth-first traversal implementation.
However, after completing `limitedInfection`, the redefinition of `totalInfection` as a
composition of `limitedInfection` became clear and quite lovely.

###### limitedInfection

The implementation is a greedy algorithm modeled around the idea of a "class": a coach and their students.

* For a given user/coach, we try to infect their class (so long as there are uninfected students and infecting the class wouldn't exceed the number of desired infections).
* We then recursively try to infect an infected student's class (if they happened to also be a coach).
* We then recursively try to infect the given user/coach's coaches' classes.
 - e.g., If A coaches B and C coaches B, then we'd try to infect C's class when visiting B.

A few known issues with the implementation:

* It does not exhaustively search the graph for classes to infect. i.e., it's a bit too greedy
 - It will only consider classes connected to parts of the connected component starting with the infected host
  - This means that the host's immediate class (if it's a coach), must fit within the infection threshold; otherwise, we'll only consider classes of coaches of the host (i.e., where the host is a student).
 - It will not choose the most optimal classes to maximize the infection threshold

**NOTE:** I have intentionally kept a failing test enabled in the test suite to indicate that the ideal implementation
would address the issues above. With more time, I would rethink the algorithm's approach – possibly rewriting the function.

The runtime complexity of this implementation is the following, where N is the number of Users in the graph:

* O(N) time
 - In the case when the entire graph connected to the host fits within the treshold
* O(N) space
 - Due to the recursive solution's stack footprint and the maintained list of infected users
   - The list isn't necessary (it can be replaced with a count of infected users), but the list avoided
   the complexity of bubbling the incremented count of infected users up the recursion. Since all
   steps of the recursion modified the same `infected` list, the top-most stack of the recursion
   could return the list's length for an accurate total of infected users. Avoiding the list wouldn't
   change the space complexity due to the recursive solution's pointer memory footprint.