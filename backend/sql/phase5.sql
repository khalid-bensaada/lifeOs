CREATE TABLE IF NOT EXISTS daily_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    review_date DATE NOT NULL,
    went_well TEXT NULL,
    improve TEXT NULL,
    tomorrow_first VARCHAR(250) NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_daily_review (user_id, review_date)
) ENGINE = InnoDB;