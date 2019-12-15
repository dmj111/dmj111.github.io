.. link:
.. description:
.. tags:
.. date: 2013/10/17 22:00:00
.. title: C quicksort
.. slug: c-quicksort

I have written quicksort in the past_ mostly to learn how it works and
to play with optimization.  (Because most of the time... I just want
to call the system sort.)

.. _past: /posts/2012/2012-04-24-quicksort-in-d/

Sometimes, knowing how this works helps with other problems, like
sorting vectors, where we can do better than a full comparison on each
step.

All of the other sorts I have written have been in a language that has
at least some generic support.  This time, though, it is in C, using
`void *`'s.

And it wasn't that bad. This code is not fit for a system library, or
anything like that, but it was fun(?) to write and test.

The code stops quicksorting when the subfile gets shorter than 10
lines, and it uses a median-of-three pivot selection.

In the testing I did, an iterative version of this algorithm showed
no improvement.



.. code:: c

    void q4(void   *array,
            size_t  length,
            size_t  size,
            int(*compare)(const void *, const void *))
    {
      if(length < 10) {
        for(void *a = array + size; a < array + size*length; a += size) {
          for(void *b = a;
              b > array && compare(b, b-size) < 0;
              b -= size) {
            swap(b, b-size, size);
          }
        }
      } else {
        void *middle = array + (length / 2) * size;
        void *outer = array + (length-1) * size;
        void *pivot = array + (length-2) * size;
        swap(middle, pivot, size);
        median_of_three(array, pivot, outer, size, compare);

        void *a = array - size;
        void * b = pivot;

        while(a < b) {
          a += size;
          for(;a < b && compare(a, pivot) < 0; a += size){}
          b -= size;
          for(;a < b && compare(pivot, b) < 0; b -= size){}
          if(a < b) {
            swap(a, b, size);
          }
        }

        assert(compare(a, pivot) >= 0);
        swap(a, pivot, size);
        q4(array, (a-array)/size, size, compare);
        q4(a + size, length - (a-array)/size-1, size, compare);
      }
    }


The median of three code leaves the smallest value at `a`, the middle
at `b`, and the largest at `c`.

.. code:: c

    void median_of_three(void *a, void*b, void*c, size_t size,
                         int (*compare)(const void*, const void*)) {
      if(compare(a, b) > 0) { swap(a, b, size); }
      if(compare(b, c) > 0) {
        swap(b, c, size);
        if(compare(a, b) > 0) { swap(a, b, size); }
      }
      assert(compare(a, b) <= 0);
      assert(compare(b, c) <= 0);
    }


And the swap is not efficiency minded...


.. code:: c

    void swap(char *a, char *b, int size) {
      while(size > 0) {
        char t = *a;
        *a = *b;
        *b = t;
        ++a, ++b, --size;
      }
    }


In most cases, the system `qsort` on my machine crushes this code.
