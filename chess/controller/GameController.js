import ChessBoard from "../model/board/ChessBoard.js";
import GameState from "../model/game/GameState.js";
import MoveHistory from "../model/moves/MoveHistory.js";
import GUIController from "./GUIController.js";

class GameController {
  #guiController;
  //#sfController;

  #board;
  #gs;
  #mh;
  #move;
  #mementos;
  #pm;

  constructor() {
    this.#board = new ChessBoard();
    this.#gs = new GameState(this.#board);
    this.#pm = this.#board.getPieceManager();
    this.#move = new MoveHistory();

    this.#guiController = new GUIController(this.#board, this);
    /*
    this.#mh = new MoveHandler(
      this.#board,
      this.#move,
      this.#gs,
      this.#guiController,
      this.#mementos,
      this.#pm
    );
    this.#sfController = new StockfishController(
      this.#board,
      this.#move,
      this.#gs,
      this.#guiController,
      this.#mh
    );
    this.#guiController.showGUI(); */

    this.#mementos = [];

    //this.initiateGame();
  }

  /*   
    initiateGame() {
    if (this.#gs.getCurrentPlayer().isStockfish()) {
      this.makeStockfishMove();
    }
  }

  handleClickToMove(row, col) {
    if (this.#gs.isBoardLocked()) {
      return;
    }

    if (this.#mh.isFirstClick()) {
      this.#mh.handleSelectPieceClick(row, col);
    } else {
      this.#mh.handleMovePieceClick(row, col);
    }

    if (this.#gs.getCurrentPlayer().isStockfish()) {
      this.makeStockfishMove();
    }
  }

  handleDragStart(row, col) {
    if (this.#gs.isBoardLocked()) {
      return false;
    }

    return this.#mh.handleDragStart(row, col);
  }

  handleDragDrop(endRow, endCol) {
    const result = this.#mh.handleDragDrop(endRow, endCol);

    if (this.#gs.getCurrentPlayer().isStockfish()) {
      this.makeStockfishMove();
    }
    return result;
  }

  handleUndoButtonClick() {
    this.#mh.handleUndoMove();
  }
    
    askStockFish() {
    this.#sfController.getBestMove();
  }

  makeStockfishMove() {
    this.#sfController.makeMove();
  }

  handlePlayAgainButtonClick() {
    this.#guiController.clearPreviousMoveHighlightedSquares();
    this.#gs.init();
    this.#board.init(this.#gs.getPlayer1(), this.#gs.getPlayer2());
    this.#pm = this.#board.getPieceManager();
    this.#mh.setFirstClick(true);
    this.#gs.setGameOver(false);
    this.#move.resetMoveHistory();
    this.#mementos = [];
    this.#guiController.updateGUI();
    this.initiateGame();
  }

  cleanup() {
    this.#sfController.cleanup();
  }
  */
}

export default GameController;
