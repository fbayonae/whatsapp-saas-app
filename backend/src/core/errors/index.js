class AppError extends Error {
    constructor(message = "Error interno", statusCode = 500, details = {}) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.details = details; // Objeto para información adicional
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message = "Datos de entrada inválidos") {
        super(message, 400);
    }
}

class NotFoundError extends AppError {
    constructor(message = "Recurso no encontrado") {
        super(message, 404);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = "No autorizado") {
        super(message, 401);
    }
}

class ForbiddenError extends AppError {
    constructor(message = "Acceso prohibido") {
        super(message, 403);
    }
}

class ConflictError extends AppError {
    constructor(message = "Conflicto con el estado actual") {
        super(message, 409);
    }
}

class TooManyRequestsError extends AppError {
    constructor(message = "Demasiadas solicitudes") {
        super(message, 429);
    }
}

class DatabaseError extends AppError {
  constructor(message = "Error de base de datos", details = {}) {
    super(message, 500);
    this.details = details;
  }
}

module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    TooManyRequestsError,
    DatabaseError
};
