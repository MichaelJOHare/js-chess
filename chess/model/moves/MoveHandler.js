import Square from "../board/Square.js";

class MoveHandler {
  constructor(
    board,
    moveHistory,
    gameState,
    guiController,
    mementos,
    pieceManager
  ) {
    this.board = board;
    this.move = moveHistory;
    this.gs = gameState;
    this.gui = guiController;
    this.mementos = mementos;
    this.pm = pieceManager;
    this.isFirstClick = true;
    this.selectedPiece = null;
    this.moves = [];
  }

  handleSelectPieceClick(row, col) {
    this.selectedPiece = this.board.getPieceAt(row, col);

    if (
      this.selectedPiece === null ||
      this.selectedPiece.getPlayer() !== this.gs.getCurrentPlayer()
    ) {
      console.log("invalid piece");
      /*       this.tryAgainPrompt(() =>
        this.gui.invalidPieceSelectionLogText()
      ); */
      return;
    }

    if (this.selectedPiece.getPlayer() === this.gs.getCurrentPlayer()) {
      this.moves = this.selectedPiece.calculateLegalMoves(
        this.board,
        this.move
      );
      if (this.moves.length > 0) {
        this.gui.setHighlightedSquares(this.moves);
      } else {
        console.log("no legal move");
        //this.tryAgainPrompt(() => this.gui.noLegalMoveLogText());
        return;
      }
      this.isFirstClick = false;
    }
  }

  handleMovePieceClick(row, col) {
    if (!this.selectedPiece) {
      this.isFirstClick = true;
      return;
    }

    const targetSquare = new Square(row, col);
    let pieceAtTargetSquare = this.board.getPieceAt(row, col);

    if (
      pieceAtTargetSquare !== null &&
      pieceAtTargetSquare.getPlayer() === this.gs.getCurrentPlayer()
    ) {
      this.handleSelectPieceClick(row, col);
      return;
    }

    let legalMove = this.moves.find((m) =>
      m.getEndSquare().equals(targetSquare)
    );

    if (!legalMove) {
      //this.tryAgainPrompt(() => this.gui.moveIsNotLegalLogText());
      console.log("illegal move");
      return;
    }

    this.finalizeMove(legalMove);
    this.handleCheckAndCheckmate();
  }

  handleDragStart(row, col) {
    this.selectedPiece = this.board.getPieceAt(row, col);

    if (
      this.selectedPiece === null ||
      this.selectedPiece.getPlayer() !== this.gs.getCurrentPlayer()
    ) {
      /*       this.tryAgainPrompt(() =>
        this.gui.invalidPieceSelectionLogText()
      ); */
      return;
    }

    if (this.selectedPiece.getPlayer() === this.gs.getCurrentPlayer()) {
      this.moves = this.selectedPiece.calculateLegalMoves(
        this.board,
        this.move
      );
      if (this.moves.length > 0) {
        this.gui.setHighlightedSquares(this.moves);
        return;
      } else {
        //this.tryAgainPrompt(() => this.gui.noLegalMoveLogText());
        return;
      }
    }
    return;
  }

  handleDragDrop(endRow, endCol) {
    const targetSquare = new Square(endRow, endCol);
    let legalMove = this.moves.find((m) =>
      m.getEndSquare().equals(targetSquare)
    );

    if (
      !legalMove ||
      this.selectedPiece.getPlayer() !== this.gs.getCurrentPlayer()
    ) {
      //this.tryAgainPrompt(() => this.gui.moveIsNotLegalLogText());
      console.log("illegal move");
      this.isFirstClick = true;
      this.selectedPiece = null;
      this.gui.updateGUI();
      return;
    }

    this.finalizeMove(legalMove);
    this.handleCheckAndCheckmate();
  }

  finalizeMove(legalMove) {
    this.mementos.push(this.gs.createMemento());

    if (legalMove.isPromotion && !this.gs.getCurrentPlayer().isStockfish()) {
      this.gui.handlePawnPromotion(legalMove, (promotionType) => {
        legalMove.setPromotionType(promotionType);
        this.continueFinalizingMove(legalMove);
      });
    } else {
      this.continueFinalizingMove(legalMove);
    }
  }

  continueFinalizingMove(legalMove) {
    this.move.makeMove(legalMove);
    this.pm.handlePromotion(this.move.getLastMove());
    // this.handleCapturedPieces(legalMove, false);
    this.isFirstClick = true;
    this.gs.swapPlayers();
    // this.gui.currentPlayerLogText(this.gs.getCurrentPlayer());
    this.gui.setHighlightedSquaresPreviousMove(legalMove);
  }

  handleCheckAndCheckmate() {
    let playerPieces = this.pm
      .getPlayerPieces(this.gs.getCurrentPlayer())
      .filter((piece) => piece.isAlive());

    let opponentPieces = this.pm
      .getPlayerPieces(this.gs.getOpposingPlayer())
      .filter((piece) => piece.isAlive());

    let hasLegalMoves = false;

    for (let piece of playerPieces) {
      if (piece.calculateLegalMoves(this.board, this.move).length > 0) {
        hasLegalMoves = true;
        break;
      }
    }

    if (this.move.getHalfMoveClock() === 100) {
      this.gs.setGameOver(true);
      //this.gui.drawLogText();
    }

    if (
      !hasLegalMoves &&
      this.board.isKingInCheck(
        this.gs.getCurrentPlayer(),
        this.move,
        this.board
      )
    ) {
      this.gs.setGameOver(true);
      // this.gui.checkmateLogText();
    } else if (
      !hasLegalMoves ||
      (playerPieces.length === 1 && opponentPieces.length === 1)
    ) {
      this.gs.setGameOver(true);
      // this.gui.stalemateLogText();
    } else if (
      this.board.isKingInCheck(
        this.gs.getCurrentPlayer(),
        this.move,
        this.board
      )
    ) {
      this.gui.setKingCheckHighlightedSquare(
        this.pm.findKingSquare(this.gs.getCurrentPlayer())
      );
    } else {
      this.gui.clearKingCheckHighlightedSquare(
        this.pm.findKingSquare(this.gs.getOpposingPlayer())
      );
    }
  }

  handleUndoMove() {
    const undoCount =
      this.gs.getCurrentPlayer() === this.gs.getPlayer1() &&
      this.gs.getPlayer2().isStockfish()
        ? 2
        : 1;

    for (let i = 0; i < undoCount; i++) {
      if (this.mementos.length < 1) {
        //this.gui.nothingLeftToUndoLogText();
        return;
      }
      this.handleSingleUndo();
    }
  }

  handleSingleUndo() {
    if (this.gs.isGameOver) {
      this.gs.setGameOver(false);
    }

    //handleCapturedPieces(this.move.getLastMove(), true);
    this.pm.handleUndoPromotion(this.move.getLastMove());

    this.move.undoMove();
    const memento = this.mementos.pop();
    this.gs.restoreFromMemento(memento);

    this.gui.setHighlightedSquaresPreviousMove(this.move.getLastMove());
    //this.gui.currentPlayerLogText(this.gs.getCurrentPlayer());
    this.isFirstClick = true;

    if (
      this.board.isKingInCheck(
        this.gs.getCurrentPlayer(),
        this.move,
        this.board
      )
    ) {
      this.gui.setKingCheckHighlightedSquare(
        this.pm.findKingSquare(this.gs.getCurrentPlayer())
      );
    } else {
      this.gui.clearKingCheckHighlightedSquare(
        this.pm.findKingSquare(this.gs.getCurrentPlayer())
      );
    }
  }

  handleRedoMove() {
    if (this.move.undone.length < 1) {
      //this.gui.nothingLeftToRedoLogText();
      return;
    }

    const redoMove = this.move.redoMove();
    this.mementos.push(this.gs.createMemento());
    this.isFirstClick = true;
    this.gs.swapPlayers();
    this.handleCheckAndCheckmate();
    return redoMove;
  }

  /*
  handleCapturedPieces(legalMove, isUndo) {}

  tryAgainPrompt(logTextMethod) {
    logTextMethod();
    this.isFirstClick = true;
  }
  */
}

export default MoveHandler;
