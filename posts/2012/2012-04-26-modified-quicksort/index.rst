.. link:
.. description:
.. tags:
.. title: Modified Quicksort in D
.. date: 2012-04-26


`In this post </blog/2012/04/24/quicksort-in-d/>`_ , we saw a simple
textbook quicksort.  Here, we add two improvements.  First, we use
insertion sort for sorting small subfiles instead of making as many
recursive calls to quicksort.  Second, we select the pivot using the
"median of three" method instead of picking the middle element as the
pivot.


.. code:: d

   import std.algorithm;
   import std.stdio;

   
For the partioning, we first select the median of the first, last, and
middle elements of the target array.  The steps of doing this affect
how the algorithm performs.  First, we move the middle element to the
next to last location of the array.  Then, we swap the elements if
needed so that the first is the smallest of the three, the last is the
largest, and the next to last is the median.

Then, the partitioning mostly is the same as it was before, except we
only partition the subarray between the first and last element, since they 
are already in valid positions.


We can reuse the old partition code, but we have to remember to offset
the return value by one, since we are sending ``array[1 .. k]`` into
``partition``, not the full array slice.

This is a place where the array slicing may be more confusing then
using explicit indices for the range we want to partition. Trying that
approach may be an interesting experiment to learn which is easier.

.. code:: d
   
  ulong medianOfThreePartition(T)(T[] array) {
    assert(array.length > 2);
  
    ulong i = 0;
    ulong j = array.length - 2;
    ulong k = array.length - 1;
  
    swap(array[array.length/2], array[j]);
  
    if(array[i] > array[j]) { swap(array[i], array[j]); }
    if(array[j] > array[k]) { swap(array[j], array[k]); }
    if(array[i] > array[j]) { swap(array[i], array[j]); }
  
    return 1 + partition(array[1 .. k]);
  }



..
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


   .. code:: d

     ulong partition(T)(T[] array) {
       if(array.length < 3) { return 0; }

       ulong i = 0;
       ulong j = array.length - 2;
       ulong k = array.length - 1;

       swap(array[array.length/2], array[j]);

       if(array[i] > array[j]) { swap(array[i], array[j]); }
       if(array[j] > array[k]) { swap(array[j], array[k]); }
       if(array[i] > array[j]) { swap(array[i], array[j]); }  


       auto pivot = array[j];


       // We are going to increment i, and decrement j in each iteration of
       // the while loop before using them.  So, they must start at the
       // location before where we really want them to be.
       //
       // This seems inconvenient, but it cleans up the possible ending
       // conditions of the while loop.  The ulong cannot really hold a
       // negative number, so this -1 requires special care in the while
       // loop. 


       // If i == -1, it will wrap around to a really big postive number.
       // So, include a test for it here.  The only time it should be
       // tested is the first iteration, while i still is -1, and the last
       // iteration, when i >= j.  
       i = 0;

       while(i < j) {
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
         while(array[j] > pivot) {
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
       swap(array[i], array[$-2]);
       // Return the pivot location
       return i;
     }

     ulong medianOfThreePartition(T)(T[] array) {
       return partition(array);
     }



   .. code:: sh

     dmd quicksort.d -unittest
     ./quicksort # runs the tests


   .. code:: d

     unittest {
       /// Check that the partitioning is correct.
       auto check_partition = function(int[] array) {

         auto p = medianOfThreePartition(array);
         foreach(i; 0 .. p) {
           assert(array[i] <= array[p]);
         }
         foreach(i; p + 1 .. array.length) {
           assert(array[i] >= array[p]);
         }

       };

       auto data = [9,2,3,4,5,6,7,8,5];
       check_partition(data);
       data = [1,2,3];
       check_partition(data);
       data = [3,2,1];
       check_partition(data);
       data = [2,3,1];
       check_partition(data);
       data = [1,3,2];
       check_partition(data);
       data = [2, 1,1,1,1,1];
       check_partition(data);
       data = [2, 1, 2, 1, 2, 1, 2];
       check_partition(data);
       data[] = 10; // set all values to 10
       check_partition(data);  
       // writeln("partition tests passed");

     }



Also, we need an insertion sort for the small subfile sorting.  This
is pretty straightforward, but we are swapping the item to move it
into place.  If we knew we were sorting something cheap to copy, there
may be a more efficient way to do that.  Maybe.

.. code:: d

  void insertionsort(T)(T[] array) {
    foreach(j; 1 .. array.length) {
      // array[0..j] is already sorted, so insert array[j] into the
      // right place.
      ulong i = j;
      while(i > 0 && array[i-1] > array[i]) {
        swap(array[i], array[i-1]);
        --i;
      }
    }
  }
  


..
   .. code:: d

     unittest {
       auto check = function(int[] data) {
         insertionsort(data);
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
       data = new int[10];
       foreach(i; 0 .. data.length) {
         data[i] = cast(int)(data.length - i);
       }
       check(data);
       // writeln("insertion sort tests passed");
     }



Here is the new quicksort function.  We have a lower limit on the size
of arrays that we will pass on to the ``medianOfThree`` function.  For
anything smaller, we call ``insertionsort``.

.. code:: d
          
  T[] quicksort(T)(T[] array) {
    const ulong RECURSION_LIMIT = 30;
    if(array.length > RECURSION_LIMIT) {
      // Move the middle element to the end to act as the pivot.
      swap(array[$/2], array[$-1]);
      auto p = medianOfThreePartition(array);
      // Index p is in position, so now recursively sort the other two
      // halves of the array.
      quicksort(array[0 .. p]);
      quicksort(array[p + 1 .. $]);
    } else {
      insertionsort(array);
    }
    return array;
  }


..

..   .. code:: d

     void checkSorted(T)(T[] data) {
       assert(isSorted(data));
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
       data = new int[100];
       foreach(i; 0 .. data.length) {
         data[i] = cast(int)(data.length - i);
       }
       check(data);
       writeln("quicksort tests passed");
     }


The old test drivers and timing code work well with this code.  The
only change is renaming the partition function.

This method is slower than the overly simple method of always
partitioning about the middle element of the array.  I need to look
into it more, but I have a few other things to do first.  The biggest
thing is to implement a fat partitioning function for handling equal
items efficiently.  Also, making the sort generic on the comparison
function looks like it should be easy too.

..

   ..   .. code:: d

..
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

     import std.random;

     int[] MakeRandomData(int N) {
       auto data = MakeOrderedData(N);
       randomShuffle(data);
       return data;
     }


     void runTimings() {
       auto sizes = [1000, 10_000, 100_000,
                     1_000_000, 10_000_000];
       foreach(s; sizes) {
         // auto data = MakeReversedData(s);
         auto data = MakeRandomData(s);
         data[] = 10;
         timeSort(data);
       }
     }


.. 
..    .. code:: d
..
..      void main() {
..       runTimings();
..       writeln("done");
..     }


   ..  http://comments.gmane.org/gmane.emacs.orgmode/45278
   .. +begin_src sh :var TANGLED=(org-babel-tangle) :tangle no :exports none :results output
   ..  wc $tangled > /dev/null
   ..  rm -f quicksort1
   ..  ~/dmd2/osx/bin/dmd -unittest quicksort1.d
   ..  ./quicksort1
   .. #+end_src

   .. #+RESULTS:
   .. : quicksort tests passed
   .. : 1000  0
   .. : 10000  0
   .. : 100000  8
   .. : 1000000  112
   .. : 10000000  1420
   .. : done










