
use std::fmt;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)] 
pub struct Move {
    pub color: String,
    pub from: String,
    pub to: String,
    pub flags: String,
    pub piece: String,
    pub san: String
}
impl fmt::Display for Move {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
      write!(f, "{} {} {} {} {} {}", self.color, self.from, self.to, self.flags, self.piece, self.san)
    }
}

pub fn get_alphabet() -> Vec<char>{
    let alphabet = (b'A'..=b'z')       // Start as u8
        .map(|c| c as char)            // Convert all to chars
        .filter(|c| c.is_alphabetic()) // Filter only alphabetic chars
        .collect::<Vec<_>>();          // Collect as Vec<char>
    alphabet
}

pub fn get_pieces() -> [&'static str; 6]  {
    let pieces = ["Pawn", "Bishop", "Knight", "Rook", "Queen", "King"];
    pieces
}
/*
pub fn get_pieces_short() -> [&'static str; 6]  {
    let pieces = ["p", "b", "n", "r", "q", "k"];
    pieces
}*/
pub fn get_all_pieces_short() -> [&'static str; 12]  {
    let pieces = ["p", "b", "n", "r", "q", "k","P", "B", "N", "R", "Q", "K"];
    pieces
}