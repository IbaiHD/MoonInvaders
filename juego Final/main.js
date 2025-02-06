/*Los eventos de las teclas de sonido. Dentro de la función del bucle jugable se añaden más eventos, pero como solo quiero que esos eventos se usen mientras se juega,
y estos quiero usarlos independientemente de si estoy en el menú o en el juego, los añado en el contexto global.*/

document.addEventListener('keydown', (e) => {
	switch (e.code){ 
		case "KeyM":
			silenciar();
			break;
		case "Comma":
			subirVolumen();
			break;
		case "Period":
			bajarVolumen();
			break;				
	}

});

// Comienzo creando el canvas y dandole valores a su height y width. Ambos elementos los usaré durante todo el código para posicionar elementos con respecto a ellos.
const canvas = document.getElementById('juegoCanvas');
canvas.width = 800;
canvas.height= 640;

/*Durante las siguientes 20 líneas de código, establezco la posición del canvas y los divs del html. 
Como los quiero centrados independientemente del tamaño del monitor, tengo que generar dichos márgenes dinámicamente.
Para ello, reutilizaré la misma variable "margen" tanto para el margin-top como para el margin-left de los elementos.*/

let margen = (window.innerHeight-canvas.height)/2 + "px"; //Primero hallo el margin-top que necesito aplicar, la mitad de la diferencia entre la altura del monitor y el canvas.
canvas.style.marginTop = margen;
document.getElementById("menu").style.marginTop = margen;
document.getElementById("selector_dificultad").style.marginTop = margen;
document.getElementById("instrucciones").style.marginTop = margen;
document.getElementById("pantalla_victoria").style.marginTop = margen;
document.getElementById("pantalla_derrota").style.marginTop = margen;
document.getElementById("animacion").style.marginTop = margen;

margen = ((window.innerHeight-canvas.height)/2 + 33) + "px"; //Como el menú de sonido es de un tamaño distinto, hallo su margen de forma independiente.
document.getElementById("menu_sonido").style.marginTop = margen;

margen = (window.innerWidth-canvas.width)/2 + "px"; //Busco el margen derecho con el mismo proceso que antes y lo aplico a todos los elementos.
canvas.style.marginLeft = margen;
document.getElementById("menu").style.marginLeft = margen;
document.getElementById("selector_dificultad").style.marginLeft = margen;
document.getElementById("instrucciones").style.marginLeft = margen;
document.getElementById("pantalla_victoria").style.marginLeft = margen;
document.getElementById("pantalla_derrota").style.marginLeft = margen;
document.getElementById("animacion").style.marginLeft = margen;

margen = ((window.innerWidth-canvas.width)/2 + 740) + "px";//Al igual que antes, el margen del menú de sonido es distinto al resto.
document.getElementById("menu_sonido").style.marginLeft = margen;

/*Una vez colocados los divs y el canvas, genero el background del canvas. Como busco generar un efecto de movimiento, he duplicado una imagen verticalmente
en photoshop de tal manera que la parte de arriba y de abajo sean la misma y se pueda loopear sin que se note.

Hago que el background del canvas sea mucho más grande que el propio canvas para luego, en cada bucle de juego,
ir desplazando el background cambiando su background-position-y con una función*/

canvas.style.backgroundSize = canvas.height*2 + "px";
const ctx = canvas.getContext('2d');
let fondoy = 0;

/*A continuación, defino las funciones que utilizaré para moverme entre los distintos divs, siendo la más amplia de ellas "menu()",
que utilizaré tanto para salir de los divs de dificultad e instrucciones como para volver al propio menú una vez termine el juego.*/


/*En la función "menu()", vuelvo a hacer display a todas las ventanas y paro los audios de fin de partida en caso de que estén sonando,
además de devolver el fondo del canvas a su posición original.*/
function menu(){
	document.getElementById("menu").style.display = "block";
	document.getElementById("instrucciones").style.display = "block";
	document.getElementById("selector_dificultad").style.display = "block";
	document.getElementById("pantalla_derrota").style.display = "block";
	document.getElementById("pantalla_victoria").style.display = "block";
	stopAudio(victoria_music);
	stopAudio(derrota_music);
	fondoy=0;
}

function mostrarDificultad(){
	document.getElementById("menu").style.display = "none";
	document.getElementById("instrucciones").style.display = "none";
}

function mostrarInstrucciones(){
	document.getElementById("menu").style.display = "none";
}

/*A continuación, defino las variables, objetos y funciones relacionadas con el sonido del juego*/

let volumentotal = 1; //El propio volumen del juego, 1 siendo el máximo y 0 el mínimo, se modifica con las funciones de sonido de más abajo.
let copiavolumen; //Lo utilizo en la función de silenciar el sonido. No lo puedo meter dentro de ella porque guarda el valor del volumen previo a ser silenciado, por lo que necesito que el valor no se destruya al volver a llamar a la función.
let muted = false; //Mismo caso que en la variable copiavolumen.

/*Los objetos que contienen los audios del juego mediante una función propia que crea un elemento html de audio. */

let lvl_music = audioCreate("media/sounds/level_music.mp3");
let boss_music = audioCreate("media/sounds/boss_warning.mp3");
let proyectil_jugador_music = audioCreate("media/sounds/disparo_jugador.mp3");
let player_hit_music = audioCreate("media/sounds/player_hit.mp3");
let victoria_music = audioCreate("media/sounds/victoria_music.mp3");
let derrota_music = audioCreate("media/sounds/derrota_music.mp3");
let boton_click_music = audioCreate("media/sounds/boton_click.mp3");
let speedboost_music = audioCreate("media/sounds/speed_boost_music.mp3");
let boss_defeat_music = audioCreate("media/sounds/boss_defeat_music.mp3");

/*El volumen predefinido de los objetos de audio. Algunos sonidos quiero que se escuchen de base más atenuados que el resto.*/

speedboost_music.volume = 0.25*volumentotal;
proyectil_jugador_music.volume = 0.15*volumentotal;	
player_hit_music.volume = 0.25*volumentotal;
victoria_music.volume = 0.4*volumentotal;

/*La función con la que creo los objetos de audio, crea un elemento html de audio con una source que se pasa por parámetro
y lo devuelve para ser almacenado en una variable */
function audioCreate(archivo){
	audio = document.createElement("audio");
	audio.src = archivo;
	return audio;
}

/*Utilizo esta función para parar y reiniciar un sonido. A veces, por ejemplo, cuando pulso un botón,
no quiero que termine de reproducirse el audio si lo pulso muy rápido */
function stopAudio(audio) {
    audio.pause();
    audio.currentTime = 0;
}

/*De uso exclusivo para el botón de silenciar en la interfaz, si el juego no está silenciado almacena el valor del volumen
en otra variable y luego establece el volumen a 0, cambiando el fondo del botón de silenciar para mostrar que no se reproducen
sonidos. Si, por el contrario, la función detecta que el juego está silenciado, devuelve el volumen a su valor original y revierte
el cambio del botón. 

En cualquier caso, se llama a la función que modifica la propiedad .volume de los objetos de audio, función que explico a continuación*/
function silenciar(){
	if(!muted){
	copiavolumen = volumentotal;
	volumentotal = 0;
	document.getElementById("boton_silencio").style.backgroundImage = 'url("media/images/fondo_sonido_muted.png")';
	muted=true;
	}else{
		volumentotal = copiavolumen;
		muted=false;
		document.getElementById("boton_silencio").style.backgroundImage = 'url("media/images/fondo_sonido.png")';
	}
	controlarVolumen();
}


/*Cada vez que se sube, baja, silencia o se deja de silenciar el audio, se llama a esta función 
para actualizar los valores de la propiedad .volume de los objetos de audio*/
function controlarVolumen(){
	lvl_music.volume = volumentotal;
	boss_music.volume = volumentotal;
	proyectil_jugador_music.volume = 0.15*volumentotal;	
	player_hit_music.volume = 0.25*volumentotal;
	victoria_music.volume = 0.4*volumentotal;
	derrota_music.volume = volumentotal;
	boton_click_music.volume = volumentotal;
	speedboost_music.volume = 0.25*volumentotal;
	boss_defeat_music.volume = 0.85*volumentotal;
}

/*Exclusiva del botón de subir volumen de la interfaz, sube el volumen en saltos de 0.05 hasta 1 en caso de ser menor
y reproduce la animación que muestra por pantalla el volumen actual */
function subirVolumen(){
	volumentotal = volumentotal + 0.05 >= 1 ? 1 : volumentotal + 0.05;
	document.getElementById("numero_volumen").value = parseInt(volumentotal*100); //Como normalmente entendemos el volumen en una escala del 1 al 100, multiplico el valor por 100.
	animationPlay("numero_volumen", "desaparecer 1s linear");
	controlarVolumen();
}

/*Exclusiva del botón de bajar volumen de la interfaz, baja el volumen en saltos de 0.05 hasta 0 en caso de ser mayor
y reproduce la animación que muestra por pantalla el volumen actual */
function bajarVolumen(){
	volumentotal = volumentotal - 0.05 <= 0 ? 0 : volumentotal - 0.05;	
	document.getElementById("numero_volumen").value = parseInt(volumentotal*100); //Como normalmente entendemos el volumen en una escala del 1 al 100, multiplico el valor por 100.
	animationPlay("numero_volumen", "desaparecer 1s linear");
	controlarVolumen();
}


/*Aunque originalmente planeaba utilizar esta función para más cosas, ha quedado relegada a las funciones de audio,
 por lo que la junto al resto de código relacionado con el audio. 
 
 Esta función modifica el css de un elemento html pasado por parámetro para que realice una animación pasada también por parámetro.
 Como quiero que dicha animación se pueda reproducir más de una vez, primero "limpio" el css del html de animaciones previas, luego
 fuerzo al html a que actualice la información del elemento llamando a una propiedad inutil, en este caso, .offsetWidth y, finalmente,
 establezco la animación que quiero darle.*/
function animationPlay(html, animacion){
	document.getElementById(html).style.animation = "none";
	document.getElementById(html).offsetWidth; //Si no hago una llamada a que el html compruebe los valores del elemento, por algún motivo, no reconoce que le he puesto "none" a la animación y no me deja repetir la misma.
	document.getElementById(html).style.animation = animacion;
}


/*Creo las variables de dificultad y les asigno por defecto los valores en fácil. 
Después, declaro las funciones que modifican dichos valores.*/

let masillarate = 0.9; //Proporción de enemigos debiles/fuertes que se generan cada vez que se genera un enemigo.
let shootrate = 0.01; //Probabilidad de que, cada bucle de refresco, un enemigo genere un disparo
let puntosparaboss = 10; //Cantidad de mejoras que hay que recoger para que se lance el evento del boss
let proyectilLateral = false; //En las dificultades más altas, aparecen disparos aleatorios por los bordes de la pantalla
let framesproyectil = 90; //Lo explico más adelante en su función, pero define la velocidad de los proyectiles enemigos
let bosshp = 15; //Cantidad de impactos que tiene que recibir el boss para ser derrotado
let dificultad = "facil"; //La propia dificultad, he utilizado esta variable durante el desarrollo para comprobar errores en los cambios de dificultad.

function facil(){
	masillarate = 0.9;
	shootrate = 0.01;
	puntosparaboss = 10;
	proyectilLateral = false;
	framesproyectil = 90;
	bosshp = 15;
	dificultad = "facil";
	menu();
}

function normal(){
	masillarate = 0.8;
	shootrate = 0.015;
	puntosparaboss = 15;
	proyectilLateral = true;
	framesproyectil = 80;
	bosshp = 25;
	dificultad = "normal";
	menu();
}

function dificil(){
	masillarate = 0.75;
	shootrate = 0.02;
	puntosparaboss = 20;
	proyectilLateral = true;
	framesproyectil = 70;
	bosshp = 40;
	dificultad = "dificil";
	menu()
}


/*Todas las funciones que se utilizan exclusivamente dentro del bucle principal de juego. Si una función o variable se necesita en el contexto global,
se encuentra por encima de esta.*/

function jugar(){


	/*Los eventos que añado una vez comienza el juego.
	
	Para el movimiento del jugador, utilizo 5 variables, una para cada dirección y otra llamada "speed" que simplemente almacena la cantidad de píxeles que se mueve por cada bucle del juego.
	Cuando pulso una tecla, dicha dirección adquiere el valor almacenado en "speed", que será utilizado para mover la posición donde se dibuja el objeto "jugador" en una función posterior
	y, cuando la suelto, ese valor vuelve a 0.

	Inicialmente, el movimiento lo conseguía haciendo que onkeypress el valor de la velocidad horizontal o vertical cambiara, pero esto hacía que el objeto "jugador" se moviera a trompicones.
	De esta manera, consigo un movimiento fluido, basandome en la explicación de este video https://www.youtube.com/watch?v=kX18GQurDQg */
	document.addEventListener('keydown', (e) => {

		switch (e.code){
			case "ArrowLeft":
				jugador.xlspeed = -jugador.speed;
				break;
			case "ArrowRight":
				jugador.xrspeed = jugador.speed;
				break;
			case "ArrowUp":
				jugador.yuspeed = -jugador.speed;
				break;
			case "ArrowDown":
				jugador.ydspeed = jugador.speed;
				break;												
		}
	
	});
	
	document.addEventListener('keyup', (e) => {
	
		switch (e.code){
			case "ArrowLeft":
				jugador.xlspeed = 0;
				break;
			case "ArrowRight":
				jugador.xrspeed = 0;
				break;
			case "ArrowUp":
				jugador.yuspeed = 0;
				break;
			case "ArrowDown":
				jugador.ydspeed = 0;
				break;									
		}
	
	});

//Modifico todos los divs para que solo se vea el canvas, haciendo un display none a todos ellos.

document.getElementById("menu").style.display = "none";
document.getElementById("instrucciones").style.display = "none";
document.getElementById("selector_dificultad").style.display = "none";
document.getElementById("pantalla_victoria").style.display = "none";
document.getElementById("pantalla_derrota").style.display = "none";

/*A continuación, el listado de variables que se utilizarán en todo el contexto de la función. Están divididos en:
	1- Arrays que almacenan los distintos objetos del juego.
	2- Variables que almacenan funciones del tipo setTimeout() para poder deterner dichos timeouts con otras funciones.
	3- Variables cuyo único propósito es ser utilizadas en funciones que pintan algo en el canvas pero que solo que lo hagan
		durante una cantidad de tiempo en particular.
	4- El objeto jugador. A diferencia del resto de objetos, se puede controlar por el usuario, se genera al principio de la partida 
		y siempre se mostrará en el canvas, por lo que necesito tener accesibles sus propiedades en el contexto de la función jugar().
	5- Objetos de tipo image que utilizaré para pintar sobre el canvas el aspecto de otros objetos.
	6- Resto de variables que cumplen distintos propósitos como impedir que una función salte si ya ha ocurrido, llevar un conteo de
		lo que ha recogido el jugador...
	 */


//Los arrays que almacenan los objetos del juego. Cuando quiero pintarlos en el canvas o comprobar colisiones, recorro los arrays correspondientes.	
let proyectiles = []; //Proyectiles generados por el jugador
let proyectilesenemigos = []; //Resto de proyectiles
let enemigos = []; //Objetos que, al entrar en contacto con el jugador, disminuyen sus puntos de salud.
let drops = []; //Objetos que, al entrar en contacto con el jugador, modifican sus estadísticas sin disminuir sus puntos de salud.


//Variables que usaré para almacenar timers que quiero parar en algún momento.
let disparar; //Almacena el setTimeout() que genera proyectiles del jugador.
let otroenemigo; //Almacena el setTimeout() que genera enemigos.

//Variables que usaré para pintar en el canvas solo durante una duración de tiempo específica

let framesspeedboost = 0; //Se utiliza en la función speedBoost(), la animación que se reproduce cuando el jugador recoge una mejora de velocidad de movimiento.
let framesboosalert = 0; //Se utiliza en la función boosAlert(), la animación que se reproduce cuando se va a lanzar el evento que genera al boss.

//El objeto que controla el usuario.

let jugador = {
    width: 32, //A la hora de tener en cuenta las dimensiones del objeto, cuántos píxels hay que tomar en cuenta en el eje x desde el punto donde se dibuja.
    height: 32, //A la hora de tener en cuenta las dimensiones del objeto, cuántos píxels hay que tomar en cuenta en el eje y desde el punto donde se dibuja.
    x: ((canvas.width-32)/2), //La posición en el eje x donde se dibuja en el canvas al jugador. Comienza en el centro restando el ancho del jugador al ancho del canvas y dividiendolo a la mitad.
    y: (canvas.height-32), //La posición en el eje y donde se dibuja en el canvas al jugador. Comienza abajo del todo restando la altura del jugador a la altura del canvas.
	speed: 8, //Cantidad de píxeles que se mueve el jugador en cada bucle de la función de juego.
	xlspeed: 0, //Mientras se pulsa arrowleft en el teclado, toma el valor de speed. Este valor se utilizará en una función futura para cambiar la posición del jugador.
	xrspeed: 0, //Igual que xlspeed, pero con arrowright.
	yuspeed: 0, //Igual que xlspeed, pero con arrowup.
	ydspeed: 0, //Igual que xlspeed, pero con arrowdown.
    hp: 10, //Puntos de golpe del jugador. Si llegan a 0 se lanza la pantalla de fin de juego. Se modifica en funciones futuras.
	maxhp: 10, //Puntos de golpe máximos del jugador. Evita en funciones futuras que, al aumentar sus puntos de golpe, rebasen este límite.
	cadencia: 500, //Cada cuantos milisegundos se genera un proyectil del jugador. Se modifica en funciones futuras.
	cadenciarecogida: 0, //Cuantos drops del tipo "cadencia" ha recogido el jugador. Se utiliza para calculos en funciones futuras.
    color: ["lightblue","orange","red"], //Color utilizado para pintar en el canvas una estimación de los puntos de golpe actuales del jugador.
	colorescudo: "black", //Color utilizado para pintar en el canvas un borde alrededor del jugador que cambia de color cuando se produce un impacto.
	sprite: "media/images/jugador_sprite.png" //La apariencia del jugador, utilizado para pintar sobre el canvas.
   };


//Datos de pantalla de fin de juego

let navesdestruidas=0;
let masillasdestruidos=0;
let tanquesdestruidos=0;
let impactosrecibidos=0;
let tiempojugado=0;

//Variables que uso para mostrar imágenes, en su mayoría, sprites de los objetos a dibujar

let img = new Image(); 
let imgmasilla = new Image();
let imgtanque = new Image();
let imgboss = new Image();
let imgdropgreen = new Image();
let imgdroporange = new Image();
let imgdropblue = new Image();
let imgdroppurple = new Image();
img.src = jugador.sprite; 
imgmasilla.src = "media/images/masilla_sprite.png";
imgtanque.src = "media/images/tanque_sprite.png";
imgboss.src = "media/images/boss_sprite.png";
imgdropgreen.src = "media/images/drop_heal.png";
imgdroporange.src = "media/images/drop_bulletspeed.png";
imgdropblue.src = "media/images/drop_speedboost.png";
imgdroppurple.src = "media/images/drop_bulletwidth.png";

//Resto de variables

let puntos = 0; //Cantidad de drops recogidos, se utiliza para dar paso al evento que genera el boss.
let speedboost = false; //Se utiliza para prevenir que se lance la función speedBoost() mientras está en true.
let victoria = false; //Se utiliza para finalizar el bucle jugable y dar paso a la ventana de victoria de fin de juego.
let gameover = false; //Se utiliza para finalizar el bucle jugable y dar paso a la ventana de derrota de fin de juego
let bosscreado = false; // Utilizo esta variable en la función de "crearBoss()" para que, si ya se ha lanzado el evento de crear un boss, no se lance de nuevo.
let widthadicional = 0; //Utilizo esta variable para calcular el ancho de los proyectiles del jugador. Como se utiliza en otras funciones, necesito que sea accesible desde el contexto de la función jugar().
let widthrecogido = 0;  //mismo caso que widthadicional.


/*Las funciones, organizadas de la siguiente manera:
   1- Funciones que crean objetos.
   2- Funciones que pintan objetos en el canvas.
   3- Funciones que mueven la posición de los objetos.
   4- Funciones que son utilizadas por otras funciones.
   5- Utilidades del sistema.
   6- La función de bucle de juego principal.
*/


/* 1- Funciones que crean objetos.
Fundamentalmente, todas funcionan de la misma manera; generan un objeto y lo introducen en su array correspondiente. */

//Crea los proyectiles que genera el jugador. Es decir, los que solo interactúan con los objetos del tipo enemigo.
function crearProyectilJugador(){ 
	let proyectil = {
		width: 8 + widthadicional, //Ancho en píxeles del proyectil, puede aumentar dependiendo de los drops que recoja el jugador
		height: 12, //Alto en píxeles del proyectil.
		x: jugador.x + (jugador.width/2), //Posición en el eje x del proyectil, se genera por defecto en el centro del jugador.
		y: jugador.y, //Posición en el eje y del proyectil, se genera por defecto en el y del jugador.
		xspeed: 0, //Cantidad de píxeles que se mueve por bucle de la función principal en el eje x.
		yspeed: -17, //Cantidad de píxeles que se mueve por bucle de la función principal en el eje y.
		color: "white", //Color en el que se pinta sobre el canvas.
		};

	proyectiles.push(proyectil); //Introduce el objeto proyectil en el array de proyectiles.
	proyectil_jugador_music.currentTime=0; //Reinicia el audio que se reproduce al lanzar un proyectil
	proyectil_jugador_music.play(); 
	disparar = setTimeout(crearProyectilJugador,jugador.cadencia); //Se llama en bucle teniendo en cuenta la cadencia del jugador para que, si aumenta o disminuye durante la partida, se ajuste de manera dinámica.	
}

/*Crea los proyectiles de los enemigos. Es decir, los que solo interactúan con el objeto de tipo jugador.
 A diferencia del jugador, como los enemigos pueden tener un ancho muy grande, la posición de inicio del proyectil
 puede ser en cualquier lugar de su width.
 Recibe por parámetro un objeto de tipo enemigo para calcular el valor de sus propiedades en función del mismo.
 Como el objetivo de los disparos es que alcancen al jugador, el valor de las propiedades xspeed e yspeed se calcular de la siguiente manera:
 	-se haya el centro del jugador (jugador.y+(jugador.height/2))
	-a eso, se le resta el y del enemigo y con ello obtenemos la distancia en "y" o "x" que les separa.
	-al dividirlo entre la velocidad del proyectil del enemigo, obtenemos la cantidad de veces que se tiene que mover 
	el proyectil para llegar a la posición del jugador.
Esto provoca que los proyectiles más cercanos vayan más lentos que los proyectiles más lejanos, puesto que la distancia que les separa es menor*/
function crearProyectilEnemigo(enemigo){  

	let proyectilenemigo = {
		width: enemigo.widthproyectil, 
		height: enemigo.heightproyectil,
		x: enemigo.x + (Math.floor(Math.random()*enemigo.width)) ,
		y: enemigo.y,
		yspeed: (jugador.y+(jugador.height/2)-enemigo.y)/enemigo.speedproyectil,
		xspeed: (jugador.x+(jugador.width/2)-enemigo.x)/enemigo.speedproyectil,
		color: "yellow",
	};
	proyectilesenemigos.push(proyectilenemigo);
}

//Esto crea un proyectil enemigo que no se mueve en el eje x, solo hacia abajo. Lo utilizo en el boss para hacerlo más desafiante al apuntar a dos lugares distintos.
function crearProyectilVertical(enemigo){
	let proyectilenemigo = {
		width: 5,
		height: 15,
		x: enemigo.x + (Math.floor(Math.random()*enemigo.width)) ,
		y: enemigo.y,
		yspeed: (canvas.height)/70,
		xspeed: 0,
		color: "orange",
	};
	proyectilesenemigos.push(proyectilenemigo);
}

//Crea un proyectil que se genera desde el borde del canvas hacia el lado opuesto sin necesidad de enemigos. Solo se activa en las dificultades más altas.
function crearProyectilLateral(){
	let probdisparo = 0.005;
	if(Math.random() <= probdisparo){
		if(jugador.x > (canvas.width/2)){
			let proyectilenemigo = {
				width: 15,
				height: 5,
				x: 0,
				y: Math.floor(Math.random()*canvas.height),
				yspeed: 1, //Dejo el yspeed en 1 y no en 0 porque, como el fondo se mueve hacia abajo, en 0 da la sensación de que va para abajo.
				xspeed: (canvas.width)/110,
				color: "brown",
			};
			proyectilesenemigos.push(proyectilenemigo);
		}else{
			let proyectilenemigo = {
				width: 15,
				height: 5,
				x: canvas.width,
				y: Math.floor(Math.random()*canvas.height),
				yspeed: 1,
				xspeed: -(canvas.width)/110,
				color: "brown",
			};
			proyectilesenemigos.push(proyectilenemigo);
		}

	}
}

//Genera un número y, dependiendo de la dificultad, genera más o menos enemigos de cada tipo. Cuando acaba, se llama a sí misma de vuelta.
function crearEnemigo(){

	let generarenemigo = Math.random();

	if (generarenemigo <= masillarate){
		let enemigo = {
			id: "masilla",
			width: 24, height: 10,
			x: Math.floor(Math.random()*(canvas.width-20)), y: 0,
			xspeed: 0, yspeed: 4,
			hp: 1,
			probdisparo: shootrate, widthproyectil:6, heightproyectil:6, speedproyectil: framesproyectil,
			color: "red",
			sprite:"media/images/masilla_sprite.png",
			moverderecha : true,
			puededisparar : true,
		};

		enemigos.push(enemigo);

	}else{
		let enemigo = {
			id: "tanque",
			width: 40, height: 20,
			x: Math.floor(Math.random()*(canvas.width-20)), y: 0,
			xspeed: 0, yspeed: 2,
			hp: 3,
			probdisparo: shootrate*0.5, widthproyectil:9, heightproyectil:9, speedproyectil: framesproyectil*1.5,
			color: "pink",
			sprite:"media/images/tanque_sprite.png",
			moverderecha : true,
			puededisparar : true,
		};

		enemigos.push(enemigo);
	}

	otroenemigo = setTimeout(crearEnemigo,650);

}

//Lanza el evento de la pelea con el boss. Como las condiciones para entrar en la función se van a generar siempre a partir de cierto punto, si ya se ha creado, no hace nada.
function crearBoss(){

	if(bosscreado){
		return;
	}

	boss_music.play();
	setTimeout(function(){lvl_music.volume *= 0.4}, 100);
	setTimeout(function(){lvl_music.volume *= 2.5}, 2000);
	bosscreado = true;

	let intervalo = setInterval(bossAlert(),10);//llamo a la función de la alerta del boss y hago que dure solo dos segundos. Como solo entra en el bucle una vez, tengo que recurrirla con un setInterval()
	setTimeout(clearInterval(intervalo),2000);

	clearTimeout(otroenemigo); //dejo de generar enemigos para que solo esté el boss en pantalla

	setTimeout(function(){
		let enemigo = {
			id: "boss",
			width: 70,
			height: 18,
			x: canvas.width/2-40,
			y: 30,
			yspeed: 0,
			xspeed: 3 + (bosshp*0.05),
			hp: bosshp,
			probdisparo: shootrate*2.5, widthproyectil:8, heightproyectil:8, speedproyectil: framesproyectil*0.85,
			color: "red",
			moverderecha: true,
			puededisparar : true,
		};

		enemigos.push(enemigo);
	},2000);
}

//Esta función tiene probabilidad de generar un objeto de tipo drop cuando se mata a un enemigo. 
// El tipo de drop depende del color del mismo, que se genera aleatoriamente cada vez tomando como referencia un array predefinido.
function crearDrop(enemigo){
	let saledrop = Math.floor(Math.random()*3)+1;

	if (saledrop <= 2){
		let colordrop = ["green", "green", "green", "blue", "orange", "orange", "purple", "purple"];
		let drop = {
			id: "drop",
			width: 30,
			height: 30,
			x: enemigo.x,
			y: enemigo.y,
			speed: 2,
			color: colordrop[Math.floor(Math.random()*8)],
		};
		drops.push(drop);
	}
}


//2- Funciones que dibujan objetos

// Dibuja los objetos en el canvas dependiendo de su id. A los drops, además, les dibuja una circunferencia alrededor.
function dibujarObjeto(obj){ 

	switch (obj.id){
		case "masilla" :
			ctx.drawImage(imgmasilla,obj.x-10,obj.y-12);
			break;
		case "tanque" :
			ctx.drawImage(imgtanque,obj.x-15,obj.y-20);
			break;
		case "boss" :
			ctx.drawImage(imgboss,obj.x-28,obj.y-61);
			break;
		case "drop" :
			ctx.beginPath();
			ctx.arc(obj.x+15, obj.y+15, obj.height, 0, 2 * Math.PI, false);
			ctx.lineWidth = 3;
			ctx.strokeStyle = obj.color;
			ctx.globalAlpha = 0.5;
			ctx.stroke();
			ctx.globalAlpha = 1;

			switch (obj.color){
				case "purple":
					ctx.drawImage(imgdroppurple,obj.x-2,obj.y-2);
					break;
				case "green":
					ctx.drawImage(imgdropgreen,obj.x-2,obj.y-1);
					break;
				case "blue":
					ctx.drawImage(imgdropblue,obj.x+2,obj.y-2);
					break;
				case "orange":
					ctx.drawImage(imgdroporange,obj.x-3,obj.y-9);
					break
			}
			break;
		default:
			ctx.fillStyle = obj.color;
			ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
	}


}

/* Dibuja al jugador. Como el movimiento no lo decide el bucle de la función jugar() si no el propio usuario, además, calcula el movimiento
antes de dibujar el objeto sumando la velocidad pertinente a la "x" y a la "y".
Para evitar que el objeto se salga del canvas, añado comprobaciones antes de modificar su posición. Si se va a salir del canvas, no se mueve.*/
function dibujarJugador(obj) { 
	obj.x += jugador.x > 0 ? obj.xlspeed : 0;
	obj.x += jugador.x < canvas.width-jugador.width ? obj.xrspeed : 0; 
	obj.y += jugador.y > 0 ? obj.yuspeed : 0;
	obj.y += jugador.y < canvas.height-jugador.height ? obj.ydspeed : 0;

	ctx.beginPath();//El jugador tiene un aura alrededor que le indica una aproximación de sus puntos de golpe. Aquí la dibujo.
	ctx.arc(jugador.x+17, jugador.y+17, jugador.width, 0, 2 * Math.PI, false);
	if (jugador.hp <= jugador.maxhp * 0.30) {
		ctx.fillStyle = obj.color[2];
	} else if (jugador.hp <= jugador.maxhp * 0.7) {
		ctx.fillStyle = obj.color[1];
	} else {
		ctx.fillStyle = obj.color[0];
	}
	ctx.globalAlpha = 0.5;
	ctx.fill();
	ctx.lineWidth = 3;//A partir de aquí dibujo una circunferencia alrededor del aura del jugador. Será negra de base y blanca si le han golpeado recientemente.
	ctx.strokeStyle = jugador.colorescudo;
	ctx.globalAlpha = 1;
	ctx.stroke();
	ctx.closePath();

	if (speedboost){//Si ha recogido una mejora de velocidad, además, dibuja una circunferencia más lejana que se va "vaciando" para indicar el tiempo que le queda.
		framesspeedboost++;
		ctx.beginPath();
		ctx.globalAlpha = 0.75;
		ctx.lineWidth = 5;
		ctx.arc(jugador.x+17, jugador.y+17, jugador.width+12, (2*Math.PI)-(framesspeedboost/38.54), 0, true);
		ctx.strokeStyle = "blue";
		ctx.stroke();
		ctx.closePath();
		ctx.globalAlpha = 1;
	} 

	ctx.drawImage(img,jugador.x-6,jugador.y-6); //Finalmente, dibujo al jugador por encima de todo lo demás
}


// 3- Funciones que mueven objetos

/*Similar a cómo se mueve el jugador, solo que de manera automática
Además, comprueba si el objeto ha colisionado con un proyectil o el propio jugador*/
function moverEnemigo(enemigos){
	
	enemigos.forEach((enemigo, eindex) =>{//Por cada objeto del array, muevo el enemigo hacia abajo.
		enemigo.y += enemigo.yspeed;
		if(enemigo.moverderecha){//El boss quiero que se mueva en horizontal en vez de en vertical. Por tanto, añado una comprobación para que se mueva de izquierda a derecha y viceversa
			enemigo.x += enemigo.xspeed;
			if(enemigo.x+enemigo.width >=canvas.width) enemigo.moverderecha=false;
		}else{
			enemigo.x -= enemigo.xspeed;
			if(enemigo.x <= 0) enemigo.moverderecha=true;
		}
		dibujarObjeto(enemigo);
		if(enemigo.y>canvas.height)enemigos.splice(eindex,1);//Si se sale del canvas por abajo, lo elimino del array para evitar uso innecesario de la memoria.
	});

	enemigos.forEach((enemigo,eindex) =>{//Por cada enemigo del array, compruebo si ha colisionado con el jugador. Si lo ha hecho, el hp del jugador se reduce y el enemigo desaparece.
		if(detectarColision(enemigo,jugador)){
			enemigos.splice(eindex,1);
			reducirHP();
		}
	});
}

/*Similar a cómo funciona moverEnemigo, pero comprobando las colisiones con los enemigos en vez de con el jugador*/
function moverProyectil(proyectiles){

	proyectiles.forEach((proyectil, index) =>{
		proyectil.y += proyectil.yspeed;
		proyectil.x += proyectil.xspeed;
		dibujarObjeto(proyectil);
		if(proyectil.y<=0) proyectiles.splice(index, 1); //Elimina los proyectiles que se salen de la pantalla por arriba.
	});

	proyectiles.forEach((proyectil, pindex) => {
		enemigos.forEach((enemigo,eindex) => {
			if (detectarColision(proyectil, enemigo)) {
				enemigo.hp -= 1;
				proyectiles.splice(pindex,1);
				if (enemigo.hp <= 0){
				crearDrop(enemigo);
				enemigos.splice(eindex, 1);
				navesdestruidas++;
				if(enemigo.id == "masilla") masillasdestruidos++;
				if(enemigo.id == "tanque") tanquesdestruidos++;
				}
				if(enemigo.hp <= 0 && enemigo.id == "boss"){
					bossDefeat(enemigo);
				}
			}	
		});
	});
}

/*Similar a cómo funciona moverProyectil, pero comprobando las colisiones con el jugador. */
function moverProyectilEnemigo(proyectilesenemigos){

	proyectilesenemigos.forEach((proyectilenemigo, index) =>{
		proyectilenemigo.y += proyectilenemigo.yspeed;
		proyectilenemigo.x += proyectilenemigo.xspeed;
		dibujarObjeto(proyectilenemigo);
		if(proyectilenemigo.y>=canvas.height) proyectilesenemigos.splice(index, 1); //Elimina los proyectiles que se salen de la pantalla por arriba.
		if(proyectilenemigo.y<=0) proyectilesenemigos.splice(index,1); //Elimina los proyectiles que se salen de la pantalla por abajo.
	});

	proyectilesenemigos.forEach((proyectilenemigo, peindex) => {
			if (detectarColision(proyectilenemigo, jugador)) {
				proyectilesenemigos.splice(peindex,1);
				reducirHP();
			}	
	});
}

/*Mismo funcionamiento que el resto añadiendo un efecto distinto dependiendo del color del drop que haya colisionado con el jugador */
function moverDrops(drops){
	
	drops.forEach((drop, index) =>{
		drop.y += drop.speed;
		dibujarObjeto(drop);
		if(drop.y>canvas.height)drops.splice(index,1);
	})

	drops.forEach((drop, dindex) => {
		if (detectarColision(jugador, drop)) {
			switch(drop.color){
				case ("green"):
					aumentarHP();
					break;
				case ("orange"):
					jugador.cadenciarecogida++;//Si recoge este drop más de 10 veces, no hace nada. Además, cada vez que lo recoge, su efecto disminuye.
					jugador.cadencia = jugador.cadenciarecogida > 10 ? jugador.cadencia : jugador.cadencia - (60 - (jugador.cadenciarecogida*5));
					break;
				case ("blue"):
					if (!speedboost) speedBoost();
					break;
				case ("pink"):
					widthrecogido++;//Si recoge este drop más de 10 veces, no hace nada. Además, cada vez que lo recoge, su efecto disminuye.
					widthadicional = widthrecogido > 10 ? widthadicional : widthadicional + (1 -((widthrecogido*5)/50));
					break;
			};		
			drops.splice(dindex,1);
			puntos++;//Recoger un drop suma un punto.
		}
	})
}

// Para dar la sensación de recorrido, he duplicado una imagen haciendo que la parte de arriba y abajo sean iguales de manera que se pueda loopear
function moverFondo(){ 
	fondoy = fondoy < -10 ? fondoy + 10 : -canvas.height*4
	canvas.style.backgroundPositionY = fondoy + "px";
}


// 4- Funciones que son utilizadas por otras funciones.

/*Esta función básicamente detecta que obj1 no esté ni a la derecha, ni a la izquierda ni encima ni debajo del obj2,
devolviendo true si se cumplen las 4 condiciones */
function detectarColision(obj1, obj2) {
	return (
	  obj1.x < obj2.x + obj2.width &&
	  obj1.x + obj1.width > obj2.x &&
	  obj1.y < obj2.y + obj2.height &&
	  obj1.y + obj1.height > obj2.y
	);
}

/*La función que genera disparos dependiendo de las propiedades probdisparo y puededisparar, además del tipo de enemigo que sea. */
function disparoEnemigo(enemigos){

	enemigos.forEach((enemigo, index) => {
		let disparo = Math.random() <= enemigo.probdisparo ? true : false; //los enemigos tienen una variable probdisparo que va de 0 a 1 dependiendo de cuanto quiero que su disparo ocurra

		if (enemigo.id !== "tanque" && disparo && enemigo.y < (canvas.height/1.5) && enemigo.puededisparar){
			crearProyectilEnemigo(enemigo); //todos los enemigos menos el tanque son capaces de hacer un disparo normal
			enemigo.puededisparar = false; //Además, para prevenir que los enemigos lancen 10 disparos seguidos, una vez han disparado no pueden volver a hacerlo hasta que la propiedad puededisparar sea true de nuevo.
			setTimeout(function(){enemigo.puededisparar=true},200);
		} 

		else if (enemigo.id === "tanque"  && disparo && enemigo.y < (canvas.height/2) && enemigo.puededisparar){ //el tanque y solo el tanque dispara 3 veces
			crearProyectilEnemigo(enemigo);
			enemigo.speedproyectil +=10; //cada vez que dispara, el siguiente proyectil va más lento
			crearProyectilEnemigo(enemigo);
			enemigo.speedproyectil +=10;
			crearProyectilEnemigo(enemigo);
			enemigo.speedproyectil -=20; //reestablezco la velocidad para la siguiente tanda de disparos si llegara a ocurrir.
			enemigo.puededisparar = false;
			setTimeout(function(){enemigo.puededisparar=true},400);
		}
		
		if (enemigo.id == "boss" && Math.random() <= enemigo.probdisparo*2) crearProyectilVertical(enemigo); //el boss, además del disparo normal, tiene un disparo especial llamando a la función crearProyectilVertical
	});

}

/*La función que se llama cuando golpean al jugador, cambiando el color de la circunferencia durante 150ms
 y finalizando el juego si el hp llega a 0*/
function reducirHP(){
	impactosrecibidos++;
	player_hit_music.currentTime = 0;
	player_hit_music.play();
	jugador.colorescudo = "grey";
	setTimeout(function(){jugador.colorescudo = "black"},150);
	jugador.hp -= 2;
	jugador.hp = jugador.hp < 0 ? 0 : jugador.hp;

	if (jugador.hp <=0) gameover = true;

}

/*Aumenta los hp del jugador cuando recoge el drop correspondiente, previniendo que aumente por encima de sus hp máximos antes de curarle y después de haberse curado. */
function aumentarHP(){
	jugador.hp = jugador.hp >= jugador.maxhp ? jugador.hp : jugador.hp + 2;
	jugador.hp = jugador.hp >= jugador.maxhp ? jugador.maxhp : jugador.hp;
}

/*Aumenta la velocidad del jugador durante unos momentos cuando recoge el drop correspondiente. */
function speedBoost(){
	speedboost_music.play()
	framesspeedboost = 0;
	speedboost = true;
	jugador.speed = 14;
	setTimeout(function(){speedboost=false; jugador.speed = 8;stopAudio(speedboost_music);}, 4000);
}



// 5- Utilidades del sistema.

/*Animación que surje cuando se va a generar un boss*/
function bossAlert(){
	framesboosalert++;
	ctx.globalAlpha =  0.75 / ((framesboosalert % 30)/2); //Con esto consigo un efecto parpadeante.
	ctx.font = '40px Arial';
	ctx.fillStyle = 'red';
	ctx.fillRect(200,40,350,90);
	ctx.fillStyle= 'white';
	ctx.fillText('BOSSALERT', 250, 100);
	ctx.globalAlpha = 1;
}

/*Si es boss es derrotado, cambia la posición del div html de la animación al lugar donde estaba el boss*/
function bossDefeat(obj){
	victoria = true;
	let animacion = document.getElementById("animacion");
	let margen = (window.innerHeight-canvas.height)/2;
	animacion.style.marginTop = (margen + obj.y) + "px";
	margen = (window.innerWidth-canvas.width)/2;
	animacion.style.marginLeft = (margen + obj.x) + "px";
	animacion.style.display="block";
	stopAudio(boss_defeat_music);
	boss_defeat_music.play();
	setTimeout(function(){animacion.style.display="none";},2000);
	
}

/*Despliega la ventana de fin de juego y muestra datos por pantalla, eliminando la función de disparar */
function ventanaDerrota(){
	stopAudio(lvl_music);
	stopAudio(proyectil_jugador_music);
	clearTimeout(disparar);
	document.getElementById("pantalla_derrota").style.display = "block";
	document.getElementById("estadisticas_derrota").innerHTML = "Naves destruidas: " + navesdestruidas + "<br><br> Masillas destruidos: "
		+ masillasdestruidos + "<br><br> Tanques destruidos: " + tanquesdestruidos + "<br><br> Impactos recibidos: " + impactosrecibidos
		+ "<br><br>Tiempo jugado: " + tiempojugado + " segundos.";
	document.getElementById("estadisticas_derrota").style.color = "white";
	derrota_music.play();
	
}

/*Despliega la ventana de fin de juego tras esperar lo suficiente como para que se reproduzca la animación boosDefeat()*/
function ventanaVictoria(){
		gameover = true;
		stopAudio(lvl_music);
		stopAudio(proyectil_jugador_music);
		clearTimeout(disparar);
		setTimeout(function(){
			document.getElementById("pantalla_victoria").style.display = "block";
			document.getElementById("estadisticas_victoria").innerHTML = "Naves destruidas: " + navesdestruidas + "<br><br> Masillas destruidos: "
			+ masillasdestruidos + "<br><br> Tanques destruidos: " + tanquesdestruidos + "<br><br> Impactos recibidos: " + impactosrecibidos
			+ "<br><br> Tiempo jugado: " + tiempojugado + " segundos.";
			document.getElementById("estadisticas_victoria").style.color = "white";
			victoria_music.play();
		},2200);
}

//Solo utilizo esta función para posteriormente mostrar en la pantalla de fin de juego cuanto ha durado la partida, es un segundero básico con una variable que se actualiza cada segundo.
function pasarSegundos(){
	tiempojugado++;
	if(!gameover) setTimeout(pasarSegundos,1000);
}



// 6- La función de bucle de juego principal.

function main() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	dibujarJugador(jugador);
	disparoEnemigo(enemigos);
	moverProyectil(proyectiles);
	moverProyectilEnemigo(proyectilesenemigos);
	moverEnemigo(enemigos);
	moverDrops(drops);
	moverFondo();	

	if (proyectilLateral) crearProyectilLateral();
	if (puntos >= puntosparaboss) crearBoss();
	if (victoria) ventanaVictoria();
	if (gameover && !victoria) ventanaDerrota();
	if (!gameover) requestAnimationFrame(main);
	if (bosscreado && framesboosalert < 120) requestAnimationFrame(bossAlert);
}


//Finalmente, las llamadas necesarias para comenzar a jugar.

pasarSegundos();
lvl_music.play();
crearProyectilJugador();
crearEnemigo();
main();

}