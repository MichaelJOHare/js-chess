import ChessBoard from "../model/board/ChessBoard.js";
import GameState from "../model/game/GameState.js";
import MoveHistory from "../model/moves/MoveHistory.js";
import GUIController from "./GUIController.js";
import MoveHandler from "../model/moves/MoveHandler.js";
import FENGenerator from "../utils/FENGenerator.js";

class GameController {
  //sfController;

  constructor() {
    this.board = new ChessBoard();
    this.gs = new GameState(this.board);
    this.pm = this.board.getPieceManager();
    this.mementos = [];
    this.move = new MoveHistory();

    this.guiController = new GUIController(this.board, this);
    this.mh = new MoveHandler(
      this.board,
      this.move,
      this.gs,
      this.guiController,
      this.mementos,
      this.pm
    );
    /*
    this.sfController = new StockfishController(
      this.board,
      this.move,
      this.gs,
      this.guiController,
      this.mh
    ); */

    this.initiateGame();
  }

  initiateGame() {
    /*     if (this.gs.getCurrentPlayer().isStockfish()) {
      this.makeStockfishMove();
    } */
    this.guiController.writeCurrentFENString();
  }

  initiateGameFromFEN(fenString) {
    const boardContext = this.board.initializeBoardFromFEN(
      fenString,
      this.gs.getPlayer1(),
      this.gs.getPlayer2()
    );

    this.guiController.clearHighlightedSquares();
    this.pm = this.board.getPieceManager();
    this.mh = new MoveHandler(
      this.board,
      this.move,
      this.gs,
      this.guiController,
      this.mementos,
      this.pm
    );
    this.gs.setGameOver(false);
    this.move.resetMoveHistory();
    this.mementos = [];

    this.move.halfMoveClock = boardContext.halfMoveClock;
    this.move.fullMoveNumber = boardContext.fullMoveNumber;
    if (boardContext.activeColor === "b") {
      this.gs.swapPlayers();
    }
    if (boardContext.epMove) {
      this.move.history.push(boardContext.epMove);
    }
    this.mh.handleCheckAndCheckmate();
    this.guiController.updateGUI();
  }

  handleClickToMove(row, col) {
    if (this.gs.isBoardLocked) {
      return;
    }

    if (this.mh.isFirstClick) {
      this.mh.handleSelectPieceClick(row, col);
    } else {
      this.mh.handleMovePieceClick(row, col);
    }

    if (this.gs.getCurrentPlayer().isStockfish()) {
      this.makeStockfishMove();
    }
    this.guiController.updateGUI();
  }

  handleDragStart(row, col) {
    if (this.gs.isBoardLocked) {
      return;
    }

    this.mh.handleDragStart(row, col);
  }

  handleDragDrop(endRow, endCol) {
    this.mh.handleDragDrop(endRow, endCol);

    if (this.gs.getCurrentPlayer().isStockfish()) {
      this.makeStockfishMove();
    }
    this.guiController.updateGUI();
  }

  handlePreviousMoveButtonClick() {
    this.mh.handleUndoMove();
  }

  handleNextMoveButtonClick() {
    return this.mh.handleRedoMove();
  }

  generateCurrentFEN() {
    return FENGenerator.toFEN(this.board, this.move, this.gs);
  }
  /*
    askStockFish() {
    this.sfController.getBestMove();
  }

  makeStockfishMove() {
    this.sfController.makeMove();
  }

  handlePlayAgainButtonClick() {
    this.guiController.clearPreviousMoveHighlightedSquares();
    this.gs.init();
    this.board.init(this.gs.getPlayer1(), this.gs.getPlayer2());
    this.pm = this.board.getPieceManager();
    this.mh.setFirstClick(true);
    this.gs.setGameOver(false);
    this.move.resetMoveHistory();
    this.mementos = [];
    this.guiController.updateGUI();
    this.initiateGame();
  }

  cleanup() {
    this.sfController.cleanup();
  }
  */
}

export default GameController;
