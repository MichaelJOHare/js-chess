import GameController from "./controller/GameController.js";

const gameController = new GameController();
console.log("GameController initialized", gameController);

/*
TO DO
 - Move-history wrap extending box into game-container/chessboard for some reason
 - Debug possible memory leak (might be extension react dev tools or stockfish idk yet)

 - Go through and change private fields to normal, remove getters.
     -Thought it was a good idea, not liking it now.  Maybe keep setters?  They make sense in my brain
 - Make move piece with click a smooth glide to location
      - Add onTouchMove etc.
 - Implement drawing arrows/circles with right click
 - Implement stockfish/flip board/misc UI (maybe PGN box)
*/
