class TonalChord {

  constructor(root, level, type, type7, bFlat, bQuads) {
    this.root = root;
    this.level = level;
    this.type = type;
		this.type7 = type7;
		this.bFlat = bFlat;
		this.bQuads = bQuads;
  }

  /*
  	return root of chord (either in sharp or flat notation)
  */
  getRoot() {
		return this.root;
  }

  /*
  	return notes of Power Chord
  */
  getPower() {
    var result = [];
    var tmp_scale = new TonalKey(this.root, this.type, this.bFlat);
    result.push(tmp_scale.getChord(1).toString(true));
    result.push(tmp_scale.getChord(5).toString(true));
    return result;
  }

  /*
  	return notes of triad
  */
  getTriad() {
    var result = [];
    var tmp_scale = new TonalKey(this.root, this.type, this.bFlat);
    result.push(tmp_scale.getChord(1).toString(true));
    result.push(tmp_scale.getChord(3).toString(true));
    result.push(tmp_scale.getChord(5).toString(true));
    return result;
  }

  /*
  	return notes of quad / seventh chord
  */
  getQuad() {
    var result = [];
    var tmp_scale = new TonalKey(this.root, this.type, this.bFlat);
    result.push(tmp_scale.getChord(1).toString(true));
    result.push(tmp_scale.getChord(3).toString(true));
    result.push(tmp_scale.getChord(5).toString(true));

    switch (this.type7) {
      // maj7 or min7
      case "": {
        result.push(tmp_scale.getChord(7).toString(true));
        break;
      }
      // dom7
      case "dom7": {
        tmp_scale = new TonalKey(this.root, "minor", this.bFlat);
        result.push(tmp_scale.getChord(7).toString(true)); // b7
        break;
      }
      // minmaj7
      case "minmaj7": {
        tmp_scale = new TonalKey(this.root, "minor", this.bFlat);
        result[0] = tmp_scale.getChord(1).toString(true); // 1
        result[1] = tmp_scale.getChord(3).toString(true); // b3
        result[2] = tmp_scale.getChord(5).toString(true); // 5
        tmp_scale = new TonalKey(this.root, "major", this.bFlat);
        result.push(tmp_scale.getChord(7).toString(true)); // 7
        break;
      }
    }
    return result;
  }

  /*
  	return string representation (C, Cmin, Cdim...)
  */
  toString(bRawNote = false) {
    if (bRawNote) {
      return this.getRoot(this.bFlat).toLowerCase();
    } else {
      var tmp = this.getRoot();
      tmp = tmp.substring(0, 1).toUpperCase() + tmp.substring(1);
 		
			if (!this.bQuads) {
				switch (this.type) {
					case "minor": {
						tmp = tmp + "m";
						break;
					}
					case "diminished": {
						tmp = tmp + "°"
						break;
					}
					case "augmented": {
						tmp = tmp + "+"
						break;
					}
				}
			} else {
				switch(this.type7) {
					case "maj7":
					case "minmaj7": {
						tmp = tmp + "<sup>" + this.type7 + "</sup>";
						break;
					}
					case "min7": {
						tmp = tmp + "m<sup>7</sup>";
						break;
					}
					case "dom7": {
						tmp = tmp + "<sup>7</sup>";
						break;
					}
					case "7b5": {
						tmp = tmp + "m<sup>7b5</sup>";
						break;
					}
				}
			}
			
			return tmp;
    }

    return null;
  }

}


class TonalKey {

  constructor(root = "c", mode = "ionian", bFlat = false, bQuads = false) {
		
		var tone_names = null;
		if (bFlat) {
			tone_names = TonalKey.tone_names_flat;
		} else {
			tone_names = TonalKey.tone_names;

		}

		this.chords = [];
		this.root = root;
    this.mode = mode.toLowerCase();
    this.iMode = TonalKey.modes[this.mode];
		this.bFlat = bFlat;
		this.bQuads = bQuads;
		this.iRoot = tone_names.indexOf(root.toLowerCase());		
    
    var tmp = [];
    for (var i = 0; i < TonalKey.key_levels.length; i++) {
      // build triad
			tmp = new TonalChord(
        tone_names[(this.iRoot - TonalKey.key_levels[this.iMode].from_root + TonalKey.key_levels[i].from_root + 12) % 12],
        i,
        TonalKey.key_levels[i].type,
				TonalKey.key_levels[i].type7,
				this.bFlat,
				this.bQuads
      );
      this.chords[(i - this.iMode + 7) % 7] = tmp;
    }
  }

  static createMajorKey(root, bFlat = false, bQuads = false) {
    return (new TonalKey(root, "ionian", bFlat, bQuads));
  }

  static createMinorKey(root, bFlat = false, bQuads = false) {
    return (new TonalKey(root, "aeolian", bFlat, bQuads));
  }

  /*
  	return string representation
  */
  toString() {
    var result = [];
    for (var i = 0; i < this.chords.length; i++) {
      result.push(this.chords[i].toString(this.bFlat));
    }
    return result.join(" ");
  }

  /*
  	returns chord of level %iLevel
  */
  getChord(iLevel) {
    return this.chords[(iLevel - 1) % 7];
  }

	/*
		returns level if tone is in key; -1 otherwise
	*/
	isToneInKey(tone) {
		for(var i=0; i < 7; i++) {
			if (this.chords[i].getRoot() == tone.toLowerCase()) return (i+1);
		}
		return -1;
	}

  /*
  	return secondary dominant (e.g. V of ii)
  */
  secondaryDominant(iLevel) {
    var tmp_chord = this.getChord(iLevel);
    var tmp_scale = new TonalKey(tmp_chord.root, "major", this.bFlat, this.bQuads);
    var secondaryDominant = tmp_scale.getChord(5);
    return secondaryDominant;
  }

  /*
  	return parallel chord (Cmaj => Cmin)
  */
  parallelChord(iLevel) {
    var tmp_chord = this.getChord(iLevel);
    switch (tmp_chord.type) {
      case "major": {
        tmp_chord.type = "minor";
        return tmp_chord;
      }
      case "minor": {
        tmp_chord.type = "major";
        return tmp_chord;
      }
    }

    return tmp_chord;
  }

  /*
  	return relative key
     - relative keys share same SIGNATURE
     - example: C Major = A Minor = G Mixolydian = D Dorian
  */
  relativeKey() {
    return (
    	new TonalKey(
      	(this.root + 5) % 7,
        TonalKey.modes[(this.iMode + 5) % 7],
        this.bFlat
			)
		);
  }
	
	/*
  	return parallel key (Cmaj => Cmin)
     - parallel keys share same TONIC
     - example: D Major = D Minor = D Dorian = D Mixolydian
  */
  parallelKey() {
    switch(this.mode) {
      case "major":
      case "ionian":
      	return (new TonalKey(this.root, "minor", this.bFlat, this.bQuads));
      case "minor":
      case "aeolian":
        return (new TonalKey(this.root, "major", this.bFlat, this.bQuads));
      default:
        return null;
    }
  }

}

/*
	STATIC PROPERTIES
*/
tunings = {
	"e-std": ["e", "a", "d", "g", "b", "e"],
	"drop-d": ["d", "a", "d", "g", "b", "e"],
	"d-std": ["d", "g", "c", "f", "a", "d"],
	"drop-c": ["c", "g", "c", "f", "a", "d"],
  "c-std": ["c", "f", "a#", "d#", "g", "c"]
}

TonalKey.tone_names = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
TonalKey.tone_names_flat = ["c", "db", "d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "b"];
TonalKey.modes = {
	"major": 0,
  "minor": 5,
  "ionian": 0,
  "dorian": 1,
  "phrygian": 2,
  "lydian": 3,
  "mixolydian": 4,
  "aeolian": 5,
  "locrian": 6
};
TonalKey.key_levels = [
  {
    "from_root": 0,
    "type": "major",
    "type7": "maj7"
  }, // 1
  {
    "from_root": 2,
    "type": "minor",
    "type7": "min7"
  }, // 2
  {
    "from_root": 4,
    "type": "minor",
    "type7": "min7"
  }, // 3 (major third)
  {
    "from_root": 5,
    "type": "major",
    "type7": "maj7"
  }, // 4
  {
    "from_root": 7,
    "type": "major",
    "type7": "dom7"
  }, // 5
  {
    "from_root": 9,
    "type": "minor",
    "type7": "min7"
  }, // 6
  {
    "from_root": 11,
    "type": "diminished",
    "type7": "7b5"
  } // 7
];


function showKey() {
	// fetch selected values
	var e1 = document.getElementById("select_root");
	var e2 = document.getElementById("select_mode");
	var e3 = document.getElementById("select_flat");
	var e4 = document.getElementById("select_quads");
	var root = e1.options[e1.selectedIndex].value;
	var mode = e2.options[e2.selectedIndex].value;
	var bFlat = (e3.options[e3.selectedIndex].value == "flat");
	var bQuads = (e4.options[e4.selectedIndex].value == "quads");

	// create key
	var key = new TonalKey(root, mode, bFlat, bQuads);
	var chord = null;
	
	// create parallel key
	var parallel_key = key.parallelKey();
	var parallel_key_chord = null;

	// iterate over all 7 intervals
	for (var i = 1; i < 8; i++) {
		e1 = document.getElementById("level_" + i);
		e2 = document.getElementById("chord_" + i);
		chord = key.getChord(i);

		//
    // 1st row: this key
    //
		switch (chord.type) {
			case "major": {
				e1.innerHTML = e1.innerHTML.toUpperCase();
				e2.innerHTML = chord.toString();
				break;
			}
			case "minor":
			case "diminished": {
				e1.innerHTML = e1.innerHTML.toLowerCase();
				e2.innerHTML = chord.toString();
				break;
			}
		}

		//
    // 2nd row: Parallel Key
    //
		e1 = document.getElementById("par_key_chord_" + i);
    e1.className = " ";
    e1.innerHTML = "-";
		if (parallel_key != null) {
			parallel_key_chord = parallel_key.getChord(i);
			if (chord.getRoot() != parallel_key_chord.getRoot()) {
				e1.className += " bold mark-red";
			}
			e1.innerHTML = parallel_key_chord.toString();
		}

		//
    // 3rd row: Parallel Chord
    //
		document.getElementById("par_chord_" + i).innerHTML = key.parallelChord(i).toString();
		
    //
    // 4th row: Secondary Dominants
    //
    if (i > 1 && i < 7) {
    	document.getElementById("secdom_" + i).innerHTML = key.secondaryDominant(i).toString();
    } else {
    	document.getElementById("secdom_" + i).innerHTML = "-";
    }
	}
	
  //
	// render guitar tab
	//
	e1 = document.getElementById("select_tuning");
	e2 = document.getElementById("select_progression");
	var tuning = tunings[e1.options[e1.selectedIndex].value];
	var progression = e2.options[e2.selectedIndex].value.split("-");
	
	var tone_names = null;
	if (bFlat) tone_names = TonalKey.tone_names_flat;
	else tone_names = TonalKey.tone_names;

	for(var iString=0; iString < 3; iString++) {
		// fetch string root note
		var iStringRoot = tone_names.indexOf(tuning[iString].toLowerCase());

		// iterate over frets per string and print only tones in key
		for(var iFret=0; iFret < 13; iFret++) {
			e1 = document.getElementById("string" + (6-iString) + "_" + iFret);
			tone = tone_names[(iStringRoot + iFret) % 12];
			level = key.isToneInKey(tone);
			
			// reset cell
			e1.innerHTML = "";
			e1.className = "fret" + iFret.toString();
			
			// fill cell if criteria are met (tone in key or fret=0)
			if (iFret == 0 || level != -1) {
				e1.innerHTML = tone.substring(0, 1).toUpperCase() + tone.substring(1);
				if (level != -1) {
					e1.innerHTML += "<sup>" + level + "<sup>";
				} else {
					e1.className += " italic";
				}
				if (progression.includes(level.toString())) {
					e1.className += " bold color-red";
				}
			}
		}
	}
	
}


function populateRootNotes() {
	var e1 = document.getElementById("select_root");
	var e2 = document.getElementById("select_flat");
	
	// remember selected item
	previousSelection = e1.selectedIndex;
	
	// clear previous options
	e1.options.length = 0;
	
	// add options
	var tone_names = null;
	if ((e2.options[e2.selectedIndex].value == "flat")) tone_names = TonalKey.tone_names_flat;
	else tone_names = TonalKey.tone_names;
	
	for (var i = 0; i < tone_names	.length; i++) {
		var opt = document.createElement("option");
		opt.value = tone_names[i];
		opt.innerHTML = tone_names[i].substring(0, 1).toUpperCase() + tone_names[i].substring(1);
		e1.appendChild(opt);
	}
	
	// reset selection to previous selected item
	if (previousSelection > -1) e1.selectedIndex = previousSelection;
}



// populate root notes
populateRootNotes();

// show initial key
showKey();
