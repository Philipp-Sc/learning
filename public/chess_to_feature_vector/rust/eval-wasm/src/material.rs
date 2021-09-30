use chess::{Board}; 


use crate::history::history_move::{get_all_pieces_short};
 
pub fn get_keys() -> Vec<String> { 

	let pieces = get_all_pieces_short();  

	let mut keys: Vec<String> = Vec::new();
 
	for piece in pieces {
		if piece!="k" && piece!="K" { 
			keys.push([piece, "count"].join(", ")); 
		}
	} 
	keys.push("B > n".to_string());
	keys.push("N > b".to_string());
	keys.push("B == N".to_string());
	keys.push("P == p".to_string());
	keys.push("b > N".to_string());
	keys.push("n > B".to_string());
	keys.push("b == n".to_string());	 
	keys
}

pub fn get_feature_vector(board: Board) -> Vec<u8> {

	let mut fen = board.to_string();
	fen = fen.splitn(2," ").next().unwrap().to_string();

 	let mut res: Vec<u8> = Vec::new();

 	let all_pieces = get_all_pieces_short();

 	for piece in all_pieces {
 		res.push(fen.matches(piece).count() as u8);
 	}

 	let index_white_bishop = all_pieces.iter().position(|&r| r == "B").unwrap();
 	let index_knight = all_pieces.iter().position(|&r| r == "n").unwrap();

 	res.push(if res[index_white_bishop]>res[index_knight] {1} else {0} as u8);

 	let index_white_knight = all_pieces.iter().position(|&r| r == "N").unwrap();
 	let index_bishop = all_pieces.iter().position(|&r| r == "b").unwrap();

 	res.push(if res[index_white_knight]>res[index_bishop] {1} else {0} as u8);
 	res.push(if res[index_white_bishop]==res[index_white_knight] {1} else {0} as u8);

 	let index_white_pawn = all_pieces.iter().position(|&r| r == "P").unwrap();
 	let index_pawn = all_pieces.iter().position(|&r| r == "p").unwrap();

 	res.push(if res[index_white_pawn]==res[index_pawn] {1} else {0} as u8);
 	res.push(if res[index_bishop]>res[index_white_knight] {1} else {0} as u8);
 	res.push(if res[index_knight]>res[index_white_bishop] {1} else {0} as u8);
 	res.push(if res[index_bishop]==res[index_knight] {1} else {0} as u8);
    res
}

