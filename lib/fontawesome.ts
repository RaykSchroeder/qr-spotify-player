// lib/fontawesome.ts
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlay, faPause, faStepForward, faStepBackward } from '@fortawesome/free-solid-svg-icons';

library.add(
  faPlay as any,
  faPause as any,
  faStepForward as any,
  faStepBackward as any
);
