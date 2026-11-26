// The factory uses the same controllable SVG clock and spatial scene as the industrial campus.
'use strict';
window.ORTOPIA_FACTORY = {
  render(stage, data, current) {
    window.ORTOPIA_INDUSTRY.render(stage, data, current);
  }
};
