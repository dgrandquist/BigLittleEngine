use macroquad::prelude::*;

const GRID_WIDTH: usize = 10;
const GRID_HEIGHT: usize = 10;
const CELL_SIZE: f32 = 40.0;
const GRID_LINE_COLOR: Color = GRAY;
const PLAYER_COLOR: Color = GREEN;
const PADDING: f32 = 20.0;
const MOVE_INTERVAL: f32 = 1.0;

struct GameState {
    player_grid_x: usize,
    player_grid_y: usize,
    player_visual_x: f32,
    player_visual_y: f32,
    move_timer: f32,
    current_move: Option<(i32, i32)>,
    last_input: Option<&'static str>,
    frame_count: usize,
    fps_timer: f32,
    current_fps: f32,
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
        let entities = vec![
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

        let start_x = GRID_WIDTH / 2;
        let start_y = GRID_HEIGHT / 2;

        GameState {
            player_grid_x: start_x,
            player_grid_y: start_y,
            player_visual_x: start_x as f32,
            player_visual_y: start_y as f32,
            move_timer: 0.0,
            current_move: None,
            last_input: None,
            frame_count: 0,
            fps_timer: 0.0,
            current_fps: 0.0,
            entities,
        }
    }

    fn update(&mut self) {
        let frame_time = get_frame_time();

        // Update FPS counter
        self.frame_count += 1;
        self.fps_timer += frame_time;
        if self.fps_timer >= 0.1 {
            self.current_fps = self.frame_count as f32 / self.fps_timer;
            self.frame_count = 0;
            self.fps_timer = 0.0;
        }

        // Check for held keys (continuous input)
        let mut next_move = None;
        if is_key_down(KeyCode::Up) {
            next_move = Some((0, -1));
            self.last_input = Some("UP");
        } else if is_key_down(KeyCode::Down) {
            next_move = Some((0, 1));
            self.last_input = Some("DOWN");
        } else if is_key_down(KeyCode::Left) {
            next_move = Some((-1, 0));
            self.last_input = Some("LEFT");
        } else if is_key_down(KeyCode::Right) {
            next_move = Some((1, 0));
            self.last_input = Some("RIGHT");
        } else {
            self.last_input = None;
        }

        // Update timer
        self.move_timer += frame_time;

        // Execute movement when interval passes
        if self.move_timer >= MOVE_INTERVAL {
            if let Some((dx, dy)) = next_move {
                let new_x = (self.player_grid_x as i32 + dx)
                    .max(0)
                    .min(GRID_WIDTH as i32 - 1) as usize;
                let new_y = (self.player_grid_y as i32 + dy)
                    .max(0)
                    .min(GRID_HEIGHT as i32 - 1) as usize;

                self.player_grid_x = new_x;
                self.player_grid_y = new_y;
                self.current_move = Some((dx, dy));
            }
            self.move_timer = 0.0;
        }

        // Animate player position smoothly between cells
        let progress = self.move_timer / MOVE_INTERVAL;
        if let Some((dx, dy)) = self.current_move {
            let start_x = (self.player_grid_x as f32) - (dx as f32) * progress;
            let start_y = (self.player_grid_y as f32) - (dy as f32) * progress;
            self.player_visual_x = start_x;
            self.player_visual_y = start_y;
        } else {
            self.player_visual_x = self.player_grid_x as f32;
            self.player_visual_y = self.player_grid_y as f32;
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

        // Draw player (animated position)
        let player_x = PADDING + self.player_visual_x * CELL_SIZE + 2.0;
        let player_y = PADDING + self.player_visual_y * CELL_SIZE + 2.0;
        let size = CELL_SIZE - 4.0;

        // Outer border (white outline)
        draw_rectangle_lines(player_x - 2.0, player_y - 2.0, size + 4.0, size + 4.0, 2.0, WHITE);
        // Player square
        draw_rectangle(player_x, player_y, size, size, PLAYER_COLOR);

        // Draw text label
        draw_text("YOU", player_x + 5.0, player_y + 25.0, 16.0, WHITE);

        // Draw HUD
        let time_until_next = MOVE_INTERVAL - self.move_timer;
        let input_str = self.last_input.unwrap_or("none");

        draw_text(&format!("FPS: {:.0}", self.current_fps), 10.0, 20.0, 16.0, WHITE);
        draw_text(&format!("Position: ({}, {})", self.player_grid_x, self.player_grid_y), 10.0, 40.0, 16.0, WHITE);
        draw_text(&format!("Next move in: {:.2}s", time_until_next), 10.0, 60.0, 16.0, WHITE);
        draw_text(&format!("Input: {}", input_str), 10.0, 80.0, 16.0, WHITE);
        draw_text("Arrow keys to move (1 cell/sec)", 10.0, 100.0, 14.0, GRAY);
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
