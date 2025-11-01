// src/Game.js
import { useState, useEffect, useRef } from "react";
import Board from "./Board";


export default function Game() {
    const [difficulty, setDifficulty] = useState(null);
    const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const [score, setScore] = useState({ X: 0, O: 0, draws: 0});
    const currentSquares = history[currentMove];
    const { winner, line: winningLine } = calculateWinner(currentSquares); // returns "X", "O", or null
    const nextPlayer = history.length % 2 === 0 ? "O" : "X";
    const status = winner
        ? `Winner: ${winner}`
        : currentSquares.every(Boolean)
        ? "It's a Draw!"
        : `Next Player: ${nextPlayer}`;
    const gameEndedRef = useRef(false);

        useEffect(() => {
            if (!winner && !currentSquares.every(Boolean)) {
                gameEndedRef.current = false;
            }

            if (!gameEndedRef.current) {
                if (winner) {
                    setScore((prev) => ({ ...prev, [winner]: prev[winner] + 1 }));
                    gameEndedRef.current = true;
                } else if (currentSquares.every(Boolean)) {
                    setScore((prev) => ({ ...prev, draws: prev.draws + 1}));
                    gameEndedRef.current = true;
                }
            }
        }, [winner, currentSquares]);

    function handleDifficultySelect(level) {
        setDifficulty(level);
        setHistory([Array(9).fill(null)]);
        setCurrentMove(0);
        setScore({X: 0, O: 0, draws: 0});
        gameEndedRef.current = false;
    }

    function handleClick(i) {
        if (difficulty === null) return;//The Game Does Not Start Yet

        const nextHistory = history.slice(0, currentMove + 1);
        const nextSquares = currentSquares.slice();

        // Ignore click if the game has a winner or the square is filled
        if (winner || nextSquares[i]) return;

        nextSquares[i] = "X";
        const updatedHistory = [...nextHistory, nextSquares];
        setHistory(updatedHistory);
        setCurrentMove(updatedHistory.length - 1);

        setTimeout(() => {
            const { winner: tempWinner } = calculateWinner(nextSquares);
            if (!tempWinner && difficulty) makeAIMove(updatedHistory);}, 400);
    }

    // Time Travel To Any Previous Move
    function jumpTo(move) {
        setCurrentMove(move);
    }

    function resetGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    gameEndedRef.current = false;
    }
    
    //  =====   AI Setup    =====
    function makeAIMove(updatedHistory) {
        const aiSquares = updatedHistory[updatedHistory.length - 1].slice();

        const { winner } = calculateWinner(aiSquares);
            if (winner) return;

        const emptyIndices = aiSquares
            .map((val, idx) => (val === null ? idx : null))
            .filter((val) => val !== null);
            if (emptyIndices.length === 0) return;

            // ===== Beginner Mode =====
            if (difficulty === "beginner") {
                const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                aiSquares[randomIndex] = "O";
                updateBoard();
                return;
            }

           // ===== Intermediate Mode =====
            else if (difficulty === "intermediate") {

            // ===== Try To Win =====
            for (let idx of emptyIndices) {
                const testSquares = aiSquares.slice();
                testSquares[idx] = "O";
                if (calculateWinner(testSquares).winner === "O") {
                    aiSquares[idx] = "O";
                    updateBoard();
                    return;
                }
            }
            // ===== Block Player =====
            for (let idx of emptyIndices) {
                const testSquares = aiSquares.slice();
                testSquares[idx] = "X";
                if (calculateWinner(testSquares).winner === "X") {
                    aiSquares[idx] = "O";
                    updateBoard();
                    return;
                }
            }

            // ===== Take Center =====
            if (aiSquares[4] === null) {
                aiSquares[4] = "O";
                updateBoard();
                return;
            }

            // ===== Take Corner =====
            const corners = [0, 2, 6, 8].filter((i) => aiSquares[i] === null);
                if (corners.length > 0) {
                    const randomCorner = corners[Math.floor(Math.random() * corners.length)];
                    aiSquares[randomCorner] = "O";
                    updateBoard();
                    return;
                }

            // ===== Take Side =====
            const sides = [1, 3, 5, 7].filter((i) => aiSquares[i] === null);
                if (sides.length > 0) {
                    const randomSide = sides[Math.floor(Math.random() * sides.length)];
                    aiSquares[randomSide] = "O";
                    updateBoard();
                }
            

            }

            // ===== Expert Mode =====
            if (difficulty === "expert") {
                let bestScore = -Infinity;
                let bestMove = null;

                for (let i = 0; i < 9; i++) {
                    if (!aiSquares[i]) {
                        aiSquares[i] = "O";//AI Move
                        const score = minmax(aiSquares, 0, false);
                        aiSquares[i] = null;
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = i;
                        }
                    }
                }
                if (bestMove !== null) {
                aiSquares[bestMove] = "O";
                updateBoard();
                return;
            }
        }

        function updateBoard() {
            const nextHistory = [...updatedHistory, aiSquares];
            setHistory(nextHistory);
            setCurrentMove(nextHistory.length - 1);
        }
    }
    
    function minmax(squares, depth, isMaximizing) {
    const { winner } = calculateWinner(squares);

        if (winner === "O") return 10 - depth;
        if (winner === "X") return depth - 10;
        if (squares.every(Boolean)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
            if (!squares[i]) {
                squares[i] = "O";
                const score = minmax(squares, depth + 1, false);
                squares[i] = null;
                bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
            if (!squares[i]) {
                squares[i] = "X";
                const score = minmax(squares, depth + 1, true);
                squares[i] = null;
                bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    // ===== Check For Winner =====
    function calculateWinner(squares) {
    const lines = [
        [0, 1, 2], 
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], line: [a, b, c] };// return winner + winning line
            }
        }
    return { winner: null, line: [] };// <--- always return an object instead returning null
    }


    return (
        <div className="game-wrapper">
            {!difficulty && (
                <div className="difficulty-select">
                    <h2>Select AI Difficulty</h2>
                    <button onClick={() => handleDifficultySelect("beginner")}>Beginner</button>
                    <button onClick={() => handleDifficultySelect("intermediate")}>Intermediate</button>
                    <button onClick={() => handleDifficultySelect("expert")}>Expert</button>
                </div>
            )}
            
            {difficulty && (
                <div className="game-container">
                    <h1 className="title">AI Tic-Tac-Toe</h1>
                    <h2 className="status">{status}</h2>

                    <Board squares={currentSquares} onClick={handleClick} winningLine={winningLine}/>

                    <div className="scoreboard">
                        <p>❌ Wins: {score.X}</p>
                        <p>⭕️ Wins: {score.O}</p>
                        <p>🤝 Draws: {score.draws}</p>
                    </div>

                    <button className="reset-btn" onClick={resetGame}>New Game</button>
                    <button className="difficulty" onClick={() => setDifficulty(null)}>Select Difficulty</button>


                    <div className="history">
                        {history.map((_, move) => (
                            <button key={move} onClick={() => jumpTo(move)}>
                                {move === 0 ? "Go to game start" : `Go to move #${move}`}
                            </button>
                        ))}
                        <h3>Move History</h3>
                    </div>
                </div>
            )}
        </div>
    );
}