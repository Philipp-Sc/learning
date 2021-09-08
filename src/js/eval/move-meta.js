const cols = ["a","b","c","d","e","f","g","h"];

export const move_meta_keys = [
		    "{fig} Pawn {white}",
			"{fig} Pawn {black}",
			"{fig} Bishop {white}",
			"{fig} Bishop {black}",
			"{fig} Knight {white}",
			"{fig} Knight {black}",
			"{fig} Rook {white}",
			"{fig} Rook {black}",
			"{fig} Queen {white}",
			"{fig} Queen {black}",
			"{fig} King {white}",
			"{fig} King {black}", 
			"{capture} Px {white}",
			"{capture} px {black}",
			"{capture} Bx {white}",
			"{capture} bx {black}",
			"{capture} Nx {white}",
			"{capture} nx {black}",
			"{capture} Qx {white}",
			"{capture} qx {black}",
			"{capture} Rx {white}",
			"{capture} rx {black}",
			"{capture} Kx {white}",
			"{capture} kx {black}",  
			"{castle} 0-0 {white}",
			"{castle} 0-0 {black}", 
			"{castle} 0-0-0 {white}",
			"{castle} 0-0-0 {black}",
			"move to file A",
			"move to rank 1",
			"move to file B",
			"move to rank 2",
			"move to file C",
			"move to rank 3",
			"move to file D",
			"move to rank 4",
			"move to file E",
			"move to rank 5",
			"move to file F",
			"move to rank 6",
			"move to file G",
			"move to rank 7",
			"move to file H",
			"move to rank 8",
			]

			// change move to rank into 8 seperate features
			// same with move to file.

 			// possibly add:
			// move from file (A,B,C,D,E,F,G,H) 
			// move from rank (1,2,3,4,5,6,7,8)

export function filterPieces(playerColor,e){
	if(playerColor=="white"){
		return e=='P' || e=='B' || e=='N' || e=='R' || e=='Q';
	}else if(playerColor=="black"){
		return e=='p' || e=='b' || e=='n' || e=='r' || e=='q';
	}else{
		return e=='p' || e=='b' || e=='n' || e=='r' || e=='q' || e=='P' || e=='B' || e=='N' || e=='R' || e=='Q';
	}
}

export function getColorOfMove(last_move){
	if(last_move.turn){
		return last_move.turn;
	}else{
		return last_move.color;
	}
}

function getNotationOfMove(last_move){
	if(last_move.notation){
		return last_move.notation.notation;
		/* {
	    "moveNumber": 1,
	    "notation": {
	        "fig": null,
	        "strike": null,
	        "col": "d",
	        "row": "4",
	        "check": null,
	        "promotion": null,
	        "notation": "d4"
	    },
	    "commentAfter": "+0.00/1 0s",
	    "variations": [],
	    "nag": null,
	    "commentDiag": {
	        "comment": "+0.00/1 0s"
	    },
	    "turn": "w"
		}*/
	}else{
		return last_move.san; //  { color: 'b', from: 'e5', to: 'f4', flags: 'c', piece: 'p', captured: 'p', san: 'exf4' }
	}
}

function getRowOfMoveTo(last_move){
	if(last_move.notation){
		var result = parseInt(last_move.notation.row);
	}else{
		var result = parseInt(last_move.to.split("")[1]);
	}
	return isNaN(result) ? -1 : result;
}

function getColOfMoveTo(last_move){
	if(last_move.notation){
		var result = cols.indexOf(last_move.notation.col);
	}else{
		var result = cols.indexOf(last_move.to.split("")[0]);
	}
	return isNaN(result) ? -1 : result;
}

function getFigureOfMove(last_move){
	if(last_move.notation){
		return last_move.notation.fig;
	}else{
		if(last_move.piece=="p"){
			return null;
		}
		return last_move.piece.toUpperCase() 
	}
}

export function get_move_meta(last_move,onlyVector){

	var color_of_move = getColorOfMove(last_move);
	var color_of_move_w = color_of_move=="w";
	var color_of_move_b = !color_of_move_w;
	var notation_of_move = getNotationOfMove(last_move);
	var notation_of_move_lower = notation_of_move.toLowerCase();
	var figure_of_move = getFigureOfMove(last_move);
	var notation_of_move_includes_x = notation_of_move.includes('x');
	var notation_of_move_is_upper = notation_of_move_lower != notation_of_move

	var file =  getColOfMoveTo(last_move);
    var rank =  getRowOfMoveTo(last_move);

	var vector = [
      (color_of_move_w && !notation_of_move_includes_x && !notation_of_move_is_upper && figure_of_move==null)  ? 1 : 0,
      (color_of_move_b && !notation_of_move_includes_x && !notation_of_move_is_upper && figure_of_move==null)  ? 1 : 0,
      (color_of_move_w && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="B")  ? 1 : 0,
      (color_of_move_b && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="B")  ? 1 : 0,
      (color_of_move_w && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="N")  ? 1 : 0,
      (color_of_move_b && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="N")  ? 1 : 0,
      (color_of_move_w && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="R")  ? 1 : 0,
      (color_of_move_b && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="R")  ? 1 : 0,
      (color_of_move_w && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="Q")  ? 1 : 0,
      (color_of_move_b && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="Q")  ? 1 : 0,
      (color_of_move_w && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="K")  ? 1 : 0,
      (color_of_move_b && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="K")  ? 1 : 0, 
      (color_of_move_w && notation_of_move_includes_x && !notation_of_move_is_upper && figure_of_move==null)  ? 1 : 0,
      (color_of_move_b && notation_of_move_includes_x && !notation_of_move_is_upper && figure_of_move==null)  ? 1 : 0,
      (color_of_move_w && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="B")  ? 1 : 0,
      (color_of_move_b && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="B")  ? 1 : 0,
      (color_of_move_w && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="N")  ? 1 : 0,
      (color_of_move_b && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="N")  ? 1 : 0,
      (color_of_move_w && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="Q")  ? 1 : 0,
      (color_of_move_b && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="Q")  ? 1 : 0,
      (color_of_move_w && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="R")  ? 1 : 0,
      (color_of_move_b && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="R")  ? 1 : 0,
      (color_of_move_w && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="K")  ? 1 : 0,
      (color_of_move_b && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="K")  ? 1 : 0,  
      (color_of_move_w && notation_of_move=="O-O")  ? 1 : 0,
      (color_of_move_b && notation_of_move=="O-O")  ? 1 : 0, 
      (color_of_move_w && notation_of_move=="O-O-O")  ? 1 : 0,
      (color_of_move_b && notation_of_move=="O-O-O")  ? 1 : 0,
      file==1 ? 1 : 0,
      rank==1 ? 1 : 0,
      file==2 ? 1 : 0,
      rank==2 ? 1 : 0,
      file==3 ? 1 : 0,
      rank==3 ? 1 : 0,
      file==4 ? 1 : 0,
      rank==4 ? 1 : 0,
      file==5 ? 1 : 0,
      rank==5 ? 1 : 0,
      file==6 ? 1 : 0,
      rank==6 ? 1 : 0,
      file==7 ? 1 : 0,
      rank==7 ? 1 : 0,
      file==8 ? 1 : 0,
      rank==8 ? 1 : 0,                
	]

		if(onlyVector) return vector;

	  var dict = {}
	  vector.forEach((e,i) => {dict[move_meta_keys[i]]=e})
	  return dict; 
	
}