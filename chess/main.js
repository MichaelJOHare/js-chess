import GameController from "./controller/GameController.js";

const gameController = new GameController();
console.log("GameController initialized", gameController);

/*
TO DO
 - Fix draggingdiv location incorrect after resizing window

 - Fix Move history scrollbar when viewport really tall and skinny before media query
        - move next/prev move buttons in small screen media query (fix move history being under text areas too)
 - Debug possible memory leak (might be extension react dev tools or stockfish idk yet)

 - Go through and change private fields to normal, remove getters.
     -Thought it was a good idea, not liking it now.  Maybe keep setters?  They make sense in my brain
 - Make move piece with click a smooth glide to location
      - Add onTouchMove, maybe sounds, etc.
 - Implement drawing arrows/circles with right click
 - Implement stockfish/flip board/misc UI (maybe PGN box)
*/
