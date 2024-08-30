/** DROP TABLE Threads; */

CREATE TABLE IF NOT EXISTS Threads (
    ThreadID STRING PRIMARY KEY,
    CreatedAt TIMESTAMP,
    UpdatedAt TIMESTAMP
);
