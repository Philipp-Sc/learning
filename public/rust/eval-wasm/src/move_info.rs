use crate::history::history_move::{Move, get_alphabet, get_pieces};

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
	let alphabet = get_alphabet();

	let dest = ["to", "from"];
	let move_dest = ["file", "rank"];

	for d in dest {
		for move_destination in move_dest {
			for x in 0..8 {
				if move_destination=="rank" {
					keys.push([d, move_destination, alphabet[x].to_string().as_str()].join(" "));
				}else {
					keys.push([d, move_destination, (x+1).to_string().as_str()].join(" "));
				}
			}
		}
	}
	keys
}

pub fn get_keys() -> Vec<String> {
	let mut res = get_keys_info();
	let mut a = get_keys_info();
	for i in 1..a.len() {
		a[i] = "White History, ".to_string()+&a[i];
	}
	let mut b = get_keys_info();
	for i in 1..b.len() {
		b[i] = "Black History, ".to_string()+&b[i];
	}
    res.append(&mut a);  
    res.append(&mut b);  
    res 

}

/*
0: "Color"
1: "Pawn, Move"
2: "Pawn, Capture"
3: "Bishop, Move"
4: "Bishop, Capture"
5: "Knight, Move"
6: "Knight, Capture"
7: "Rook, Move"
8: "Rook, Capture"
9: "Queen, Move"
10: "Queen, Capture"
11: "King, Move"
12: "King, Capture"
13: "King, 0-0"
14: "King, 0-0-0"
15: "to file 1"
16: "to file 2"
17: "to file 3"
18: "to file 4"
19: "to file 5"
20: "to file 6"
21: "to file 7"
22: "to file 8"
23: "to rank A"
24: "to rank B"
25: "to rank C"
26: "to rank D"
27: "to rank E"
28: "to rank F"
29: "to rank G"
30: "to rank H"
31: "from file 1"
32: "from file 2"
33: "from file 3"
34: "from file 4"
35: "from file 5"
36: "from file 6"
37: "from file 7"
38: "from file 8"
39: "from rank A"
40: "from rank B"
41: "from rank C"
42: "from rank D"
43: "from rank E"
44: "from rank F"
45: "from rank G"
46: "from rank H"
*/

pub fn get_feature_vector(history: Vec<Move>) -> Vec<u8> {

	let last_move: &Move = history.last().unwrap();
	let mut res = get_move_info(last_move);
	let mut a = get_move_history(history);

    res.append(&mut a);  
    res 
}

fn get_move_history(history: Vec<Move>) -> Vec<u8> { // needs to handle two colors
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
}

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
    res.push(if last_move.piece=="k" && last_move.san=="0-0" {1} else {0} as u8);
    res.push(if last_move.piece=="k" && last_move.san=="0-0-0" {1} else {0} as u8);

    let alphabet = get_alphabet();

    for i in 1..9 {
    	res.push(if last_move.to.to_uppercase().contains(alphabet[(i-1) as usize]) {1} else {0} as u8);
    	res.push(if last_move.to.contains(&i.to_string()) {1} else {0} as u8);
    }
    for i in 1..9 {
    	res.push(if last_move.from.to_uppercase().contains(alphabet[(i-1) as usize]) {1} else {0} as u8);
    	res.push(if last_move.from.contains(&i.to_string()) {1} else {0} as u8);
    }
    res
}