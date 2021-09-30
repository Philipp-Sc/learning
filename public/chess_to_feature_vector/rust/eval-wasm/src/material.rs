use chess::{Board}; 

 
pub fn get_keys() -> Vec<String> { 

//	let pieces = get_all_pieces_short();  

	let mut keys: Vec<String> = Vec::new();
 /*
	for piece in pieces {
		if piece!="k" && piece!="K" { 
			keys.push([piece, "count"].join(" ")); 
		}
	} */
	keys.push("p count".to_string());
	keys.push("P count".to_string());

	keys.push("b count".to_string());
	keys.push("B count".to_string());

	keys.push("n count".to_string());
	keys.push("N count".to_string());

	keys.push("r count".to_string());
	keys.push("R count".to_string());

	keys.push("q count".to_string());
	keys.push("Q count".to_string());

	keys.push("B > n".to_string());
	keys.push("N > b".to_string());
	keys.push("B == N".to_string());
	keys.push("P == p".to_string());
	keys.push("b > N".to_string());
	keys.push("n > B".to_string());
	keys.push("b == n".to_string());	 
	keys
}

#[allow(non_snake_case)]
pub fn get_feature_vector(board: Board) -> Vec<u8> {

	let mut fen = board.to_string();
	fen = fen.splitn(2," ").next().unwrap().to_string();

 	let mut res: Vec<u8> = Vec::new();

 	//let all_pieces = get_all_pieces_short(); // ["p", "b", "n", "r", "q", "k","P", "B", "N", "R", "Q", "K"]

 	let piece_p = fen.matches("p").count() as u8;
 	let piece_P = fen.matches("P").count() as u8;

 	let piece_b = fen.matches("b").count() as u8;
 	let piece_B = fen.matches("B").count() as u8;

 	let piece_n = fen.matches("n").count() as u8;
 	let piece_N = fen.matches("N").count() as u8;

 	let piece_r = fen.matches("r").count() as u8;
 	let piece_R = fen.matches("R").count() as u8;

 	let piece_q = fen.matches("q").count() as u8;
 	let piece_Q = fen.matches("Q").count() as u8;

 	res.push(piece_p);
 	res.push(piece_P);
 	res.push(piece_b);
 	res.push(piece_B);
 	res.push(piece_n);
 	res.push(piece_N);
 	res.push(piece_r);
 	res.push(piece_R);
 	res.push(piece_q);
 	res.push(piece_Q);

 	res.push(if piece_B>piece_n {1} else {0} as u8);

 	res.push(if piece_N>piece_b {1} else {0} as u8);
 	res.push(if piece_B==piece_N {1} else {0} as u8);

 	res.push(if piece_P==piece_p {1} else {0} as u8);
 	res.push(if piece_b>piece_N {1} else {0} as u8);
 	res.push(if piece_n>piece_B {1} else {0} as u8);
 	res.push(if piece_b==piece_n {1} else {0} as u8);
    res
}

