class PromotionSelector {
  constructor(drawBoardCallback, boardContainer, imageLoader) {
    this.drawBoard = drawBoardCallback;
    this.boardContainer = boardContainer;
    this.imageLoader = imageLoader;

    this.activePromotionSelector = null;
  }

  createPromotionSelector(move, callback, squareSize) {
    let promotionPieces = ["Queen", "Rook", "Bishop", "Knight"];
    const pawnPosition = move.getEndSquare();
    const pawnRow = pawnPosition.getRow();
    const pawnCol = pawnPosition.getCol();
    const color = move.piece.getPlayer().getColor().toLowerCase();
    const colorCapitalized = color.charAt(0).toUpperCase() + color.slice(1);
    const selector = document.createElement("div");
    const selectorHeight = this.squareSize * promotionPieces.length;
    selector.className = "promotion-selector";
    selector.style.position = "absolute";

    this.activePromotionSelector = {
      selector: selector,
      move: move,
      startSquare: move.getStartSquare(),
      endSquare: move.getEndSquare(),
      selectorSquares: this.calculateSelectorSquares(
        move.getEndSquare(),
        color
      ),
    };

    if (color === "black") {
      promotionPieces = promotionPieces.reverse();
    }

    if (pawnRow === 0) {
      selector.style.top = `${pawnRow * squareSize}px`;
    } else if (pawnRow === 7) {
      selector.style.top = `${(pawnRow + 1) * squareSize - selectorHeight}px`;
    }
    selector.style.left = `${pawnCol * squareSize}px`;

    selector.style.width = `${squareSize}px`;
    selector.style.height = `${squareSize * promotionPieces.length}px`;
    selector.style.zIndex = "3";
    selector.style.padding = "0";
    selector.style.margin = "0";
    selector.style.lineHeight = "0";
    selector.style.boxSizing = "border-box";

    // Shade the entire chessboard
    const boardOverlay = document.createElement("div");
    boardOverlay.className = "board-overlay";
    boardOverlay.style.position = "absolute";
    boardOverlay.style.left = "0";
    boardOverlay.style.top = "0";
    boardOverlay.style.width = "100%";
    boardOverlay.style.height = "100%";
    boardOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    boardOverlay.style.zIndex = "2";
    this.boardContainer.appendChild(boardOverlay);

    promotionPieces.forEach((type) => {
      const pieceName = `${colorCapitalized}_${type}`;
      const image = this.imageLoader.pieceImages[pieceName];
      if (image) {
        const img = document.createElement("img");
        img.src = image.src;
        img.style.width = "100%";
        img.style.height = `${squareSize}px`;
        img.style.padding = "0";
        img.style.margin = "0";
        img.style.display = "block";
        img.addEventListener("click", () => {
          callback(type.toUpperCase());
          boardOverlay.remove();
          this.removePromotionSelector();
        });
        selector.appendChild(img);
      }
    });

    this.boardContainer.appendChild(selector);
  }

  calculateSelectorSquares(endSquare, color) {
    const squares = [];
    const startRow =
      color === "white" ? endSquare.getRow() : endSquare.getRow() - 3;

    for (let i = 0; i < 4; i++) {
      const row = startRow + (color === "white" ? i : -i);
      const col = endSquare.getCol();
      squares.push({ row, col });
    }

    return squares;
  }

  removePromotionSelector() {
    if (this.activePromotionSelector) {
      this.activePromotionSelector.selector.remove();
      this.activePromotionSelector = null;

      this.drawBoard();
    }
  }
}

export default PromotionSelector;
