import { program } from 'commander';
import format from './scripts/format.js';
import summarize from './scripts/summarize.js';
import grammarCheck from './scripts/grammarCheck.js';
import styleImprove from './scripts/styleImprove.js';

program.option('--script <type>', 'Type of script to run: format, summarize, grammarCheck, styleImprove');

program.parse(process.argv);

const options = program.opts();

(async () => {
  try {
    switch (options.script) {
      case 'format':
        await format();
        break;
      case 'summarize':
        await summarize();
        break;
      case 'grammarCheck':
        await grammarCheck();
        break;
      case 'styleImprove':
        await styleImprove();
        break;
      default:
        console.log('Please specify a valid script type using --script option.');
    }
  } catch (error) {
    console.error('Error executing script:', error);
  }
})();
