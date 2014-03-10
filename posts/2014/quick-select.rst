.. title: Quick select
.. tags: mathjax
.. date: 2014/03/06 23:25:35

.. |--| unicode:: U+2013   .. en dash
.. |---| unicode:: U+2014  .. em dash, trimming surrounding whitespace
   :trim:
.. |...| unicode:: U+2026  .. ellipsis

Why would a programmer want to write `their own sort function`_?

First, and most importantly, to learn about algorithms and
programming.  Also, a language or library sometimes has an inadequate
sort function for a specific situation.

There is also a problem in the wild that a custom sort is nice to use
for.

Finding the median of an array of data (or any other percentile, for
that matter.)  Quickselect_ is closely related to Quicksort.  Instead
of recursively sorting both halves of the partition created in the
partitioning step, we can just follow the one that contains the
element we are looking for.

The C++ STL contains a partition_ function that can do just what we
want.  Sometimes a language / library doesn't include this
functionality.


.. _partition: http://www.cplusplus.com/reference/algorithm/partition/

Quickselect is an :math:`O(n)` algorithm in the average case, which
sounds much better than the :math:`O(n \log n)` case for Quicksort.
But, once :math:`n` gets large enough, these two grow at about the
same rate.  The bigger win is that Quickselect has a lower constant,
so even though both it and Quicksort grow at about the same rate,
Quickselect is a few times faster on random data.

So, here is a ``quickMedian`` function.  This function keeps calling a
partitioning function on the subarray that contains the middle point.
(Not really the median |...| but it is our example.)

The partition function returns and object containing several indexes.

- a |---| the start of the left partition
- b |---| the end of the left partition
- c |---| the start of the right partition
- d |---| the end of the right partition


We also jump out early instead of breaking the array down to a single
element, and use insertion sort on the last chunk of the array.


.. include:: files/code/quicksort1/quickselect.test.js
   :code: javascript
   :start-after: //QMEDSTART
   :end-before: //QMEDEND
   :number-lines:


This function can be generalized to find a different value than the
center value, or even to find several percentiles at once.


Here are some non-representative timing results, from my Mac, on
Chrome.

.. csv-table:: Timing results on 1 million values (in seconds)
   :header: data type, quick sort, quick select median

   random double, 0.15, 0.02
   sawtooth [1]_, 0.02, 0.02
   ordered, 0.04, 0.02
   reversed,0.05, 0.02
   shuffled,0.15, 0.03

.. [1] The values in the array are 0, 1, 2, 3, 0, 1, 2, 3, |...| the
       whole way to the end of the array.

Here is a `link to the test driver`__ that launches directly into the
tests.  It runs in Chrome, but hasn't been tested extensively.

__ /code/quicksort1/quickselect.test.html


.. _Quickselect : https://en.wikipedia.org/wiki/Quickselect
.. _`their own sort function`: /posts/2014/js-quicksort.html
