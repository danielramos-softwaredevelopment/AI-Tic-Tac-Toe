// src/Board.js
import Square from "./Square";

export default function Board({ squares, onClick, winningLine }) {
    function renderSquare(i) {
        const isWinningSquare = winningLine.includes(i);
        return (
        <Square
        key={i}
        value={squares[i]}
        onClick={() => onClick(i)}
        highlight={isWinningSquare}/>
        );
    }

    return (
        <div className="board">
            {Array(9)
            .fill(null)
            .map((_, i) => renderSquare(i))}
        </div>
    );
}