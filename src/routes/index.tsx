import { createFileRoute } from "@tanstack/react-router";
import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";
import {
  BarChart3,
  Bell,
  ChevronDown,
  Clock3,
  Crown,
  Flag,
  Gamepad2,
  Globe2,
  LayoutGrid,
  Menu,
  MessageCircle,
  MicOff,
  MoreHorizontal,
  RotateCcw,
  Swords,
  Trophy,
  Users,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Chess Arena — Play Chess Online" },
      { name: "description", content: "Play a focused, beautiful game of chess against a friend or the computer in Chess Arena." },
      { property: "og:title", content: "Chess Arena — Play Chess Online" },
      { property: "og:description", content: "A premium browser chess experience for focused games and friendly competition." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type GameMode = "computer" | "local" | "online";
type Difficulty = "Easy" | "Medium" | "Hard";

const pieceGlyphs: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};
const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
const initialSeconds = 10 * 60;

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function PlayerBadge({ color, name, rating, active, time, isHuman = false }: { color: Color; name: string; rating: string; active?: boolean; time: number; isHuman?: boolean }) {
  return (
    <div className={`player-badge ${active ? "player-badge-active" : ""}`}>
      <div className={`avatar avatar-${color}`} aria-hidden="true">{color === "b" ? "♞" : "♙"}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{name}</span>
          {isHuman ? <span className="status-dot" title="You" /> : null}
        </div>
        <span className="text-xs text-muted-foreground">{rating}</span>
      </div>
      <div className={`clock ${active ? "clock-active" : ""}`}><Clock3 size={14} />{formatTime(time)}</div>
    </div>
  );
}

function Index() {
  const gameRef = useRef(new Chess());
  const [position, setPosition] = useState(gameRef.current.fen());
  const [mode, setMode] = useState<GameMode>("computer");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [playerColor, setPlayerColor] = useState<Color>("w");
  const [selected, setSelected] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [captured, setCaptured] = useState<PieceSymbol[]>([]);
  const [whiteTime, setWhiteTime] = useState(initialSeconds);
  const [blackTime, setBlackTime] = useState(initialSeconds);
  const [soundOn, setSoundOn] = useState(true);
  const [onlineCode, setOnlineCode] = useState("");
  const [onlineNotice, setOnlineNotice] = useState("");
  const [, setTick] = useState(0);

  const game = gameRef.current;
  const turn = game.turn();
  const history = game.history({ verbose: true });
  const gameOver = game.isGameOver();
  const orientation = mode === "computer" ? playerColor : "w";
  const boardRanks = orientation === "w" ? ranks : [...ranks].reverse();
  const boardFiles = orientation === "w" ? files : [...files].reverse();
  const legalTargets = useMemo(() => {
    if (!selected) return [];
    return game.moves({ square: selected, verbose: true }).map((move) => move.to);
    // position changes are the intentional redraw signal for the engine ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, position]);

  useEffect(() => {
    if (gameOver || mode === "online") return;
    const timer = window.setInterval(() => {
      if (game.turn() === "w") setWhiteTime((time) => Math.max(0, time - 1));
      else setBlackTime((time) => Math.max(0, time - 1));
      setTick((tick) => tick + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [gameOver, mode, position, game]);

  useEffect(() => {
    if (mode !== "computer" || playerColor !== "b" || turn !== "w" || gameOver) return;
    const timer = window.setTimeout(() => makeComputerMove(), 550);
    return () => window.clearTimeout(timer);
  }, [mode, playerColor, turn, gameOver, position]);

  function resetGame() {
    game.reset();
    setPosition(game.fen());
    setSelected(null);
    setLastMove(null);
    setCaptured([]);
    setWhiteTime(initialSeconds);
    setBlackTime(initialSeconds);
    setOnlineNotice("");
  }

  function makeMove(from: Square, to: Square) {
    try {
      const move = game.move({ from, to, promotion: "q" });
      setPosition(game.fen());
      setLastMove({ from: move.from, to: move.to });
      if (move.captured) setCaptured((items) => [...items, move.captured as PieceSymbol]);
      setSelected(null);
    } catch {
      setSelected(null);
    }
  }

  function makeComputerMove() {
    const legal = game.moves({ verbose: true });
    if (!legal.length) return;
    const ordered = difficulty === "Easy" ? legal : [...legal].sort((a, b) => Number(b.captured ? 1 : 0) - Number(a.captured ? 1 : 0));
    const move = difficulty === "Hard" ? ordered[0] : ordered[Math.floor(Math.random() * Math.min(ordered.length, difficulty === "Medium" ? 10 : 4))];
    if (move) makeMove(move.from, move.to);
  }

  function handleSquareClick(square: Square) {
    if (gameOver || (mode === "computer" && turn !== playerColor)) return;
    const piece = game.get(square);
    if (selected && legalTargets.includes(square)) {
      makeMove(selected, square);
      return;
    }
    if (piece?.color === turn) setSelected(square);
    else setSelected(null);
  }

  function undoMove() {
    if (mode !== "local") return;
    const move = game.undo();
    if (!move) return;
    setPosition(game.fen());
    setLastMove(null);
    setSelected(null);
    setCaptured((items) => items.slice(0, move.captured ? -1 : undefined));
  }

  const status = game.isCheckmate() ? `${turn === "w" ? "Black" : "White"} wins by checkmate` : game.isStalemate() ? "Stalemate — draw" : game.isDraw() ? "Draw game" : game.isCheck() ? `${turn === "w" ? "White" : "Black"} is in check` : `${turn === "w" ? "White" : "Black"} to move`;
  const moveRows = Array.from({ length: Math.ceil(history.length / 2) }, (_, index) => ({ number: index + 1, white: history[index * 2]?.san, black: history[index * 2 + 1]?.san }));

  return (
    <main className="arena-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Crown size={18} /></div><span>Chess <b>Arena</b></span></div>
        <nav className="topnav" aria-label="Primary navigation"><button className="nav-link nav-link-active">Play</button><button className="nav-link">Puzzles</button><button className="nav-link">Learn</button><button className="nav-link">Leaderboard</button></nav>
        <div className="top-actions"><Button variant="ghost" size="icon" aria-label="Notifications"><Bell size={18} /></Button><div className="user-chip"><div className="user-avatar">JD</div><span>Jordan</span><ChevronDown size={14} /></div><Button className="mobile-menu" variant="ghost" size="icon" aria-label="Open menu"><Menu size={20} /></Button></div>
      </header>

      <div className="arena-layout">
        <aside className="sidebar-panel">
          <div className="side-label">Game modes</div>
          <div className="mode-list">
            <ModeButton active={mode === "computer"} icon={<Zap size={17} />} label="Vs. Computer" meta="Practice your game" onClick={() => { setMode("computer"); resetGame(); }} />
            <ModeButton active={mode === "local"} icon={<Users size={17} />} label="Local 2 Player" meta="Play with a friend" onClick={() => { setMode("local"); resetGame(); }} />
            <ModeButton active={mode === "online"} icon={<Globe2 size={17} />} label="Online Multiplayer" meta="Play anyone, anywhere" onClick={() => { setMode("online"); resetGame(); }} />
          </div>
          <div className="side-rule" />
          <div className="side-label">Your stats</div>
          <div className="stat-grid"><Stat label="Rating" value="1,248" icon={<BarChart3 size={15} />} /><Stat label="Games" value="86" icon={<Gamepad2 size={15} />} /><Stat label="Win rate" value="58%" icon={<Trophy size={15} />} /></div>
          <div className="side-quote"><span className="quote-mark">“</span><p>Chess is the gymnasium of the mind.</p><span>— Blaise Pascal</span></div>
        </aside>

        <section className="game-stage">
          <div className="stage-heading"><div><p className="eyebrow">{mode === "computer" ? "Rated practice" : mode === "local" ? "Pass & play" : "Live arena"}</p><h1>{mode === "computer" ? "Sharpen your edge" : mode === "local" ? "The board is yours" : "Ready for a challenger?"}</h1></div><Button variant="outline" size="sm" onClick={resetGame}><RotateCcw size={15} />New game</Button></div>
          <div className="players-row"><PlayerBadge color="b" name={mode === "computer" ? "Chess Bot" : "Alex Morgan"} rating={mode === "computer" ? `${difficulty} · 1,450` : "1,312"} active={turn === "b" && !gameOver} time={blackTime} /><span className="vs-label">vs</span><PlayerBadge color="w" name="Jordan Davis" rating="1,248" active={turn === "w" && !gameOver} time={whiteTime} isHuman /></div>
          <div className="board-frame"><div className="board-wrap"><div className="chess-board" aria-label="Interactive chess board">{boardRanks.flatMap((rank) => boardFiles.map((file) => { const square = `${file}${rank}` as Square; const piece = game.get(square); const dark = (files.indexOf(file) + rank) % 2 === 1; const isSelected = selected === square; const isLast = lastMove?.from === square || lastMove?.to === square; const isTarget = legalTargets.includes(square); return <Button key={square} variant="ghost" size="icon" className={`chess-square ${dark ? "square-dark" : "square-light"} ${isSelected ? "square-selected" : ""} ${isLast ? "square-last" : ""} ${isTarget ? "square-target" : ""}`} onClick={() => handleSquareClick(square)} aria-label={`${square}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${piece.type}` : " empty"}`}>{piece ? <span className={`piece piece-${piece.color}`}>{pieceGlyphs[piece.color][piece.type]}</span> : null}{isTarget && !piece ? <span className="move-dot" /> : null}{isTarget && piece ? <span className="capture-ring" /> : null}{file === boardFiles[0] ? <span className="rank-label">{rank}</span> : null}{rank === (orientation === "w" ? 1 : 8) ? <span className="file-label">{file}</span> : null}</Button>; }))}</div></div></div>
          <div className="game-status"><span className={game.isCheck() ? "status-alert" : "status-live"} />{status}{game.isCheckmate() ? <span className="status-result">Game over</span> : null}</div>
          <div className="under-board-actions"><Button variant="outline" size="sm" onClick={() => setSoundOn(!soundOn)}>{soundOn ? <Volume2 size={15} /> : <MicOff size={15} />}{soundOn ? "Sound on" : "Muted"}</Button><Button variant="outline" size="sm" disabled={mode !== "local"} onClick={undoMove}><RotateCcw size={15} />Undo move</Button><Button variant="outline" size="sm" onClick={() => setOnlineNotice("Draw offer sent to your opponent")}>Offer draw</Button><Button variant="outline" size="sm" onClick={() => setOnlineNotice("You resigned this game")}><Flag size={15} />Resign</Button></div>
        </section>

        <aside className="right-panel">
          {mode === "computer" ? <div className="config-section"><PanelTitle icon={<Zap size={16} />} title="Computer settings" /><div className="field-label">Difficulty</div><div className="segmented">{(["Easy", "Medium", "Hard"] as Difficulty[]).map((item) => <button key={item} className={difficulty === item ? "segment-active" : ""} onClick={() => setDifficulty(item)}>{item}</button>)}</div><div className="field-label color-label">Your color</div><div className="color-choice">{(["w", "b"] as Color[]).map((color) => <button key={color} className={`color-option ${playerColor === color ? "color-option-active" : ""}`} onClick={() => { setPlayerColor(color); resetGame(); }}><span className={`mini-piece mini-${color}`}>{color === "w" ? "♙" : "♟"}</span>{color === "w" ? "White" : "Black"}</button>)}</div></div> : mode === "online" ? <div className="config-section"><PanelTitle icon={<Globe2 size={16} />} title="Online multiplayer" /><p className="panel-copy">Challenge a friend or join a game with a code.</p><Button className="w-full" onClick={() => setOnlineNotice("Game created — share code ARENA-72")}>Create a game</Button><div className="join-row"><input value={onlineCode} onChange={(event) => setOnlineCode(event.target.value)} placeholder="Enter game code" aria-label="Game code" /><Button variant="outline" onClick={() => setOnlineNotice(onlineCode ? `Joined game ${onlineCode}` : "Enter a game code first")}>Join</Button></div>{onlineNotice ? <p className="notice-text">{onlineNotice}</p> : null}</div> : <div className="config-section"><PanelTitle icon={<Users size={16} />} title="Local match" /><p className="panel-copy">Two players, one board. Pass the device after each move.</p><div className="local-time"><Clock3 size={15} /><span>10 min</span><span className="muted-pill">Rapid</span></div></div>}
          <div className="panel-divider" /><div className="history-head"><PanelTitle icon={<LayoutGrid size={16} />} title="Move history" /><Button variant="ghost" size="icon" aria-label="Move history options"><MoreHorizontal size={18} /></Button></div><div className="move-list">{moveRows.length ? moveRows.map((row) => <div className={`move-row ${row.number === moveRows.length ? "move-row-current" : ""}`} key={row.number}><span className="move-number">{row.number}.</span><span>{row.white ?? "—"}</span><span>{row.black ?? "—"}</span></div>) : <div className="empty-history">Your moves will appear here</div>}</div>
          <div className="captured-section"><span className="section-mini-title">Captured</span><div className="captured-pieces">{captured.length ? captured.map((piece, index) => <span key={`${piece}-${index}`}>{pieceGlyphs.b[piece]}</span>) : <span className="captured-empty">No captures yet</span>}</div></div>
          <div className="chat-link"><MessageCircle size={16} /><span>Game chat</span><span className="chat-count">2</span></div>
        </aside>
      </div>
    </main>
  );
}

function ModeButton({ active, icon, label, meta, onClick }: { active: boolean; icon: React.ReactNode; label: string; meta: string; onClick: () => void }) {
  return <button className={`mode-button ${active ? "mode-button-active" : ""}`} onClick={onClick}><span className="mode-icon">{icon}</span><span><strong>{label}</strong><small>{meta}</small></span>{active ? <span className="active-bar" /> : null}</button>;
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) { return <div className="stat-item"><span>{icon}{label}</span><strong>{value}</strong></div>; }
function PanelTitle({ icon, title }: { icon: React.ReactNode; title: string }) { return <div className="panel-title"><span>{icon}</span><h2>{title}</h2></div>; }
