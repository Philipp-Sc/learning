use chess::{Board, Color, Square};  

 
pub fn get_keys() -> Vec<String> { 
   
	let mut keys: Vec<String> = Vec::new();
	keys.push("Expansion Factor King Side {white}".to_string());
	keys.push("Expansion Factor King Side {black}".to_string());
	keys.push("Expansion Factor Queen Side {white}".to_string());
	keys.push("Expansion Factor Queen Side {black}".to_string());
	keys.push("Expansion Factor {white}".to_string());
	keys.push("Expansion Factor {black}".to_string()); 
	keys.push("Expansion Factor Center {white}".to_string());
	keys.push("Expansion Factor Center {black}".to_string()); 
   
	keys
}

pub fn get_feature_vector(board: Board) -> Vec<u8> {

 	let mut white_side: Vec<u8> = Vec::new();
 	let mut black_side: Vec<u8> = Vec::new();

 	let mut king_side_white: Vec<u8> = Vec::new();
 	let mut king_side_black: Vec<u8> = Vec::new();

 	let mut queen_side_white: Vec<u8> = Vec::new();
 	let mut queen_side_black: Vec<u8> = Vec::new(); 

 	let mut center_white: Vec<u8> = Vec::new(); 
 	let mut center_black: Vec<u8> = Vec::new(); 

 	for i in 0..64 {
 		let remainder = i % 8;
    	if remainder >= 2 && remainder <= 5 && i >= 16 && i <= 47 {
			if i <=31 {
				center_white.push(square_index_has_piece(i,board,Color::White));
			}else {
				center_black.push(square_index_has_piece(i,board,Color::Black));
			}
    	}
    	if remainder <= 3 {
			if i <=31 {
				queen_side_white.push(square_index_has_piece(i,board,Color::White));
			}else {
				queen_side_black.push(square_index_has_piece(i,board,Color::Black));
			}
    	}
    	if remainder >= 4 && remainder <= 7 {
			if i <=31 {
				king_side_white.push(square_index_has_piece(i,board,Color::White));
			}else {
				king_side_black.push(square_index_has_piece(i,board,Color::Black));
			}
    	}
    	if i <=31 {
			white_side.push(square_index_has_piece(i,board,Color::White));
		}else {
			black_side.push(square_index_has_piece(i,board,Color::Black));
		}
 	}  
 
 	let mut res: Vec<u8> = Vec::new();
 	res.push(calc_expansion_factor(king_side_white));
 	res.push(calc_expansion_factor(king_side_black));
 	res.push(calc_expansion_factor(queen_side_white));
 	res.push(calc_expansion_factor(queen_side_black));
 	res.push(calc_expansion_factor(white_side));
 	res.push(calc_expansion_factor(black_side));
 	res.push(calc_expansion_factor(center_white));
 	res.push(calc_expansion_factor(center_black));
    res
}

fn calc_expansion_factor(list: Vec<u8>) -> u8 {
	if list.len() > 0 { 
		let mut length = 0;
		for x in list.iter() {
			if x!=&0u8 {
				length += 1;
			}
		}
		if length==0 {
			return 0;
		}else{
			let sum: u8 = list.iter().sum::<u8>();
			let expansion_factor = 10. * (sum as f32) / (length as f32);
			return expansion_factor.round() as u8;
		}
	}else{
		return 0;
	}
}

fn square_index_has_piece(i: u8, board: Board, color: Color) -> u8 {
	let square: Square = unsafe { Square::new(i) };
	let mut rank = square.get_rank().to_index() as u8;
	if color==Color::Black {
		rank = 8 - rank;
	}

	let bb = *board.color_combined(color);

	// Iterate over each square in the bitboard
	for sq in bb {
	    if sq == square {
	    	return rank+1;
	    }
	} 
	return 0;
}
  