export const successPraises = [
  'Great job!',
  'Awesome!',
  'You did it!',
  'Fantastic!',
  'Super!',
  'Way to go!',
  'Brilliant!',
  'Excellent!',
  'Perfect!',
  'Amazing!',
  'Good job!',
  'Wow!'
];

export const getRandomPraise = () => {
  return successPraises[Math.floor(Math.random() * successPraises.length)];
};
