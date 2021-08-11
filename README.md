# About
This PWA channels my passions (Mastering Chess, Learning Languages & Programming) into one app. This app is a constant work in progress, changes are pushed without testing, result in loss of data and may ruin your user experience. It's not a bug, it's a feature!

# Documentation
# Chess

**Learning Chess (intended for expert chess players) guided by modern techniques including: statistics, the best chess engines, psychology and machine learning.**

*Coach Settings (change by tapping the labels)*

* **@profile {2200,2300,2400,2500}** defines the opponent skill level in terms of consistency. How does this work? A pgn chess database of stockfish annotated games (played by humans) is provided. The app uses this database to determine the skill level of the specified elo range for example "@profile 2200" is 2200 - 2300. The skill level tells the engine the target evaluation for each move. This has some interesting side effects, if you play badly the engine is likely to mirror you and also make a mistake to balance the evaluation. To limit this behaviour the additional parameter @mistake_tolerance exists. On the other hand if you play well the strength of the stockfish engine is reduced since it will play inconsistently just like humans do. E.g not always play the best move.
* **@mistake_tolerance [0-1]** if you make a mistake or blunder that worsens your position (evaluated by the engine) so far bellow the given threshold the engine will take advantage and try to win. E.g a @mistake_tolerance 0.5 means if your position is about half a pawn worse then the engine will try to win by playing the top rated moves. 
* **@depth [1-19]** engine search depth, the higher the depth the more accurate the evaluation. 
* **@no_book / @ custom_book** use the pgn chess database for the first 5 opening moves, use this parameter to have more human like games.


*Actions (activate by tapping the labels or the pieces on the board!)*

Labels
* **Resign!** Give up the current game to start a new game.
* **Force Move!** The engine mirrors you time usage, that way the game feels much more natural. If you do not want to wait use this button, to force the engine to move immidiatly.
* **Switch Sides!** Play a different color or overtake the engines side.

Pieces (you can click/tap the pieces on the board to get extra information)
* Learn about Chess by exploring the information provided to you. Including valuable statistics related to your position.


*Statistical Measures*
* Material
* Degree of Freedom
* Mobility
* Expansion factor
* Protected squares
* Packing density

# Language Learning

**Language Learning with instant feedback, space repetition, voice recognition and your own frictionless content creation.**
...

# Manual

**Clone the repository**

`git clone https://github.com/Philipp-Sc/learning.git`

`cd learning`

**Https** *(required)*

* Put the ssh certificates (cert.pem, privkey.pem) for your domain here. 
* You may use https://hub.docker.com/r/certbot/certbot/ to generate the certificates with Let's Encrypt. 

**Build the Docker image**

`docker build -t philipp-sc/learning `

**Start the container and run the ExpressJS server**

`docker run --name=learning-xtreme -d -p 443:8080 philipp-sc/learning npm start`

*Make sure the port 443 is open to accept incoming requests*

**View the logs**

`docker logs learning-xtreme`


``

# Contact

philipp.schluetermann@udo.edu

# License
<a href="https://www.philipp-schluetermann.de/about/"> Philipp Schlütermann </a> may distribute, remix, adapt, and build upon this work, even commercially.

You may distribute, remix, adapt, and build upon this work for non-commercial use, provided that the following conditions are met:
1. Redistributions this work must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Neither the name of Philipp Schlütermann nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
3. Commercial use is prohibited without specific prior written permission from the author.

THIS SOFTWARE IS PROVIDED AS IS AND WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
