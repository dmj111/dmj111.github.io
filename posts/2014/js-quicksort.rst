.. title: JavaScript Quicksort
.. slug: js-quicksort
.. date: 2014/02/21 07:05:26

.. |--| unicode:: U+2013   .. en dash
.. |---| unicode:: U+2014  .. em dash, trimming surrounding whitespace
   :trim:

Quicksort, yet again.  This time, in JavaScript!

I have been using JavaScript more frequently, and have been pleasantly
surprised at how fast it is.

So, I naturally wanted some test cases of things that I always thought
JavaScript was too slow for.  Sorting was one of those cases.

To check it out, I wrote some quicksort functions and compared them
to ``Array.sort``. Here is the unscientific comparison.

Using `Engineering a Sort Function`__ as a reference, along with
textbooks, etc, I wrote the following:

__ http://citeseer.ist.psu.edu/viewdoc/summary?doi=10.1.1.14.8162

.. include:: files/code/quicksort1/quicksort.js
   :code: javascript
   :start-after: //QSORT1START
   :end-before: //QSORT1END
   :number-lines:


This method:

- Uses a median of three pivot strategy
- Leave the pivot in place while partitioning
- Is recursive down both halves of the partition.

Lines 18 |--| 32 partition the data.

Originally, I used a random pivot.  That works well, but the median of
three can help partition the data more evenly, leading to less work.

The pivot value is copied out to a temporary during the paritioning.
In JavaScript, this isn't as big of a deal, because objects besides
primitives are basically reference types anyways... so copying the
pivot value in that case is more like a pointer copy.

A common case that I care about is when there are many equal values in
the array.  This version of quicksort does not handle that well.

The next version uses the fat partitioning described in the paper to
group all of the values equal to the pivot.

.. include:: files/code/quicksort1/quicksort.js
   :code: javascript
   :start-after: //QSORT2START
   :end-before: //QSORT2END
   :number-lines:

Lines 45 |--| 52 swap values equal to the pivot to the outer part of the
array.  At the end of the partition the pivot values are brought back
together in the center.

These sort routines use the ``<`` operator.  The ``Array.sort``
routine requires a comparison operator that returns ``-1``, ``0``, or
``1`` for less than, equal to, and greater than.  The custom routines
are less general (so far!)

Here are some timing results on Chrome comparing the two sorts and the
system sort.  These tests are unfair and likely misleading, but they
are a start.

.. csv-table:: Timing results on 1 million values (in seconds)
   :header: data type, qsort1, qsort2, Array.sort, NumPy

   random double, 0.13, 0.15, 3.15, 0.11
   sawtooth [1]_, 0.03, 0.01, 0.04, 0.02
   ordered, 0.02, 0.03, 0.59,  0.01
   reversed, 0.02, 0.03, 0.60,  0.02
   shuffled, 0.11, 0.13, 0.68, 0.09


``qsort1`` and ``qsort2`` are far less generic than ``Array.sort``,
and there are likely several errors in how I am doing this timing.
Sometimes, for example I seem to be getting GC pauses while doing the
test, but I have not confirmed what is going on yet.  Overall, I am
optimistic that in these cases, JavaScript can be made to run in a
reasonable amount of time.

The NumPy values are in there for comparison.  I am assuming that the
NumPy sort is in native code underneath, and it is far easier to time
python code than to write some C++ wrappers just for a comparison.


Here is a `link to the test driver`__ that launches directly into the
tests.

__ /code/quicksort1/quicksort.html


.. [1] The values in the array are 0, 1, 2, 3, 0, 1, 2, 3, ... the
       whole way to the end of the array.
