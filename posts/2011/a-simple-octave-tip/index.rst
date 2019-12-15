.. link:
.. description:
.. has_math: true
.. title: A simple Octave tip
.. date: 2011-11-19
.. slug: a-simple-octave-tip

..   alias : [/posts/2011/2011-11-19-a-simple-octave-tip/]
..            /blog/2011/11/19/a-simple-octave-tip/index.html

.. mathjax tip here
..  http://ralsina.com.ar/weblog/posts/math-works-now.txt

Matlab and Octave_ are both great for quickly trying out numeric code,
especially using linear algebra.  Many times code can be written to
use the built in matrix operators instead of using loops.  This makes
the code clearer and faster.  The following examples all use Octave.

.. _Octave: http://www.gnu.org/software/octave/

First, consider this formula

.. math::

  S = \sum_{i=1}^n x_i  y_i


``x`` and ``y`` are one dimensional vectors in Octave, so we can find
:math:`S` with this code:

.. code:: octave

     S = 0;
     N = length(x);
     for i = 1:N
       S += x(i) * y(i);
     end


That code is straight forward.  Octave can do more, though.  The =.*=
operator does an element by element multiplication over matrices, and
=sum= adds up the elements in a matrix.  Since our matrices are
one-dimensional, we can compose these functions to get our result, at
the cost of creating a temporary matrix.

.. code:: octave

     S = sum(x .* y)


Finally, Octave already has a function that does what we want.  The
formula we are looking at is the dot product of two vectors, so in
Octave, we can do

.. code:: octave

   S = dot(x, y)


The first attempt is the clearest when you do not know what ``.*``,
``sum``, and ``dot`` do.  But, once you know what ``sum`` and ``dot``
do, they are much clearer.  Also, they are much faster in Octave than
the naive loop.

The next listing shows a test driver to compare the three methods.

.. code:: octave

     fprintf("\n||||\n| method | size| result | time |\n")
     fmt = "| %s | %d | %f | %f |\n";

     for SIZE = [100, 1000,10000,100000,1000000]
         x = rand(SIZE, 1);
         y = rand(SIZE, 1);

         fprintf("|---\n")
         tic
         S = 0;
         for i = 1:SIZE
           S += x(i) * y(i);
         end
         t1 = toc;
         fprintf(fmt, "for", SIZE, S, t1);

         tic
         S = sum(x .* y);
         t1 = toc;
         fprintf(fmt, "sum", SIZE, S, t1);

         tic
         S = dot(x, y);
         t1 = toc;
         fprintf(fmt, "dot", SIZE, S, t1);
       end


Running this code gives us the following results.



=======  =======  =============  =========
 method     size     result      time
=======  =======  =============  =========
 for         100      24.266291  0.000744
 sum         100      24.266291  0.000055
 dot         100      24.266291  0.000018

 for        1000     247.065638  0.007198
 sum        1000     247.065638  0.000016
 dot        1000     247.065638  0.000017

 for       10000    2507.387623  0.074163
 sum       10000    2507.387623  0.000083
 dot       10000    2507.387623  0.000029

 for      100000   25090.247927  0.736105
 sum      100000   25090.247927  0.000656
 dot      100000   25090.247927  0.000095

 for     1000000  249863.296971  7.334975
 sum     1000000  249863.296971  0.006773
 dot     1000000  249863.296971  0.001246

=======  =======  =============  =========

As a general rule, we should always try to use the language and tools,
instead of doing things ourselves.  Often, this is mostly a matter of
learning what is available.

Sometimes, though we want to *learn* how something works. Then, of
course, it makes sense to do it ourselves instead of just making a
call to existing code.
