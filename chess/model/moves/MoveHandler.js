import Square from "../board/Square.js";

class MoveHandler {
  constructor(board, move, gs, guiController, mementos, pm) {
    this.mementos = mementos;
    this.board = board;
    this.move = move;
    this.gs = gs;
    this.guiController = guiController;
    this.pm = pm;
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
        this.guiController.invalidPieceSelectionLogText()
      ); */
      return;
    }

    if (this.selectedPiece.getPlayer() === this.gs.getCurrentPlayer()) {
      this.moves = this.selectedPiece.calculateLegalMoves(
        this.board,
        this.move
      );
      if (this.moves.length > 0) {
        console.log(this.moves);
        //this.guiController.setHighlightedSquares(this.moves);
      } else {
        console.log("no legal move");
        //this.tryAgainPrompt(() => this.guiController.noLegalMoveLogText());
        return;
      }
      this.isFirstClick = false;
    }
  }

  handleMovePieceClick(row, col) {
    //this.guiController.clearHighlightedSquares();
    let targetSquare = new Square(row, col);

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
      this.tryAgainPrompt(() => this.guiController.moveIsNotLegalLogText());
      return;
    }

    this.finalizeMove(legalMove);
    this.handleCheckAndCheckmate();
  }

  /*
  handleDragStart(row, col) {
    this.selectedPiece = this.board.getPieceAt(row, col);

    if (
      this.selectedPiece === null ||
      this.selectedPiece.getPlayer() !== this.gs.getCurrentPlayer()
    ) {
      this.tryAgainPrompt(() =>
        this.guiController.invalidPieceSelectionLogText()
      );
      return false;
    }

    if (this.selectedPiece.getPlayer() === this.gs.getCurrentPlayer()) {
      this.moves = this.selectedPiece.calculateLegalMoves(
        this.board,
        this.move
      );
      if (this.moves.length > 0) {
        this.guiController.setHighlightedSquares(this.moves);
        return true;
      } else {
        this.tryAgainPrompt(() => this.guiController.noLegalMoveLogText());
        return false;
      }
    }
    return false;
  }

  handleDragDrop(endRow, endCol) {}
  */

  finalizeMove(legalMove) {
    this.mementos.push(this.gs.createMemento());

    /*     if (legalMove.isPromotion() && !this.gs.getCurrentPlayer().isStockfish()) {
      legalMove.setPromotionType(
        this.guiController.handlePawnPromotion(this.selectedPiece)
      );
    } */

    this.move.makeMove(legalMove);
    // this.pm.handlePromotion(this.move.getLastMove());
    // this.handleCapturedPieces(legalMove, false);
    this.guiController.updateGUI();
    this.isFirstClick = true;

    this.gs.swapPlayers();
    // this.guiController.currentPlayerLogText(this.gs.getCurrentPlayer());
    // this.guiController.setHighlightedSquaresPreviousMove(legalMove);
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

    /*     if (this.move.getHalfMoveClock() === 100) {
      this.gs.setGameOver(true);
      this.guiController.drawLogText();
    } */

    if (
      !hasLegalMoves &&
      this.board.isKingInCheck(
        this.gs.getCurrentPlayer(),
        this.move,
        this.board
      )
    ) {
      // this.gs.setGameOver(true);
      // this.guiController.checkmateLogText();
    } else if (
      !hasLegalMoves ||
      (playerPieces.length === 1 && opponentPieces.length === 1)
    ) {
      // this.gs.setGameOver(true);
      // this.guiController.stalemateLogText();
    } else if (
      this.board.isKingInCheck(
        this.gs.getCurrentPlayer(),
        this.move,
        this.board
      )
    ) {
      /*       this.guiController.checkLogText(
        this.pm.findKingSquare(this.gs.getCurrentPlayer())
      ); */
    } else {
      /*       this.guiController.clearKingCheckHighlightedSquare(
        this.pm.findKingSquare(this.gs.getOpposingPlayer())
      ); */
    }
  }

  /*
  handleUndoMove() {}

  handleSingleUndo() {}

  handleCapturedPieces(legalMove, isUndo) {}

  tryAgainPrompt(logTextMethod) {
    logTextMethod();
    this.isFirstClick = true;
  }
  */
}

export default MoveHandler;
