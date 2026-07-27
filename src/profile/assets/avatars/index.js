import man1 from './Man-1.jpg';
import man2 from './Man-2.png';
import man3 from './Man-3.png';
import woman1 from './WoMan-1.png';
import woman2 from './Women-2.jpeg';
import woman3 from './WoMan-3.png';

// Single source of truth for the "Select Avatar" picker. To add a new avatar,
// drop the image in this folder and add one entry below — nothing else
// needs to change.
const avatars = [
  { id: 'man-1', src: man1, gender: 'm' },
  { id: 'man-2', src: man2, gender: 'm' },
  { id: 'man-3', src: man3, gender: 'm' },
  { id: 'woman-1', src: woman1, gender: 'f' },
  { id: 'woman-2', src: woman2, gender: 'f' },
  { id: 'woman-3', src: woman3, gender: 'f' },
];

export const getAvatarsForGender = (gender) => {
  if (gender === 'm' || gender === 'f') {
    return avatars.filter((avatar) => avatar.gender === gender);
  }
  return avatars;
};

export default avatars;
