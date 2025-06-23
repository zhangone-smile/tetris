export const TETROMINOES = {
  'I': {
    shape: [
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0]
    ],
    color: '#00ffff',
  },
  'J': {
    shape: [
      [0, 'J', 0],
      [0, 'J', 0],
      ['J', 'J', 0]
    ],
    color: '#0000ff',
  },
  'L': {
    shape: [
      [0, 'L', 0],
      [0, 'L', 0],
      [0, 'L', 'L']
    ],
    color: '#ff7f00',
  },
  'O': {
    shape: [
      ['O', 'O'],
      ['O', 'O']
    ],
    color: '#ffff00',
  },
  'S': {
    shape: [
      [0, 'S', 'S'],
      ['S', 'S', 0],
      [0, 0, 0]
    ],
    color: '#00ff00',
  },
  'T': {
    shape: [
      ['T', 'T', 'T'],
      [0, 'T', 0],
      [0, 0, 0]
    ],
    color: '#800080',
  },
  'Z': {
    shape: [
      ['Z', 'Z', 0],
      [0, 'Z', 'Z'],
      [0, 0, 0]
    ],
    color: '#ff0000',
  },
  0: {
    shape: [[0]],
    color: '#f0f0f0'
  }
};

export const randomTetromino = () => {
  const tetrominoes = 'IJLOSTZ';
  const randTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
  return TETROMINOES[randTetromino];
}; 