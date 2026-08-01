import maleAerospace from './male/Aerospace.png';
import maleBiology from './male/Biology.png';
import maleBiotechnology from './male/Biotechnology.png';
import maleChemistry from './male/Chemistry.png';
import maleComputerScience from './male/Computer Science.png';
import maleElectronics from './male/Electronics.png';
import maleElrctric from './male/Elrctric.png';
import malePhysics from './male/Physics.png';
import maleProfessor from './male/Professor.png';
import maleRobotic from './male/Robotic.png';
import maleZoology from './male/Zoology.png';

import femaleAerospace from './female/Aerospace.png';
import femaleBiotechnology from './female/Biotechnology.png';
import femaleChemistry from './female/Chemistry.png';
import femaleComputerScience from './female/Computer Science.png';
import femaleElectronics from './female/Electronics.png';
import femaleEvniromental from './female/Evniromental.png';
import femaleMathematics from './female/Mathematics.png';
import femalePhysics from './female/Physics.png';
import femaleProfessor from './female/Professor.png';
import femaleRobotic from './female/Robotic.png';
import femaleZoology from './female/Zoology.png';

// Single source of truth for the "Select Avatar" picker. To add a new avatar,
// drop the image in the male/ or female/ folder and add one entry below —
// nothing else needs to change.
const avatars = [
  { id: 'male-aerospace', src: maleAerospace, gender: 'm' },
  { id: 'male-biology', src: maleBiology, gender: 'm' },
  { id: 'male-biotechnology', src: maleBiotechnology, gender: 'm' },
  { id: 'male-chemistry', src: maleChemistry, gender: 'm' },
  { id: 'male-computer-science', src: maleComputerScience, gender: 'm' },
  { id: 'male-electronics', src: maleElectronics, gender: 'm' },
  { id: 'male-elrctric', src: maleElrctric, gender: 'm' },
  { id: 'male-physics', src: malePhysics, gender: 'm' },
  { id: 'male-professor', src: maleProfessor, gender: 'm' },
  { id: 'male-robotic', src: maleRobotic, gender: 'm' },
  { id: 'male-zoology', src: maleZoology, gender: 'm' },

  { id: 'female-aerospace', src: femaleAerospace, gender: 'f' },
  { id: 'female-biotechnology', src: femaleBiotechnology, gender: 'f' },
  { id: 'female-chemistry', src: femaleChemistry, gender: 'f' },
  { id: 'female-computer-science', src: femaleComputerScience, gender: 'f' },
  { id: 'female-electronics', src: femaleElectronics, gender: 'f' },
  { id: 'female-evniromental', src: femaleEvniromental, gender: 'f' },
  { id: 'female-mathematics', src: femaleMathematics, gender: 'f' },
  { id: 'female-physics', src: femalePhysics, gender: 'f' },
  { id: 'female-professor', src: femaleProfessor, gender: 'f' },
  { id: 'female-robotic', src: femaleRobotic, gender: 'f' },
  { id: 'female-zoology', src: femaleZoology, gender: 'f' },
];

export const getAvatarsForGender = (gender) => {
  if (gender === 'm' || gender === 'f') {
    return avatars.filter((avatar) => avatar.gender === gender);
  }
  return avatars;
};

export default avatars;
