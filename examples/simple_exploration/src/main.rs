use macroquad::prelude::*;

const GRID_WIDTH: usize = 10;
const GRID_HEIGHT: usize = 10;
const CELL_SIZE: f32 = 40.0;
const GRID_LINE_COLOR: Color = GRAY;
const PLAYER_COLOR: Color = GREEN;
const PADDING: f32 = 20.0;

struct GameState {
    player_x: usize,
    player_y: usize,
    move_timer: f32,
    move_interval: f32,
    pending_move: Option<(i32, i32)>,
    entities: Vec<Entity>,
}

#[derive(Clone)]
struct Entity {
    x: usize,
    y: usize,
    color: Color,
    emotion: &'static str,
}

impl GameState {
    fn new() -> Self {
        let mut entities = vec![
            Entity {
                x: 1,
                y: 1,
                color: BLUE,
                emotion: "sad",
            },
            Entity {
                x: 8,
                y: 2,
                color: YELLOW,
                emotion: "neutral",
            },
            Entity {
                x: 3,
                y: 7,
                color: RED,
                emotion: "angry",
            },
            Entity {
                x: 7,
                y: 8,
                color: PURPLE,
                emotion: "curious",
            },
            Entity {
                x: 5,
                y: 2,
                color: Color::new(1.0, 0.5, 0.0, 1.0),
                emotion: "excited",
            },
        ];

        GameState {
            player_x: GRID_WIDTH / 2,
            player_y: GRID_HEIGHT / 2,
            move_timer: 0.0,
            move_interval: 1.0,
            pending_move: None,
            entities,
        }
    }

    fn update(&mut self) {
        // Capture input
        if is_key_pressed(KeyCode::Up) {
            self.pending_move = Some((0, -1));
        } else if is_key_pressed(KeyCode::Down) {
            self.pending_move = Some((0, 1));
        } else if is_key_pressed(KeyCode::Left) {
            self.pending_move = Some((-1, 0));
        } else if is_key_pressed(KeyCode::Right) {
            self.pending_move = Some((1, 0));
        }

        // Update timer
        self.move_timer += get_frame_time();

        // Execute movement when interval passes
        if self.move_timer >= self.move_interval && self.pending_move.is_some() {
            if let Some((dx, dy)) = self.pending_move.take() {
                let new_x = (self.player_x as i32 + dx).max(0).min(GRID_WIDTH as i32 - 1) as usize;
                let new_y = (self.player_y as i32 + dy).max(0).min(GRID_HEIGHT as i32 - 1) as usize;

                self.player_x = new_x;
                self.player_y = new_y;
            }
            self.move_timer = 0.0;
        }
    }

    fn draw(&self) {
        clear_background(BLACK);

        // Draw grid
        for x in 0..=GRID_WIDTH {
            let x_pos = PADDING + (x as f32) * CELL_SIZE;
            draw_line(
                x_pos,
                PADDING,
                x_pos,
                PADDING + (GRID_HEIGHT as f32) * CELL_SIZE,
                1.0,
                GRID_LINE_COLOR,
            );
        }

        for y in 0..=GRID_HEIGHT {
            let y_pos = PADDING + (y as f32) * CELL_SIZE;
            draw_line(
                PADDING,
                y_pos,
                PADDING + (GRID_WIDTH as f32) * CELL_SIZE,
                y_pos,
                1.0,
                GRID_LINE_COLOR,
            );
        }

        // Draw entities
        for entity in &self.entities {
            let x = PADDING + entity.x as f32 * CELL_SIZE + 2.0;
            let y = PADDING + entity.y as f32 * CELL_SIZE + 2.0;
            draw_rectangle(x, y, CELL_SIZE - 4.0, CELL_SIZE - 4.0, entity.color);
        }

        // Draw player (larger, with outline)
        let player_x = PADDING + self.player_x as f32 * CELL_SIZE + 2.0;
        let player_y = PADDING + self.player_y as f32 * CELL_SIZE + 2.0;
        let size = CELL_SIZE - 4.0;

        // Outer border (white outline)
        draw_rectangle_lines(player_x - 2.0, player_y - 2.0, size + 4.0, size + 4.0, 2.0, WHITE);
        // Player square
        draw_rectangle(player_x, player_y, size, size, PLAYER_COLOR);

        // Draw text label
        draw_text("YOU", player_x + 5.0, player_y + 25.0, 16.0, WHITE);

        // Draw info text
        draw_text(
            &format!(
                "Position: ({}, {}) | Move interval: {}s | Use arrow keys to move",
                self.player_x, self.player_y, self.move_interval
            ),
            10.0,
            20.0,
            16.0,
            WHITE,
        );
    }
}

#[macroquad::main("Simple Exploration")]
async fn main() {
    let mut game = GameState::new();

    loop {
        game.update();
        game.draw();
        next_frame().await;
    }
}
