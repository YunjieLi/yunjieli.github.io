const tolerance = 10;   // error tolorance of the tuner
const limit = 40;
const opacityMax = .7;
const translateMax = 60;

const Notes = function(tuner) {
  this.tuner = tuner
  this.isAutoMode = true
}

Notes.prototype.update = function(note) {
  let sharp = note.name[1] ? note.name[1] : ' ';
  let cents = note.cents;
  // if within a small difference, treat it as "tuned"
  // if (Math.abs(cents) < tolerance) cents = 0;
  let percentage = Math.min(Math.abs(cents/limit), 1);
  let sign = cents > 0 ? 1 : -1;
  let opacity = opacityMax * percentage;
  let shift = translateMax * percentage * sign;

  $('.note .name-letter').text(note.name[0]);
  $('.note .name-sharp').text(sharp);
  $('.note .octave').text(note.octave);
  $('.note .cents').text(note.cents);

  // $('.note-ghost').css('opacity', opacity);
    $('.note-ghost').css('transform', 'translateX(' + cents + 'px)');
}

Notes.prototype.toggleAutoMode = function() {
  if (this.isAutoMode) {
    // this.clearActive()
  }
  this.isAutoMode = !this.isAutoMode
}
