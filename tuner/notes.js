const tolerance = 20   // error tolorance of the tuner

const Notes = function(tuner) {
  this.tuner = tuner
  this.isAutoMode = true
}

Notes.prototype.update = function(note) {
  let name = note.name[0];
  let sharp = note.name[1] ? note.name[1] : ' ';
  let error = note.cents;
  let $name = $('.note .name');

  $('.note .name-letter').text(name);
  $('.note .name-sharp').text(sharp);
  $('.note .octave').text(note.octave);
  $('.note .frequency').text(Math.round(note.frequency));
  $('.note .cents').text(error);

  $name.removeClass('flat sharp');
  if (error > tolerance) {
    $name.addClass('sharp');
  } else if ( error < -tolerance ) {
    $name.addClass('flat');
  }
}

Notes.prototype.toggleAutoMode = function() {
  if (this.isAutoMode) {
    // this.clearActive()
  }
  this.isAutoMode = !this.isAutoMode
}
