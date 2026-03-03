```mermaid
erDiagram
    sessions ||--o{ sessionExercises : "has"
    sessionExercises ||--o{ sets : "has"
    sessionExercises }o--|| exercises : "references"

    sessions {
        string id PK
        string date
        string notes
        boolean painFlag
        number createdAt
        number updatedAt
    }

    sessionExercises {
        string id PK
        string sessionId FK
        string exerciseId FK
        number exerciseOrder
        number createdAt
        number updatedAt
    }

    sets {
        string id PK
        string sessionExerciseId FK
        number setOrder
        number reps
        number weightKg
        number rpe
        number restSeconds
        boolean formQualityFlag
        number createdAt
        number updatedAt
    }

    exercises {
        string id PK
        string name
        string category
        number updatedAt
    }

    meta {
        string key PK
        any value
    }