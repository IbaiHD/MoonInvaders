// Obtener el canvas y su contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuración del juego
let square = {
    x: Math.random() * (canvas.width - 50),
    y: Math.random() * (canvas.height - 50),
    size: 50,
    color: 'red'
};

let score = 0;

// Detección de clics
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Verificar si el clic fue dentro del cuadrado (esto es lo que he usado para hacer la funcion detectarColisiones)
    if (
        mouseX >= square.x &&
        mouseX <= square.x + square.size &&
        mouseY >= square.y &&
        mouseY <= square.y + square.size
    ) {
        score++;
        moveSquare();
    }
});

// Función para mover el cuadrado a una nueva posición
function moveSquare() {
    square.x = Math.random() * (canvas.width - square.size);
    square.y = Math.random() * (canvas.height - square.size);
}

// Función para actualizar y dibujar el juego
function updateGame() {
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar el cuadrado
    ctx.fillStyle = square.color;
    ctx.fillRect(square.x, square.y, square.size, square.size);

    // Mostrar el puntaje
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    // Repetir la actualización
    requestAnimationFrame(updateGame);
}

// Iniciar el juego
updateGame();