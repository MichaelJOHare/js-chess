import ChessBoard from "../model/board/ChessBoard.js";

export default class FENGenerator {
  static toFEN(board, move, gameState) {
    let fen = "";

    // 1. Piece placement
    for (let row = 0; row < ChessBoard.ROW_LENGTH; row++) {
      let emptySquares = 0;
      for (let col = 0; col < ChessBoard.COLUMN_LENGTH; col++) {
        const piece = board.getPieceAt(row, col);
        if (piece === null) {
          emptySquares++;
        } else {
          if (emptySquares !== 0) {
            fen += emptySquares;
            emptySquares = 0;
          }
          fen += pieceToFEN(piece);
        }
      }
      if (emptySquares !== 0) {
        fen += emptySquares;
      }
      if (row < 7) {
        fen += "/";
      }
    }

    // 2. The side to move
    fen += " " + (gameState.currentPlayer.isWhite() ? "w" : "b") + " ";

    // 3. Castling availability
    fen += generateCastlingAvailability(board);

    // 4. En passant target square
    fen +=
      " " +
      (move.getEnPassantTarget() ? move.getEnPassantTarget().toString() : "-") +
      " ";

    // 5. Halfmove clock
    fen += " " + halfMoveClock + " ";

    // 6. Fullmove number
    fen += " " + fullMoveNumber;

    return fen;
  }
}

function pieceToFEN(piece) {
  if (!piece || !piece.getType() || !piece.getPlayer()) {
    throw new Error("Invalid piece");
  }

  switch (piece.type) {
    case "KING":
      return piece.player.color === "WHITE" ? "K" : "k";
    case "QUEEN":
      return piece.player.color === "WHITE" ? "Q" : "q";
    case "ROOK":
      return piece.player.color === "WHITE" ? "R" : "r";
    case "BISHOP":
      return piece.player.color === "WHITE" ? "B" : "b";
    case "KNIGHT":
      return piece.player.color === "WHITE" ? "N" : "n";
    case "PAWN":
      return piece.player.color === "WHITE" ? "P" : "p";
    default:
      throw new Error("Unknown piece type");
  }
}

function generateCastlingAvailability(board) {
  let castlingAvailability = "";
  const chessBoard = board.getBoard();

  const whiteKing =
    chessBoard[ChessBoard.WHITE_MAJOR_PIECE_ROW][ChessBoard.KING_COLUMN];
  if (whiteKing.getType() === "KING" && !whiteKing.hasMoved) {
    const whiteKingRook =
      chessBoard[ChessBoard.WHITE_MAJOR_PIECE_ROW][ChessBoard.ROOK_COLUMN_1];
    const whiteQueenRook =
      chessBoard[ChessBoard.WHITE_MAJOR_PIECE_ROW][ChessBoard.ROOK_COLUMN_2];
    if (whiteKingRook.getType() === "ROOK" && !whiteKingRook.hasMoved) {
      castlingAvailability += "K";
    }
    if (whiteQueenRook.getType() === "ROOK" && !whiteQueenRook.hasMoved) {
      castlingAvailability += "Q";
    }
  }

  const blackKing =
    chessBoard[ChessBoard.BLACK_MAJOR_PIECE_ROW][ChessBoard.KING_COLUMN];
  if (blackKing.getType() === "KING" && !blackKing.hasMoved) {
    const blackKingRook =
      chessBoard[ChessBoard.BLACK_MAJOR_PIECE_ROW][ChessBoard.ROOK_COLUMN_1];
    const blackQueenRook =
      chessBoard[ChessBoard.BLACK_MAJOR_PIECE_ROW][ChessBoard.ROOK_COLUMN_2];
    if (blackKingRook.getType() === "ROOK" && !blackKingRook.hasMoved) {
      castlingAvailability += "k";
    }
    if (blackQueenRook.getType() === "ROOK" && !blackQueenRook.hasMoved) {
      castlingAvailability += "q";
    }
  }

  return castlingAvailability || "-";
}
