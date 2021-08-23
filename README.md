<p align="center">
  <img height="369px" src="https://github.com/Philipp-Sc/learning/blob/main/Screenshot_20210816_.png?raw=true" />
  <img height="369px" src="https://github.com/Philipp-Sc/learning/blob/main/Screenshot_20210816.png?raw=true" />
</p> 

This PWA channels my passions (Mastering Chess, Learning Languages & Software Development). 

I work on <a href="https://github.com/Philipp-Sc/learning">Philipp-Sc/learning</a> to implement features that I do not see elsewhere:

* Studying Chess with the help of Data Science, eventually AI.
* Learning Languages frictionless while on the go traveling abroad.


It is written using Ionic, Capacitorjs and Expressjs. 


# Roadmap
# Chess
* **@self_play** Have the opponement play the same opening and eventually mirror your playing style based on your past games. Bobby Fisher has been known to play himself. Alpha Zero was trained using self play.
* **@custom_book** Extend functionality: 1) Filter by Elo independent from current elo. 2) Allow the use of the engine pgn database as source. 3) Optional weighting of common opening moves. Still random but prefer common openings. 4) Allow user to provide pgn database.
* Highlight the Statistical Measures (Degree of Freedom, Mobility, Expansion factor, Protected squares, Packing density) if possible on the board.
* Improve the Visualization of the Statistical Measures, make it intuitive. (e.g Illustrations, Charts, Explainations)

# Language
* ...

# Documentation
# Chess

**Learning Chess (intended for expert chess players) guided by modern techniques including: statistics, chess engines, psychology and machine learning.**

*Coach Settings (change by tapping the labels)*


*Above the board:*

* **@profile {2200,2300,2400,2500}** defines the opponent skill level in terms of consistency. 
  
  A pgn chess database of stockfish annotated games (played by humans) is provided. 
  The algorithm uses this database to determine the **skill level** of the specified elo range for example "@profile 2200" filters the games by elo 2200 - 2300. 
  
  The **skill level** tells the engine the **target evaluation** for each move. 
  
  With that: 
  * The opponement only plays good as long as you play decent.
  * If you are behind, it will also play badly and give you a chance to come back.
    To limit this behaviour the additional parameter @mistake_tolerance exists. 
  * On the other hand if you play well the strength of the stockfish engine is reduced. It will play inconsistently picking moves by the **target evaluation**. E.g not always play the best move. This is best for training, if the chess engine just butchers you, learning is difficult.


* **@mistake_tolerance [0-1]** if you make a mistake or blunder that worsens your position (evaluated by the engine) so far bellow the given threshold the engine will take advantage and try to win. E.g a @mistake_tolerance 0.5 means if your position is about half a pawn worse then the engine will try to win by playing the top rated moves. 
* **@depth [1-19]** engine search depth, the higher the depth the more accurate the evaluation. 
* **@no_book / @ custom_book** use the pgn chess database for the first 5 opening moves, use this parameter to have more human like games.


*Below the board:*

* **@highlight analysis** if active the analysis is shown live on the board as the engine opponent evaluates the position.

* **@highligh avg. perf.** if active the board is highlighted either in green or in red based on your past performance at the current move number.
* **@highligh median. perf.** if active the board is highlighted either in green or in red based on your past performance at the current move number.
 (If **@highligh avg. perf.** and **@highligh median. perf.** are active the average of both is taken to determine the color.)

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

* `git clone https://github.com/Philipp-Sc/learning.git`

* `cd learning`

# Run on localhost (development)


**Update npm**

* `npm install -g npm`


**Install dependencies**

* `npm install`

* `npm install @wmik/use-media-recorder --force`

**Build the Capacitor PWA**

* `npm run build`

**Host with express.js** *(required)*

*express.js is required because stockfish.js (https://github.com/niklasf/stockfish.wasm) uses sharedarraybuffer (https://developer.chrome.com/blog/enabling-shared-array-buffer/))*

* `node server-localhost.js`

*without stockfish.js the express.js server is not needed, use:*

* `ionic serve --livereload;`



# Hosting

**Https** *(required)*

* Put the ssh certificates (cert.pem, privkey.pem) for your domain here. 
* You may use https://hub.docker.com/r/certbot/certbot/ to generate the certificates with Let's Encrypt. 

**Build the Docker image**

* `docker build -t philipp-sc/learning `

**Start the container and run the express.js server**

* `docker run --name=learning-xtreme -d -p 443:8080 philipp-sc/learning npm start`

*Make sure the port 443 is open to accept incoming requests*

**View the logs**

* `docker logs learning-xtreme`
 

# Contact

philipp.schluetermann@udo.edu

# License
<a href="https://www.philipp-schluetermann.de/about/"> Philipp Schlütermann </a> may distribute, remix, adapt, and build upon this work, even commercially.

You may distribute, remix, adapt, and build upon this work for non-commercial use, provided that the following conditions are met:
1. Redistributions this work must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Neither the name of Philipp Schlütermann nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
3. Commercial use is prohibited without specific prior written permission from the author.

THIS SOFTWARE IS PROVIDED AS IS AND WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.

# Thanks

**Stockfish**

* Multi-threaded WASM. Uses SIMD. Strongest.
	
  See https://github.com/hi-ogawa/Stockfish for a WebAssembly port with NNUE support.
  
  See https://github.com/hi-ogawa/stockfish-nnue-wasm-demo/blob/master/public/index.html for how to use Stockfish 14 (nnue-wasm).
  
* Multi-threaded WASM, but using the classical handcrafted evaluation function.
	
  https://github.com/niklasf/stockfish.wasm
  
* Slower-single threaded WASM fallback.
  
  With extremely slow pure JavaScript fallback.
	
  Maintained with bugfixes to keep supporting older browsers, but active development is happening on stockfish.wasm.
	
  https://github.com/niklasf/stockfish.js
  
**Chess Utilities**

* PGN Parsing https://github.com/mliebelt/pgn-parser
* Chess.js https://github.com/jhlywa/chess.js
* Chessboard.js https://github.com/willb335/chessboardjsx
* Elo-Rating https://www.npmjs.com/package/elo-rating		
		
