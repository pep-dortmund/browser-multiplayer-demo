N_ROWS = 6
N_COLS = 7

DIRECTIONS = {
    'horizontal': [0, 1],
    'vertical': [1, 0],
    'ascending': [1, 1],
    'descending': [-1, 1],
}


def init_state():
    return {
        'board': [[0 for _ in range(N_COLS)] for _ in range(N_ROWS)],
        'player': 1,
        'winner': None,
    }


def check_victory(board):
    # check horizontally
    for row in range(N_ROWS):
        winner = check_from_cell(board, row, 0, "horizontal")
        if winner:
            return winner

    # check vertically
    for col in range(N_COLS):
        winner = check_from_cell(board, 0, col, "vertical")
        if winner:
            return winner

    # check diagonally ascending
    # first, check starting from row 0
    for col in range(N_COLS):
        winner = check_from_cell(board, 0, col, "ascending")
        if winner:
            return winner

    # then from col 0, starting with row 1, 0 was already checked before
    for row in range(1, N_ROWS):
        winner = check_from_cell(board, row, 0, "ascending")
        if winner:
            return winner

    # first, check starting from the top row
    for col in range(0, N_COLS):
        winner = check_from_cell(board, N_ROWS - 1, col, "descending")
        if winner:
            return winner

    # then from col 0
    for row in range(N_ROWS):
        winner = check_from_cell(board, row, 0, "descending")
        if winner:
            return winner

    return None


def check_from_cell(board, row, col, direction):
    n_found = 0
    current = 0
    drow, dcol = DIRECTIONS[direction]

    while row >= 0 and row < N_ROWS and col >= 0 and col < N_COLS:
        owner = board[row][col]

        if owner == 0:
            n_found = 0
            current = 0
        elif owner == current:
            n_found += 1
        else:
            n_found = 1
            current = owner

        if n_found == 4:
            return dict(player=current, row=row, col=col, direction=direction)

        row += drow
        col += dcol

    return None
