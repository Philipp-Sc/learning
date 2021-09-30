use chess::{Board, Square, Color, Piece,get_file, File};

use std::str::FromStr;

macro_rules! vec_of_strings {
    ($($x:expr),*) => (vec![$($x.to_string()),*]);
}
 
pub fn get_keys() -> Vec<String> { 
   		vec_of_strings![ 
		"Open A File",
		"Half-Open A File {white}",
		"Half-Open A File {black}",
		"Open B File",
		"Half-Open B File {white}",
		"Half-Open B File {black}",
		"Open C File",
		"Half-Open C File {white}",
		"Half-Open C File {black}",
		"Open D File",
		"Half-Open D File {white}",
		"Half-Open D File {black}",
		"Open E File",
		"Half-Open E File {white}",
		"Half-Open E File {black}",
		"Open F File",
		"Half-Open F File {white}",
		"Half-Open F File {black}",
		"Open G File",
		"Half-Open G File {white}",
		"Half-Open G File {black}",
		"Open H File",  
		"Half-Open H File {white}",
		"Half-Open H File {black}",
		"Double Pawns {white}",
		"Double Pawns {black}",
		"Isolated Pawns {white}",
		"Isolated Pawns {black}",
		"King Side Pawn Majority {white}",
		"Queen Side Pawn Majority {white}",
		"King Side Pawn Majority {black}",
		"Queen Side Pawn Majority {black}",
		"Median advanced pawn {white}",
		"Furthest advanced pawn {white}",
		"Least advanced pawn {white}",
		"Median advanced pawn {black}",
		"Furthest advanced pawn {black}",
		"Least advanced pawn {black}",
		"Fianchetto Queen Side {white}", 
		"Fianchetto King Side {white}",
		"Fianchetto Queen Side {black}",
		"Fianchetto King Side {black}",
		"Pawn Structure Closest Match",  
		"Pawn Structure Closest Match Count",  
		"Pawn On A3",
		"Pawn On A4",
		"Pawn On A5",
		"Pawn On A6", 
		"Pawn On H3",
		"Pawn On H4",
		"Pawn On H5",
		"Pawn On H6",
		"Count Pawns On White Squares {white}",
		"Count Pawns On Black Squares {white}",
		"Count Pawns On White Squares {black}",
		"Count Pawns On Black Squares {black}"]
}

pub fn get_pawn_structure_list() -> Vec<String> {

	vec_of_strings![
						"4k3/pp3ppp/2p1p3/8/3P4/8/PPP2PPP/4K3 w - - 0 1", // 8/pp3ppp/2p1p3/8/3P4/8/PPP2PPP/8
						"4k3/pp3ppp/2p1p3/8/3P4/4P3/PP3PPP/4K3 w - - 0 1",
						"4k3/pp3ppp/3pp3/8/4P3/8/PPP2PPP/4K3 w - - 0 1",
						"4k3/pp2pp1p/3p2p1/8/4P3/8/PPP2PPP/4K3 w - - 0 1",
						"4k3/pp3ppp/3p4/4p3/4P3/8/PPP2PPP/4K3 w - - 0 1",
						"4k3/pp2pppp/3p4/8/2P1P3/8/PP3PPP/4K3 w - - 0 1",
						"4k3/pp1p1ppp/4p3/8/2P1P3/8/PP3PPP/4K3 w - - 0 1",
						"4k3/5ppp/pp1pp3/8/2P1P3/8/PP3PPP/4K3 w - - 0 1",
						"4k3/pp3ppp/2p5/4p3/2P1P3/8/PP3PPP/4K3 w - - 0 1",
						"4k3/pp3ppp/2pp4/8/2P1P3/8/PP3PPP/4K3 w - - 0 1",
						"4k3/ppp2ppp/3p4/3Pp3/4P3/8/PPP2PPP/4K3 w - - 0 1",
						"4k3/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/4K3 w - - 0 1",
						"4k3/ppp2ppp/8/8/3P4/8/PP3PPP/4K3 w - - 0 1",
						"4k3/pp3ppp/4p3/8/3P4/8/PP3PPP/4K3 w - - 0 1",
						"4k3/pp3ppp/4p3/8/2PP4/8/P4PPP/4K3 w - - 0 1",
						"4k3/pp3ppp/2p5/3p4/3P4/4P3/PP3PPP/4K3 w - - 0 1",
						"4k3/pp3ppp/4p3/2Pp4/3P4/8/PP3PPP/4K3 w - - 0 1",
						"4k3/ppp2pp/4p3/3p1p2/3P1P2/4P3/PPP3PP/4K3 w - - 0 1",
						"4k3/pp3ppp/3p4/2p1p3/2P1P3/3P4/PP3PPP/4K3 w - - 0 1",
						"4k3/pp2pppp/3p4/2p5/4P3/3P4/PPP2PPP/4K3 w - - 0 1"]
}

pub fn get_feature_vector(board: Board) -> Vec<u8> {

   	let fianchetto_squares = [[8,17,10],[13,22,15],[48,41,50],[53,46,55]];
	let mut fianchettoes: Vec<u8> = Vec::new();
	for squares in fianchetto_squares {
		let mut is_fianchetto = 0;
		for x in squares {
			if board.piece_on(unsafe {Square::new(x)})==Some(Piece::Pawn) { // WARNING: not considering color, becaues it is to unlikely to matter
				is_fianchetto += 1;
			}
		}
		fianchettoes.push(if is_fianchetto==3 {1} else {0});
	}

	let mut rim_squares = vec![16,24,32,40,23,31,39,47];
	for x in 0..rim_squares.len() {
		if board.piece_on(unsafe {Square::new(rim_squares[x])})==Some(Piece::Pawn) {
			rim_squares[x] = 1;
		}else{
			rim_squares[x] = 0;
		}
	}

    let mut count_pawns_on_file: Vec<(u8,u8,u8)> = Vec::new();  

	let mut count_white_double_pawns = 0;
	let mut count_black_double_pawns = 0;

	let mut white_pawns_white_squares = 0;
	let mut white_pawns_black_squares = 0;
	let mut black_pawns_white_squares = 0;
	let mut black_pawns_black_squares = 0;

	let mut white_king_side_pawns = 0;
	let mut black_king_side_pawns = 0;
	let mut white_queen_side_pawns = 0;
	let mut black_queen_side_pawns = 0;

	let mut white_pawn_ranks: Vec<u8> = Vec::new();
	let mut black_pawn_ranks: Vec<u8> = Vec::new();


	let mut pawn_structure: Vec<(usize,bool)> = Vec::new();

    let mut res: Vec<u8> = Vec::new(); 

	for x in 0..8 {
		let mut pawns_on_file = 0;
		let mut white_pawns_on_file = 0;
		let mut black_pawns_on_file = 0;

		for sq in get_file(File::from_index(x)) {
			if board.piece_on(sq)==Some(Piece::Pawn) {
				pawns_on_file +=  1; 
				if board.color_on(sq)==Some(Color::White) {
					pawn_structure.push((sq.to_index(),true));

					if sq.to_index() % 2 == 0 {
						white_pawns_black_squares += 1;

					}else{
					    white_pawns_white_squares += 1;
					}
					white_pawns_on_file +=1;
					white_pawn_ranks.push(sq.get_rank().to_index() as u8);
				}else {
					pawn_structure.push((sq.to_index(),false));

					if sq.to_index() % 2 == 0 {
						black_pawns_black_squares += 1;

					}else{
					    black_pawns_white_squares += 1;
					}
					black_pawns_on_file +=1;
					black_pawn_ranks.push(7-sq.get_rank().to_index() as u8);
				}
			}
		} 
 
		if x >= 4 { // king side
			white_king_side_pawns += white_pawns_on_file;
			black_king_side_pawns += black_pawns_on_file;
		}else {
			white_queen_side_pawns += white_pawns_on_file;
			black_queen_side_pawns += black_pawns_on_file;
		}

		count_white_double_pawns += if white_pawns_on_file>=2 {1} else {0};
		count_black_double_pawns += if black_pawns_on_file>=2 {1} else {0};

		count_pawns_on_file.push((pawns_on_file,white_pawns_on_file,black_pawns_on_file));
		res.push(if pawns_on_file==0 {1} else {0}); 
		res.push(if pawns_on_file!=0 && white_pawns_on_file==0 {1} else {0}); 
		res.push(if pawns_on_file!=0 && black_pawns_on_file==0 {1} else {0});
	}
  
  	res.push(count_white_double_pawns);
  	res.push(count_black_double_pawns);

  	let isolated_pawns = get_count_isolated_pawns(count_pawns_on_file);
  	res.push(isolated_pawns.0);
  	res.push(isolated_pawns.1);

  	res.push(if white_king_side_pawns > white_queen_side_pawns {1} else {0});
  	res.push(if white_king_side_pawns < white_queen_side_pawns {1} else {0});
  	res.push(if black_king_side_pawns > black_queen_side_pawns {1} else {0});
  	res.push(if black_king_side_pawns < black_queen_side_pawns {1} else {0});

  	white_pawn_ranks.sort();
  	black_pawn_ranks.sort();

  	if white_pawn_ranks.len() > 0 {
	  	res.push(white_pawn_ranks[white_pawn_ranks.len() / 2]);
	  	res.push(*white_pawn_ranks.iter().max().unwrap());
	  	res.push(*white_pawn_ranks.iter().min().unwrap()); 		
  	}else{
  		res.push(0);
  		res.push(0);
  		res.push(0);
  	}
  	if black_pawn_ranks.len()>0 {
	  	res.push(black_pawn_ranks[black_pawn_ranks.len() / 2]);
	  	res.push(*black_pawn_ranks.iter().max().unwrap());
	  	res.push(*black_pawn_ranks.iter().min().unwrap());
  	}else{
  		res.push(0);
  		res.push(0);
  		res.push(0);
  	}


  	res.append(&mut fianchettoes);

  	//pawn_structure.sort_by_key(|k| k.0);
  	let mut score_list: Vec<(u8,u8)> = Vec::new();
  	for pawn_structure_fen in get_pawn_structure_list() {
  		let pawn_structure_board = Board::from_str(&pawn_structure_fen).unwrap(); 
  		let mut score = 0;
  		for sq in *pawn_structure_board.combined() {
  			let item = (sq.to_index(),pawn_structure_board.color_on(sq)==Some(Color::White));
  			if pawn_structure.iter().any(|&i| i.0==item.0 && i.1==item.1) {
  				score += 1;
  			}
  		}
  		score_list.push((score,score_list.len() as u8));
  	}
  	score_list.sort_by_key(|k| k.0);
  	res.push(score_list[0].1);
  	res.push(score_list[0].0);

  	res.append(&mut rim_squares);

  	res.push(white_pawns_white_squares);
  	res.push(white_pawns_black_squares);
  	res.push(black_pawns_white_squares);
  	res.push(black_pawns_black_squares);
 
	res
}
  

fn get_count_isolated_pawns(count_pawns_on_file: Vec<(u8,u8,u8)>) -> (u8,u8) {

    let mut res: Vec<(u8,u8)> = Vec::new(); 

    if count_pawns_on_file[0].0==0 || count_pawns_on_file[1].0!=0 {
    	res.push((0,0));
    }else{
	    let mut white_pawns = 0;
	    let mut black_pawns = 0;
	    if count_pawns_on_file[0].1!=0 && count_pawns_on_file[1].1==0 {
	    	white_pawns = 1;
	    }
	    if count_pawns_on_file[0].2!=0 && count_pawns_on_file[1].2==0 {
	    	black_pawns = 1;
	    }
	    res.push((white_pawns,black_pawns));
	}

	for i in 1..7 {
		if count_pawns_on_file[i].0!=0 {
		    let mut white_pawns = 0;
		    let mut black_pawns = 0;
			if count_pawns_on_file[i-1].1==0 && count_pawns_on_file[i+1].1==0 {
				white_pawns = 1;
			}
			if count_pawns_on_file[i-1].2==0 && count_pawns_on_file[i+1].2==0 {
				black_pawns = 1;
			}
			res.push((white_pawns,black_pawns));

		}else{
			res.push((0,0));
		}
	}

	if count_pawns_on_file[7].0==0 || count_pawns_on_file[6].0!=0 {
    	res.push((0,0));
    }else{
	    let mut white_pawns = 0;
	    let mut black_pawns = 0;
	    if count_pawns_on_file[7].1!=0 && count_pawns_on_file[6].1==0 {
	    	white_pawns = 1;
	    }
	    if count_pawns_on_file[7].2!=0 && count_pawns_on_file[6].2==0 {
	    	black_pawns = 1;
	    }
	    res.push((white_pawns,black_pawns));
	}

	let mut white_isolated_pawns = 0;
	let mut black_isolated_pawns = 0;
	for x in res {
		white_isolated_pawns += x.0;
		black_isolated_pawns += x.1;
	}
	(white_isolated_pawns,black_isolated_pawns)


}