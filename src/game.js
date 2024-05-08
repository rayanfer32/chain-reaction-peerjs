// Define a class named 'game'
export default class game {
  // Constructor function, takes an options object with a default of 2 players
  constructor(options = { players: 2 }) {
    // Initialize the game board with 9 rows and 6 columns
    this.game = [...Array(9)].map(() =>
      [...Array(6)].map(() => {
        return { player: null, mass: 0 }; // Each cell has player and mass properties
      })
    );
    // Define an array of player colors, sliced to the specified number of players
    this.players = [
      "red",
      "green",
      "blue",
      "yellow",
      "pink",
      "indigo",
      "purple",
      "gray",
    ].slice(0, options.players);
    // Initialize the turn counter
    this.turn = 0;
    // Initialize a variable to check if the game board is unstable
    this.check = false;
  }

  // Method to add mass to a cell at a specified position
  add(pos) {
    // Check if the cell is owned by the current player or empty
    if (
      this.game[pos[0]][pos[1]].player === this.players[this.turn] ||
      this.game[pos[0]][pos[1]].player === null
    ) {
      // Add mass to the cell
      this.game[pos[0]][pos[1]] = {
        mass: this.game[pos[0]][pos[1]].mass + 1,
        player: this.players[this.turn],
      };
      // Check for unstable conditions
      try {
        this.checkunstable();
      } catch {}
      // If the board is unstable, remove players who don't have any cells
      if (this.check) {
        var players = this.players;
        for (var i = 0; i < players.length; i++) {
          if (!this.searchPlayer(players[i])) {
            players.splice(i, 1);
            i--;
          }
        }
      }
      // Move to the next player's turn
      if (this.turn + 1 >= this.players.length) {
        this.turn = 0;
      } else {
        this.turn++;
      }
    }
  }

  // Helper function to check if an array includes another array
  includesArray = (data, arr) => {
    return data.some(
      (e) => Array.isArray(e) && e.every((o, i) => Object.is(arr[i], o))
    );
  };

  // Function to determine the mass limit for a given cell position
  masslimit = (pos) => {
    if (
      this.includesArray(
        [
          [0, 0],
          [0, 5],
          [8, 0],
          [8, 5],
        ],
        pos
      )
    ) {
      return 1;
    } else if ([0, 8].includes(pos[0]) || [0, 5].includes(pos[1])) {
      return 2;
    } else {
      return 3;
    }
  };

  // Method to explode a cell at a specified position
  explode(pos) {
    // Attempt to add mass to adjacent cells, ignoring errors if out of bounds
    try {
      this.game[pos[0] - 1][pos[1]] = {
        mass: this.game[pos[0] - 1][pos[1]].mass + 1,
        player: this.game[pos[0]][pos[1]].player,
      };
      // todo: animate the explosion using css transition

    } catch {}
    try {
      this.game[pos[0] + 1][pos[1]] = {
        mass: this.game[pos[0] + 1][pos[1]].mass + 1,
        player: this.game[pos[0]][pos[1]].player,
      };
    } catch {}
    try {
      this.game[pos[0]][pos[1] - 1] = {
        mass: this.game[pos[0]][pos[1] - 1].mass + 1,
        player: this.game[pos[0]][pos[1]].player,
      };
    } catch {}
    try {
      this.game[pos[0]][pos[1] + 1] = {
        mass: this.game[pos[0]][pos[1] + 1].mass + 1,
        player: this.game[pos[0]][pos[1]].player,
      };
    } catch {}
    // Reset the mass and player of the exploded cell
    this.game[pos[0]][pos[1]] = { mass: 0, player: null };
  }

  // Method to recursively check for unstable conditions on the game board
  checkunstable() {
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 6; j++) {
        // If a cell has mass greater than its mass limit, explode it
        if (this.game[i][j].mass > this.masslimit([i, j])) {
          this.check = true; // Set the check flag to true
          this.explode([i, j]); // Explode the cell
          this.checkunstable(); // Recursively check for more unstable cells
        }
      }
    }
  }

  // Method to search for cells owned by a specific player
  searchPlayer = (player) => {
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 6; j++) {
        if (this.game[i][j].player === player) {
          return true; // Return true if a cell owned by the player is found
        }
      }
    }
    return false; // Return false if no cells owned by the player are found
  };
}
