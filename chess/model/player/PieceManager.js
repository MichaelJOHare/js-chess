class PieceManager {
  constructor(board) {
    this.piecesByPlayer = {};
    this.initPieces(board);
  }

  initPieces(board) {
    const boardArray = board.getBoard();
    for (let row of boardArray) {
      for (let piece of row) {
        if (piece !== null) {
          const player = piece.getPlayer();
          if (!this.piecesByPlayer[player]) {
            this.piecesByPlayer[player] = [];
          }
          this.piecesByPlayer[player].push(piece);
        }
      }
    }
  }

  getPlayerPieces(player) {
    return this.piecesByPlayer[player] || [];
  }

  removePiece(piece) {
    const owner = piece.getPlayer();
    const playerPieces = this.piecesByPlayer[owner];
    if (playerPieces) {
      const index = playerPieces.indexOf(piece);
      if (index > -1) {
        playerPieces.splice(index, 1);
      }
    }
  }

  addPiece(piece) {
    const owner = piece.getPlayer();
    if (!this.piecesByPlayer[owner]) {
      this.piecesByPlayer[owner] = [];
    }
    this.piecesByPlayer[owner].push(piece);
  }

  findKingSquare(player) {
    const pieces = this.piecesByPlayer[player] || [];
    for (let piece of pieces) {
      if (piece.getType() === PieceType.KING) {
        return piece.getCurrentSquare();
      }
    }
    return null;
  }

  handlePromotion(move) {
    if (move.isPromotion()) {
      this.removePiece(move.getOriginalPiece());
      this.addPiece(move.getPromotedPiece());
    }
  }

  handleUndoPromotion(move) {
    if (move.isPromotion()) {
      this.removePiece(move.getPromotedPiece());
      this.addPiece(move.getOriginalPiece());
    }
  }

  getOpposingPieces(player) {
    const opposingPieces = [];
    for (let key in this.piecesByPlayer) {
      if (key !== player) {
        opposingPieces.push(...this.piecesByPlayer[key]);
      }
    }
    return opposingPieces;
  }
}
