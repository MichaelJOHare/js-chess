import GameController from "./controller/GameController.js";

const gameController = new GameController();
console.log("GameController initialized", gameController);

/*
TO DO
 - Separate out reversing promotion selector from update promotion selector
      so it can be independently toggled with flip board as I can't make it work currently

 - Debug possible memory leak
    - Relatively confident slow leak is from dark reader, live server, or a combination of both.

 - Go through and change private fields to normal, remove getters.
     -Thought it was a good idea, not liking it now.  Maybe keep setters?  They make sense in my brain
 - Make move piece with click a smooth glide to location
      - Add onTouchMove, maybe sounds, etc.
 - Implement drawing arrows/circles with right click
 - Implement stockfish/flip board/misc UI (maybe PGN box)
*/
