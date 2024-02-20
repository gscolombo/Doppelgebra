import CartesianPlane from './components/cartersianPlane/plane';
import { debounce } from 'lodash';

let f: string, g: string;
document.querySelectorAll('.field').forEach((field) => {
  field.addEventListener(
    'input',
    debounce((e: InputEvent) => {
      const expr = (e.target as HTMLInputElement).value;
      switch (field.id) {
        case 'f':
          f = expr;
          break;
        case 'g':
          g = expr;
      }
      new CartesianPlane('plane', [f, g]);
    }, 1000)
  );
});

new CartesianPlane('plane', [f, g]);
