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

* Make player mode selection easier. Custom, Automatic.

* Make UI more close to Lichess.

* **@self_play** Have the opponement play the same opening and eventually mirror your playing style based on your past games. Bobby Fisher has been known to play himself. Alpha Zero was trained using self play.

* **@custom_book** Extend functionality: 1) Filter by Elo independent from current elo. 2) Allow the use of the engine pgn database as source. 3) Optional weighting of common opening moves. Still random but prefer common openings. 4) Allow user to provide pgn database.
 
* Highlight the Features (Degree of Freedom, Mobility, Expansion factor, Protected squares,..) if possible on the board.

* **notification** show and highlight most important principles/features relevant in the current position
* Improve NN by providing better training data. (Annotate Lichess Chess Database with Stockfish)
* Consider live training the NN on the current (or simialar) game position. Stockfish evaluations are already partly there anyway.
* Add more principles/features.
* Calculate Pawn Structure from Database. Reduce 3 features to 1.
* Fix Pawn Structure Visualization on Mobile
* Ensure the Importance Calculation is stopped before the next one is calculated.
* Reduce the amount of features for importance calculation somehow. Calculate the top 10 and add show more button. Top 10 based on heuristic.
* Add button to enable/disable feature importance


* **@training** 
* a) Based on game history let the opponement go for positions where you made mistakes in the past.
* b) Predicting your blunder probability ahead of time.

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
* **@depth [1-19]** engine search depth, the higher the depth the more accurate the evaluation. It will give the engine more good moves to fallback to.
* **@no_book / @ custom_book** use the pgn chess database for the first 5 opening moves, use this parameter to have more human like games.


*Below the board:*

* **Resign!** Give up the current game to start a new game.
* **Force Move!** The engine mirrors you time usage, that way the game feels much more natural. If you do not want to wait use this button, to force the engine to move immidiatly.
* **Switch Sides!** Play a different color or overtake the engines side.
* **Take Back Move!** I added this feature to account for mouse slips. Undo your last move. 



* **@analysis**  (+) the analysis is shown live on the board as the engine opponent evaluates the position.
* **@max depth** the maximum depth for the analysis, should be higher than the depth used by the opponement.

* **@engine move** (+) show the move/square that the engine is currently evaluating on the board.


* **@avg. perf.** (+) the board is highlighted based on your past performance at the current move number.
* **@median. perf.** (+) the board is highlighted based on your past performance at the current move number.
 (If **@avg. perf.** and **@median. perf.** the average of both is taken to determine the color. If the games played were very consisten then take avg. perf or both, else use median perf.)

* **Export Last Game To Lichess** Import the game to Lichess and open Lichess in a new Tab/Lichess App.

* **NN evaluation** After every move a Tensorflow Neural Network evaluates the *previous* position. 
* For example `NN evaluation of dxe4: 0.50 (2/27)` means that the move dxe4 has been given an evaluation of 0.50, and it was one of the best moves 2 out of 27.
* `Input Neurons:` This shows the most important features of the position. (The previous position at which dxe4 not yet has been played) This allows you to understand what features were important for the move you just played. Direct feedback is important to improve the quality of your moves.

* The features provide three numbers `a (b, c)`
* `a` your value of this feature.
* `b` the average value of this feature in human games where your side drew or won.
* `c` the average value of this feature in engine games where your side drew or won. 

* The feature also provides an indication `+ or -`, this shows that the feature is more/less important that usual.

# Language Learning

**Language Learning with instant feedback, space repetition, voice recognition and your own frictionless content creation.**
...

# Manual - Just Read The Instructions

**Clone the repository**

* `git clone https://github.com/Philipp-Sc/learning.git`

* `cd learning`


# a) Local Setup (current build)

* `cd learning_host_production`

* `npm install`

* `node server-localhost.js`  (local testing)

* `node server.js` (production, also see bellow *hosting*) 


# b) Docker Setup (current build)

* `cd learning_host_production`

* `docker build -t philipp-sc/learning .` or `docker load < philipp-sc_learning_latest.xz`

* `docker run --name=learning-xtreme -d -p 8080:8080 philipp-sc/learning npm test` (local testing)

* `docker run --name=learning-xtreme -d -p 443:8080 philipp-sc/learning npm start` (production, also see bellow *hosting*) 


# Development - More Than Just Reading The Instructions

**Update npm**

* `npm install -g npm`


**Install dependencies**

* `npm install`

* `npm install @wmik/use-media-recorder --force`

**Build webpack-eval-package**

* Description: The code needed to evaluate a given position i.e feature extraction. The main script is implemented as webworker to increase performance.

* `cd src/webpack-eval-package; npx webpack; cp dist/main.js ../../public/chess-to-vector-worker/main.js;cd ../..;`
* `cd src/webpack-tensorflow-worker/; npx webpack; cp dist/main.js ../../public/tensorflow-worker/main.js;cd ../..;`
(you may need to install webpack, anyway this command is only needed for development. The main.js for the package is already provided with this repo.)

**Build the Capacitor PWA (get the latest build)**

* `npm run build`

* ` find ./build -type f -name '*.js.map' -exec du -ch {} +` (find out how much space is used by javascript source maps)
* ` find ./build -type f -not -name '*.js.map' -exec du -ch {} + ` (space used by everything else)

* ` find ./build -type f -name '*.js.map' -delete` (delete source maps for production version)
 
* `rm -rf learning_host_production/build/; cp -a build learning_host_production/` (optional, to continue with a) or b) otherwise bellow)

* Shortcut to build Dockerimage:

* `sudo systemctl start docker;cd learning_host_production/;docker build -t philipp-sc/learning .;docker save philipp-sc/learning:latest | xz > philipp-sc_learning_latest.xz;cd ..;` (also see Dockerfile comments)

**Host with express.js** *(required)*

*express.js is required because stockfish.js (https://github.com/niklasf/stockfish.wasm) uses sharedarraybuffer (https://developer.chrome.com/blog/enabling-shared-array-buffer/))*

* `node server-localhost.js` (testing)

*without stockfish.js the express.js server is not needed, use:*

* `ionic serve --livereload;`

* NOTE: There is also a Dockerfile for the complete build pipeline.


# Hosting (production)

**Https** *(required)*

* Put the ssh certificates (cert.pem, privkey.pem) for your domain here. 
* You may use https://hub.docker.com/r/certbot/certbot/ to generate the certificates with Let's Encrypt. 


* Ensure that the listed domains point to this machine and that it can accept inbound connections from the internet.

* `iptables -A INPUT  -p tcp -m tcp --dport 80 -j ACCEPT` (open port 80 for a moment)

* `docker run -it --rm --name certbot \
            -v "/etc/letsencrypt:/etc/letsencrypt" \
            -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
            -p 80:80 \
            certbot/certbot certonly`

* `1: Spin up a temporary webserver (standalone)`

* `Please enter the domain name(s) you would like on your certificate (comma and/or
space separated): librelearning.eu librelearning.de`

* `iptables -A INPUT  -p tcp -m tcp --dport 80 -j REJECT` (close port 80)

* Copy certificates over
* `cp /etc/letsencrypt/live/librelearning.eu/cert.pem .`
* `cp /etc/letsencrypt/live/librelearning.eu/privkey.pem .`

* `chown user:user *.pem ` (make sure the certificates are accessible)

* Now build the docker image or start the expressjs server.


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
		
