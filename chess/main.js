import GameController from "./controller/GameController.js";

const gameController = new GameController();
console.log("GameController initialized", gameController);

/*
TO DO
 - Make promotion wait for promotion selection
 - Make PromotionSelector resize dynamically
 - Fix select piece -> slightly drag opponent piece causing highlight/ghost piece bug
 - Fix drag/drop to illegal square -> still able to move same piece to legal square
    - maybe instead just make it so highlight doesn't get cleared so it's not as confusing
 - Implement stockfish/undo/misc UI
*/
