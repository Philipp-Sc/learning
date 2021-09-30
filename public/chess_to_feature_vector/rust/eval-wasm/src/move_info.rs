use crate::history::history_move::{Move, get_pieces};

fn get_keys_info() -> Vec<String> { 
	let pieces = get_pieces();
	let actions = ["Move", "Capture"];
	let king_only_actions = ["0-0", "0-0-0"];

	let mut keys: Vec<String> = Vec::new();
	keys.push("Color of last move".to_string());
 
	for piece in pieces {
		for action in actions {
			keys.push([piece, action].join(", "));
		}
		if piece == "King" {
			for king_only_action in king_only_actions{
				keys.push([piece, king_only_action].join(", "));
			}
		}
	} 
	keys
}

pub fn get_keys() -> Vec<String> {
	let res = get_keys_info();
	/*let mut a = get_keys_info();
	for i in 1..a.len() {
		a[i] = "White History, ".to_string()+&a[i];
	}
	let mut b = get_keys_info();
	for i in 1..b.len() {
		b[i] = "Black History, ".to_string()+&b[i];
	}
    res.append(&mut a);  
    res.append(&mut b);  */
    res 

} 

pub fn get_feature_vector(history: Vec<Move>) -> Vec<u8> {

	let last_move: &Move = history.last().unwrap();
	let res = get_move_info(last_move);
	//let mut a = get_move_history(history,last_move);

    //res.append(&mut a);  
    res 
}
/*
fn get_move_history(history: Vec<Move>, last_move: &Move) -> Vec<u8> { 

	// how many pawn moves so far
	// how many non pawn moves so far
	// how many king moves so far

	let mut move_history_white: Vec<u8> = get_move_info(&history[0]);
	let mut move_history_black: Vec<u8> = Vec::new();
	for _ in 0..move_history_white.len() {
		move_history_black.push(0u8);
	}
	if history.len()>1 {
		move_history_black = get_move_info(&history[1]); 
	}
	for i in 2..history.len() {
		let res = get_move_info(&history[i]);
		for x in 0..res.len() {
			if i % 2 == 0 {
				move_history_white[x] += res[x];
			}else{
				move_history_black[x] += res[x];
			}
		}
	} 
	move_history_white.remove(0);
	move_history_black.remove(0);
	move_history_white.append(&mut move_history_black);
	move_history_white
}*/

fn get_move_info(last_move: &Move) -> Vec<u8> {

	let mut res: Vec<u8> = Vec::new();
    res.push(if last_move.color=="w" {0} else {1} as u8);
    res.push(if last_move.piece=="p" {1} else {0} as u8);
    res.push(if last_move.piece=="p" && last_move.san.contains("x") {1} else {0} as u8);
    res.push(if last_move.piece=="b" {1} else {0} as u8);
    res.push(if last_move.piece=="b" && last_move.san.contains("x") {1} else {0} as u8);
    res.push(if last_move.piece=="n" {1} else {0} as u8);
    res.push(if last_move.piece=="n" && last_move.san.contains("x") {1} else {0} as u8);
    res.push(if last_move.piece=="r" {1} else {0} as u8);
    res.push(if last_move.piece=="r" && last_move.san.contains("x") {1} else {0} as u8);
    res.push(if last_move.piece=="q" {1} else {0} as u8);
    res.push(if last_move.piece=="q" && last_move.san.contains("x") {1} else {0} as u8);
    res.push(if last_move.piece=="k" {1} else {0} as u8);
    res.push(if last_move.piece=="k" && last_move.san.contains("x") {1} else {0} as u8);
    res.push(if last_move.piece=="k" && last_move.flags=="k" {1} else {0} as u8);
    res.push(if last_move.piece=="k" && last_move.flags=="q" {1} else {0} as u8);

    /*
    let alphabet = get_alphabet();

    for i in 1..9 {
    	res.push(if last_move.to.to_uppercase().contains(alphabet[(i-1) as usize]) {1} else {0} as u8);
    	res.push(if last_move.to.contains(&i.to_string()) {1} else {0} as u8);
    }
    for i in 1..9 {
    	res.push(if last_move.from.to_uppercase().contains(alphabet[(i-1) as usize]) {1} else {0} as u8);
    	res.push(if last_move.from.contains(&i.to_string()) {1} else {0} as u8);
    }
    */
    res
}