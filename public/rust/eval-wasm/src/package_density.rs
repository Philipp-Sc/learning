use chess::{BoardBuilder, Board, Square, Color, Piece, MoveGen};
use std::convert::TryFrom;
 
pub fn get_keys() -> Vec<String> { 
   
	let mut keys: Vec<String> = Vec::new();
	keys.push("Protected-squares (excl. pieces as defenders, protected pawns, overprotection) {white}".to_string());
	keys.push("Protected-squares per pawn (excl. pieces as defenders, protected pawns, overprotection) {white}".to_string());
	keys.push("Over-protected-squares (excl. pieces as defenders, protected pawns) {white}".to_string());
	keys.push("Protected-squares (excl. pieces as defenders, protected pawns, overprotection) {black}".to_string());
	keys.push("Protected-squares per pawn (excl. pieces as defenders, protected pawns, overprotection) {black}".to_string());
	keys.push("Over-protected squares (excl. pieces as defenders, protected pawns) {black}".to_string());  
   
	keys
}

pub fn get_feature_vector(board: Board) -> Vec<u8> {
 
    let mut a = get_package_density(board, Color::White);
    let mut b = get_package_density(board, Color::Black);

    let mut res: Vec<u8> = Vec::new();
    res.append(&mut a);
    res.append(&mut b);
	res
}

fn get_package_density(board: Board, color: Color) -> Vec<u8> {
	let board = get_board_for_package_density(board, color); 

    let mut movegen = MoveGen::new_legal(&board);
 	let mut squares_protected: Vec<usize> = Vec::new(); 
 	let move_count: u8 = movegen.len() as u8 -1;
	for chess_move in &mut movegen { 
		squares_protected.push(chess_move.get_dest().to_index());
	}
	squares_protected.sort_unstable();
	squares_protected.dedup();
	let squares_count: u8 = squares_protected.len() as u8 -1;
	let pawn_count = get_pawn_count(board, Color::White);
 
 	let mut res: Vec<u8> = Vec::new(); 
 	res.push(squares_count); 
 	res.push(((10.*squares_count as f32) / (pawn_count as f32)).round() as u8);
 	res.push(move_count-squares_count);
 	res
}

fn get_pawn_count(board: Board, color: Color) -> u8 {
	let bb = *board.color_combined(color);
	let mut count: u8 = 0;
	for sq in bb {
		if board.piece_on(sq)==Some(Piece::Pawn) {
			count += 1;
		}
	}
	count
}

fn get_board_for_package_density(board: Board, color: Color) -> Board {

	let mut position = BoardBuilder::new();

	if color==Color::White {
		position.piece(Square::A1, Piece::King, Color::White);
		position.piece(Square::H1, Piece::King, Color::Black); 
		for i in 16..56 {
			position.piece(unsafe { Square::new(i) },Piece::Pawn, Color::Black);
		}
		for i in 56..64 {
			position.piece(unsafe { Square::new(i) },Piece::Knight, Color::Black);
		}
	}else {
		position.piece(Square::A8, Piece::King, Color::White);
		position.piece(Square::H8, Piece::King, Color::Black); 
		for i in 8..48 {
			position.piece(unsafe { Square::new(i) },Piece::Pawn, Color::White);
		}
		for i in 0..8 {
			position.piece(unsafe { Square::new(i) },Piece::Knight, Color::White);
		}
	}

	let bb = *board.color_combined(color);
	for sq in bb {
		if board.piece_on(sq)==Some(Piece::Pawn) {
			position.piece(sq,Piece::Pawn, color);
		}
	}
 
	position.side_to_move(color);

	Board::try_from(&position).unwrap()
}