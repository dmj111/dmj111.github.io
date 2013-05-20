.. link:
.. description:
.. tags:
.. title: Git remote setup
.. date: 2013-05-17

In mercurial, you can clone remotely pretty easily:

.. code:: sh
          
          hg clone some_repo ssh://host/path/to/new_repo

I have not learned git very well yet, but `this link
<http://thelucid.com/2008/12/02/git-setting-up-a-remote-repository-and-doing-an-initial-push/>`_
helped solve my remote problem.  

The main steps

   - setup a bare git repo on the target machine (``git init
     --bare``), and named ``.git``
   - add the remote repo as a remote 
   - and push!

I think the ``--bare`` was the part I kept missing.
