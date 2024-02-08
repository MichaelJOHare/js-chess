import Pawn from "../model/pieces/Pawn.js";
import PlayerColor from "../model/player/PlayerColor.js";

class GameLogPanel {
  constructor(moveHistory, guiController) {
    this.moveHistory = moveHistory;
    this.gui = guiController;

    this.gameLog = document.getElementById("move-history");
  }

  updateGameLog() {
    this.clearGameLog();
    this.writeToGameLog();
  }

  writeToGameLog() {
    let pastMoves = this.moveHistory.history;
    let undoneMoves = this.moveHistory.undone;
    let combinedMoves = [
      ...pastMoves, // vv might use in future to create branching vv
      ...undoneMoves.map((move) => ({ ...move, isUndone: true })),
    ];

    let currentMoveDiv;

    combinedMoves.forEach((move, index) => {
      let moveNotation = this.createGameLogObject(move);
      let moveId = "move-" + index;

      if (index % 2 === 0) {
        currentMoveDiv = document.createElement("div");
        currentMoveDiv.className = "full-move";
        this.gameLog.appendChild(currentMoveDiv);

        let moveNumberSpan = document.createElement("span");
        moveNumberSpan.className = "move-number";
        moveNumberSpan.innerHTML = `${Math.floor(index / 2) + 1}. `;
        currentMoveDiv.appendChild(moveNumberSpan);
      }

      let moveSpan = document.createElement("span");
      moveSpan.className = "move-history-entry";
      moveSpan.id = moveId;
      moveSpan.innerHTML = moveNotation;
      moveSpan.addEventListener("click", () => this.onClick(index));

      currentMoveDiv.appendChild(moveSpan);
    });
  }

  clearGameLog() {
    this.gameLog.innerHTML = "";
  }

  createGameLogObject(move) {
    let movingPiece = move.piece;
    let pieceSymbol = "";
    let endSquare = move.endSquare;
    // Need to figure out if two of the same knight/rook could've captured or moved from same file or rank ->
    //                     include rank if on same file, file if on same rank
    let captureSymbol = move.isCapture ? "x" : "";

    if (!(movingPiece instanceof Pawn)) {
      pieceSymbol =
        movingPiece.getPlayer().getColor() === PlayerColor.WHITE
          ? movingPiece.getWhiteChessPieceSymbol()
          : movingPiece.getBlackChessPieceSymbol();
    } else {
      if (move.isCapture) {
        pieceSymbol = move.startSquare.toString().substring(0, 1);
      }
    }

    let gameLogObject = pieceSymbol + captureSymbol + endSquare;
    return gameLogObject;
  }

  onClick(clickedIndex) {
    // create id="current-move" for currentMove to highlight it in css
    let currentMoveIndex = this.moveHistory.history.length - 1;
    let movesToUndoRedo = clickedIndex - currentMoveIndex;

    if (movesToUndoRedo < 0) {
      // Undo moves
      for (let i = movesToUndoRedo; i < 0; i++) {
        this.moveHistory.undoMove();
      }
    } else if (movesToUndoRedo > 0) {
      // Redo moves
      for (let i = 0; i < movesToUndoRedo; i++) {
        this.moveHistory.redoMove();
      }
    }

    this.gui.updateGUI();
  }
}

export default GameLogPanel;
