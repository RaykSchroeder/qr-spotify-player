import { config, library } from '@fortawesome/fontawesome-svg-core';
import { faPlay, faPause, faForward, faBackward, faQrcode } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

config.autoAddCss = false;
library.add(faPlay, faPause, faForward, faBackward, faQrcode);
