.. link:
.. description:
.. tags:
.. title: Updating Emacs packages
.. date: 2013-01-02


I use ELPA, Marmalade, and MELPA to manage Emacs extensions.

This block of elisp in my config file adds all of the package
repositories I use.

.. code:: scm

  (setq package-archives
        '(("gnu" . "http://elpa.gnu.org/packages/")
          ("marmalade" . "http://marmalade-repo.org/packages/")
          ("melpa" . "http://melpa.milkbox.net/packages/")))


Occasionally, I must run ``M-x package-list-packages`` to update then
pacakge listing.  This creates a ``*Packages*`` buffer that shows the
available and installed packages.  In this buffer, type ``U`` to mark
the upgradeable packages.  (note, plan to restart emacs after this
process...)  Emacs will ask for confirmation on the installation of
the new packages, then confirmation on the deletion of the old
packages.





