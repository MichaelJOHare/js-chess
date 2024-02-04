import GameController from "./controller/GameController.js";

const gameController = new GameController();
console.log("GameController initialized", gameController);

/*
TO DO

 - Go through and change private fields to normal, remove getters.
     -Thought it was a good idea, not liking it now.  Maybe keep setters?  They make sense in my brain
 - Make move piece with click a smooth glide to location
      - Add onTouchMove etc.
 - Implement drawing arrows/circles with right click
 - Implement stockfish/undo+redo/flip board/misc UI (maybe FEN and PGN boxes)
*/
