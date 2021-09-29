use chess::{Board, ChessMove, MoveGen, EMPTY, Piece, Color};  
 
pub fn get_keys() -> Vec<String> { 
 

	let mut keys: Vec<String> = Vec::new();
	keys.push("Opponement Targets".to_string());
	keys.push("Opponement Targets (Pawns)".to_string());
	keys.push("Opponement Targets (Knight or Bishop)".to_string());
	keys.push("Opponement Targets (Rook)".to_string());
	keys.push("Opponement Targets (Queen)".to_string());
	keys.push("Opponement Targets (King)".to_string());
	keys.push("Opponement Target Area (Unprotected)".to_string());
	keys.push("Opponement Mobility".to_string());
	keys.push("Opponement Mobility (Pawns)".to_string());
	keys.push("Opponement Mobility (Knight or Bishop)".to_string());
	keys.push("Opponement Mobility (Rook)".to_string());
	keys.push("Opponement Mobility (Queen)".to_string());
	keys.push("Opponement Mobility (King)".to_string());
	keys.push("Opponement Space Area (Unprotected)".to_string());

	 // "Number of Moves that can move at max 3 squares behind friendly pawns"
   
	keys
}

pub fn get_feature_vector(board: Board) -> Vec<u8> {


 	let mut res: Vec<u8> = Vec::new();
 
    let mut movegen = MoveGen::new_legal(&board);

	//let mut fen = board.to_string();
	//fen = fen.splitn(2," ").next().unwrap().to_string();

	// lets iterate over targets.
	let targets = board.color_combined(!board.side_to_move());
	movegen.set_iterator_mask(*targets);

	// count the number of targets
	let mut count_targets: u8 = 0;
	let mut count_pawn_moves: u8 = 0;
	let mut count_knight_or_bishop_moves: u8 = 0;
	let mut count_rook_moves: u8 = 0;
	let mut count_queen_moves: u8 = 0;
	let mut count_king_moves: u8 = 0;
	let mut count_space_area: u8 = 0;

	for chess_move in &mut movegen {
		let moved_piece = board.piece_on(chess_move.get_source());
	    count_targets += 1;
	    count_pawn_moves += if moved_piece==Some(Piece::Pawn) {1} else {0};
	    count_knight_or_bishop_moves += if moved_piece==Some(Piece::Knight) || moved_piece==Some(Piece::Bishop) {1} else {0};
	    count_rook_moves += if moved_piece==Some(Piece::Rook) {1} else {0};
	    count_queen_moves += if moved_piece==Some(Piece::Queen) {1} else {0};
	    count_king_moves += if moved_piece==Some(Piece::King) {1} else {0};
	    count_space_area += if is_in_space_area(board, chess_move, moved_piece) {1} else {0};
	    // This move captures one of my opponents pieces (with the exception of en passant)
	}
	// targets
	res.push(count_targets);
	res.push(count_pawn_moves);
	res.push(count_knight_or_bishop_moves);
	res.push(count_rook_moves);
	res.push(count_queen_moves);
	res.push(count_king_moves);
	res.push(count_space_area);

    // sets iterator to get the remaining moves
	movegen.set_iterator_mask(!EMPTY); 
	for chess_move in &mut movegen { 
		let moved_piece = board.piece_on(chess_move.get_source());
	    count_targets += 1;
	    count_pawn_moves += if moved_piece==Some(Piece::Pawn) {1} else {0};
	    count_knight_or_bishop_moves += if moved_piece==Some(Piece::Knight) || moved_piece==Some(Piece::Bishop) {1} else {0};
	    count_rook_moves += if moved_piece==Some(Piece::Rook) {1} else {0};
	    count_queen_moves += if moved_piece==Some(Piece::Queen) {1} else {0};
	    count_king_moves += if moved_piece==Some(Piece::King) {1} else {0};
	    count_space_area += if is_in_space_area(board, chess_move, moved_piece) {1} else {0};
	    // This move does not capture anything
	}
	// mobility
	res.push(count_targets);
	res.push(count_pawn_moves);
	res.push(count_knight_or_bishop_moves);
	res.push(count_rook_moves);
	res.push(count_queen_moves);
	res.push(count_king_moves);
	res.push(count_space_area);
 

    res
}

fn is_in_space_area(board: Board, chess_move: ChessMove, moved_piece: Option<Piece>) -> bool {
	let mut is_in_space_area = false;    
	if moved_piece==Some(Piece::Rook) || moved_piece==Some(Piece::Knight) || moved_piece==Some(Piece::Bishop) {
	    	let moved_to = chess_move.get_dest();
	    	let moved_to_index = moved_to.to_int();
	    	let remainder = moved_to_index % 8;
	    	if remainder >= 2 && remainder <= 5 {
	    		let go_down = board.side_to_move() == Color::White;
	    		let mut evaluate_square = moved_to;
		    	for _ in 0..3 {
		    		let temp_evaluate_square = if go_down {evaluate_square.down()} else {evaluate_square.up()};
		    		if temp_evaluate_square!=None {
		    			evaluate_square = temp_evaluate_square.unwrap();
		    			if board.piece_on(evaluate_square)==Some(Piece::Pawn){
		    				is_in_space_area = true;
	   				        break;
		    			}
		    		}
		    	}
	    	}
	    }
	is_in_space_area
}