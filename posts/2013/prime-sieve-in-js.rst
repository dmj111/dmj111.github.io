.. link:
.. description:
.. tags:
.. title: Prime sieve in JavaScript
.. date: 2013-11-17 0:00

.. |...| unicode:: U+2026  .. ellipsis


*Update* : After running the C version through Emscripten_, the result
is about the same speed as the C version when run through Firefox.
Wow!

*Update* : Switching from a Javascript ``Array`` to ``Int8Array``
halved the time in Firefox, making it comparable to C and Emscripten.
(Until moving C to 8 bits, then things got faster there as well |...|).

Ok, time for some more prime sieving.  This time, we are going to
try JavaScript, Python, and C.


First, the Python code

.. code:: python

    import numpy as np

    def sieve1(n):
        values = np.arange(n)
        values[1] = 0
        # values[4::2] = 0
        for i in xrange(n):
            i2 = i*i
            if i2 >= n:
                break
            if values[i]:
                values[i2::i] = 0
        result = values[values > 0]
        return result


This is the normal sieve.  The inner loop is in NumPy_, and running ::

  %timeit ps = primes_np.sieve1(15485864)

Gives me a list of first million primes in about 425 ms on my laptop.


Next, C.

.. code:: c

    #include <stdio.h>
    #include <stdlib.h>
    #include <time.h>

    int main() {
      const int n = 15485864;
      clock_t start = clock();
      int *arr = malloc(n * sizeof(int));

      for(int i = 0; i < n; ++i) { arr[i] = i; }
      arr[1] = 0;

      for(int i = 0; i < n; ++i) {
        int d = i * i;
        if(d >= n) { break; }
        if(arr[i]) {
          for(int j = d; j < n; j += i) {
            arr[j] = 0;
          }
        }
      }
      int count = 0;
      for(int i = 0; i < n; ++i) {
        if(arr[i]) { ++count; }
      }
      clock_t end = clock();
      printf("found %d primes less than %d\n", count, n);
      double duration = (end - start) / (double)CLOCKS_PER_SEC;
      printf("took %f seconds\n", duration);
    }


This code took about 280 ms. (``clang -O3``)


Finally, the JavaScript version.

.. This injects the code into the text

.. include:: posts/2013/prime_code.js
   :code: js


This takes around 650 ms on the same computer.

None of these examples were tweaked or tested rigorously |...|

Just for fun, you can run the JavaScript on this page. The millionth
prime should be 15,485,863.


.. raw:: html

   <button id="test_prime">Click to calculate first million primes</button>

   <div id="prime_result">See the results here … </div>

   <div></div>

.. Inject the javascript code from the file

.. raw:: html

   <script type="text/javascript">

.. this injects the code as code

.. raw:: html
   :file: posts/2013/prime_code.js

.. raw:: html

   </script>


.. The gui javascript code...

.. raw:: html

   <script type="text/javascript">
   (function () {
	 var elem = document.getElementById("test_prime");
	 var prime_ui_fcn = function () {
	    var el = document.getElementById("prime_result");
	    el.innerHTML = "Calculating …";
	    setTimeout(function() {
	        var start = new Date();
		var r = primes.sieve1(15486000+1);
                var now = new Date();
	        el.innerHTML = "millionth prime: " + r[999999].toLocaleString() +
		               " took " + (now - start) + "ms";

		}, 10);
	 };
	 elem.addEventListener("click", prime_ui_fcn);
	 })();

   </script>



.. _NumPy: http://www.numpy.org/
.. _Emscripten: https://github.com/kripken/emscripten/wiki
