// Sound library utilities for web application
import catSounds from './catSounds';
import dogSounds from './dogSounds';
import guineaPigSounds from './guineaPigSounds';

const soundLibraries = {
  cat: catSounds,
  dog: dogSounds,
  guinea_pig: guineaPigSounds
};

export function getSoundLibrary(animal) {
  return soundLibraries[animal] || soundLibraries.cat;
}

export function getSoundInfo(animal, soundType) {
  const library = getSoundLibrary(animal);
  return library[soundType] || null;
}

export function getAllSoundTypes(animal) {
  const library = getSoundLibrary(animal);
  return Object.keys(library);
}
