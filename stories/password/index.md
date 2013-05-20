<!--
.. link:
.. description:
.. tags:
.. date: 2013/05/14 23:35:17
.. title: Password
.. slug: password
-->


<form name="shahash" action="#">
<table summary="hash form" style="background-color: rgb(238, 238, 238);" border="1" cellpadding="1" cellspacing="1">
<tbody><tr>
<td align="right"> password </td>
<td align="right"><input size="32" name="key" type="password" placeholder="password"></td>
</tr><tr>
<td align="right"> message </td>
<td align="right"><input size="32" name="msg" type="text" placeholder="message"></td>
</tr><tr>
<td align="right">hash</td><td>
<input name="output" size="32" type="text"></td>
</tr>
<tr>
<td align="right">testhash</td><td>
<input size="32" name="testout" type="text"></td>
</tr>
<tr>
<td align="right">numbers</td><td>
<input size="32" name="numbers" type="text"></td>
</tr>
<tr>
<td align="right">diceware</td><td>
<input size="32" name="diceware" type="text"></td>
</tr>

</tbody></table>
</form>

This page comes with no warranty, and it might even be bad for your
security or health! Please do pick good passwords, and take means to
protect
them. [Here is some better advice](https://www.schneier.com/blog/archives/2014/03/choosing_secure_1.html)
on what to do...

This page is based on one called twonz, and the notes to it are below
this paragraph.  The difference is that this one uses a different
sha-1 function.  (Neither page uses SHA-1 for real, they both drop '+'
and '/' from the output).  Also, the testhash line always hashes the same
text ('test'), so that way you can verify that you typed the password
correctly.


### original copyright

this webpage is a self-contained program for computing secure password
choices using a keyed message authentication code. it is copyright (C)
1999 vengeance software, written by graydon hoare and released under
the terms of the GNU general public license v2.0+

to operate it, key the first field with your passphrase (it is not
stored nor sent anywhere outside your browser, honest -- read the
code), then enter the name of the facility, site, URL, etc. that you
want to make a password for in the second field. press the button, and
a password will pop up in the 3rd field. It will always compute the
same password, and it's quite hard for anyone to figure out the
passphrase from the generated password (they would need a way through
SHA-1).


<script type="text/javascript" src="password.js"></script>


<script type="text/javascript">
window.addEventListener('load', function() {
      'use strict';
      document.shahash.key.onchange = recompute;
      document.shahash.msg.onchange = recompute;
      window.onload = function(e) {
      document.shahash.key.focus();
      }
});

</script>
