.. link:
.. description:
.. tags:
.. title: Quicksort in D
.. date: 2012-04-24


I have finally gotten around to learning about the `D Programming
Language <http://dlang.org/>`_ . Here is a toy quicksort, with some
uninformed comments about D.

First, we need to import the std.algorithm library for the swap
function, and the stdio libraray for printing stuff out.


.. code:: d

   import std.algorithm;
   import std.stdio;


Next, we have the partition function.  This shows several things.
First, it is templatized on type, though not on comparison function.
The ``(T)`` in ``partition(T)(...)`` marks the function as a template
on ``T``.

This code also shows is how D handles arrays.  D is aware of array
slices, so we can recurse on parts of the array, instead of passing in
an array and begin / end indices.  This may only be sugar, but it
allows stricted error checking in non-release mode, as the D arrays
are bounds checked.


The partition function uses the last element of the array as the
pivot.  The partition function
walks two indices, ``i`` and ``j``, from the beginning and the end of the
array.  The condition is that ``array[x]`` is less than or equal to the
pivot when x is less or equal to i, and ``array[x]`` is greater than the
pivot when x is greater or equal to j.  At the end, we swap the pivot
out to where it belongs.


.. code:: d
  
  ulong partition(T)(T[] array) {
    if(array.length < 2) { return 0; }
  
    auto pivot = array[$-1];
  
    // We are going to increment i, and decrement j in each iteration of
    // the while loop before using them.  So, they must start at the
    // location before where we really want them to be.
    //
    // This seems inconvenient, but it cleans up the possible ending
    // conditions of the while loop.  The ulong cannot really hold a
    // negative number, so this -1 requires special care in the while
    // loop. 
    ulong i = -1;
    ulong j = array.length-1;
  
    // If i == -1, it will wrap around to a really big postive number.
    // So, include a test for it here.  The only time it should be
    // tested is the first iteration, while i still is -1, and the last
    // iteration, when i >= j.  
    while(i < j || i == -1) {
      // Find the next element from the start that is larger or equal to
      // the pivot element.
      // 
      // The pivot at the the end of the array is a sentinel, so we
      // needn't check for overrunning this array in direction.  
      i += 1;
      while(array[i] < pivot) {
        i += 1;
      }
  
      // Find the next element from the end that is less than or equal
      // to the pivot.  We must guard against running past the i'th
      // element, since we could have an array that was all greater than
      // the pivot.  If j was 0 before this, things would be bad.  That
      // is why the function asserts that the length be more than 1.
      j -= 1;
      while(i < j && array[j] > pivot) {
        j -= 1;
      }
  
      if(i < j && j < array.length) {
        // Swap the values pointed at by i and j.  Now, array[x] for x
        // <= i is <= pivot, and array[x] for x >= j is >= pivot.
        swap(array[i], array[j]);
      }
    }
  
    
    // We know i >= j.
    // 1) If i was incremented to be equal to j, then
    //  i = j = array.length - 1, and array[i] is the only element >=
    //  pivot.
    // 2) Or, i was incremented to j, and array[j] >= pivot from the
    //    previous iteration.  In this case, array[j] >= pivot.
    // 3) Or, i was incremented so that array[i] >= pivot, then j was
    //    decremented till j == i.  So, array[i] >= pivot.
    /// So, array[i] is always greater than or equal to the pivot after
    // the while loop.  And, array[i-1] is less than or equal to pivot,
    // if i > 0.
  
    // Swap the pivot into the right place.  Everything to the left is
    // <= pivot.  Every thing to the right is >= pivot.
    swap(array[i], array[$-1]);
    // Return the pivot location
    return i;
  }
    



D has some nice unittest capabilities.  Code in a ``unittest`` section
is only compiled with the ``-unittest`` compile flag, and it is run
every time the code is executed.  There is no way to forget to run it
then.  Unless, of course, it isn't compiled with the ``-unittest``
flag...

For example, 

.. code:: sh

  dmd quicksort.d -unittest
  ./quicksort # runs the tests


So, lets add some tests for the partition function.  Imagine, if you
wish, that the tests were written before the code.


.. code:: d

  unittest {
    /// Check that the partitioning is correct.
    auto check_partition = function(int[] array) {
      auto p = partition(array);
      foreach(i; 0 .. p) {
        assert(array[i] <= array[p]);
      }
      foreach(i; p + 1 .. array.length) {
        assert(array[i] >= array[p]);
      }
    };
  
    auto data = [9,2,3,4,5,6,7,8,5];
    check_partition(data);
    data = [1];
    check_partition(data);
    data = [1, 2];
    check_partition(data);
    data = [2, 1];  
    check_partition(data);
    data = [2, 1,1,1,1,1];
    check_partition(data);
    data = [2, 1, 2, 1, 2, 1, 2];
    check_partition(data);
    data[] = 10; // set all values to 10
    check_partition(data);  
    writeln("partition tests passed");
  
  }
  


These lightweight tests are nice to have inline with the code.  More
involved tests might not be appropriate here, but tests that are so
easy to write make it hard to justify skipping tests.  Not that we
should justify skipping tests anyways.

A nice statement in those tests was an array expression. ``data[] = 10``
sets all of the entries of ``data`` to ``10``.  Arrays in D are much more
first class citizens then vectors are in C++.

After the ``partition`` function, the rest of quicksort is easy.  We
partition the data, and recursively sort each partition.  At each
step, we are removing the partition element from the array, so we know
that the total length of the subarrays is always decreasing.

.. code:: d

  T[] quicksort(T)(T[] array) {
    if(array.length > 1) {
      // Move the middle element to the end to act as the pivot.
      swap(array[$/2], array[$-1]);
      auto p = partition(array);
      // Index p is in position, so now recursively sort the other two
      // halves of the array.
      quicksort(array[0 .. p]);
      quicksort(array[p + 1 .. $]);
    }
    return array;
  }


Again, we can write some unittests to make sure that things seem fine.

.. code:: d
  
  void checkSorted(T)(T[] data) {
    foreach(i; 1 .. data.length) {
       assert(data[i] >= data[i-1]);
    }
  }
  
  unittest {
    auto check = function(int[] data) {
      quicksort(data);
      checkSorted(data);
    };
  
    auto data = [1,2,3,4,5];
    check(data);
    data = [5,4,3,2,1];
    check(data);
    data = [];
    check(data);
    data = [1];
    check(data);
    data = new int[1000];
    foreach(i; 0 .. data.length) {
      data[i] = cast(int)(data.length - i);
    }
    check(data);
  }


Finally, we would like some timings to see how we are doing.  In the
process of writing this code, it was wrong several times.  The results
were correct, but a bug made the code run in quadratic time.  Timing
code isn't always for optimization; unexpected timing results can
point to subtle bugs.

Until I understand D better, I am commenting / uncommenting code
to vary the tests.  (Yuck)

Testing with reversed data is kind of a double-edged sword.  Reversed
data is an optimistic case for the simple "pick the middle element"
pivoting, because the middle element is always close to the median,
reducing the depth of the recursive calls.  When implementing median
of three, partitioning, though, the reversed order can find bugs
causing quadratic performance.


The =StopWatch= class is convenient here for some coarse timing
information.  These tests are one shot timing tests, without any
statistical validity.  Another convenience here is the literal number
notation.  Underscores can be used in a number to make it read easier,
without affecting its value.

.. code:: d

  import std.datetime;
  
  void timeSort(T)(T[] array) {
    StopWatch sw;
    sw.start();
    quicksort(array);
    // sort(array);
    sw.stop();
    writeln(array.length, "  ", sw.peek().msecs);
    
    // Also, make sure its right!
    checkSorted(array);
  }
  
  int[] MakeOrderedData(int N) {
    auto data = new int[N];
    foreach(i; 0 .. data.length) {
      data[i] = cast(int)(i); // cast(int)(-i);
    }
    return data;
  }
  
  
  int[] MakeReversedData(int N) {
    auto data = MakeOrderedData(N);
    data.reverse();
    return data;
  }
    
    
  void runTimings() {
    auto sizes = [1000, 10_000, 100_000,
                  1_000_000, 10_000_000];
    foreach(s; sizes) {
      auto data = MakeReversedData(s);
      timeSort(data);
    }
  }
    


Finally, a main function.

.. code:: d

  void main() {
    runTimings();
    writeln("done");
  }


.. 
   http://comments.gmane.org/gmane.emacs.orgmode/45278
   #+begin_src sh :var TANGLED=(org-babel-tangle) :tangle no :exports none
     wc $TANGLED > /dev/null
     rm -f quicksort1
     ~/dmd2/osx/bin/dmd -unittest quicksort1.d
     ./quicksort1
   #+end_src

   #+RESULTS:
   | partition | tests | passed |
   |      1000 |     0 |        |
   |     10000 |     0 |        |
   |    100000 |     6 |        |
   |   1000000 |    71 |        |
   |  10000000 |   801 |        |
   |      done |       |        |



And here are some timing results.

 ==========  =============
      size   milliseconds  
 ==========  =============
      1000              0  
     10000              0  
    100000              6  
   1000000             74  
  10000000            837  
 ==========  =============









