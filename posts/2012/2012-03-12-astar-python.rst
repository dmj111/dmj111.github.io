.. link:
.. description:
.. tags:
.. title: A* in Python
.. date: 2012-03-12


`A* <http://en.wikipedia.org/wiki/A*_search_algorithm>`_ is a directed
search algorithm.  Given a good heuristic function, it can perform
much better than a blind breadth-first search.


A* code
-------

First, the main algorithm itself.  I like using Python for lots of
reasons.  One that stands out, though, is that functions are first
class.  This allows us to write a generic A* function that works on
many problems.

(Python is not unique in this.  But it is still fun.)

Here is the main solving code.

.. code:: python

  import heapq
  import math
  import random
  def solve(start, finish, heuristic):
      """Find the shortest path from START to FINISH."""
      heap = []

      link = {} # parent node link
      h = {} # heuristic function cache
      g = {} # shortest path to a node

      g[start] = 0
      h[start] = 0
      link[start] = None


      heapq.heappush(heap, (0, 0, start))
      # keep a count of the  number of steps, and avoid an infinite loop.
      for kk in xrange(1000000):
          f, junk, current = heapq.heappop(heap)
          if current == finish:
              print "distance:", g[current], "steps:", kk
              return g[current], kk, build_path(start, finish, link)

          moves = current.get_moves()
          distance = g[current]
          for mv in moves:
              if mv not in g or g[mv] > distance + 1:
                  g[mv] = distance + 1
                  if mv not in h:
                      h[mv] = heuristic(mv)
                  link[mv] = current
                  heapq.heappush(heap, (g[mv] + h[mv], -kk, mv))
      else:
          raise Exception("did not find a solution")


``solve`` takes two *positions*, a start and finish, and a heuristic
function.  The heuristic function must always return a distance that
is less or equal to the actual distance between two positions.  The
whole algorithm rests on that assumption.

``g[mv]`` holds the length of the shortest known path to ``mv``, and
``h[mv]`` holds the estimated distance from ``mv`` to finish according to
the ``heuristic`` function.  Then, ``g[mv] + h[mv]`` is the current best
estimate of the distance from ``start`` to ``finish`` through ``mv``.

We keep a the nodes to search next in a priority queue, ordered by the
the current best estimates of the distance to ``finish``.

``solve`` is a generic function, and it realized on duck-typing to work.
The position objects must provide a ``get_moves`` method that returns
neighboring positions, a hash function ``__hash__``, and an
equality operator ``__eq__``.

Whenever the goal position is at the top of the heap we are done.
This is because the heap is ordered by the best possible score from a
position to the goal.  If there is a shorter path to the goal, it
would have already been explored, since we explore by the best
possible path first.  Since it hasn't been seen before, this path is
the best.

Note that this isn't true about positions other than the goal.  That
is because the heuristic provides an optimistic guess for the shortest
path from a position to the goal, not the shortest path between any
two positions.  This is the reason that in the inner loop, we check if
we are in the shortest path seen so far to a node.  A node may be
visited multiple times by A*, with shorter paths to the node each
time.

The function ``build_path`` reconstructs the path to the solution for
us.  This is useful for debugging, and because we often want to know
the path, not just the path length.

.. code:: python

  def build_path(start, finish, parent):
      """
      Reconstruct the path from start to finish given
      a dict of parent links.

      """
      x = finish
      xs = [x]
      while x != start:
          x = parent[x]
          xs.append(x)
      xs.reverse()
      return xs



Here is a heuristic that does nothing, just for testing.  Using this
heuristic will lead to Dijkstra's algorithm, which is a good, but
uninformed search algorithm.

.. code:: python

   def no_heuristic(*args):
      """Dummy heuristic that doesn't do anything"""
      return 0


A grid example
--------------

Here is a simple test class where the program must find a path on a
rectangular grid.  We will assume the grid is infinite, but will also
hope that our search doesn't go that far off course.

.. code:: python

  class GridPosition(object):
      """Represent a position on a grid."""
      def __init__(self, x, y):
          self.x = x
          self.y = y

      def __hash__(self):
          return hash((self.x, self.y))

      def __repr__(self):
          return "GridPosition(%d,%d)" % (self.x, self.y)

      def __eq__(self, other):
          return self.x == other.x and self.y == other.y

      def get_moves(self):
          # There are times when returning this in a shuffled order
          # would help avoid degenerate cases.  For learning, though,
          # life is easier if the algorithm behaves predictably.
          yield GridPosition(self.x + 1, self.y)
          yield GridPosition(self.x, self.y + 1)
          yield GridPosition(self.x - 1, self.y)
          yield GridPosition(self.x, self.y - 1)


.. code:: python

   grid_start = GridPosition(0,0)
   grid_end = GridPosition(10,10)


.. code:: python

   def grid_test_no_heuristic():
      solve(grid_start, grid_end, no_heuristic)


This gives us:


::

    distance: 20 steps: 840


Now, we can add a heuristic.  An obvious one is to Euclidean distance,
since the shortest path between two points is a straight line.

.. code:: python

  def euclidean_h(goal):
      def f(pos):
          dx, dy = pos.x - goal.x, pos.y - goal.y
          return math.hypot(dx, dy)
      return f

.. code:: python

  def grid_test_euclidean_heuristic():
      solve(grid_start, grid_end, euclidean_h(grid_end))

::

    distance: 20 steps: 134


That result is significantly better.

We can do even better.  Since our grid movements are restricted
to left, right, up and down, we can use Manhattan distance as the
heuristic.  In this simple case, Manhattan distance is a perfect
heuristic.  Adding obstacles, or changing the cost of moving
through grid points would keep Manhattan from being perfect.


.. code:: python

   def manhattan_h(goal):
      def f(pos):
          dx, dy = pos.x - goal.x, pos.y - goal.y
          return abs(dx) + abs(dy)
      return f

.. code:: python

  def grid_test_manhattan_heuristic():
      solve(grid_start, grid_end, manhattan_h(grid_end))


::

    distance: 20 steps: 20

We found the path without exploring any unnecessary nodes.




Block Puzzle
------------

In the Stanford AI class offered online, they discussed A* in the
context of the classic `fifteen puzzle
<https://en.wikipedia.org/wiki/Fifteen_puzzle>`_, but simplified to
just eight pieces.

Here is a class for the block puzzle.  Usually the 15 puzzle is used,
but the 8 puzzle is a lot faster to solve.

.. code:: python

  class BlockPuzzle(object):
      def __init__(self, n, xs=None):
          """Create an nxn block puzzle

          Use XS to initialize to a specific state.
          """
          self.n = n
          self.n2 = n * n
          if xs is None:
              self.xs = [(x + 1) % self.n2 for x in xrange(self.n2)]
          else:
              self.xs = list(xs)
          self.hsh = None
          self.last_move = []

      def __hash__(self):
          if self.hsh is None:
              self.hsh = hash(tuple(self.xs))
          return self.hsh

      def __repr__(self):
          return "BlockPuzzle(%d, %s)" % (self.n, self.xs)

      def show(self):
          ys = ["%2d" % x for x in self.xs]
          xs = [" ".join(ys[kk:kk+self.n]) for kk in xrange(0,self.n2, self.n)]
          return "\n".join(xs)

      def __eq__(self, other):
          return self.xs == other.xs

      def copy(self):
          return BlockPuzzle(self.n, self.xs)

      def get_moves(self):
          # Find the 0 tile, and then generate any moves we
          # can by sliding another block into its place.
          tile0 = self.xs.index(0)
          def swap(i):
              j = tile0
              tmp = list(self.xs)
              last_move = tmp[i]
              tmp[i], tmp[j] = tmp[j], tmp[i]
              result = BlockPuzzle(self.n, tmp)
              result.last_move = last_move
              return result

          if tile0 - self.n >= 0:
              yield swap(tile0-self.n)
          if tile0 +self.n < self.n2:
              yield swap(tile0+self.n)
          if tile0 % self.n > 0:
              yield swap(tile0-1)
          if tile0 % self.n < self.n-1:
              yield swap(tile0+1)


We also need a way to create a shuffled puzzle.  Here is a generic
method for shuffling.


.. code:: python

  def shuffle(position, n):
      for kk in xrange(n):
          xs = list(position.get_moves())
          position = random.choice(xs)
      return position


Now, we need a heuristic.  The empty heuristic approach will take too
long here.

The first, and simplest heuristic is to count how many tiles are out
of place.

.. code:: python

  def misplaced_h(position):
      """Returns the number of tiles out of place."""
      n2 = position.n2
      c = 0
      for kk in xrange(n2):
          if position.xs[kk] != kk+1:
              c += 1
      return c


Here is a sample run

.. code:: python

  def test_block_8_misplaced(num_tests):
      for kk in xrange(num_tests):
          p = shuffle(BlockPuzzle(3), 200)
          print p.show()
          solve(p, BlockPuzzle(3), misplaced_h)

::

     0  2  5
     8  3  7
     1  6  4
     distance: 19 steps: 872
     2  7  0
     6  8  3
     1  5  4
     distance: 19 steps: 958
     1  5  4
     7  2  8
     0  3  6
     distance: 25 steps: 13027
     6  8  7
     2  5  4
     0  1  3
     distance: 27 steps: 26762
     3  8  4
     7  0  6
     2  1  5
    distance: 21 steps: 3008

Now, another heuristic is to measure the distance that each tile must
move.  This heuristic is ok, because we only move one tile at a time,
and we know that each tile must move at least this many steps.


.. code:: python

  def distance_h(position):
      n = position.n
      def row(x): return x / n
      def col(x): return x % n
      score = 0
      for idx, x in enumerate(position.xs):
          if x == 0: continue
          ir,ic = row(idx), col(idx)
          xr,xc = row(x-1), col(x-1)
          score += abs(ir-xr) + abs(ic-xc)
      return score




And another sample run.

.. code:: python

  def test_block_8_distance(num_tests):
      for kk in xrange(num_tests):
          p = shuffle(BlockPuzzle(3), 200)
          print p.show()
          solve(p, BlockPuzzle(3), distance_h)


::

    4  7  2
    1  0  5
    6  8  3
   distance: 22 steps: 941
    6  5  1
    4  0  3
    2  7  8
   distance: 16 steps: 59
    1  3  4
    2  0  5
    7  8  6
   distance: 16 steps: 235
    4  5  0
    3  8  2
    6  1  7
   distance: 24 steps: 1038
    6  7  2
    5  8  3
    0  1  4
   distance: 24 steps: 705


For similar sizes, the results from this heuristic are much better.
This testing methodology was pretty poor, though.  A more detailed
analysis would be better, but this writeup is getting long as it is.

Here is a short sample of one to one comparisons.

.. code:: python

  def test_block(steps=100, count=5):
      for kk in xrange(count):
          p = shuffle(BlockPuzzle(3), steps)
          print p.show()
          print "misplaced",
          x = solve(p, BlockPuzzle(3), misplaced_h)
          print "distance",
          x = solve(p, BlockPuzzle(3), distance_h)




::

  2  6  1
  4  8  5
  0  3  7
 misplaced distance: 24 steps: 14962
 distance distance: 24 steps: 862


..
  if __name__ == "__main__":
      import sys
      cmd = sys.argv[1]
      if cmd== "number":
          number_test()
      elif cmd == "grid_no":
          grid_test_no_heuristic()
      elif cmd == "grid_euclidean":
          grid_test_euclidean_heuristic()
      elif cmd == "grid_manhattan":
          grid_test_manhattan_heuristic()
      elif cmd == "block_8_mis":
          test_block_8_misplaced(1)
      elif cmd == "block_8_distance":
          test_block_8_distance(1)
      elif cmd == "test_block":
          test_block()
      else:
          print "bad arg", sys.argv
