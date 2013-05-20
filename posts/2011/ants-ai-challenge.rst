.. link:
.. description:
.. tags: 
.. title: Ants AI Challenge
.. date: 2011-12-18 21:41
.. slug: ants-ai-challenge


The `AI Challenge <http://aichallenge.org/>`_ is Ants this time
around.  The goal is make your your ants collect food, explore, raze
opponent ant hills, and protect their own hill.  New ants are earned
by harvesting food, and there is a combat system.
`Here <http://youtu.be/2ddj0CJOPQo>`_ is a video of a game.  For a
better view, go to the main site to watch some games!


From past contests, I knew I could easily spend too much time
competing.  I also knew that I didn't want to spend most of my free
time tweaking weights and settings.  So, I decided to work on this for
a short while, try to get a respectable bot, then quit.  I succeeded
at quitting, though maybe not soon enough.

Unlike the previous contests (`Tron <http://tron.aichallenge.org/>`_
and `Planet Wars <http://planetwars.aichallenge.org/>`_), in this
version the bots have imperfect information.  Like the previous
contests, the game is text based, making it very easy for contestants
to use their language of choice, subject only to getting the language
running on the contest server.  This was one of the reasons I entered
the Tron contest, besides how awesome it looked.  Often these kind of
games require players to compile or link their bot into the game
engine.

My goal was to create a bot that made only local decisions for each
ant because there were too many possibilities to consider every
possible set of moves.  With any luck, good behavior could emerge from
such a bot.  I also hoped to only use very simple features for these
local decisions, but the features in the bot are lacking in several
respects.

So, again, I wanted to treat each ant independently.  That makes
searching their moves easy, but also makes the bot dumb.  The first
bot I submitted searched for food, enemy hills, and unknown territory,
It avoided enemies, but had no combat code.  The bot was pretty dumb.

The second version had some simple combat code.  I tried making each
ant move as aggressively as possible, and then backed off any move
that didn't seem safe enough.  This bot also had some code to push
ants away from their own hill.  The second version was much stronger
than the first, but it timed out on some big maps.

The timeouts occurred because the bot does a few breadth-first
searches to find out the distances from the various targets.  One BFS
starts at each known food, one at each known enemy hill, and another
at all of the grid cells that haven't been seen for a while.  The way
I wrote the BFS in Python was almost fast enough, but could take too
long on larger maps.

The scoring function for ants that are not in combat is just a
weighted combination of the inverse distance squared from each of the
interesting targets.  This makes the ants go towards food, but if they
have a choice between close food and close enemy hill, they charge the
hill.  They also are attracted to enemy ants, which helps the bot get
the numbers needed for attacking.

The third version was a rewrite of the second, but in C++.  This made
the BFS searches about 50 times faster. I tried making the combat code
more aggressive, but it went too far, often walking right into an
attack.


The third version is my official version.  Some weaknesses it has are

 - no defense of the home base
 - no overall global decision making. (it will send every ant to battle at
   one hill, and leave another that is only)
 - the combat is pretty bad
 - there is no coordination at all between ants

I spend some time on the code after my official entry, but made no
progress that was worth submitting.  I `wrote code
<http://forums.aichallenge.org/viewtopic.php?f=24&t=2098>`_ to
discover the symmetry of the map to predict where other hills would
be, though it wasn't very helpful.  The math was fun, though.  I tried
using logistic regression to tune the weights of my evaluation
function.  That failed, and I think it was because I was trying to
predict the wrong thing, and my features did not account for any
global information.

Some of the other competitors are far beyond the rest of us, and I
look forward to learning how they did it.  Overall though, I am happy
with the time I spent, and what I have learned.  With the Stanford
Online classes, work, and other activities, spending more time on the
AI contest was just going to happen for me.

Congratulations to the winners!

