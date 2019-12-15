.. link:
.. description:
.. has_math: true
.. title: Sieve of Eratosthenes
.. date: 2012-01-07 8:00

A function to generate prime numbers is often useful.  This sieve of
eratosthenes is one of the simplest ways to find prime numbers, and it
is much more efficient than the brute force method.

`Here is a nice description
<http://programmingpraxis.com/2009/02/19/sieve-of-eratosthenes/>`_ of
how to perform the sieve, and `here is a previous
</2010/08/sieve-of-eratosthenes/>`_
post I wrote about it.  This time, I rewrote it in OCaml, and got a
little farther by only generating the odd prime numbers.

First, here is a helper function to take an array of integers, and
return a new array that contains only the non-zero values.  This
will be useful later in all of the sieve functions.

.. code:: ocaml

  (* return a new array of the non-zero items *)
  let filter_non_zeros ar =
    let count = Array.fold_left (fun count x ->
      if x <> 0 then count + 1 else count) 0 ar in
    let result = Array.make count 0 in
    let rec go idx jdx =
      if jdx = count then
        result
      else if ar.(idx) = 0 then
        go (idx + 1) jdx
      else
        (result.(jdx) <- ar.(idx);
         go (idx + 1) (jdx + 1))
    in
    go 0 0



Next, the straightforward sieve, first written to use recursion
instead of loops. Loops are not necessary in languages like OCaml, but
sometimes they are nicer than the recursion, depending on the problem.

.. code:: ocaml

  (* Sieve of eratosthenes, using all recursion for the looping *)
  let sieve n =
    let result = Array.init (n+1) (fun i -> i) in
    let stop_index = int_of_float (sqrt (float_of_int n) ) + 1 in
    result.(1) <- 0;

    let rec loop idx =
      if idx = stop_index then
        ()
      else if result.(idx) = 0 then
        (* not prime *)
        loop (idx + 1)
      else
        let rec clear j =
          if j <= n then
            (result.(j) <- 0;
             clear (j + idx));
        in
        clear (idx * idx);
        loop (idx + 1)
    in
    loop 2;
    filter_non_zeros result


This function creates an array of potential prime numbers.  Then, it
walks through the array, looking for the next prime.  When a new prime
is found, the function clears all of the multiples of the prime in the
rest of the array.

Next is a function that moves the inner most recursion into a loop.

.. code:: ocaml

  (* Sieve of Eratosthenes, moving the inner loop into a loop *)
  let sieve2 n =
    let result = Array.init (n+1) (fun i -> i) in
    let stop_index = int_of_float (sqrt (float_of_int n) ) + 1 in
    result.(1) <- 0;

    let rec loop idx =
      if idx = stop_index then
        ()
      else if result.(idx) = 0 then
        (* not prime *)
        loop (idx + 1)
      else
        (let j = ref (idx * idx) in
         while !j <= n do
           (result.(!j) <- 0;
            j := !j + idx);
         done;
         loop (idx + 1))
    in
    loop 2;
    filter_non_zeros result


That function takes the same time as the first one, and is just a difference
in style.

Next is a function that does away with the recursion altogether.

.. code:: ocaml

  (* Sieve of Eratosthenes, using all loops instead of recursion *)
  let sieve3 n =
    let result = Array.init (n+1) (fun i -> i) in
    let stop_index = int_of_float (sqrt (float_of_int n) ) + 1 in
    result.(1) <- 0;
    let idx = ref 2 in
    while !idx <= stop_index do
      if result.(!idx) <> 0 then
        (let p = !idx in
         let j = ref (p * p) in
         while !j <= n do
           result.(!j) <- 0;
           j := !j + p;
         done);
      idx := !idx + 1;
    done;
    filter_non_zeros result


Finally, the last method only generates the odd primes.  We can ignore
even numbers right from the start, and halve the memory and timing
requirements.  This requires a little trickery to do all of the
indexing correctly, but it isn't too bad.


.. To get the indexing right, first we have that index \(i\) is for the
.. value \(p = 2 i + 1\).  The square of \(p\) is
.. \(p^2 = (2 i + 1) ^2 = 4 i ^2 + 4 i + 1 = (2 i + 1)(2 i

.. code:: ocaml

  (* This one ignores the even numbers entirely, so it is about
     twice as fast now *)
  let sieve4 n =
    let m = (n / 2) + 1 in
    let result = Array.init m (fun i->2*i+1) in
    (* Remeber that 2 is a prime *)
    result.(0) <- 2;
    let stop_index = int_of_float (sqrt (float_of_int n) /. 2.) + 1 in

    let idx = ref 1 in
    while !idx <= stop_index do
      if result.(!idx) <> 0 then
        (* 2 * idx + 1 is the next prime.  Now
           remove its multiples.
           We want to start at p*p, and step by p.
           for example, If idx is 1, then p is 3.
           To get result(i) = 9, we need i to be 4.
           If idx is 2, and p = 5, then to get
           result(i) = 25, we need i to be 12.
           So, we can move out by idx * p, then step by p
        *)
        (let p = result.(!idx) in
         let j = ref (!idx * (p + 1)) in
         while !j < m do
           result.(!j) <- 0;
           j := !j + p;
         done);
      idx := !idx + 1;
    done;
    filter_non_zeros result


And finally, a test driver.

.. code:: ocaml

  let main sieve_fcn =
    let n = 15485863 in
    let m = Array.length (sieve_fcn n) in
    Printf.printf "number of primes less than %d: %d\n" n m;
  ;;

  main sieve4;;
