# Chess Arena Live

Create a complete, modern, responsive Chess Game website using Laravel.



The website should be a fully functional browser-based chess game, not just a static design.



TECH STACK:

- Laravel (latest stable version)

- PHP

- Blade templates

- Tailwind CSS

- JavaScript

- MySQL for user accounts, game history, and statistics

- Use a reliable chess rules library if needed for accurate legal-move validation



MAIN FEATURES:



1. HOME PAGE

- Premium modern chess-themed UI

- Logo/name: "Chess Arena"

- Hero section with "Play Chess" CTA

- Buttons:

  - Play vs Computer

  - Local 2 Player

  - Online Multiplayer

- Clean responsive design for desktop and mobile



2. CHESS GAME

- Interactive 8×8 chess board

- Proper chess pieces

- Players can click/tap pieces and make moves

- Highlight legal moves

- Highlight selected piece

- Detect:

  - Check

  - Checkmate

  - Stalemate

  - Draw

  - Castling

  - En passant

  - Pawn promotion

- Prevent illegal moves

- Show whose turn it is

- Move history

- Captured pieces display

- New Game button

- Resign button

- Offer Draw button

- Undo only in Local 2 Player mode



3. GAME MODES

A. Play vs Computer

- Easy, Medium and Hard difficulty

- Computer makes legal chess moves

- Show player color selection



B. Local 2 Player

- Two players can play on the same device

- White and Black timers



C. Online Multiplayer

- Create a game

- Join a game using a game code

- Real-time moves using Laravel WebSockets / broadcasting

- Synchronize board state between both players



4. CHESS CLOCK

- Configurable time controls:

  - 1+0

  - 3+2

  - 5+0

  - 10+0

  - 10+5

  - 15+10

- Automatically switch timer after every legal move

- Detect timeout and declare winner



5. USER SYSTEM

- Register

- Login

- Logout

- User profile

- Username/avatar

- Games played

- Wins

- Losses

- Draws

- Win percentage

- Rating/ELO system



6. GAME HISTORY

- Save completed games in MySQL

- Store moves using standard chess notation

- Show previous games

- Show result and opponent

- Allow users to replay old games move-by-move



7. LEADERBOARD

- Global ranking

- Player username

- Rating

- Wins

- Games played

- Sort by rating



8. UI/UX

- Premium gaming interface

- Dark chess-themed design

- Elegant animations

- Smooth piece movement

- Move/capture/check sounds with mute option

- Responsive layout

-

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://s-court-online.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f5331187-2c2b-4acb-a509-e4b990509b2d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
