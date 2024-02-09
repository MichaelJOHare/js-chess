import ChessBoardPanel from "./ChessBoardPanel.js";
import EnPassantMove from "../model/moves/EnPassantMove.js";

class ChessBoardHighlighter {
  constructor(board, ctx, offscreenCanvas, offscreenCtx, imageLoader) {
    this.board = board;
    this.ctx = ctx;
    this.offscreenCanvas = offscreenCanvas;
    this.offscreenCtx = offscreenCtx;
    this.imageLoader = imageLoader;

    this.squareSize = 0;
    this.kingCheckHighlightedSquare = null;
    this.listOfMovesToHighlight = [];
    this.highlightedSquares = [];
    this.previousMove = null;
    this.previousMoveHighlightedSquares = [];
  }

  drawRankFileLabels(row, col) {
    const rowLabels = "87654321";
    const colLabels = "abcdefgh";
    const fontSize = this.squareSize / 6;
    this.offscreenCtx.font = `bold ${fontSize}px Roboto`;
    this.offscreenCtx.textBaseline = "top";

    // Column labels
    if (row === 7) {
      this.offscreenCtx.fillStyle =
        col % 2 === 1
          ? ChessBoardPanel.DARK_SQUARE_COLOR
          : ChessBoardPanel.LIGHT_SQUARE_COLOR;
      this.offscreenCtx.fillText(
        colLabels[col],
        col * this.squareSize + fontSize * 0.3,
        (row + 1) * this.squareSize - fontSize * 1
      );
    }

    // Row labels
    if (col === 7) {
      this.offscreenCtx.fillStyle =
        row % 2 === 1
          ? ChessBoardPanel.DARK_SQUARE_COLOR
          : ChessBoardPanel.LIGHT_SQUARE_COLOR;
      const labelWidth = this.offscreenCtx.measureText(rowLabels[row]).width;
      this.offscreenCtx.fillText(
        rowLabels[row],
        (col + 1) * this.squareSize - labelWidth - fontSize * 0.3,
        row * this.squareSize + fontSize * 0.3
      );
    }
  }

  drawHighlightedSquares(moves) {
    this.listOfMovesToHighlight = moves;
    this.highlightedSquares = [];

    const startSquare = moves[0].getStartSquare();
    this.highlightedSquares.push(startSquare);

    this.clearSquareOnOffscreenCanvas(
      startSquare.getRow(),
      startSquare.getCol()
    );
    this.drawSelectedPieceHighlightedSquares(
      startSquare.getRow(),
      startSquare.getCol()
    );
    this.drawPieceOnOffscreenCanvas(
      this.board.getPieceAt(startSquare.getRow(), startSquare.getCol()),
      startSquare.getCol() * this.squareSize,
      startSquare.getRow() * this.squareSize
    );

    moves.forEach((move) => {
      const endSquare = move.getEndSquare();
      this.highlightedSquares.push(endSquare);
      const row = endSquare.getRow();
      const col = endSquare.getCol();

      let highlightColor =
        (row + col) % 2 === 0
          ? ChessBoardPanel.LIGHT_SQUARE_HIGHLIGHT_COLOR
          : ChessBoardPanel.DARK_SQUARE_HIGHLIGHT_COLOR;

      if (
        this.board.isOccupiedByOpponent(
          row,
          col,
          move.getPiece().getPlayer()
        ) ||
        move instanceof EnPassantMove
      ) {
        this.drawCornerHighlights(row, col);
      } else {
        this.drawDotHighlight(row, col, highlightColor);
      }
      if (row === 7 || col === 7) {
        this.drawRankFileLabels(row, col);
      }
    });
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  drawPreviousMoveHighlightedSquares(move) {
    if (!move) {
      return;
    }
    this.previousMove = move;
    const squares = [move.getStartSquare(), move.getEndSquare()];
    squares.forEach((square) => {
      this.previousMoveHighlightedSquares.push(square);
      const row = square.getRow();
      const col = square.getCol();

      this.offscreenCtx.fillStyle =
        (row + col) % 2 === 0
          ? ChessBoardPanel.LIGHT_SQUARE_PREVIOUS_MOVE
          : ChessBoardPanel.DARK_SQUARE_PREVIOUS_MOVE;

      this.offscreenCtx.fillRect(
        col * this.squareSize,
        row * this.squareSize,
        this.squareSize,
        this.squareSize
      );
      if (row === 7 || col === 7) {
        this.drawRankFileLabels(row, col);
      }
    });
    this.drawPieceOnOffscreenCanvas(
      move.getPiece(),
      move.getEndSquare().getCol() * this.squareSize,
      move.getEndSquare().getRow() * this.squareSize
    );
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  drawSelectedPieceHighlightedSquares(row, col) {
    this.offscreenCtx.fillStyle =
      (row + col) % 2 === 0
        ? ChessBoardPanel.LIGHT_SQUARE_SELECTED_PIECE
        : ChessBoardPanel.DARK_SQUARE_SELECTED_PIECE;
    this.offscreenCtx.fillRect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );
    if (row === 7 || col === 7) {
      this.drawRankFileLabels(row, col);
    }
  }

  drawDotHighlight(row, col, color) {
    const centerX = (col + 0.5) * this.squareSize;
    const centerY = (row + 0.5) * this.squareSize;
    const radius = this.squareSize * 0.1;

    this.offscreenCtx.beginPath();
    this.offscreenCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    this.offscreenCtx.fillStyle = color;
    this.offscreenCtx.fill();
  }

  drawCornerHighlights(row, col) {
    this.clearSquareOnOffscreenCanvas(row, col);

    // Draw the square with the highlight color
    this.offscreenCtx.fillStyle =
      (row + col) % 2 === 0
        ? ChessBoardPanel.LIGHT_SQUARE_HIGHLIGHT_COLOR
        : ChessBoardPanel.DARK_SQUARE_HIGHLIGHT_COLOR;
    this.offscreenCtx.fillRect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );

    this.offscreenCtx.save();
    this.offscreenCtx.beginPath();
    this.offscreenCtx.rect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );
    this.offscreenCtx.clip();

    const radius = this.squareSize * 0.58;
    const centerX = (col + 0.5) * this.squareSize;
    const centerY = (row + 0.5) * this.squareSize;
    this.offscreenCtx.beginPath();
    this.offscreenCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    this.offscreenCtx.fillStyle =
      (row + col) % 2 === 0
        ? ChessBoardPanel.LIGHT_SQUARE_COLOR
        : ChessBoardPanel.DARK_SQUARE_COLOR;

    this.offscreenCtx.fill();
    this.offscreenCtx.restore();

    const piece = this.board.getPieceAt(row, col);
    if (piece) {
      this.drawPieceOnOffscreenCanvas(
        piece,
        col * this.squareSize,
        row * this.squareSize
      );
    }
  }

  drawKingCheckHighlight(row, col) {
    this.clearSquareOnOffscreenCanvas(row, col);

    const centerX = (col + 0.5) * this.squareSize;
    const centerY = (row + 0.5) * this.squareSize;
    const innerRadius = 0;
    const outerRadius = this.squareSize * 0.9;

    const gradient = this.offscreenCtx.createRadialGradient(
      centerX,
      centerY,
      innerRadius,
      centerX,
      centerY,
      outerRadius
    );

    gradient.addColorStop(0, "rgb(255, 0, 0)");
    gradient.addColorStop(0.25, "rgb(231, 0, 0)");
    gradient.addColorStop(0.89, "rgba(169, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(158, 0, 0, 0)");

    this.offscreenCtx.fillStyle = gradient;

    this.offscreenCtx.fillRect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );

    const piece = this.board.getPieceAt(row, col);
    if (piece) {
      this.drawPieceOnOffscreenCanvas(
        piece,
        col * this.squareSize,
        row * this.squareSize
      );
    }
    if (row === 7 || col === 7) {
      this.drawRankFileLabels(row, col);
    }
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    this.kingCheckHighlightedSquare = { row, col };
  }

  clearHighlights() {
    this.highlightedSquares.forEach((square) => {
      this.redrawSquare(square.getRow(), square.getCol());
    });
    this.highlightedSquares = [];
    this.listOfMovesToHighlight = [];
  }

  clearPreviousMoveHighlights() {
    this.previousMoveHighlightedSquares.forEach((square) => {
      this.redrawSquare(square.getRow(), square.getCol());
    });
    this.previousMoveHighlightedSquares = [];
    this.previousMove = null;
  }

  drawPieceOnOffscreenCanvas(piece, x, y) {
    const image = this.imageLoader.getPieceImage(piece);
    if (image) {
      this.offscreenCtx.drawImage(
        image,
        x,
        y,
        this.squareSize * 0.96,
        this.squareSize * 0.96
      );
    }
  }

  clearSquareOnOffscreenCanvas(row, col) {
    this.offscreenCtx.clearRect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );
  }

  redrawSquare(row, col) {
    this.offscreenCtx.fillStyle =
      (row + col) % 2 === 0
        ? ChessBoardPanel.LIGHT_SQUARE_COLOR
        : ChessBoardPanel.DARK_SQUARE_COLOR;
    this.offscreenCtx.fillRect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );

    const piece = this.board.getPieceAt(row, col);
    if (piece) {
      this.drawPieceOnOffscreenCanvas(
        piece,
        col * this.squareSize,
        row * this.squareSize
      );
    }
  }

  updateSquareSize(squareSize) {
    this.squareSize = squareSize;
  }
}

export default ChessBoardHighlighter;
