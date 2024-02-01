import GameController from "./controller/GameController.js";

const gameController = new GameController();
console.log("GameController initialized", gameController);

/*
TO DO
 - Make move piece with click a smooth glide to location
      - Add onTouchMove etc.
 - Make select piece with no moves highlight its square
 - Make PromotionSelector resize dynamically
 - Implement stockfish/undo/misc UI
*/
