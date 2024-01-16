import ChessPiece from "./ChessPiece";
import PieceType from "../pieces/PieceType";
import RookMovementStrategy from "./movementstrategy/RookMovementStrategy";

class Rook extends ChessPiece {
  static WHITE_ROOK = "♜";
  static BLACK_ROOK = "♖";
  #hasMoved; // Private field for hasMoved

  constructor(currentSquare, player) {
    super(currentSquare, player, PieceType.ROOK, new RookMovementStrategy());
    this.#hasMoved = false;
  }

  hasMoved() {
    return this.#hasMoved;
  }

  setHasMoved(hasMoved) {
    this.#hasMoved = hasMoved;
  }

  getWhiteChessPieceSymbol() {
    return Rook.WHITE_ROOK;
  }

  getBlackChessPieceSymbol() {
    return Rook.BLACK_ROOK;
  }
}

export default Rook;
