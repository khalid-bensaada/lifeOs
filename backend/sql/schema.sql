CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS user_settings (
    user_id BIGINT UNSIGNED PRIMARY KEY,
    theme ENUM('light', 'dark', 'system') NOT NULL DEFAULT 'system',
    language ENUM('en', 'ar', 'fr') NOT NULL DEFAULT 'en',
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    daily_task_limit TINYINT UNSIGNED NOT NULL DEFAULT 5,
    work_start TIME NOT NULL DEFAULT '09:00:00',
    work_end TIME NOT NULL DEFAULT '17:00:00',
    sleep_time TIME NOT NULL DEFAULT '00:00:00',
    review_day TINYINT UNSIGNED NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS goals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    category ENUM(
        'Career',
        'Programming',
        'Design',
        '3D',
        'Video',
        'Fitness',
        'Finance',
        'Personal',
        'Education',
        'Other'
    ) NOT NULL DEFAULT 'Other',
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    status ENUM('active', 'completed', 'paused', 'archived') NOT NULL DEFAULT 'active',
    deadline DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_goals_user_status (user_id, status)
) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS milestones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    goal_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    position INT UNSIGNED NOT NULL DEFAULT 0,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
    INDEX idx_milestones_goal (goal_id)
) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    goal_id BIGINT UNSIGNED NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    status ENUM(
        'idea',
        'planning',
        'in_progress',
        'paused',
        'completed',
        'archived'
    ) NOT NULL DEFAULT 'idea',
    tech VARCHAR(200) NOT NULL DEFAULT '',
    start_date DATE NULL,
    deadline DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE
    SET NULL,
        INDEX idx_projects_user_status (user_id, status)
) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    project_id BIGINT UNSIGNED NULL,
    goal_id BIGINT UNSIGNED NULL,
    title VARCHAR(250) NOT NULL,
    description TEXT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    status ENUM('todo', 'in_progress', 'completed', 'skipped') NOT NULL DEFAULT 'todo',
    due_date DATE NULL,
    est_min INT UNSIGNED NOT NULL DEFAULT 30,
    actual_min INT UNSIGNED NULL,
    is_today BOOLEAN NOT NULL DEFAULT FALSE,
    archived_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE
    SET NULL,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE
    SET NULL,
        INDEX idx_tasks_user_status (user_id, status),
        INDEX idx_tasks_user_due (user_id, due_date)
) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS habits (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Personal',
    archived_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_habits_user (user_id)
) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS habit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    habit_id BIGINT UNSIGNED NOT NULL,
    log_date DATE NOT NULL,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE KEY uq_habit_day (habit_id, log_date)
) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS skills (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Other',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_skills_user (user_id)
) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS skill_milestones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    skill_id BIGINT UNSIGNED NOT NULL,
    level TINYINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    position INT UNSIGNED NOT NULL DEFAULT 0,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT chk_skill_level CHECK (
        level BETWEEN 1 AND 4
    ),
    INDEX idx_skill_milestones (skill_id, level)
) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS skill_projects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    skill_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    position INT UNSIGNED NOT NULL DEFAULT 0,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_skill_projects (skill_id)
) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS time_entries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    task_id BIGINT UNSIGNED NULL,
    project_id BIGINT UNSIGNED NULL,
    skill_id BIGINT UNSIGNED NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    entry_date DATE NOT NULL,
    started_at DATETIME NULL,
    ended_at DATETIME NULL,
    duration_sec INT UNSIGNED NOT NULL,
    note TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE
    SET NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE
    SET NULL,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE
    SET NULL,
        INDEX idx_time_user_date (user_id, entry_date)
) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS calendar_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_events_user_date (user_id, event_date)
) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS weekly_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    week_start DATE NOT NULL,
    went_well TEXT NULL,
    went_bad TEXT NULL,
    wasted TEXT NULL,
    learned TEXT NULL,
    change_next TEXT NULL,
    stats JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_review_week (user_id, week_start)
) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS weekly_priorities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(250) NOT NULL,
    position TINYINT UNSIGNED NOT NULL DEFAULT 0,
    FOREIGN KEY (review_id) REFERENCES weekly_reviews(id) ON DELETE CASCADE,
    INDEX idx_priorities_review (review_id)
) ENGINE = InnoDB;